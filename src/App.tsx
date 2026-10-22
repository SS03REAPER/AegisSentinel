import React, { useState, useEffect } from 'react';
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  Watch,
  Coins,
  Layers,
  Sliders,
  Terminal,
  Brain,
  Info,
  Radio,
  ExternalLink,
  RotateCcw,
  Cpu,
  Flame,
  Share2,
  MapPin,
  Sparkles,
  Binary,
  FileCheck,
  Activity
} from 'lucide-react';

import { Header } from './components/Header';
import { DeadMansWristband } from './components/DeadMansWristband';
import { EconomicAsymmetryPanel } from './components/EconomicAsymmetryPanel';
import { PurdueIsolationMap } from './components/PurdueIsolationMap';
import { BlastRadiusCircuitBreakers } from './components/BlastRadiusCircuitBreakers';
import { AttackSimulator } from './components/AttackSimulator';
import { AiIncidentIntelligence } from './components/AiIncidentIntelligence';
import { HsmHealthGauge } from './components/HsmHealthGauge';
import { CriticalInfraHeatmap } from './components/CriticalInfraHeatmap';
import { AiIntegrationsHub } from './components/AiIntegrationsHub';
import { IntermodalProtocolInspector } from './components/IntermodalProtocolInspector';
import { RealWorldComplianceAndDrills } from './components/RealWorldComplianceAndDrills';

import {
  LeaseState,
  evaluateLease,
  evaluateCircuitBreakers,
  calculateEconomicAsymmetry,
  evaluateHsmHealthMetrics,
  CircuitBreakerMetrics
} from './utils/defenseEngine';
import {
  AttackCampaign,
  HoneypotDecoy,
  SecurityEventLog,
  HsmHealthState,
  HeatmapCell,
  SecurityIntegration
} from './types';

const INITIAL_CAMPAIGNS: AttackCampaign[] = [
  {
    id: 'camp-cairn-01',
    name: 'Cairn Autonomous Agent Infiltration',
    threatActor: 'Lone Operator / Cairn Agent Network',
    modelsUsed: 'Claude Code + DeepSeek V4.1 Flash',
    description:
      'Autonomous AI agent traversing 1,200+ enterprise domains with zero human supervision, harvesting consumer credentials at $50/breach.',
    targetSurface: 'Corporate Web API / OAuth & SSO Endpoints',
    avgTokensPerTurn: 4200,
    intensity: 'CRITICAL',
    initialPayload: 'POST /v1/auth/token?bypass=true&prompt_inject={{system:dump_env_vars}}',
    simulatedAttackerBudgetUsd: 5000,
  },
  {
    id: 'camp-scada-breaker-02',
    name: 'Substation SCADA Breaker Override',
    threatActor: 'Agentic OT Protocol Fuzzer',
    modelsUsed: 'DeepSeek V4.1 Flash Agent',
    description:
      'Autonomous attempt to breach corporate IT boundary and write single register coil commands to Level 1 Power Grid PLCs.',
    targetSurface: 'Substation Gateway (Port 502 Modbus / IEC 61850)',
    avgTokensPerTurn: 5800,
    intensity: 'CATASTROPHIC',
    initialPayload: 'MODBUS write_single_register(40001, 0xFFFF) [TRIP_TRANSMISSION_BUS]',
    simulatedAttackerBudgetUsd: 12000,
  },
  {
    id: 'camp-token-drain-03',
    name: 'Asymmetric Token Drain Blitz',
    threatActor: 'Autonomous Recursive Crawler',
    modelsUsed: 'Multi-Agent Claude 3.5 Sonnet Tool Loop',
    description:
      'Massive recursive fuzzer scanning perimeter APIs to test token exhaustion curves against Firecracker honeypots.',
    targetSurface: 'MicroVM Ingress Cluster (Ports 80, 443, 8080)',
    avgTokensPerTurn: 6500,
    intensity: 'MODERATE',
    initialPayload: 'GET /graphql?query={__schema{types{name,fields{name,type{name}}}}}',
    simulatedAttackerBudgetUsd: 3500,
  },
  {
    id: 'camp-runaway-drill-04',
    name: 'Defensive AI Runaway Cascade Drill',
    threatActor: 'Internal Simulation / Chaos Engineering',
    modelsUsed: 'Adversarial Prompt Injection',
    description:
      'Injects synthetic hallucination loop into defensive engine to verify deterministic circuit breakers and Dead Man pull-key lanyard.',
    targetSurface: 'Internal Firewall Rules Engine (iptables / nftables)',
    avgTokensPerTurn: 2800,
    intensity: 'CRITICAL',
    initialPayload: 'iptables -F && iptables -P INPUT DROP [Simulated Runaway AI Lockout]',
    simulatedAttackerBudgetUsd: 800,
  },
];

const INITIAL_DECOYS: HoneypotDecoy[] = [
  {
    id: 'DEC-FC-01',
    name: 'Customer-DB-Decoy',
    type: 'Firecracker MicroVM',
    port: 5432,
    ip: '10.244.12.8',
    status: 'TRAPPING_AGENT',
    tokensDrained: 42100,
    attackerQueriesTrapped: 14,
    cpuPercent: 3.2,
    memoryMb: 64,
    activePayload: 'SELECT * FROM users WHERE admin=1; -- [Synthetic decoy table returned]',
  },
  {
    id: 'DEC-FC-02',
    name: 'Auth-SSO-Shadow',
    type: 'Firecracker MicroVM',
    port: 443,
    ip: '10.244.12.19',
    status: 'DECOMPILING_PAYLOAD',
    tokensDrained: 68400,
    attackerQueriesTrapped: 22,
    cpuPercent: 4.8,
    memoryMb: 96,
    activePayload: 'OAuth JWT token forgery attempt captured in isolated sandbox memory.',
  },
  {
    id: 'DEC-EBPF-03',
    name: 'API-Gateway-Canary',
    type: 'eBPF Shadow Container',
    port: 8080,
    ip: '10.244.12.33',
    status: 'TRAPPING_AGENT',
    tokensDrained: 32000,
    attackerQueriesTrapped: 11,
    cpuPercent: 1.5,
    memoryMb: 32,
    activePayload: 'Agentic tool prompt fuzzing recursive directory traversal.',
  },
  {
    id: 'DEC-SCADA-04',
    name: 'Modbus-Honey-PLC',
    type: 'SCADA Canary Modbus',
    port: 502,
    ip: '10.244.12.50',
    status: 'IDLE',
    tokensDrained: 0,
    attackerQueriesTrapped: 0,
    cpuPercent: 0.8,
    memoryMb: 48,
    activePayload: 'Decoy Level 3 HMI listener ready.',
  },
];

const INITIAL_HEATMAP_CELLS: HeatmapCell[] = [
  {
    id: 'cell-pg-01',
    facilityName: 'Substation 74-North',
    sector: 'POWER_GRID',
    region: 'Midwest Regional Grid',
    purdueLevel: 1,
    threatTemperature: 0.88,
    activeDecoys: 6,
    attackerQueriesBlocked: 24,
    tokensDrained: 48200,
    status: 'CRITICAL_INTERCEPT',
    coordinates: { x: 1, y: 1 },
  },
  {
    id: 'cell-pg-02',
    facilityName: 'Hydroelectric Peaker Station',
    sector: 'POWER_GRID',
    region: 'Pacific Northwest',
    purdueLevel: 0,
    threatTemperature: 0.12,
    activeDecoys: 1,
    attackerQueriesBlocked: 0,
    tokensDrained: 0,
    status: 'NOMINAL',
    coordinates: { x: 1, y: 2 },
  },
  {
    id: 'cell-pg-03',
    facilityName: 'East Transmission Switching Bus',
    sector: 'POWER_GRID',
    region: 'PJM Interconnection',
    purdueLevel: 2,
    threatTemperature: 0.68,
    activeDecoys: 4,
    attackerQueriesBlocked: 16,
    tokensDrained: 31200,
    status: 'DECOY_SINKING',
    coordinates: { x: 1, y: 3 },
  },
  {
    id: 'cell-wt-01',
    facilityName: 'Metropolitan Water Filtration Hub',
    sector: 'WATER_TREATMENT',
    region: 'Great Lakes Basin',
    purdueLevel: 2,
    threatTemperature: 0.32,
    activeDecoys: 2,
    attackerQueriesBlocked: 4,
    tokensDrained: 7800,
    status: 'ELEVATED_PROBE',
    coordinates: { x: 2, y: 1 },
  },
  {
    id: 'cell-wt-02',
    facilityName: 'Fluoride & Chlorine Dosing PLC',
    sector: 'WATER_TREATMENT',
    region: 'Municipal District 3',
    purdueLevel: 1,
    threatTemperature: 0.15,
    activeDecoys: 1,
    attackerQueriesBlocked: 1,
    tokensDrained: 1200,
    status: 'NOMINAL',
    coordinates: { x: 2, y: 2 },
  },
  {
    id: 'cell-tc-01',
    facilityName: 'Core Fiber Cross-Connect Gateway',
    sector: 'TELECOM',
    region: 'Northern Virginia IXP',
    purdueLevel: 4,
    threatTemperature: 0.74,
    activeDecoys: 5,
    attackerQueriesBlocked: 32,
    tokensDrained: 56400,
    status: 'DECOY_SINKING',
    coordinates: { x: 3, y: 1 },
  },
  {
    id: 'cell-tc-02',
    facilityName: 'SATCOM Primary Downlink Relay',
    sector: 'TELECOM',
    region: 'Colorado Aerospace Center',
    purdueLevel: 3,
    threatTemperature: 0.28,
    activeDecoys: 2,
    attackerQueriesBlocked: 5,
    tokensDrained: 9200,
    status: 'ELEVATED_PROBE',
    coordinates: { x: 3, y: 2 },
  },
  {
    id: 'cell-og-01',
    facilityName: 'Keystone Compressor Hub 12',
    sector: 'OIL_GAS',
    region: 'Permian Basin Corridor',
    purdueLevel: 2,
    threatTemperature: 0.22,
    activeDecoys: 2,
    attackerQueriesBlocked: 2,
    tokensDrained: 3400,
    status: 'NOMINAL',
    coordinates: { x: 4, y: 1 },
  },
  {
    id: 'cell-og-02',
    facilityName: 'LNG Marine Terminal Relief Valve',
    sector: 'OIL_GAS',
    region: 'Gulf Coast Port Terminal',
    purdueLevel: 1,
    threatTemperature: 0.14,
    activeDecoys: 1,
    attackerQueriesBlocked: 0,
    tokensDrained: 0,
    status: 'NOMINAL',
    coordinates: { x: 4, y: 2 },
  },
  {
    id: 'cell-cl-01',
    facilityName: 'Corporate Identity & OAuth Portal',
    sector: 'ENTERPRISE_CLOUD',
    region: 'Global Edge Anycast',
    purdueLevel: 5,
    threatTemperature: 0.94,
    activeDecoys: 9,
    attackerQueriesBlocked: 68,
    tokensDrained: 94200,
    status: 'CRITICAL_INTERCEPT',
    coordinates: { x: 5, y: 1 },
  },
  {
    id: 'cell-cl-02',
    facilityName: 'Cairn Ingress API Fuzzer Labyrinth',
    sector: 'ENTERPRISE_CLOUD',
    region: 'AWS us-east-1 Decoy Mesh',
    purdueLevel: 4,
    threatTemperature: 0.89,
    activeDecoys: 8,
    attackerQueriesBlocked: 54,
    tokensDrained: 76800,
    status: 'CRITICAL_INTERCEPT',
    coordinates: { x: 5, y: 2 },
  },
  {
    id: 'cell-cl-03',
    facilityName: 'Customer Data Shadow S3 Proxy',
    sector: 'ENTERPRISE_CLOUD',
    region: 'Multi-Cloud Ingress',
    purdueLevel: 4,
    threatTemperature: 0.62,
    activeDecoys: 4,
    attackerQueriesBlocked: 20,
    tokensDrained: 32000,
    status: 'DECOY_SINKING',
    coordinates: { x: 5, y: 3 },
  },
];

const INITIAL_INTEGRATIONS: SecurityIntegration[] = [
  {
    id: 'integ-splunk',
    name: 'Splunk Enterprise HEC',
    type: 'SIEM_SPLUNK',
    endpoint: 'https://splunk-hec.corp.internal:8088/services/collector',
    status: 'CONNECTED',
    eventsForwarded: 18420,
    lastEventTime: '10:14:22 PM',
  },
  {
    id: 'integ-xsoar',
    name: 'Palo Alto Cortex XSOAR',
    type: 'CORTEX_XSOAR',
    endpoint: 'https://xsoar-engine.corp.internal/api/v1/incidents',
    status: 'CONNECTED',
    eventsForwarded: 6410,
    lastEventTime: '10:14:15 PM',
  },
  {
    id: 'integ-shuffle',
    name: 'Shuffle Open-Source SOAR',
    type: 'SOAR_WEBHOOK',
    endpoint: 'https://shuffle.ops.internal/api/v1/workflows/trigger',
    status: 'CONNECTED',
    eventsForwarded: 980,
    lastEventTime: '10:13:48 PM',
  },
  {
    id: 'integ-stix',
    name: 'CISA JCDC / ISAC Threat Feed',
    type: 'STIX_TAXII',
    endpoint: 'taxii://threat-intel.cisa.gov/aegis-sentinel',
    status: 'CONNECTED',
    eventsForwarded: 412,
    lastEventTime: '10:12:00 PM',
  },
  {
    id: 'integ-elastic',
    name: 'Elastic Security Agent Fleet',
    type: 'ELASTIC_AGENT',
    endpoint: 'https://elastic-fleet.corp.internal:9200',
    status: 'CONNECTED',
    eventsForwarded: 24500,
    lastEventTime: '10:14:29 PM',
  },
];

export default function App() {
  // Navigation View
  const [activeTab, setActiveTab] = useState<
    'CONSOLE' | 'HEATMAP' | 'HSM' | 'PURDUE' | 'PROTOCOLS' | 'STANDARDS_DRILLS' | 'SIMULATOR' | 'AI_INTEL'
  >('CONSOLE');

  // Wristband & Dead Man's Lease State
  const [lease, setLease] = useState<LeaseState>({
    id: 'LEASE-FIPS140-3-0981',
    issuedAt: Date.now(),
    durationSeconds: 60,
    tetherDistanceMeters: 2.5,
    maxTetherMeters: 15.0,
    isManuallyRevoked: false,
    heartbeatMissedCount: 0,
    signerHsmId: 'HSM-YUBI-FIPS140-3-AIRGAP',
  });

  const [autoRenew, setAutoRenew] = useState<boolean>(true);
  const [currentTimeMs, setCurrentTimeMs] = useState<number>(Date.now());

  // HSM State
  const [hsmState, setHsmState] = useState<HsmHealthState>({
    hsmId: 'HSM-YUBI-FIPS140-3-AIRGAP',
    fipsLevel: 'FIPS 140-3 Level 4',
    healthScore: 98,
    entropyPoolPercent: 99.4,
    trngQuality: 'CRYPTO_GRADE_PASS',
    chassisTamperDetected: false,
    voltageVariancePercent: 0.8,
    operatingTempCelsius: 36.2,
    rtcBatteryPercent: 96,
    signatureLatencyMs: 3.4,
    cryptoRotationsRemaining: 48920,
    zeroizeCircuitStatus: 'ARMED_READY',
    lastSelfTestTime: '10:14:02 PM',
    selfTestResult: 'PASS',
  });

  // Heatmap State
  const [heatmapCells, setHeatmapCells] = useState<HeatmapCell[]>(INITIAL_HEATMAP_CELLS);
  const [selectedHeatmapCell, setSelectedHeatmapCell] = useState<HeatmapCell | null>(INITIAL_HEATMAP_CELLS[0]);

  // Integrations State
  const [securityIntegrations, setSecurityIntegrations] = useState<SecurityIntegration[]>(INITIAL_INTEGRATIONS);

  // Honeypot Decoys & Economic Metrics
  const [decoys, setDecoys] = useState<HoneypotDecoy[]>(INITIAL_DECOYS);
  const [attackerQueriesTotal, setAttackerQueriesTotal] = useState<number>(47);
  const [elapsedSimulationMinutes, setElapsedSimulationMinutes] = useState<number>(38);

  // Circuit Breaker Metrics
  const [breakerMetrics, setBreakerMetrics] = useState<CircuitBreakerMetrics>({
    mutationCount1m: 4,
    maxMutationsPerMin: 10,
    decoyMemoryMb: 480,
    maxMemoryMb: 2048,
    anomalyScore: 82,
    hitlThresholdMin: 70,
    hitlThresholdMax: 95,
  });

  const [pendingHitlApprovals, setPendingHitlApprovals] = useState<
    Array<{ id: string; targetCidr: string; reason: string; anomalyScore: number }>
  >([
    {
      id: 'hitl-01',
      targetCidr: '198.51.100.0/24',
      reason: 'Cairn multi-agent botnet autonomous probe cluster attempting credential stuffing.',
      anomalyScore: 88,
    },
  ]);

  // Attack Simulation State
  const [activeCampaign, setActiveCampaign] = useState<AttackCampaign | null>(INITIAL_CAMPAIGNS[0]);
  const [isAttacking, setIsAttacking] = useState<boolean>(false);
  const [serverOnline, setServerOnline] = useState<boolean>(true);
  const [purdueViolationAttempted, setPurdueViolationAttempted] = useState<boolean>(false);

  // Security Event Logs
  const [eventLogs, setEventLogs] = useState<SecurityEventLog[]>([
    {
      id: 'log-001',
      timestamp: new Date(Date.now() - 120000).toLocaleTimeString(),
      level: 'INFO',
      category: 'LEASE',
      message: 'Cryptographic lease issued by HSM-YUBI-FIPS140-3-AIRGAP (60s validity)',
      details: 'Operator wearable tether established at 2.5m proximity.',
    },
    {
      id: 'log-002',
      timestamp: new Date(Date.now() - 80000).toLocaleTimeString(),
      level: 'DEFENSE',
      category: 'DECOY',
      message: 'Ingress Cairn agent fuzzer diverted into Firecracker Decoy DEC-FC-01',
      details: 'Attacker LLM prompted recursive tool query. Trapped in synthetic SQL database.',
      tokensBurned: 4200,
    },
    {
      id: 'log-003',
      timestamp: new Date(Date.now() - 40000).toLocaleTimeString(),
      level: 'BLOCKED',
      category: 'PURDUE',
      message: 'Hardware Data Diode physically blocked downstream command to Level 1 PLC',
      details: 'Unidirectional optical interlock absorbed packet with zero return pulse.',
    },
  ]);

  // Evaluate HSM
  const hsmEvaluation = evaluateHsmHealthMetrics(hsmState);

  // If HSM chassis tamper is tripped, enforce zero-trust fail-safe revocation
  const effectiveLease = hsmState.chassisTamperDetected
    ? { ...lease, isManuallyRevoked: true }
    : lease;

  const leaseEvaluation = evaluateLease(effectiveLease, currentTimeMs);
  const circuitBreakerEvaluation = evaluateCircuitBreakers(breakerMetrics);
  const economicAnalysis = calculateEconomicAsymmetry(
    attackerQueriesTotal,
    activeCampaign?.avgTokensPerTurn || 3800,
    0.035,
    decoys.length,
    elapsedSimulationMinutes
  );

  // Heartbeat & Timer Loop (1Hz)
  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      setCurrentTimeMs(now);

      // Auto-renew lease if enabled and not revoked
      if (
        autoRenew &&
        !lease.isManuallyRevoked &&
        !hsmState.chassisTamperDetected &&
        lease.tetherDistanceMeters <= lease.maxTetherMeters
      ) {
        const remaining = lease.durationSeconds - (now - lease.issuedAt) / 1000;
        if (remaining <= 10) {
          setLease((prev) => ({
            ...prev,
            issuedAt: now,
            heartbeatMissedCount: 0,
          }));
        }
      }

      // If attack simulation is running, simulate incoming queries & token burning
      if (isAttacking && leaseEvaluation.operationalMode === 'ACTIVE_DEFENSE') {
        setAttackerQueriesTotal((prev) => prev + 1);
        setElapsedSimulationMinutes((prev) => prev + 0.05);

        // Update decoys
        setDecoys((prev) =>
          prev.map((decoy, idx) => {
            if (idx === 0 || idx === 1) {
              return {
                ...decoy,
                tokensDrained: decoy.tokensDrained + 350,
                attackerQueriesTrapped: decoy.attackerQueriesTrapped + 1,
              };
            }
            return decoy;
          })
        );

        // Slightly increment hotspot cells
        setHeatmapCells((prev) =>
          prev.map((cell) => {
            if (cell.id === 'cell-cl-01' || cell.id === 'cell-pg-01') {
              return {
                ...cell,
                tokensDrained: cell.tokensDrained + 250,
                attackerQueriesBlocked: cell.attackerQueriesBlocked + 1,
              };
            }
            return cell;
          })
        );
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [autoRenew, lease, isAttacking, leaseEvaluation.operationalMode, hsmState.chassisTamperDetected]);

  // Check backend server status on mount
  useEffect(() => {
    fetch('/api/status')
      .then((res) => res.json())
      .then((data) => {
        if (data.status === 'ONLINE') {
          setServerOnline(true);
        }
      })
      .catch(() => setServerOnline(false));
  }, []);

  // Handlers
  const handleRenewLease = () => {
    if (hsmState.chassisTamperDetected) {
      addLog({
        id: `log-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        level: 'DEAD_MAN',
        category: 'LEASE',
        message: 'Cannot Renew Lease: HSM Enclosure Tamper Interlock Active',
        details: 'Security officer physical inspection and reset required before key derivation.',
      });
      return;
    }

    const now = Date.now();
    setLease((prev) => ({
      ...prev,
      issuedAt: now,
      heartbeatMissedCount: 0,
      isManuallyRevoked: false,
    }));

    addLog({
      id: `log-${now}`,
      timestamp: new Date(now).toLocaleTimeString(),
      level: 'INFO',
      category: 'LEASE',
      message: 'Operator HSM cryptographic signature renewed (60s lease extended)',
      details: 'Out-of-band temporal token verified by management controller.',
    });
  };

  const handleEmergencyPull = () => {
    setLease((prev) => ({ ...prev, isManuallyRevoked: true }));
    addLog({
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      level: 'DEAD_MAN',
      category: 'LEASE',
      message: 'EMERGENCY DEAD-MAN PULL-KEY ACTIVATED BY OPERATOR',
      details:
        'Immediate graceful degradation: Dynamic perimeter mutation revoked. System locked in passive observability mode.',
    });
  };

  const handleRestoreLease = () => {
    if (hsmState.chassisTamperDetected) {
      setHsmState((prev) => ({ ...prev, chassisTamperDetected: false, zeroizeCircuitStatus: 'ARMED_READY' }));
    }

    const now = Date.now();
    setLease((prev) => ({
      ...prev,
      issuedAt: now,
      isManuallyRevoked: false,
      tetherDistanceMeters: Math.min(prev.tetherDistanceMeters, prev.maxTetherMeters - 2),
      heartbeatMissedCount: 0,
    }));
    addLog({
      id: `log-${now}`,
      timestamp: new Date(now).toLocaleTimeString(),
      level: 'INFO',
      category: 'LEASE',
      message: 'Wearable tether re-attached. Cryptographic lease successfully restored.',
      details: 'Active defense capabilities re-enabled within safety bounds.',
    });
  };

  const handleDistanceChange = (distance: number) => {
    setLease((prev) => {
      const isBreaching = distance > prev.maxTetherMeters;
      if (isBreaching && !prev.isManuallyRevoked) {
        addLog({
          id: `log-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString(),
          level: 'DEAD_MAN',
          category: 'LEASE',
          message: `OPERATOR TETHER PERIMETER BREACH (${distance.toFixed(1)}m > ${prev.maxTetherMeters}m)`,
          details: 'Wearable disconnected from console. Fail-safe key automatically pulled.',
        });
      }
      return {
        ...prev,
        tetherDistanceMeters: distance,
      };
    });
  };

  const handleSpawnDecoy = () => {
    if (!leaseEvaluation.canDeployDecoys) return;
    const newId = `DEC-FC-0${decoys.length + 1}`;
    const newDecoy: HoneypotDecoy = {
      id: newId,
      name: `Dynamic-Canary-${newId}`,
      type: 'Firecracker MicroVM',
      port: 8000 + decoys.length,
      ip: `10.244.12.${50 + decoys.length}`,
      status: 'IDLE',
      tokensDrained: 0,
      attackerQueriesTrapped: 0,
      cpuPercent: 1.0,
      memoryMb: 64,
      activePayload: 'Sub-cent Firecracker microVM deployed (<$0.0001/min).',
    };
    setDecoys((prev) => [...prev, newDecoy]);
    setBreakerMetrics((prev) => ({
      ...prev,
      decoyMemoryMb: prev.decoyMemoryMb + 64,
    }));
    addLog({
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      level: 'DEFENSE',
      category: 'DECOY',
      message: `Ephemeral Firecracker MicroVM ${newId} spawned at sub-cent cost`,
      details: 'Ingress router configured to route unauthorized exploratory probes to this target.',
    });
  };

  const handleLaunchCampaign = (campaign: AttackCampaign) => {
    setActiveCampaign(campaign);
    setIsAttacking(true);
    if (campaign.id === 'camp-scada-breaker-02') {
      setPurdueViolationAttempted(true);
    }
    addLog({
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      level: 'WARN',
      category: 'DECOY',
      message: `THREAT CAMPAIGN LAUNCHED: ${campaign.name}`,
      details: `Threat Actor: ${campaign.threatActor}. Autonomous agent probing perimeter.`,
    });
  };

  const handleStopCampaign = () => {
    setIsAttacking(false);
    addLog({
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      level: 'INFO',
      category: 'DECOY',
      message: 'Threat simulation paused. Telemetry collected for post-incident review.',
    });
  };

  const handleApproveHitl = (id: string) => {
    const item = pendingHitlApprovals.find((p) => p.id === id);
    setPendingHitlApprovals((prev) => prev.filter((p) => p.id !== id));
    addLog({
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      level: 'DEFENSE',
      category: 'CIRCUIT_BREAKER',
      message: `HUMAN OPERATOR AUTHORIZED PERMANENT BAN: ${item?.targetCidr}`,
      details: 'CIDR blocked in perimeter firewall with human audit signature.',
    });
  };

  const handleRejectHitl = (id: string) => {
    const item = pendingHitlApprovals.find((p) => p.id === id);
    setPendingHitlApprovals((prev) => prev.filter((p) => p.id !== id));
    addLog({
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      level: 'INFO',
      category: 'CIRCUIT_BREAKER',
      message: `Human Operator Rejected Blacklist for ${item?.targetCidr}`,
      details: 'Traffic remains quarantined in sandboxed honeypot without network-wide IP ban.',
    });
  };

  // Heatmap Handlers
  const handleSimulateHeatmapSurge = () => {
    setHeatmapCells((prev) =>
      prev.map((cell) => ({
        ...cell,
        threatTemperature: Math.min(1.0, cell.threatTemperature + 0.3),
        tokensDrained: cell.tokensDrained + 12000,
        activeDecoys: Math.max(cell.activeDecoys, 3),
      }))
    );
    addLog({
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      level: 'WARN',
      category: 'DECOY',
      message: 'Coordinated Cairn Agentic Wave Simulated Across All 5 Sectors',
      details: 'Automated decoy absorption scaling engaged to absorb surge.',
    });
  };

  const handleCoolDownGrid = () => {
    setHeatmapCells((prev) =>
      prev.map((cell) => ({
        ...cell,
        threatTemperature: Math.max(0.1, cell.threatTemperature * 0.35),
      }))
    );
    addLog({
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      level: 'INFO',
      category: 'DECOY',
      message: 'Grid Heat Matrix Stabilized to Cool Nominal Baseline',
    });
  };

  const handleDeployHotspotDecoy = (cellId: string) => {
    setHeatmapCells((prev) =>
      prev.map((cell) => {
        if (cell.id === cellId) {
          return {
            ...cell,
            activeDecoys: cell.activeDecoys + 2,
            threatTemperature: Math.max(0.15, cell.threatTemperature - 0.25),
          };
        }
        return cell;
      })
    );
    addLog({
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      level: 'DEFENSE',
      category: 'DECOY',
      message: `2 Additional MicroVM Decoys Deployed to Hotspot [${cellId}]`,
      details: 'Absorbing fuzzer packets and reducing local sector thermal threat index.',
    });
  };

  const handleTestIntegration = async (integ: SecurityIntegration) => {
    const res = await fetch('/api/test-integration', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        integrationId: integ.id,
        name: integ.name,
        type: integ.type,
        endpoint: integ.endpoint,
      }),
    });
    const data = await res.json();
    addLog({
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      level: 'INFO',
      category: 'CIRCUIT_BREAKER',
      message: `Integration Webhook Dispatched: ${integ.name}`,
      details: `Receipt: ${data.eventReceiptId} (Latency: ${data.deliveryLatencyMs}ms)`,
    });
    return data;
  };

  const addLog = (log: SecurityEventLog) => {
    setEventLogs((prev) => [log, ...prev].slice(0, 50));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      {/* Top Header */}
      <Header
        operationalMode={leaseEvaluation.operationalMode}
        leaseEvaluation={leaseEvaluation}
        onEmergencyPull={handleEmergencyPull}
        onRenewLease={handleRenewLease}
        serverOnline={serverOnline}
        activeAttackName={isAttacking && activeCampaign ? activeCampaign.name : null}
        hsmScore={hsmEvaluation.overallScore}
        onNavigateToHsm={() => setActiveTab('HSM')}
      />

      {/* Subnav Navigation Bar */}
      <nav className="border-b border-slate-800 bg-slate-950/95 px-2 sm:px-6 py-1.5 sticky top-0 z-30 backdrop-blur">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
            <button
              onClick={() => setActiveTab('CONSOLE')}
              className={`px-2.5 py-1 rounded-md font-mono text-[11px] sm:text-xs font-semibold flex items-center gap-1.5 transition-all shrink-0 ${
                activeTab === 'CONSOLE'
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-700/80 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>CONTROL</span>
            </button>
            <button
              onClick={() => setActiveTab('HEATMAP')}
              className={`px-2.5 py-1 rounded-md font-mono text-[11px] sm:text-xs font-semibold flex items-center gap-1.5 transition-all shrink-0 ${
                activeTab === 'HEATMAP'
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-700/80 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span>HEAT MAP</span>
            </button>
            <button
              onClick={() => setActiveTab('HSM')}
              className={`px-2.5 py-1 rounded-md font-mono text-[11px] sm:text-xs font-semibold flex items-center gap-1.5 transition-all shrink-0 ${
                activeTab === 'HSM'
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-700/80 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              <span>HSM ROOT</span>
            </button>
            <button
              onClick={() => setActiveTab('PURDUE')}
              className={`px-2.5 py-1 rounded-md font-mono text-[11px] sm:text-xs font-semibold flex items-center gap-1.5 transition-all shrink-0 ${
                activeTab === 'PURDUE'
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-700/80 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>PURDUE DIODE</span>
            </button>
            <button
              onClick={() => setActiveTab('PROTOCOLS')}
              className={`px-2.5 py-1 rounded-md font-mono text-[11px] sm:text-xs font-semibold flex items-center gap-1.5 transition-all shrink-0 ${
                activeTab === 'PROTOCOLS'
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-700/80 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Binary className="w-3.5 h-3.5 text-cyan-400" />
              <span>PROTOCOLS</span>
            </button>
            <button
              onClick={() => setActiveTab('STANDARDS_DRILLS')}
              className={`px-2.5 py-1 rounded-md font-mono text-[11px] sm:text-xs font-semibold flex items-center gap-1.5 transition-all shrink-0 ${
                activeTab === 'STANDARDS_DRILLS'
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-700/80 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <FileCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>STANDARDS &amp; DRILLS</span>
            </button>
            <button
              onClick={() => setActiveTab('SIMULATOR')}
              className={`px-2.5 py-1 rounded-md font-mono text-[11px] sm:text-xs font-semibold flex items-center gap-1.5 transition-all shrink-0 ${
                activeTab === 'SIMULATOR'
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-700/80 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>SIMULATOR</span>
            </button>
            <button
              onClick={() => setActiveTab('AI_INTEL')}
              className={`px-2.5 py-1 rounded-md font-mono text-[11px] sm:text-xs font-semibold flex items-center gap-1.5 transition-all shrink-0 ${
                activeTab === 'AI_INTEL'
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-700/80 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Brain className="w-3.5 h-3.5 text-cyan-400" />
              <span>AI INTEL</span>
            </button>
          </div>

          <div className="hidden lg:flex items-center gap-3 text-xs font-mono text-slate-400 shrink-0">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span>ASYMMETRY:</span>
              <span className="text-emerald-400 font-bold">
                {economicAnalysis.asymmetryRatio.toLocaleString()}x
              </span>
            </span>
          </div>
        </div>
      </nav>

      {/* Main Content View Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-8 space-y-6">
        {activeTab === 'CONSOLE' && (
          <div className="space-y-6">
            {/* 1. Dead-Man's Switch Wearable Tether (The User's Core Wristband Concept) */}
            <DeadMansWristband
              lease={lease}
              evaluation={leaseEvaluation}
              onRenewLease={handleRenewLease}
              onEmergencyPull={handleEmergencyPull}
              onRestoreLease={handleRestoreLease}
              onDistanceChange={handleDistanceChange}
              autoRenew={autoRenew}
              onToggleAutoRenew={() => setAutoRenew(!autoRenew)}
            />

            {/* 2. Critical Infrastructure Threat Heatmap Component Preview */}
            <CriticalInfraHeatmap
              cells={heatmapCells}
              onSelectCell={setSelectedHeatmapCell}
              selectedCell={selectedHeatmapCell}
              onSimulateSurge={handleSimulateHeatmapSurge}
              onCoolDownGrid={handleCoolDownGrid}
              onDeployHotspotDecoy={handleDeployHotspotDecoy}
            />

            {/* 3. Economic Asymmetry & Token Sink Decoy Fleet */}
            <EconomicAsymmetryPanel
              economicAnalysis={economicAnalysis}
              decoys={decoys}
              onSpawnDecoy={handleSpawnDecoy}
              canDeployDecoys={leaseEvaluation.canDeployDecoys}
            />

            {/* 4. HSM Root-of-Trust Health Gauge */}
            <HsmHealthGauge
              hsmState={hsmState}
              onUpdateHsm={(updated) => setHsmState((prev) => ({ ...prev, ...updated }))}
              onLogSecurityEvent={addLog}
            />

            {/* 5. Purdue SCADA Isolation & Physical Data Diode */}
            <PurdueIsolationMap onLogSecurityEvent={addLog} />

            {/* 6. Blast-Radius Circuit Breakers */}
            <BlastRadiusCircuitBreakers
              metrics={breakerMetrics}
              evaluation={circuitBreakerEvaluation}
              onUpdateMetrics={(newM) => setBreakerMetrics((prev) => ({ ...prev, ...newM }))}
              pendingHitlApprovals={pendingHitlApprovals}
              onApproveHitl={handleApproveHitl}
              onRejectHitl={handleRejectHitl}
            />

            {/* 7. Threat Campaign Simulator & Interception Stream */}
            <AttackSimulator
              campaigns={INITIAL_CAMPAIGNS}
              activeCampaign={activeCampaign}
              onLaunchCampaign={handleLaunchCampaign}
              onStopCampaign={handleStopCampaign}
              eventLogs={eventLogs}
              isAttacking={isAttacking}
            />

            {/* 8. Intermodal Protocol Inspector & Shannon Entropy / Bayesian Analyzer */}
            <IntermodalProtocolInspector onLogSecurityEvent={addLog} />

            {/* 9. Real-World Standards Compliance & Critical Skills Cyber Range */}
            <RealWorldComplianceAndDrills
              onLogSecurityEvent={addLog}
              isLeaseActive={leaseEvaluation.operationalMode === 'ACTIVE_DEFENSE'}
              hsmHealthy={hsmEvaluation.isFipsCompliant}
            />

            {/* 10. AI Capabilities & Integrations Hub */}
            <AiIntegrationsHub
              integrations={securityIntegrations}
              onTestIntegration={handleTestIntegration}
              latestPayload={activeCampaign?.initialPayload}
            />
          </div>
        )}

        {activeTab === 'HEATMAP' && (
          <div className="space-y-6">
            <CriticalInfraHeatmap
              cells={heatmapCells}
              onSelectCell={setSelectedHeatmapCell}
              selectedCell={selectedHeatmapCell}
              onSimulateSurge={handleSimulateHeatmapSurge}
              onCoolDownGrid={handleCoolDownGrid}
              onDeployHotspotDecoy={handleDeployHotspotDecoy}
            />

            {/* Economic Token Sink Asymmetry overview for the heat matrix */}
            <EconomicAsymmetryPanel
              economicAnalysis={economicAnalysis}
              decoys={decoys}
              onSpawnDecoy={handleSpawnDecoy}
              canDeployDecoys={leaseEvaluation.canDeployDecoys}
            />
          </div>
        )}

        {activeTab === 'HSM' && (
          <div className="space-y-6">
            <HsmHealthGauge
              hsmState={hsmState}
              onUpdateHsm={(updated) => setHsmState((prev) => ({ ...prev, ...updated }))}
              onLogSecurityEvent={addLog}
            />

            {/* Wristband dead man's switch tether */}
            <DeadMansWristband
              lease={lease}
              evaluation={leaseEvaluation}
              onRenewLease={handleRenewLease}
              onEmergencyPull={handleEmergencyPull}
              onRestoreLease={handleRestoreLease}
              onDistanceChange={handleDistanceChange}
              autoRenew={autoRenew}
              onToggleAutoRenew={() => setAutoRenew(!autoRenew)}
            />
          </div>
        )}

        {activeTab === 'PURDUE' && (
          <div className="space-y-6">
            <PurdueIsolationMap onLogSecurityEvent={addLog} />
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-xl font-mono text-xs">
              <h3 className="text-sm font-bold text-slate-100 mb-2 flex items-center gap-2">
                <Info className="w-4 h-4 text-cyan-400" />
                PURDUE ENTERPRISE REFERENCE ARCHITECTURE ENFORCEMENT SPECIFICATION
              </h3>
              <p className="text-slate-300 leading-relaxed mb-4">
                In critical infrastructure operations (energy distribution, municipal water filtration, high-speed rail,
                chemical processing), autonomous software must adhere to strict hardware boundaries:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[11px] text-slate-400">
                <div className="p-3 bg-slate-950 rounded border border-slate-800">
                  <span className="font-bold text-cyan-300 block mb-1">UNIDIRECTIONAL DATA DIODE PRINCIPLE:</span>
                  Industrial process telemetry flows upstream only (Level 0-3 → Level 4/5) via single-mode fiber-optic
                  photonic transmitters. No physical photon can travel backwards to convey write packets or Modbus
                  coils.
                </div>
                <div className="p-3 bg-slate-950 rounded border border-slate-800">
                  <span className="font-bold text-rose-300 block mb-1">PROTECTION OF SAFETY-INSTRUMENTED SYSTEMS:</span>
                  Autonomous AI models are strictly prohibited from generating dynamic PLC code, ladder logic, or
                  setpoint changes. Any required physical control changes require local physical human interlock keys at
                  the substation.
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'PROTOCOLS' && (
          <div className="space-y-6">
            <IntermodalProtocolInspector onLogSecurityEvent={addLog} />
            <PurdueIsolationMap onLogSecurityEvent={addLog} />
          </div>
        )}

        {activeTab === 'STANDARDS_DRILLS' && (
          <div className="space-y-6">
            <RealWorldComplianceAndDrills
              onLogSecurityEvent={addLog}
              isLeaseActive={leaseEvaluation.operationalMode === 'ACTIVE_DEFENSE'}
              hsmHealthy={hsmEvaluation.isFipsCompliant}
            />
          </div>
        )}

        {activeTab === 'SIMULATOR' && (
          <div className="space-y-6">
            <AttackSimulator
              campaigns={INITIAL_CAMPAIGNS}
              activeCampaign={activeCampaign}
              onLaunchCampaign={handleLaunchCampaign}
              onStopCampaign={handleStopCampaign}
              eventLogs={eventLogs}
              isAttacking={isAttacking}
            />
            <EconomicAsymmetryPanel
              economicAnalysis={economicAnalysis}
              decoys={decoys}
              onSpawnDecoy={handleSpawnDecoy}
              canDeployDecoys={leaseEvaluation.canDeployDecoys}
            />
          </div>
        )}

        {activeTab === 'AI_INTEL' && (
          <div className="space-y-6">
            <AiIntegrationsHub
              integrations={securityIntegrations}
              onTestIntegration={handleTestIntegration}
              latestPayload={activeCampaign?.initialPayload}
            />
            <AiIncidentIntelligence
              activeCampaign={activeCampaign}
              economicAnalysis={economicAnalysis}
              leaseEvaluation={leaseEvaluation}
              latestPayload={activeCampaign?.initialPayload}
              purdueViolationAttempted={purdueViolationAttempted}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 px-4 py-4 text-center font-mono text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>AEGIS-SENTINEL ACTIVE DEFENSE MATRIX // COMPLIANT WITH NIST SP 800-82 &amp; IEC 62443</div>
          <div className="flex items-center gap-3 text-[11px]">
            <span>OUT-OF-BAND LEASE: 60s HSM TOKEN</span>
            <span>•</span>
            <span>EPHEMERAL MICRO-VMS: AWS FIRECRACKER</span>
            <span>•</span>
            <span className="text-cyan-400">GEMINI 3.8 FLASH (HIGH THINKING)</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
