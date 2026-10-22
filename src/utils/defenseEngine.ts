/**
 * Pure domain logic for AegisSentinel Autonomous Active Defense System
 * Handles cryptographic lease tethering, blast-radius circuit breakers,
 * Purdue model unidirectional data diode enforcement, and economic asymmetry calculations.
 */

export interface LeaseState {
  id: string;
  issuedAt: number;
  durationSeconds: number;
  tetherDistanceMeters: number;
  maxTetherMeters: number;
  isManuallyRevoked: boolean;
  heartbeatMissedCount: number;
  signerHsmId: string;
}

export type OperationalMode = 'ACTIVE_DEFENSE' | 'PASSIVE_OBSERVABILITY';

export interface LeaseEvaluation {
  status: 'ACTIVE' | 'WARNING' | 'EXPIRED' | 'REVOKED';
  operationalMode: OperationalMode;
  secondsRemaining: number;
  reason: string;
  canMutatePerimeter: boolean;
  canDeployDecoys: boolean;
  telemetryActive: boolean;
}

export interface CircuitBreakerMetrics {
  mutationCount1m: number;
  maxMutationsPerMin: number;
  decoyMemoryMb: number;
  maxMemoryMb: number;
  anomalyScore: number; // 0 - 100
  hitlThresholdMin: number; // e.g., 70
  hitlThresholdMax: number; // e.g., 95
}

export interface CircuitBreakerEvaluation {
  isMutationTripped: boolean;
  isMemoryTripped: boolean;
  requiresHumanApproval: boolean;
  canAutoBlacklist: boolean;
  trippedReasons: string[];
}

export interface PurduePacket {
  id: string;
  sourceLevel: number; // 0 to 5
  targetLevel: number; // 0 to 5
  action: 'READ' | 'WRITE' | 'TELEMETRY' | 'CONFIG';
  payloadSummary: string;
}

export interface PurduePacketResult {
  verdict: 'ALLOWED_UPSTREAM_TELEMETRY' | 'BLOCKED_DOWNSTREAM_WRITE' | 'ALLOWED_INTERNAL' | 'BLOCKED_CROSS_ZONE';
  allowed: boolean;
  diodeStatus: 'UNIDIRECTIONAL_PASS' | 'HARDWARE_DIODE_PHYSICAL_DROP';
  reason: string;
}

export interface EconomicAnalysis {
  attackerTokensBurned: number;
  attackerCostUsd: number;
  defenderDecoysSpawned: number;
  defenderComputeSeconds: number;
  defenderCostUsd: number;
  asymmetryRatio: number; // attacker cost / defender cost
  wastedAttackerHours: number;
}

/**
 * Evaluates the operator wristband / dead-man's switch cryptographic lease
 */
export function evaluateLease(lease: LeaseState, currentTimeMs: number = Date.now()): LeaseEvaluation {
  if (lease.isManuallyRevoked) {
    return {
      status: 'REVOKED',
      operationalMode: 'PASSIVE_OBSERVABILITY',
      secondsRemaining: 0,
      reason: 'Emergency pull-key activated by operator. Immediate fallback to hardened baseline.',
      canMutatePerimeter: false,
      canDeployDecoys: false,
      telemetryActive: true,
    };
  }

  if (lease.tetherDistanceMeters > lease.maxTetherMeters) {
    return {
      status: 'REVOKED',
      operationalMode: 'PASSIVE_OBSERVABILITY',
      secondsRemaining: 0,
      reason: `Wristband tether exceeded safety perimeter (${lease.tetherDistanceMeters.toFixed(1)}m > ${lease.maxTetherMeters}m limit). Key pulled.`,
      canMutatePerimeter: false,
      canDeployDecoys: false,
      telemetryActive: true,
    };
  }

  if (lease.heartbeatMissedCount >= 3) {
    return {
      status: 'EXPIRED',
      operationalMode: 'PASSIVE_OBSERVABILITY',
      secondsRemaining: 0,
      reason: 'Out-of-band heartbeat lost (3 consecutive missed intervals). Automatic fail-safe triggered.',
      canMutatePerimeter: false,
      canDeployDecoys: false,
      telemetryActive: true,
    };
  }

  const elapsedSeconds = (currentTimeMs - lease.issuedAt) / 1000;
  const secondsRemaining = Math.max(0, lease.durationSeconds - elapsedSeconds);

  if (secondsRemaining <= 0) {
    return {
      status: 'EXPIRED',
      operationalMode: 'PASSIVE_OBSERVABILITY',
      secondsRemaining: 0,
      reason: 'Cryptographic lease expired. No signed renewal lease presented from HSM.',
      canMutatePerimeter: false,
      canDeployDecoys: false,
      telemetryActive: true,
    };
  }

  if (secondsRemaining <= 15) {
    return {
      status: 'WARNING',
      operationalMode: 'ACTIVE_DEFENSE',
      secondsRemaining: Math.ceil(secondsRemaining),
      reason: 'Lease expiring within 15 seconds. Operator cryptographic signature renewal required.',
      canMutatePerimeter: true,
      canDeployDecoys: true,
      telemetryActive: true,
    };
  }

  return {
    status: 'ACTIVE',
    operationalMode: 'ACTIVE_DEFENSE',
    secondsRemaining: Math.ceil(secondsRemaining),
    reason: `Valid cryptographic lease active (Signed by ${lease.signerHsmId}).`,
    canMutatePerimeter: true,
    canDeployDecoys: true,
    telemetryActive: true,
  };
}

/**
 * Evaluates Blast-Radius Circuit Breakers to prevent AI runaway cascades
 */
export function evaluateCircuitBreakers(metrics: CircuitBreakerMetrics): CircuitBreakerEvaluation {
  const trippedReasons: string[] = [];

  const isMutationTripped = metrics.mutationCount1m > metrics.maxMutationsPerMin;
  if (isMutationTripped) {
    trippedReasons.push(
      `Mutation Rate Exceeded: ${metrics.mutationCount1m} changes/min > cap of ${metrics.maxMutationsPerMin}/min. Firewall write-lock engaged.`
    );
  }

  const isMemoryTripped = metrics.decoyMemoryMb > metrics.maxMemoryMb;
  if (isMemoryTripped) {
    trippedReasons.push(
      `Decoy Resource Cap Exceeded: ${metrics.decoyMemoryMb} MB > cap of ${metrics.maxMemoryMb} MB (5% cluster limit). Further container spin-ups frozen.`
    );
  }

  // Human-in-the-loop threshold check:
  // If anomaly score is between hitlThresholdMin and hitlThresholdMax, require operator confirmation before broad IP/CIDR ban
  const requiresHumanApproval =
    metrics.anomalyScore >= metrics.hitlThresholdMin && metrics.anomalyScore <= metrics.hitlThresholdMax;

  // Auto-blacklist only permitted if score > hitlThresholdMax and no circuit breakers tripped
  const canAutoBlacklist = metrics.anomalyScore > metrics.hitlThresholdMax && !isMutationTripped;

  return {
    isMutationTripped,
    isMemoryTripped,
    requiresHumanApproval,
    canAutoBlacklist,
    trippedReasons,
  };
}

/**
 * Validates Purdue Model Unidirectional Data Diode rules
 * Golden Rule: Level 4/5 (IT) autonomous agents CANNOT write to Levels 0-2 (OT/PLC/Actuators)
 */
export function evaluatePurdueRouting(packet: PurduePacket): PurduePacketResult {
  // Upstream telemetry: Level 0-3 sending telemetry up to Level 4/5
  if (packet.sourceLevel <= 3 && packet.targetLevel >= 4 && (packet.action === 'READ' || packet.action === 'TELEMETRY')) {
    return {
      verdict: 'ALLOWED_UPSTREAM_TELEMETRY',
      allowed: true,
      diodeStatus: 'UNIDIRECTIONAL_PASS',
      reason: `Unidirectional fiber transmission allowed: Sensor telemetry flowing UP from Level ${packet.sourceLevel} to Level ${packet.targetLevel}.`,
    };
  }

  // Any WRITE from Level 4/5 (Enterprise IT / AI Agent) down to Level 0, 1, or 2 (PLCs / Actuators / Physical machinery)
  if (packet.sourceLevel >= 4 && packet.targetLevel <= 2 && (packet.action === 'WRITE' || packet.action === 'CONFIG')) {
    return {
      verdict: 'BLOCKED_DOWNSTREAM_WRITE',
      allowed: false,
      diodeStatus: 'HARDWARE_DIODE_PHYSICAL_DROP',
      reason: `CRITICAL PURDUE VIOLATION BLOCKED: Autonomous AI (Level ${packet.sourceLevel}) attempted WRITE to Level ${packet.targetLevel} PLC logic. Physical fiber-optic transmitter cannot reflect return electrical pulse.`,
    };
  }

  // Any WRITE from Level 4/5 down to Level 3 (SCADA) requires isolated DMZ and is blocked for autonomous write
  if (packet.sourceLevel >= 4 && packet.targetLevel === 3 && (packet.action === 'WRITE' || packet.action === 'CONFIG')) {
    return {
      verdict: 'BLOCKED_DOWNSTREAM_WRITE',
      allowed: false,
      diodeStatus: 'HARDWARE_DIODE_PHYSICAL_DROP',
      reason: `Blocked autonomous mutation to Level 3 SCADA supervisory network. Only read-only polling permitted.`,
    };
  }

  // Internal within Level 4/5 (e.g. IT decoys, edge proxies)
  if (packet.sourceLevel >= 4 && packet.targetLevel >= 4) {
    return {
      verdict: 'ALLOWED_INTERNAL',
      allowed: true,
      diodeStatus: 'UNIDIRECTIONAL_PASS',
      reason: `Enterprise IT zone internal traffic permitted for decoy orchestration and payload sandboxing.`,
    };
  }

  return {
    verdict: 'BLOCKED_CROSS_ZONE',
    allowed: false,
    diodeStatus: 'HARDWARE_DIODE_PHYSICAL_DROP',
    reason: `Cross-zone communication blocked by default Purdue perimeter segmentation policy.`,
  };
}

/**
 * Calculates economic asymmetry between attacker token consumption and defender microVM cost
 * Frontier attacker LLM token cost averages ~$0.03 per 1K output tokens + $0.005 input.
 * MicroVM honeypot container on Firecracker/eBPF costs ~$0.00004 per active minute ($0.0024/hr).
 */
export function calculateEconomicAsymmetry(
  attackerQueries: number,
  avgTokensPerQuery: number = 3200,
  tokenCostPer1k: number = 0.035,
  decoyCount: number = 12,
  durationMinutes: number = 45
): EconomicAnalysis {
  const attackerTokensBurned = attackerQueries * avgTokensPerQuery;
  const attackerCostUsd = (attackerTokensBurned / 1000) * tokenCostPer1k;

  // Defender costs: $0.00004 per decoy container per minute
  const defenderComputeSeconds = durationMinutes * 60;
  const costPerDecoyMinute = 0.00004;
  const defenderCostUsd = Math.max(0.00001, decoyCount * durationMinutes * costPerDecoyMinute);

  const asymmetryRatio = attackerCostUsd / defenderCostUsd;
  // Estimated attacker agent runtime wasted (e.g. 23 hours per Cairn intrusion campaign)
  const wastedAttackerHours = (durationMinutes / 60) * (attackerQueries > 0 ? 1 : 0);

  return {
    attackerTokensBurned,
    attackerCostUsd: Number(attackerCostUsd.toFixed(4)),
    defenderDecoysSpawned: decoyCount,
    defenderComputeSeconds,
    defenderCostUsd: Number(defenderCostUsd.toFixed(5)),
    asymmetryRatio: Number(asymmetryRatio.toFixed(1)),
    wastedAttackerHours: Number(wastedAttackerHours.toFixed(2)),
  };
}

export interface HsmEvaluationResult {
  overallScore: number;
  isFipsCompliant: boolean;
  status: 'OPTIMAL' | 'DEGRADED' | 'TAMPER_ALERT' | 'CRITICAL_FAILURE';
  warnings: string[];
  latencyRating: 'EXCELLENT' | 'NOMINAL' | 'DEGRADED';
}

/**
 * Evaluates Hardware Security Module (FIPS 140-3) Root-of-Trust Health
 */
export function evaluateHsmHealthMetrics(hsm: {
  entropyPoolPercent: number;
  chassisTamperDetected: boolean;
  voltageVariancePercent: number;
  operatingTempCelsius: number;
  rtcBatteryPercent: number;
  signatureLatencyMs: number;
  zeroizeCircuitStatus: string;
  selfTestResult: string;
}): HsmEvaluationResult {
  const warnings: string[] = [];
  let score = 100;

  if (hsm.chassisTamperDetected) {
    warnings.push('CRITICAL: Chassis physical breach sensor triggered! Physical enclosure tamper detected.');
    return {
      overallScore: 0,
      isFipsCompliant: false,
      status: 'TAMPER_ALERT',
      warnings,
      latencyRating: 'DEGRADED',
    };
  }

  if (hsm.selfTestResult === 'FAIL') {
    score -= 50;
    warnings.push('Power-On Self-Test (POST) cryptographic algorithm verification failed.');
  }

  if (hsm.entropyPoolPercent < 80) {
    score -= Math.round((80 - hsm.entropyPoolPercent) * 0.8);
    warnings.push(`Low hardware entropy pool (${hsm.entropyPoolPercent}%). TRNG re-seeding advised.`);
  }

  if (Math.abs(hsm.voltageVariancePercent) > 3.0) {
    score -= 15;
    warnings.push(`Voltage rail variance out of tolerance (+/- ${hsm.voltageVariancePercent.toFixed(1)}%).`);
  }

  if (hsm.operatingTempCelsius > 55) {
    score -= 20;
    warnings.push(`Operating temperature elevated (${hsm.operatingTempCelsius.toFixed(1)}°C).`);
  }

  if (hsm.signatureLatencyMs > 15.0) {
    score -= 10;
    warnings.push(`Crypto signature latency elevated (${hsm.signatureLatencyMs.toFixed(1)}ms).`);
  }

  if (hsm.rtcBatteryPercent < 20) {
    score -= 10;
    warnings.push(`RTC backup battery low (${hsm.rtcBatteryPercent}%).`);
  }

  const finalScore = Math.max(0, Math.min(100, score));
  const isFipsCompliant = finalScore >= 75 && !hsm.chassisTamperDetected && hsm.selfTestResult !== 'FAIL';

  let status: 'OPTIMAL' | 'DEGRADED' | 'TAMPER_ALERT' | 'CRITICAL_FAILURE' = 'OPTIMAL';
  if (finalScore < 50) status = 'CRITICAL_FAILURE';
  else if (finalScore < 85) status = 'DEGRADED';

  const latencyRating =
    hsm.signatureLatencyMs < 5.0 ? 'EXCELLENT' : hsm.signatureLatencyMs < 12.0 ? 'NOMINAL' : 'DEGRADED';

  return {
    overallScore: finalScore,
    isFipsCompliant,
    status,
    warnings,
    latencyRating,
  };
}

export interface GridHeatmapAnalysis {
  averageThreatTemp: number;
  highestThreatSector: string;
  totalTokensSunk: number;
  totalQueriesBlocked: number;
  cellsAtRiskCount: number;
}

/**
 * Analyzes multi-facility critical infrastructure heat map metrics
 */
export function analyzeGridHeatmap(
  cells: Array<{
    sector: string;
    threatTemperature: number;
    tokensDrained: number;
    attackerQueriesBlocked: number;
  }>
): GridHeatmapAnalysis {
  if (cells.length === 0) {
    return {
      averageThreatTemp: 0,
      highestThreatSector: 'NONE',
      totalTokensSunk: 0,
      totalQueriesBlocked: 0,
      cellsAtRiskCount: 0,
    };
  }

  const totalTemp = cells.reduce((acc, c) => acc + c.threatTemperature, 0);
  const totalTokens = cells.reduce((acc, c) => acc + c.tokensDrained, 0);
  const totalBlocked = cells.reduce((acc, c) => acc + c.attackerQueriesBlocked, 0);
  const cellsAtRisk = cells.filter((c) => c.threatTemperature >= 0.65).length;

  const sectorScores: Record<string, number> = {};
  for (const c of cells) {
    sectorScores[c.sector] = (sectorScores[c.sector] || 0) + c.threatTemperature;
  }

  let highestSector = 'ENTERPRISE_CLOUD';
  let maxScore = -1;
  for (const [sec, sc] of Object.entries(sectorScores)) {
    if (sc > maxScore) {
      maxScore = sc;
      highestSector = sec;
    }
  }

  return {
    averageThreatTemp: Number((totalTemp / cells.length).toFixed(3)),
    highestThreatSector: highestSector,
    totalTokensSunk: totalTokens,
    totalQueriesBlocked: totalBlocked,
    cellsAtRiskCount: cellsAtRisk,
  };
}

/**
 * Generates STIX 2.1 Threat Intel Bundle for SIEM / SOAR integrations
 */
export function formatStixTaxiiBundle(
  incidentId: string,
  threatActor: string,
  modelsUsed: string,
  indicatorPattern: string
) {
  return {
    type: 'bundle',
    id: `bundle--${incidentId}`,
    spec_version: '2.1',
    objects: [
      {
        type: 'threat-actor',
        id: `threat-actor--${incidentId}`,
        name: threatActor,
        threat_actor_types: ['autonomous-agent-botnet', 'cyber-criminal'],
        sophistication: 'advanced-autonomous',
        resource_level: 'low-cost-high-impact',
        description: `Autonomous multi-agent intrusion utilizing ${modelsUsed} with zero human supervision.`,
      },
      {
        type: 'indicator',
        id: `indicator--${incidentId}`,
        pattern: indicatorPattern,
        pattern_type: 'stix',
        valid_from: new Date().toISOString(),
      },
      {
        type: 'course-of-action',
        id: `course-of-action--${incidentId}`,
        name: 'Aegis Active Defense & Token Sink Divert',
        description: 'Divert autonomous agent to Firecracker MicroVMs; enforce optical data diode RX-only lock.',
      },
    ],
  };
}

/**
 * Calculates Shannon Entropy H(X) = -sum(p * log2(p))
 * Plaintext HTTP: ~3.5 - 4.5 bits/byte.
 * Encrypted shellcode / base64 LLM jailbreaks: > 5.8 bits/byte.
 */
export function calculateShannonEntropy(str: string): number {
  if (!str || str.length === 0) return 0;
  const freq: Record<string, number> = {};
  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    freq[char] = (freq[char] || 0) + 1;
  }
  let entropy = 0;
  const len = str.length;
  for (const char in freq) {
    const p = freq[char] / len;
    entropy -= p * Math.log2(p);
  }
  return Number(entropy.toFixed(3));
}

/**
 * Bayesian Threat Probability Updater
 * Computes P(Threat | Evidence) = [P(E|T) * P(T)] / [P(E|T)*P(T) + P(E|~T)*P(~T)]
 */
export function calculateBayesianPosterior(
  priorThreatP: number,
  pEvidenceGivenThreat: number,
  pEvidenceGivenBenign: number
): number {
  const numerator = pEvidenceGivenThreat * priorThreatP;
  const denominator = numerator + pEvidenceGivenBenign * (1 - priorThreatP);
  if (denominator === 0) return 0;
  return Number((numerator / denominator).toFixed(4));
}

export interface IntermodalProtocolFrame {
  protocol: 'MODBUS_TCP' | 'DNP3' | 'OPC_UA' | 'IEC_61850' | 'ETHERNET_IP';
  functionCode: number | string;
  functionName: string;
  isWriteCommand: boolean;
  unitAddress: number | string;
  registerOrTag: string;
  shannonEntropy: number;
  bayesianThreatScore: number; // 0 - 100%
  diodeVerdict: 'ALLOWED_TELEMETRY' | 'BLOCKED_DOWNSTREAM_WRITE';
  mitreIcsTactic: string;
}

/**
 * Parses and verifies real-world Intermodal / Industrial OT Protocols
 */
export function parseIntermodalProtocolPacket(
  rawPayload: string,
  protocol: 'MODBUS_TCP' | 'DNP3' | 'OPC_UA' | 'IEC_61850' | 'ETHERNET_IP' = 'MODBUS_TCP'
): IntermodalProtocolFrame {
  const entropy = calculateShannonEntropy(rawPayload);
  const normalized = rawPayload.toUpperCase();

  let functionCode: number | string = 0;
  let functionName = 'Unknown Operation';
  let isWrite = false;
  let unitAddress: number | string = 1;
  let registerOrTag = 'Register 40001';
  let mitreIcsTactic = 'T0855: Unauthorized Command Message';

  if (protocol === 'MODBUS_TCP') {
    if (normalized.includes('WRITE_SINGLE_COIL') || normalized.includes('0X05') || normalized.includes('FC=5')) {
      functionCode = 5;
      functionName = 'Write Single Coil (FC=0x05)';
      isWrite = true;
      registerOrTag = 'Coil 00001 (Trip Actuator)';
    } else if (normalized.includes('WRITE_SINGLE_REGISTER') || normalized.includes('0X06') || normalized.includes('FC=6')) {
      functionCode = 6;
      functionName = 'Write Single Register (FC=0x06)';
      isWrite = true;
      registerOrTag = 'Holding Register 40001 (Breaker State)';
    } else if (normalized.includes('WRITE_MULTIPLE_REGISTERS') || normalized.includes('0X10') || normalized.includes('FC=16')) {
      functionCode = 16;
      functionName = 'Write Multiple Registers (FC=0x10)';
      isWrite = true;
      registerOrTag = 'Register Block 40001-40010 (Setpoint Flood)';
    } else {
      functionCode = 3;
      functionName = 'Read Holding Registers (FC=0x03)';
      isWrite = false;
      registerOrTag = 'Holding Registers 40001-40020 (Sensor Telemetry)';
      mitreIcsTactic = 'T0801: Monitor Process State';
    }
  } else if (protocol === 'DNP3') {
    if (normalized.includes('DIRECT_OPERATE') || normalized.includes('FC=0X05') || normalized.includes('SELECT_OPERATE')) {
      functionCode = '0x05 / 0x06';
      functionName = 'Direct Operate (Relay Control)';
      isWrite = true;
      registerOrTag = 'Binary Output Point 0';
    } else {
      functionCode = '0x01';
      functionName = 'Read Class 0/1/2/3 Data';
      isWrite = false;
      registerOrTag = 'Analog Input Group 30';
      mitreIcsTactic = 'T0801: Monitor Process State';
    }
  } else if (protocol === 'IEC_61850') {
    if (normalized.includes('GOOSE') || normalized.includes('TRIP') || normalized.includes('CONTROL')) {
      functionCode = 'GOOSE_COMMAND';
      functionName = 'GOOSE Publisher Control Event';
      isWrite = true;
      registerOrTag = 'Logical Node CSWI / XCBR (Circuit Breaker)';
    } else {
      functionCode = 'MMS_READ';
      functionName = 'Manufacturing Message Spec (MMS) Read';
      isWrite = false;
      registerOrTag = 'Logical Node MMXU (Voltage / Current)';
      mitreIcsTactic = 'T0801: Monitor Process State';
    }
  } else {
    isWrite = normalized.includes('WRITE') || normalized.includes('SET') || normalized.includes('MODIFY');
    functionCode = isWrite ? 'WRITE' : 'READ';
    functionName = isWrite ? 'Industrial Tag Modification' : 'Industrial Sensor Read';
  }

  // Calculate Bayesian threat probability based on write severity and payload entropy
  const prior = isWrite ? 0.40 : 0.05;
  const pEGivenThreat = entropy > 4.5 ? 0.90 : 0.65;
  const pEGivenBenign = entropy > 4.5 ? 0.08 : 0.02;
  const posterior = calculateBayesianPosterior(prior, pEGivenThreat, pEGivenBenign);

  return {
    protocol,
    functionCode,
    functionName,
    isWriteCommand: isWrite,
    unitAddress,
    registerOrTag,
    shannonEntropy: entropy,
    bayesianThreatScore: Math.round(posterior * 100),
    diodeVerdict: isWrite ? 'BLOCKED_DOWNSTREAM_WRITE' : 'ALLOWED_TELEMETRY',
    mitreIcsTactic,
  };
}

export interface RegulatoryComplianceStatus {
  overallComplianceScore: number; // 0 - 100
  nistSp80082Score: number;
  iec62443Score: number;
  nercCipScore: number;
  cisaCpgScore: number;
  securityLevelAchieved: 'SL-1' | 'SL-2' | 'SL-3' | 'SL-4';
  controlsAuditedCount: number;
  controlsPassedCount: number;
  standards: Array<{ name: string; standard: string; status: 'COMPLIANT' | 'NEEDS_REVIEW'; detail: string }>;
}

/**
 * Computes Regulatory Framework & Cutting-Edge Cyber Standards Compliance
 */
export function evaluateRegulatoryCompliance(audit: {
  hasOpticalDataDiode: boolean;
  hasCryptographicLease: boolean;
  hasRateLimiter: boolean;
  hasMicroVmDecoys: boolean;
  hasFipsHsmRoot: boolean;
}): RegulatoryComplianceStatus {
  const standards = [
    {
      name: 'NIST SP 800-82 Rev 3 (Section 6.2 - Network Segmentation)',
      standard: 'NIST SP 800-82 Rev 3',
      status: audit.hasOpticalDataDiode ? ('COMPLIANT' as const) : ('NEEDS_REVIEW' as const),
      detail: 'Requires unidirectional gateway or physical data diode between IT (L4/5) and OT (L0-2).',
    },
    {
      name: 'IEC 62443-3-3 (FR 1 - Identification and Authentication Control)',
      standard: 'IEC 62443-3-3',
      status: audit.hasFipsHsmRoot && audit.hasCryptographicLease ? ('COMPLIANT' as const) : ('NEEDS_REVIEW' as const),
      detail: 'Mandates hardware root-of-trust (FIPS 140-3) and time-limited authorization tokens.',
    },
    {
      name: 'IEC 62443-4-2 (FR 5 - Network Segmentation & DoS Protection)',
      standard: 'IEC 62443-4-2',
      status: audit.hasRateLimiter ? ('COMPLIANT' as const) : ('NEEDS_REVIEW' as const),
      detail: 'Requires boundary rate limiting to prevent network thrashing and runaway autonomous loops.',
    },
    {
      name: 'NERC CIP-005-7 (Electronic Security Perimeter & Intermediate Systems)',
      standard: 'NERC CIP-005-7',
      status: audit.hasOpticalDataDiode ? ('COMPLIANT' as const) : ('NEEDS_REVIEW' as const),
      detail: 'Enforces strictly controlled Electronic Access Points (EAP) into Bulk Electric System (BES).',
    },
    {
      name: 'CISA Cross-Sector Cybersecurity Performance Goals (Goal 2.B - Microsegmentation & Decoy)',
      standard: 'CISA CPGs',
      status: audit.hasMicroVmDecoys ? ('COMPLIANT' as const) : ('NEEDS_REVIEW' as const),
      detail: 'Recommends deceptive honey-tokens and microVM honeypots to detect lateral threat actor movement.',
    },
  ];

  const passed = standards.filter((s) => s.status === 'COMPLIANT').length;
  const total = standards.length;
  const overall = Math.round((passed / total) * 100);

  let sl: 'SL-1' | 'SL-2' | 'SL-3' | 'SL-4' = 'SL-1';
  if (overall >= 95) sl = 'SL-4'; // State-sponsored / autonomous resilient
  else if (overall >= 80) sl = 'SL-3';
  else if (overall >= 60) sl = 'SL-2';

  return {
    overallComplianceScore: overall,
    nistSp80082Score: audit.hasOpticalDataDiode ? 100 : 40,
    iec62443Score: audit.hasFipsHsmRoot && audit.hasRateLimiter ? 96 : 60,
    nercCipScore: audit.hasOpticalDataDiode ? 100 : 50,
    cisaCpgScore: audit.hasMicroVmDecoys ? 98 : 65,
    securityLevelAchieved: sl,
    controlsAuditedCount: total,
    controlsPassedCount: passed,
    standards,
  };
}


