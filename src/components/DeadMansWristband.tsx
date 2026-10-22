import React, { useState } from 'react';
import {
  Watch,
  KeyRound,
  Radio,
  AlertOctagon,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  Lock,
  Unlock,
  Sliders,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Sparkles
} from 'lucide-react';
import { LeaseState, LeaseEvaluation, OperationalMode } from '../utils/defenseEngine';

interface DeadMansWristbandProps {
  lease: LeaseState;
  evaluation: LeaseEvaluation;
  onRenewLease: () => void;
  onEmergencyPull: () => void;
  onRestoreLease: () => void;
  onDistanceChange: (distance: number) => void;
  autoRenew: boolean;
  onToggleAutoRenew: () => void;
}

export const DeadMansWristband: React.FC<DeadMansWristbandProps> = ({
  lease,
  evaluation,
  onRenewLease,
  onEmergencyPull,
  onRestoreLease,
  onDistanceChange,
  autoRenew,
  onToggleAutoRenew,
}) => {
  const [showSafetyModal, setShowSafetyModal] = useState(false);
  const isRevoked = evaluation.status === 'REVOKED';
  const isExpired = evaluation.status === 'EXPIRED';
  const isWarning = evaluation.status === 'WARNING';
  const isActive = evaluation.status === 'ACTIVE';

  const percentRemaining = Math.max(0, Math.min(100, (evaluation.secondsRemaining / lease.durationSeconds) * 100));
  const isTetherBroken = lease.tetherDistanceMeters > lease.maxTetherMeters;

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-xl relative overflow-hidden">
      {/* Background Ambient Glow */}
      <div
        className={`absolute -top-24 -right-24 w-64 h-64 rounded-full blur-3xl pointer-events-none transition-all duration-700 ${
          isRevoked || isExpired
            ? 'bg-rose-500/10'
            : isWarning
            ? 'bg-amber-500/15'
            : 'bg-cyan-500/10'
        }`}
      />

      {/* Top Banner / Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-lg flex items-center justify-center font-mono ${
              isActive
                ? 'bg-cyan-950/80 text-cyan-400 border border-cyan-500/40'
                : isWarning
                ? 'bg-amber-950/80 text-amber-400 border border-amber-500/40'
                : 'bg-rose-950/80 text-rose-400 border border-rose-500/40 animate-pulse'
            }`}
          >
            <Watch className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-100 font-mono tracking-wide">
                OPERATOR WRISTBAND &amp; DEAD-MAN'S TETHER
              </h2>
              <span
                className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded font-bold ${
                  isActive
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                    : isWarning
                    ? 'bg-amber-950 text-amber-400 border border-amber-800 animate-pulse'
                    : 'bg-rose-950 text-rose-300 border border-rose-800'
                }`}
              >
                {evaluation.status}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono">
              Cryptographic Lease &amp; Out-of-Band Hardware Interlock Fail-Safe
            </p>
          </div>
        </div>

        {/* Heartbeat Mode Toggle */}
        <div className="flex items-center gap-2 bg-slate-950/70 px-3 py-1.5 rounded-lg border border-slate-800 text-xs font-mono">
          <span className="text-slate-400">HSM Heartbeat:</span>
          <button
            onClick={onToggleAutoRenew}
            className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-all ${
              autoRenew
                ? 'bg-cyan-900/60 text-cyan-300 border border-cyan-700'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            {autoRenew ? 'AUTOMATIC (ACTIVE)' : 'MANUAL CHECK-IN'}
          </button>
        </div>
      </div>

      {/* Main Grid: Wristband Physical Tether Visualizer + Cryptographic Lease Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mt-5">
        {/* Left Column: Interactive Wristband Distance Tether */}
        <div className="lg:col-span-7 bg-slate-950/70 rounded-lg p-4 border border-slate-800/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono font-semibold text-slate-300 flex items-center gap-2">
                <Radio className="w-3.5 h-3.5 text-cyan-400" />
                WEARABLE DISTANCE TETHER (UWB / NFC BEACON)
              </span>
              <span
                className={`text-xs font-mono font-bold ${
                  isTetherBroken ? 'text-rose-400' : 'text-cyan-400'
                }`}
              >
                {lease.tetherDistanceMeters.toFixed(1)}m / {lease.maxTetherMeters}m limit
              </span>
            </div>

            {/* Visual Tether Track */}
            <div className="relative my-4 py-2 px-1">
              <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden relative">
                {/* Safe zone green background */}
                <div
                  className="h-full bg-emerald-950/70 absolute left-0"
                  style={{ width: `${(lease.maxTetherMeters / 25) * 100}%` }}
                />
                {/* Danger zone red background */}
                <div
                  className="h-full bg-rose-950/70 absolute right-0"
                  style={{ width: `${(1 - lease.maxTetherMeters / 25) * 100}%` }}
                />
                {/* Safety Boundary Marker */}
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-amber-400 z-10"
                  style={{ left: `${(lease.maxTetherMeters / 25) * 100}%` }}
                />
              </div>

              {/* Wearable Node Position Indicator */}
              <div
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-20 flex flex-col items-center pointer-events-none transition-all duration-150"
                style={{ left: `${Math.min(100, (lease.tetherDistanceMeters / 25) * 100)}%` }}
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center shadow-lg border-2 ${
                    isTetherBroken
                      ? 'bg-rose-600 border-white text-white animate-bounce'
                      : 'bg-cyan-500 border-slate-900 text-slate-950'
                  }`}
                >
                  <Watch className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>

            {/* Slider to interactively adjust operator distance */}
            <div className="mt-3">
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-1">
                <span>0m (At Terminal)</span>
                <span>15m Safe Threshold</span>
                <span>25m (Walked Away)</span>
              </div>
              <input
                type="range"
                min="0"
                max="25"
                step="0.5"
                value={lease.tetherDistanceMeters}
                onChange={(e) => onDistanceChange(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                aria-label="Adjust operator wristband distance from console"
              />
              <p className="text-[11px] text-slate-400 font-mono mt-2 leading-relaxed">
                <span className="text-cyan-300 font-semibold">Real-world concept:</span> If the operator steps beyond{' '}
                <span className="text-amber-300 font-semibold">{lease.maxTetherMeters}m</span> or physically collapses, the
                wearable breaks proximity. The out-of-band controller{' '}
                <span className="text-rose-400 font-semibold">instantly pulls the cryptographic key</span>, dropping the
                autonomous agent to read-only mode to prevent rogue unchecked operations.
              </p>
            </div>
          </div>

          {/* Signer token metadata */}
          <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-[11px] font-mono text-slate-400">
            <div>
              <span className="text-slate-500">HSM Signer:</span>{' '}
              <span className="text-cyan-300">{lease.signerHsmId}</span>
            </div>
            <div>
              <span className="text-slate-500">Lease Window:</span>{' '}
              <span className="text-slate-300">{lease.durationSeconds}s temporal window</span>
            </div>
          </div>
        </div>

        {/* Right Column: Giant Pull-Key E-Stop & Lease Gauge */}
        <div className="lg:col-span-5 bg-slate-950/70 rounded-lg p-4 border border-slate-800/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono font-semibold text-slate-300 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-cyan-400" />
                60S EPHEMERAL LEASE
              </span>
              <span
                className={`font-mono text-lg font-black tracking-widest ${
                  isRevoked || isExpired
                    ? 'text-rose-400'
                    : isWarning
                    ? 'text-amber-400 animate-pulse'
                    : 'text-cyan-400'
                }`}
              >
                {evaluation.secondsRemaining}s
              </span>
            </div>

            {/* Countdown Progress Bar */}
            <div className="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden mb-3">
              <div
                className={`h-full transition-all duration-300 rounded-full ${
                  isRevoked || isExpired
                    ? 'bg-rose-500'
                    : isWarning
                    ? 'bg-amber-400 animate-pulse'
                    : 'bg-gradient-to-r from-cyan-500 to-emerald-400'
                }`}
                style={{ width: `${percentRemaining}%` }}
              />
            </div>

            {/* Current Evaluation Status Message */}
            <div
              className={`p-2.5 rounded-lg text-xs font-mono border leading-tight ${
                isRevoked || isExpired
                  ? 'bg-rose-950/40 border-rose-800 text-rose-300'
                  : isWarning
                  ? 'bg-amber-950/40 border-amber-800 text-amber-300'
                  : 'bg-cyan-950/30 border-cyan-800 text-cyan-300'
              }`}
            >
              <div className="font-semibold flex items-center gap-1.5 mb-1">
                {isRevoked || isExpired ? (
                  <XCircle className="w-3.5 h-3.5 text-rose-400" />
                ) : (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                )}
                {evaluation.reason}
              </div>
            </div>
          </div>

          {/* Action Buttons: Giant Pull Key & Manual Re-Sign */}
          <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-col gap-2">
            {isRevoked || isExpired ? (
              <button
                onClick={onRestoreLease}
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-mono font-bold text-xs rounded-lg flex items-center justify-center gap-2 shadow-lg transition-all active:scale-98"
              >
                <Unlock className="w-4 h-4" />
                RE-ATTACH WRISTBAND &amp; ISSUE NEW LEASE
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={onRenewLease}
                  className="py-2.5 px-3 bg-cyan-950/90 hover:bg-cyan-900 border border-cyan-600 text-cyan-200 font-mono text-xs rounded-lg flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-95"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  RE-SIGN (60s)
                </button>
                <button
                  onClick={onEmergencyPull}
                  className="py-2.5 px-3 bg-rose-600 hover:bg-rose-500 text-white font-mono font-black text-xs rounded-lg flex items-center justify-center gap-1.5 transition-all shadow-[0_0_15px_rgba(225,29,72,0.4)] active:scale-95"
                  title="Giant Red Button: Emergency Pull-Key"
                >
                  <AlertOctagon className="w-4 h-4" />
                  PULL KEY NOW
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Graceful Degradation Protocol Matrix (How the program survives without rogue risk) */}
      <div className="mt-5 pt-4 border-t border-slate-800">
        <h3 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
          <span>FAIL-SAFE GRACEFUL DEGRADATION MATRIX (NO SYSTEM CRASH)</span>
          <span className="text-[10px] font-normal text-slate-500">
            • E-Brake vs Hard Crash Architecture
          </span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Capability 1: Dynamic Firewall Write Access */}
          <div
            className={`p-3 rounded-lg border font-mono text-xs ${
              evaluation.canMutatePerimeter
                ? 'bg-slate-950 border-slate-800 text-slate-300'
                : 'bg-rose-950/30 border-rose-900 text-rose-300'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] text-slate-400">PERIMETER MUTATION</span>
              {evaluation.canMutatePerimeter ? (
                <span className="text-emerald-400 text-[10px] font-bold">ALLOWED</span>
              ) : (
                <span className="text-rose-400 text-[10px] font-bold">REVOKED</span>
              )}
            </div>
            <p className="text-[11px] text-slate-400 leading-tight">
              {evaluation.canMutatePerimeter
                ? 'AI can apply dynamic iptables rule updates within safety budget.'
                : 'Write access cut. Frozen to static baseline rules.v4.'}
            </p>
          </div>

          {/* Capability 2: Decoy Orchestration */}
          <div
            className={`p-3 rounded-lg border font-mono text-xs ${
              evaluation.canDeployDecoys
                ? 'bg-slate-950 border-slate-800 text-slate-300'
                : 'bg-rose-950/30 border-rose-900 text-rose-300'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] text-slate-400">MICRO-VM DECOYS</span>
              {evaluation.canDeployDecoys ? (
                <span className="text-emerald-400 text-[10px] font-bold">ELASTIC</span>
              ) : (
                <span className="text-rose-400 text-[10px] font-bold">FROZEN</span>
              )}
            </div>
            <p className="text-[11px] text-slate-400 leading-tight">
              {evaluation.canDeployDecoys
                ? 'Elastic spin-up of Firecracker honeypots enabled.'
                : 'Decoy fleet frozen at current count. No new resource allocation.'}
            </p>
          </div>

          {/* Capability 3: Passive Telemetry & Logging */}
          <div className="p-3 rounded-lg border font-mono text-xs bg-slate-950 border-slate-800 text-slate-300">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] text-slate-400">TELEMETRY &amp; AUDIT</span>
              <span className="text-emerald-400 text-[10px] font-bold">ACTIVE (100%)</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-tight">
              All sensors, eBPF probes, and audit logs continue capturing packets. Network is never blind.
            </p>
          </div>

          {/* Capability 4: Air-Gapped OOB Interlock */}
          <div className="p-3 rounded-lg border font-mono text-xs bg-slate-950 border-slate-800 text-slate-300">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] text-slate-400">OOB INTERLOCK</span>
              <span className="text-cyan-400 text-[10px] font-bold">ISOLATED NIC</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-tight">
              AI has 0 network routes to management hardware. It cannot self-renew or bypass key pull.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
