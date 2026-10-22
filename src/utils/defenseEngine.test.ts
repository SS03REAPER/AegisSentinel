import test from 'node:test';
import assert from 'node:assert/strict';
import {
  evaluateLease,
  evaluateCircuitBreakers,
  evaluatePurdueRouting,
  calculateEconomicAsymmetry,
  evaluateHsmHealthMetrics,
  analyzeGridHeatmap,
  formatStixTaxiiBundle,
  calculateShannonEntropy,
  calculateBayesianPosterior,
  parseIntermodalProtocolPacket,
  evaluateRegulatoryCompliance,
  LeaseState,
  CircuitBreakerMetrics,
  PurduePacket
} from './defenseEngine';

test('evaluateLease returns ACTIVE when lease is fresh and within tether radius', () => {
  const now = 100000;
  const lease: LeaseState = {
    id: 'lease-test-1',
    issuedAt: now - 10000, // 10s elapsed
    durationSeconds: 60,
    tetherDistanceMeters: 2.5,
    maxTetherMeters: 15.0,
    isManuallyRevoked: false,
    heartbeatMissedCount: 0,
    signerHsmId: 'HSM-YUBI-FIPS-0982',
  };

  const evalResult = evaluateLease(lease, now);
  assert.equal(evalResult.status, 'ACTIVE');
  assert.equal(evalResult.operationalMode, 'ACTIVE_DEFENSE');
  assert.equal(evalResult.secondsRemaining, 50);
  assert.equal(evalResult.canMutatePerimeter, true);
  assert.equal(evalResult.telemetryActive, true);
});

test('evaluateLease enters WARNING when less than 15 seconds remain', () => {
  const now = 100000;
  const lease: LeaseState = {
    id: 'lease-test-2',
    issuedAt: now - 50000, // 50s elapsed
    durationSeconds: 60,
    tetherDistanceMeters: 3.0,
    maxTetherMeters: 15.0,
    isManuallyRevoked: false,
    heartbeatMissedCount: 0,
    signerHsmId: 'HSM-YUBI-FIPS-0982',
  };

  const evalResult = evaluateLease(lease, now);
  assert.equal(evalResult.status, 'WARNING');
  assert.equal(evalResult.secondsRemaining, 10);
  assert.equal(evalResult.operationalMode, 'ACTIVE_DEFENSE');
});

test('evaluateLease degrades to PASSIVE_OBSERVABILITY when lease expires', () => {
  const now = 100000;
  const lease: LeaseState = {
    id: 'lease-test-3',
    issuedAt: now - 65000, // 65s elapsed
    durationSeconds: 60,
    tetherDistanceMeters: 4.0,
    maxTetherMeters: 15.0,
    isManuallyRevoked: false,
    heartbeatMissedCount: 0,
    signerHsmId: 'HSM-YUBI-FIPS-0982',
  };

  const evalResult = evaluateLease(lease, now);
  assert.equal(evalResult.status, 'EXPIRED');
  assert.equal(evalResult.operationalMode, 'PASSIVE_OBSERVABILITY');
  assert.equal(evalResult.canMutatePerimeter, false);
  assert.equal(evalResult.canDeployDecoys, false);
  assert.equal(evalResult.telemetryActive, true);
});

test('evaluateLease immediately REVOKES when operator pulls key or moves beyond tether distance', () => {
  const now = 100000;
  const leaseManuallyRevoked: LeaseState = {
    id: 'lease-test-4',
    issuedAt: now - 5000,
    durationSeconds: 60,
    tetherDistanceMeters: 2.0,
    maxTetherMeters: 15.0,
    isManuallyRevoked: true,
    heartbeatMissedCount: 0,
    signerHsmId: 'HSM-YUBI-FIPS-0982',
  };

  const evalRevoked = evaluateLease(leaseManuallyRevoked, now);
  assert.equal(evalRevoked.status, 'REVOKED');
  assert.equal(evalRevoked.operationalMode, 'PASSIVE_OBSERVABILITY');
  assert.equal(evalRevoked.canMutatePerimeter, false);

  const leaseDistanceBreach: LeaseState = {
    ...leaseManuallyRevoked,
    isManuallyRevoked: false,
    tetherDistanceMeters: 22.4, // > 15m
  };

  const evalBreach = evaluateLease(leaseDistanceBreach, now);
  assert.equal(evalBreach.status, 'REVOKED');
  assert.match(evalBreach.reason, /safety perimeter/i);
});

test('evaluateCircuitBreakers trips when mutation rate exceeds threshold', () => {
  const metrics: CircuitBreakerMetrics = {
    mutationCount1m: 14,
    maxMutationsPerMin: 10,
    decoyMemoryMb: 512,
    maxMemoryMb: 2048,
    anomalyScore: 82,
    hitlThresholdMin: 70,
    hitlThresholdMax: 95,
  };

  const result = evaluateCircuitBreakers(metrics);
  assert.equal(result.isMutationTripped, true);
  assert.equal(result.isMemoryTripped, false);
  assert.equal(result.requiresHumanApproval, true);
  assert.equal(result.canAutoBlacklist, false);
  assert.ok(result.trippedReasons.length > 0);
});

test('evaluatePurdueRouting strictly blocks Level 4/5 AI writes to Level 0-2 PLCs/Actuators', () => {
  const maliciousAiWrite: PurduePacket = {
    id: 'pkt-1',
    sourceLevel: 4, // Enterprise IT
    targetLevel: 1, // Basic Control PLC
    action: 'WRITE',
    payloadSummary: 'MODBUS write_single_register(40001, 0xFFFF)',
  };

  const verdict = evaluatePurdueRouting(maliciousAiWrite);
  assert.equal(verdict.allowed, false);
  assert.equal(verdict.verdict, 'BLOCKED_DOWNSTREAM_WRITE');
  assert.equal(verdict.diodeStatus, 'HARDWARE_DIODE_PHYSICAL_DROP');
  assert.match(verdict.reason, /CRITICAL PURDUE VIOLATION/i);

  const legitimateUpstreamTelemetry: PurduePacket = {
    id: 'pkt-2',
    sourceLevel: 1, // PLC sensor
    targetLevel: 5, // Cloud/Enterprise Analytics
    action: 'TELEMETRY',
    payloadSummary: 'Turbine Vibration & RPM telemetry 3600rpm',
  };

  const telemetryVerdict = evaluatePurdueRouting(legitimateUpstreamTelemetry);
  assert.equal(telemetryVerdict.allowed, true);
  assert.equal(telemetryVerdict.verdict, 'ALLOWED_UPSTREAM_TELEMETRY');
  assert.equal(telemetryVerdict.diodeStatus, 'UNIDIRECTIONAL_PASS');
});

test('calculateEconomicAsymmetry demonstrates sub-cent defense vs high-cost LLM burn', () => {
  // Attacker makes 120 queries during automated scanning run
  const analysis = calculateEconomicAsymmetry(120, 3200, 0.035, 10, 30);
  assert.ok(analysis.attackerTokensBurned > 300000);
  assert.ok(analysis.attackerCostUsd > 10.0);
  assert.ok(analysis.defenderCostUsd < 0.05);
  assert.ok(analysis.asymmetryRatio > 500);
});

test('evaluateHsmHealthMetrics evaluates nominal conditions and tamper alarms', () => {
  const nominalHsm = {
    entropyPoolPercent: 99.4,
    chassisTamperDetected: false,
    voltageVariancePercent: 0.8,
    operatingTempCelsius: 36.2,
    rtcBatteryPercent: 95,
    signatureLatencyMs: 3.4,
    zeroizeCircuitStatus: 'ARMED_READY',
    selfTestResult: 'PASS',
  };

  const nominalEval = evaluateHsmHealthMetrics(nominalHsm);
  assert.equal(nominalEval.status, 'OPTIMAL');
  assert.equal(nominalEval.isFipsCompliant, true);
  assert.equal(nominalEval.latencyRating, 'EXCELLENT');
  assert.ok(nominalEval.overallScore >= 95);

  const tamperedHsm = {
    ...nominalHsm,
    chassisTamperDetected: true,
  };
  const tamperedEval = evaluateHsmHealthMetrics(tamperedHsm);
  assert.equal(tamperedEval.status, 'TAMPER_ALERT');
  assert.equal(tamperedEval.isFipsCompliant, false);
  assert.equal(tamperedEval.overallScore, 0);
  assert.match(tamperedEval.warnings[0], /enclosure tamper/i);
});

test('analyzeGridHeatmap computes correct temperature metrics and high risk sector', () => {
  const cells = [
    { sector: 'POWER_GRID', threatTemperature: 0.9, tokensDrained: 50000, attackerQueriesBlocked: 12 },
    { sector: 'POWER_GRID', threatTemperature: 0.8, tokensDrained: 35000, attackerQueriesBlocked: 8 },
    { sector: 'WATER_TREATMENT', threatTemperature: 0.2, tokensDrained: 5000, attackerQueriesBlocked: 2 },
    { sector: 'TELECOM', threatTemperature: 0.1, tokensDrained: 2000, attackerQueriesBlocked: 1 },
  ];

  const analysis = analyzeGridHeatmap(cells);
  assert.equal(analysis.highestThreatSector, 'POWER_GRID');
  assert.equal(analysis.totalTokensSunk, 92000);
  assert.equal(analysis.totalQueriesBlocked, 23);
  assert.equal(analysis.cellsAtRiskCount, 2);
  assert.equal(analysis.averageThreatTemp, 0.5);
});

test('formatStixTaxiiBundle outputs compliant STIX 2.1 threat objects', () => {
  const bundle = formatStixTaxiiBundle(
    'inc-cairn-01',
    'Cairn Multi-Agent Infiltrator',
    'DeepSeek V4.1 + Claude Code',
    "[network-traffic:dst_port = 443 AND network-traffic:payload MATCHES 'cairn_agent']"
  );

  assert.equal(bundle.type, 'bundle');
  assert.equal(bundle.spec_version, '2.1');
  assert.equal(bundle.objects.length, 3);
  assert.equal(bundle.objects[0].type, 'threat-actor');
  assert.equal(bundle.objects[1].type, 'indicator');
  assert.equal(bundle.objects[2].type, 'course-of-action');
});

test('calculateShannonEntropy differentiates low-entropy plaintext from high-entropy payloads', () => {
  const singleChar = 'AAAAAAAAAA';
  assert.equal(calculateShannonEntropy(singleChar), 0);

  const plainEnglish = 'GET /api/status HTTP/1.1';
  const plainEntropy = calculateShannonEntropy(plainEnglish);
  assert.ok(plainEntropy > 2.5 && plainEntropy < 4.2);

  const randomHighEntropy = 'eX8+9aB/z1kLmPq0wR2tYu3vI4o5pA6sD7fG8hJ9kL0=';
  const highEntropy = calculateShannonEntropy(randomHighEntropy);
  assert.ok(highEntropy > 4.8);
});

test('calculateBayesianPosterior updates threat probability with mathematical precision', () => {
  // Prior P(T) = 0.05, P(E|T) = 0.90, P(E|~T) = 0.02
  const posterior = calculateBayesianPosterior(0.05, 0.90, 0.02);
  assert.ok(posterior > 0.65); // Increases from 5% prior to ~70% posterior
});

test('parseIntermodalProtocolPacket detects write commands and enforces data diode block', () => {
  const modbusWrite = parseIntermodalProtocolPacket('MODBUS WRITE_SINGLE_REGISTER 40001 0xFFFF', 'MODBUS_TCP');
  assert.equal(modbusWrite.isWriteCommand, true);
  assert.equal(modbusWrite.functionCode, 6);
  assert.equal(modbusWrite.diodeVerdict, 'BLOCKED_DOWNSTREAM_WRITE');
  assert.ok(modbusWrite.bayesianThreatScore > 75);

  const modbusRead = parseIntermodalProtocolPacket('MODBUS READ_HOLDING_REGISTERS 40001 10', 'MODBUS_TCP');
  assert.equal(modbusRead.isWriteCommand, false);
  assert.equal(modbusRead.diodeVerdict, 'ALLOWED_TELEMETRY');
});

test('evaluateRegulatoryCompliance validates against NIST SP 800-82 and IEC 62443 SL-4', () => {
  const fullyCompliant = evaluateRegulatoryCompliance({
    hasOpticalDataDiode: true,
    hasCryptographicLease: true,
    hasRateLimiter: true,
    hasMicroVmDecoys: true,
    hasFipsHsmRoot: true,
  });

  assert.equal(fullyCompliant.overallComplianceScore, 100);
  assert.equal(fullyCompliant.securityLevelAchieved, 'SL-4');
  assert.equal(fullyCompliant.controlsPassedCount, 5);

  const deficient = evaluateRegulatoryCompliance({
    hasOpticalDataDiode: false,
    hasCryptographicLease: false,
    hasRateLimiter: true,
    hasMicroVmDecoys: true,
    hasFipsHsmRoot: false,
  });

  assert.ok(deficient.overallComplianceScore < 60);
  assert.equal(deficient.securityLevelAchieved, 'SL-1');
});


