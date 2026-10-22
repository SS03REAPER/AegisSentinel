export interface AttackCampaign {
  id: string;
  name: string;
  threatActor: string;
  modelsUsed: string;
  description: string;
  targetSurface: string;
  avgTokensPerTurn: number;
  intensity: 'MODERATE' | 'CRITICAL' | 'CATASTROPHIC';
  initialPayload: string;
  simulatedAttackerBudgetUsd: number;
}

export interface HoneypotDecoy {
  id: string;
  name: string;
  type: 'Firecracker MicroVM' | 'eBPF Shadow Container' | 'SCADA Canary Modbus' | 'Honey API Endpoint';
  port: number;
  ip: string;
  status: 'IDLE' | 'TRAPPING_AGENT' | 'DECOMPILING_PAYLOAD' | 'RECYCLING';
  tokensDrained: number;
  attackerQueriesTrapped: number;
  cpuPercent: number;
  memoryMb: number;
  activePayload?: string;
}

export interface SecurityEventLog {
  id: string;
  timestamp: string;
  level: 'INFO' | 'WARN' | 'DEFENSE' | 'BLOCKED' | 'DEAD_MAN';
  category: 'DECOY' | 'PURDUE' | 'LEASE' | 'CIRCUIT_BREAKER' | 'AI_REASONING';
  message: string;
  details?: string;
  sourceIp?: string;
  tokensBurned?: number;
}

export interface PurdueNode {
  level: number;
  name: string;
  subtitle: string;
  description: string;
  aiWriteAccess: boolean;
  status: 'NOMINAL' | 'MONITORED' | 'BLOCKED_WRITE_ATTEMPT' | 'ISOLATED';
}

export interface SoarRule {
  ruleId: string;
  mitreTactic: string;
  threatType: string;
  sigmaRule: string;
  snortSignature: string;
  iptablesCommand: string;
  purdueAction: string;
}

export interface HsmHealthState {
  hsmId: string;
  fipsLevel: 'FIPS 140-3 Level 4' | 'FIPS 140-2 Level 3';
  healthScore: number; // 0 - 100
  entropyPoolPercent: number; // 0 - 100
  trngQuality: 'CRYPTO_GRADE_PASS' | 'DEGRADED';
  chassisTamperDetected: boolean;
  voltageVariancePercent: number; // nominal +/- 1.2%
  operatingTempCelsius: number; // e.g. 34.5°C
  rtcBatteryPercent: number; // e.g. 96%
  signatureLatencyMs: number; // e.g. 3.8ms
  cryptoRotationsRemaining: number;
  zeroizeCircuitStatus: 'ARMED_READY' | 'TRIGGERED';
  lastSelfTestTime: string;
  selfTestResult: 'PASS' | 'FAIL' | 'TESTING';
}

export interface HeatmapCell {
  id: string;
  facilityName: string;
  sector: 'POWER_GRID' | 'WATER_TREATMENT' | 'TELECOM' | 'OIL_GAS' | 'ENTERPRISE_CLOUD';
  region: string;
  purdueLevel: number;
  threatTemperature: number; // 0.0 (Cold/Nominal) to 1.0 (Critical Threat)
  activeDecoys: number;
  attackerQueriesBlocked: number;
  tokensDrained: number;
  status: 'NOMINAL' | 'ELEVATED_PROBE' | 'DECOY_SINKING' | 'CRITICAL_INTERCEPT';
  coordinates: { x: number; y: number };
}

export interface SecurityIntegration {
  id: string;
  name: string;
  type: 'SOAR_WEBHOOK' | 'SIEM_SPLUNK' | 'CORTEX_XSOAR' | 'STIX_TAXII' | 'ELASTIC_AGENT';
  endpoint: string;
  status: 'CONNECTED' | 'SYNCING' | 'STANDBY';
  eventsForwarded: number;
  lastEventTime: string;
}

