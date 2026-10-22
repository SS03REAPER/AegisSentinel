import React, { useState } from 'react';
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  Cpu,
  Zap,
  Activity,
  Flame,
  Battery,
  Clock,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Unlock,
  Radio,
  FileCheck
} from 'lucide-react';
import { HsmHealthState } from '../types';
import { evaluateHsmHealthMetrics } from '../utils/defenseEngine';

interface HsmHealthGaugeProps {
  hsmState: HsmHealthState;
  onUpdateHsm: (updated: Partial<HsmHealthState>) => void;
  onLogSecurityEvent: (event: any) => void;
}

export const HsmHealthGauge: React.FC<HsmHealthGaugeProps> = ({
  hsmState,
  onUpdateHsm,
  onLogSecurityEvent,
}) => {
  const [isRunningSelfTest, setIsRunningSelfTest] = useState(false);
  const evaluation = evaluateHsmHealthMetrics(hsmState);

  const handleRunSelfTest = () => {
    setIsRunningSelfTest(true);
    onUpdateHsm({ selfTestResult: 'TESTING' });

    setTimeout(() => {
      setIsRunningSelfTest(false);
      onUpdateHsm({
        selfTestResult: 'PASS',
        lastSelfTestTime: new Date().toLocaleTimeString(),
        entropyPoolPercent: 99.8,
        signatureLatencyMs: 3.2,
      });

      onLogSecurityEvent({
        id: `log-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        level: 'INFO',
        category: 'LEASE',
        message: 'FIPS 140-3 Cryptographic Power-On Self-Test (POST) Passed',
        details: 'Known-Answer Tests (KAT) for Ed25519, SHA-512, and AES-256-GCM validated.',
      });
    }, 1200);
  };

  const handleToggleTamper = () => {
    const newTamper = !hsmState.chassisTamperDetected;
    onUpdateHsm({
      chassisTamperDetected: newTamper,
      zeroizeCircuitStatus: newTamper ? 'TRIGGERED' : 'ARMED_READY',
    });

    onLogSecurityEvent({
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      level: newTamper ? 'DEAD_MAN' : 'INFO',
      category: 'LEASE',
      message: newTamper
        ? 'CRITICAL TAMPER SENSOR TRIP ON HSM ENCLOSURE'
        : 'HSM Enclosure Tamper Interlock Reset and Cleared',
      details: newTamper
        ? 'Physical microswitch breach detected. Ephemeral keys zeroized immediately.'
        : 'Tamper interlock re-certified by security officer key.',
    });
  };

  const handleReseedEntropy = () => {
    onUpdateHsm({
      entropyPoolPercent: 100,
      trngQuality: 'CRYPTO_GRADE_PASS',
    });
    onLogSecurityEvent({
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      level: 'INFO',
      category: 'LEASE',
      message: 'Hardware Quantum TRNG Reseeded with 1024 Bits of Physical Entropy',
      details: 'Thermal noise diode source harvested and NIST SP 800-90B health tests passed.',
    });
  };

  // Circular gauge calculation
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (evaluation.overallScore / 100) * circumference;

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-xl">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-100 font-mono tracking-wide flex items-center gap-2">
              <Cpu className="w-5 h-5 text-cyan-400" />
              HSM ROOT-OF-TRUST HEALTH GAUGE // FIPS 140-3 LEVEL 4
            </h2>
            <span
              className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                evaluation.status === 'OPTIMAL'
                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                  : evaluation.status === 'DEGRADED'
                  ? 'bg-amber-950 text-amber-400 border border-amber-800'
                  : 'bg-rose-950 text-rose-300 border border-rose-800 animate-pulse'
              }`}
            >
              {evaluation.status}
            </span>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Physical Hardware Security Module monitoring for ephemeral dead-man lease signature verification
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleRunSelfTest}
            disabled={isRunningSelfTest}
            className="px-3 py-1.5 rounded-lg bg-cyan-950/80 hover:bg-cyan-900 text-cyan-200 border border-cyan-700/80 text-xs font-mono font-semibold flex items-center gap-1.5 transition-all shadow-sm active:scale-95 disabled:opacity-50"
            title="Execute FIPS 140-3 Known-Answer Test (KAT) and cryptographic health checks"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isRunningSelfTest ? 'animate-spin' : ''}`} />
            <span>{isRunningSelfTest ? 'TESTING...' : 'RUN SELF-TEST (POST)'}</span>
          </button>
          <button
            onClick={handleToggleTamper}
            className={`px-3 py-1.5 rounded-lg border text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow-sm active:scale-95 ${
              hsmState.chassisTamperDetected
                ? 'bg-emerald-950 hover:bg-emerald-900 border-emerald-600 text-emerald-300'
                : 'bg-rose-950 hover:bg-rose-900 border-rose-600 text-rose-300'
            }`}
            title="Test physical enclosure tamper sensor breach"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>{hsmState.chassisTamperDetected ? 'RESET TAMPER SENSOR' : 'TRIGGER TAMPER DRILL'}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Circular Gauge + Telemetry Meters */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mt-5">
        {/* Left: Circular Health Gauge */}
        <div className="lg:col-span-4 bg-slate-950/80 rounded-lg p-5 border border-slate-800 flex flex-col items-center justify-center text-center">
          <div className="relative w-36 h-36 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              {/* Background Circle */}
              <circle
                cx="72"
                cy="72"
                r={radius}
                className="text-slate-800"
                strokeWidth="10"
                stroke="currentColor"
                fill="transparent"
              />
              {/* Progress Arc */}
              <circle
                cx="72"
                cy="72"
                r={radius}
                className={`transition-all duration-700 ${
                  evaluation.overallScore > 80
                    ? 'text-emerald-400'
                    : evaluation.overallScore > 50
                    ? 'text-amber-400'
                    : 'text-rose-500'
                }`}
                strokeWidth="10"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
              />
            </svg>

            {/* Center Score Readout */}
            <div className="absolute flex flex-col items-center font-mono">
              <span className="text-3xl font-black text-slate-100 tracking-tight">
                {evaluation.overallScore}
              </span>
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                HSM HEALTH
              </span>
            </div>
          </div>

          <div className="mt-3 font-mono text-xs">
            <div className="text-slate-300 font-bold flex items-center justify-center gap-1.5">
              {evaluation.isFipsCompliant ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-rose-400 animate-pulse" />
              )}
              <span>{hsmState.fipsLevel}</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Hardware Root: <span className="text-cyan-300">{hsmState.hsmId}</span>
            </div>
          </div>
        </div>

        {/* Right: Key Telemetry Metrics Grid */}
        <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 font-mono text-xs">
          {/* Metric 1: Quantum Hardware Entropy */}
          <div className="bg-slate-950/80 p-3.5 rounded-lg border border-slate-800 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 text-[11px] mb-1">
              <span>TRNG ENTROPY POOL</span>
              <button
                onClick={handleReseedEntropy}
                className="text-cyan-400 hover:text-cyan-200 text-[10px] underline"
              >
                RE-SEED
              </button>
            </div>
            <div className="text-xl font-black text-cyan-300">
              {hsmState.entropyPoolPercent.toFixed(1)}%
            </div>
            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden my-1.5">
              <div
                className="h-full bg-cyan-400 transition-all duration-300"
                style={{ width: `${hsmState.entropyPoolPercent}%` }}
              />
            </div>
            <div className="text-[10px] text-slate-500">
              Quality: <span className="text-emerald-400 font-bold">{hsmState.trngQuality}</span>
            </div>
          </div>

          {/* Metric 2: Enclosure Tamper Sensors */}
          <div
            className={`p-3.5 rounded-lg border flex flex-col justify-between ${
              hsmState.chassisTamperDetected
                ? 'bg-rose-950/40 border-rose-800 text-rose-300'
                : 'bg-slate-950/80 border-slate-800 text-slate-300'
            }`}
          >
            <div className="text-slate-400 text-[11px] mb-1 flex items-center justify-between">
              <span>PHYSICAL TAMPER</span>
              <ShieldAlert className="w-3.5 h-3.5" />
            </div>
            <div
              className={`text-base font-black ${
                hsmState.chassisTamperDetected ? 'text-rose-400 animate-pulse' : 'text-emerald-400'
              }`}
            >
              {hsmState.chassisTamperDetected ? 'BREACH DETECTED' : 'ENCLOSURE SECURE'}
            </div>
            <div className="text-[10px] text-slate-400 mt-2">
              Microswitch: {hsmState.chassisTamperDetected ? 'OPEN (TRIPPED)' : 'LOCKED (PASS)'}
            </div>
            <div className="text-[10px] text-slate-500">
              Laser / Drill Grid: <span className="text-emerald-400">INTACT</span>
            </div>
          </div>

          {/* Metric 3: Signature Latency */}
          <div className="bg-slate-950/80 p-3.5 rounded-lg border border-slate-800 flex flex-col justify-between">
            <div className="text-slate-400 text-[11px] mb-1 flex items-center justify-between">
              <span>SIGNATURE LATENCY</span>
              <Zap className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="text-xl font-black text-slate-100">
              {hsmState.signatureLatencyMs.toFixed(1)} ms
            </div>
            <div className="text-[10px] text-slate-400 mt-2">
              Algorithm: <span className="text-cyan-300 font-bold">Ed25519 (60s Lease)</span>
            </div>
            <div className="text-[10px] text-slate-500">
              Rating: <span className="text-emerald-400 font-bold">{evaluation.latencyRating}</span>
            </div>
          </div>

          {/* Metric 4: Operating Temperature */}
          <div className="bg-slate-950/80 p-3.5 rounded-lg border border-slate-800 flex flex-col justify-between">
            <div className="text-slate-400 text-[11px] mb-1 flex items-center justify-between">
              <span>OPERATING TEMP</span>
              <Flame className="w-3.5 h-3.5 text-rose-400" />
            </div>
            <div className="text-xl font-black text-slate-100">
              {hsmState.operatingTempCelsius.toFixed(1)} °C
            </div>
            <div className="text-[10px] text-slate-400 mt-2">
              Thermal Range: <span className="text-emerald-400">0°C to 70°C Safe</span>
            </div>
            <div className="text-[10px] text-slate-500">Thermal trip sensor armed</div>
          </div>

          {/* Metric 5: RTC Backup Battery */}
          <div className="bg-slate-950/80 p-3.5 rounded-lg border border-slate-800 flex flex-col justify-between">
            <div className="text-slate-400 text-[11px] mb-1 flex items-center justify-between">
              <span>RTC BACKUP BATTERY</span>
              <Battery className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="text-xl font-black text-emerald-300">{hsmState.rtcBatteryPercent}%</div>
            <div className="text-[10px] text-slate-400 mt-2">
              Voltage Rail: <span className="text-cyan-300">+{hsmState.voltageVariancePercent.toFixed(1)}%</span>
            </div>
            <div className="text-[10px] text-slate-500">Zero-power temporal retention</div>
          </div>

          {/* Metric 6: Ephemeral Key Rotations */}
          <div className="bg-slate-950/80 p-3.5 rounded-lg border border-slate-800 flex flex-col justify-between">
            <div className="text-slate-400 text-[11px] mb-1 flex items-center justify-between">
              <span>KEY ROTATIONS LEFT</span>
              <Lock className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <div className="text-xl font-black text-cyan-300">
              {hsmState.cryptoRotationsRemaining.toLocaleString()}
            </div>
            <div className="text-[10px] text-slate-400 mt-2">
              Zeroize Circuit:{' '}
              <span
                className={`font-bold ${
                  hsmState.zeroizeCircuitStatus === 'TRIGGERED' ? 'text-rose-400' : 'text-emerald-400'
                }`}
              >
                {hsmState.zeroizeCircuitStatus}
              </span>
            </div>
            <div className="text-[10px] text-slate-500">Last POST: {hsmState.lastSelfTestTime}</div>
          </div>
        </div>
      </div>

      {/* Warnings / Tamper Alerts */}
      {evaluation.warnings.length > 0 && (
        <div className="mt-4 p-3 rounded-lg bg-rose-950/40 border border-rose-800 text-rose-300 text-xs font-mono space-y-1">
          <div className="font-bold flex items-center gap-1.5 text-rose-300">
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            <span>HSM DIAGNOSTIC HEALTH ALERTS:</span>
          </div>
          {evaluation.warnings.map((w, idx) => (
            <div key={idx} className="pl-5 text-rose-200">
              • {w}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
