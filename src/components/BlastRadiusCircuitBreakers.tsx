import React from 'react';
import {
  Sliders,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
  AlertOctagon,
  Cpu,
  Flame,
  CheckCircle2,
  XCircle,
  HelpCircle
} from 'lucide-react';
import { CircuitBreakerMetrics, CircuitBreakerEvaluation } from '../utils/defenseEngine';

interface BlastRadiusCircuitBreakersProps {
  metrics: CircuitBreakerMetrics;
  evaluation: CircuitBreakerEvaluation;
  onUpdateMetrics: (newMetrics: Partial<CircuitBreakerMetrics>) => void;
  pendingHitlApprovals: Array<{ id: string; targetCidr: string; reason: string; anomalyScore: number }>;
  onApproveHitl: (id: string) => void;
  onRejectHitl: (id: string) => void;
}

export const BlastRadiusCircuitBreakers: React.FC<BlastRadiusCircuitBreakersProps> = ({
  metrics,
  evaluation,
  onUpdateMetrics,
  pendingHitlApprovals,
  onApproveHitl,
  onRejectHitl,
}) => {
  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-xl">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-100 font-mono tracking-wide flex items-center gap-2">
              <Sliders className="w-5 h-5 text-amber-400" />
              BLAST-RADIUS CIRCUIT BREAKERS // ANTI-CASCADE
            </h2>
            <span
              className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                evaluation.isMutationTripped || evaluation.isMemoryTripped
                  ? 'bg-rose-950 text-rose-300 border border-rose-800 animate-pulse'
                  : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
              }`}
            >
              {evaluation.isMutationTripped || evaluation.isMemoryTripped
                ? 'CIRCUIT BREAKER ENGAGED'
                : 'CONSTRAINTS NOMINAL'}
            </span>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Deterministic mathematical caps preventing autonomous AI self-inflicted Denial of Service (DoS) and routing loops
          </p>
        </div>

        {/* Reset/Simulate Surge button */}
        <div className="flex items-center gap-2">
          <button
            onClick={() =>
              onUpdateMetrics({
                mutationCount1m: metrics.mutationCount1m > metrics.maxMutationsPerMin ? 3 : 14,
              })
            }
            className={`px-3 py-1.5 rounded-lg border text-xs font-mono font-semibold transition-all shadow-sm active:scale-95 ${
              metrics.mutationCount1m > metrics.maxMutationsPerMin
                ? 'bg-emerald-950/80 hover:bg-emerald-900 border-emerald-600 text-emerald-300'
                : 'bg-rose-950/80 hover:bg-rose-900 border-rose-600 text-rose-300'
            }`}
          >
            {metrics.mutationCount1m > metrics.maxMutationsPerMin
              ? 'RESET MUTATION SURGE'
              : 'TRIGGER MUTATION OVERLOAD DRILL'}
          </button>
        </div>
      </div>

      {/* Tripped Reasons Banner if any */}
      {evaluation.trippedReasons.length > 0 && (
        <div className="mt-4 p-3 rounded-lg bg-rose-950/40 border border-rose-800 text-rose-200 text-xs font-mono space-y-1">
          <div className="font-bold flex items-center gap-1.5 text-rose-300">
            <AlertOctagon className="w-4 h-4 text-rose-400 animate-pulse" />
            AUTOMATIC BLAST RADIUS LOCKDOWN TRIGGERED:
          </div>
          {evaluation.trippedReasons.map((reason, idx) => (
            <div key={idx} className="pl-5 text-rose-300/90">
              • {reason}
            </div>
          ))}
        </div>
      )}

      {/* 3 Main Breaker Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
        {/* Breaker 1: Mutation Rate Limiter */}
        <div
          className={`p-4 rounded-lg border font-mono transition-all ${
            evaluation.isMutationTripped
              ? 'bg-rose-950/30 border-rose-800'
              : 'bg-slate-950/80 border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              MUTATION RATE LIMITER
            </span>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                evaluation.isMutationTripped
                  ? 'bg-rose-950 text-rose-300 border border-rose-800 animate-pulse'
                  : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
              }`}
            >
              {evaluation.isMutationTripped ? 'WRITE-LOCK ENGAGED' : 'PERMITTED'}
            </span>
          </div>

          <div className="text-xl font-bold font-mono text-slate-100 my-1">
            {metrics.mutationCount1m} / {metrics.maxMutationsPerMin}{' '}
            <span className="text-xs font-normal text-slate-400">rules/min</span>
          </div>

          {/* Progress Bar */}
          <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden my-2">
            <div
              className={`h-full transition-all duration-300 ${
                evaluation.isMutationTripped ? 'bg-rose-500' : 'bg-cyan-400'
              }`}
              style={{
                width: `${Math.min(100, (metrics.mutationCount1m / metrics.maxMutationsPerMin) * 100)}%`,
              }}
            />
          </div>

          <p className="text-[11px] text-slate-400 leading-relaxed mt-2">
            Prevents AI from accidentally severing legitimate sysadmin SSH/VPN access or causing network route thrashing
            during an adversarial hallucination.
          </p>

          <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <span>Adjust Ceiling:</span>
            <input
              type="range"
              min="5"
              max="30"
              value={metrics.maxMutationsPerMin}
              onChange={(e) => onUpdateMetrics({ maxMutationsPerMin: parseInt(e.target.value, 10) })}
              className="w-24 h-1.5 bg-slate-800 rounded appearance-none cursor-pointer accent-cyan-400"
              aria-label="Adjust maximum allowed firewall mutations per minute"
            />
          </div>
        </div>

        {/* Breaker 2: Decoy Memory Capping */}
        <div
          className={`p-4 rounded-lg border font-mono transition-all ${
            evaluation.isMemoryTripped
              ? 'bg-rose-950/30 border-rose-800'
              : 'bg-slate-950/80 border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              DECOY MEMORY CAPPING
            </span>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                evaluation.isMemoryTripped
                  ? 'bg-rose-950 text-rose-300 border border-rose-800 animate-pulse'
                  : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
              }`}
            >
              {evaluation.isMemoryTripped ? 'ALLOCATION FROZEN' : 'UNDER 5% CAP'}
            </span>
          </div>

          <div className="text-xl font-bold font-mono text-slate-100 my-1">
            {metrics.decoyMemoryMb} / {metrics.maxMemoryMb}{' '}
            <span className="text-xs font-normal text-slate-400">MB RAM</span>
          </div>

          {/* Progress Bar */}
          <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden my-2">
            <div
              className={`h-full transition-all duration-300 ${
                evaluation.isMemoryTripped ? 'bg-rose-500' : 'bg-emerald-400'
              }`}
              style={{
                width: `${Math.min(100, (metrics.decoyMemoryMb / metrics.maxMemoryMb) * 100)}%`,
              }}
            />
          </div>

          <p className="text-[11px] text-slate-400 leading-relaxed mt-2">
            Hard resource boundary. Prevents runaway container fork-bombs from exhausting host cluster RAM and CPU
            budget.
          </p>

          <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <span>Cluster Cap:</span>
            <span className="text-cyan-300 font-bold">{metrics.maxMemoryMb} MB (5.0%)</span>
          </div>
        </div>

        {/* Breaker 3: Human-in-the-Loop Quarantine */}
        <div className="p-4 rounded-lg border font-mono bg-slate-950/80 border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-cyan-400" />
              HUMAN-IN-THE-LOOP THRESHOLD
            </span>
            <span className="text-[10px] font-bold text-amber-300 bg-amber-950/80 px-1.5 py-0.5 rounded border border-amber-800">
              70% - 95% ANOMALY
            </span>
          </div>

          <div className="text-xl font-bold font-mono text-slate-100 my-1">
            Score: {metrics.anomalyScore}%
          </div>

          {/* Progress Bar */}
          <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden my-2">
            <div
              className="h-full bg-gradient-to-r from-emerald-400 via-amber-400 to-rose-500 transition-all duration-300"
              style={{ width: `${metrics.anomalyScore}%` }}
            />
          </div>

          <p className="text-[11px] text-slate-400 leading-relaxed mt-2">
            Between 70% and 95%, traffic is silently quarantined into micro-honeypots, but permanent network CIDR
            blacklisting requires verified operator authorization.
          </p>

          <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <span>Simulate Anomaly:</span>
            <input
              type="range"
              min="0"
              max="100"
              value={metrics.anomalyScore}
              onChange={(e) => onUpdateMetrics({ anomalyScore: parseInt(e.target.value, 10) })}
              className="w-24 h-1.5 bg-slate-800 rounded appearance-none cursor-pointer accent-amber-400"
              aria-label="Adjust anomaly score for Human-in-the-Loop testing"
            />
          </div>
        </div>
      </div>

      {/* Pending Human-in-the-Loop Authorization Queue */}
      {pendingHitlApprovals.length > 0 && (
        <div className="mt-5 pt-4 border-t border-slate-800">
          <h3 className="text-xs font-mono font-bold text-amber-300 uppercase tracking-wider mb-2 flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-amber-400" />
            <span>PENDING HUMAN OPERATOR APPROVAL QUEUE ({pendingHitlApprovals.length})</span>
          </h3>

          <div className="space-y-2">
            {pendingHitlApprovals.map((req) => (
              <div
                key={req.id}
                className="bg-slate-950 p-3 rounded-lg border border-amber-900/60 font-mono text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2 text-slate-200 font-bold">
                    <span>TARGET CIDR:</span>
                    <span className="text-rose-400">{req.targetCidr}</span>
                    <span className="text-amber-400 text-[10px] bg-amber-950 px-1.5 py-0.2 rounded border border-amber-800">
                      Anomaly Score: {req.anomalyScore}%
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">{req.reason}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => onApproveHitl(req.id)}
                    className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs rounded transition-all active:scale-95 flex items-center gap-1"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    AUTHORIZE PERMANENT BAN
                  </button>
                  <button
                    onClick={() => onRejectHitl(req.id)}
                    className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded transition-all active:scale-95 flex items-center gap-1"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    REJECT (KEEP SANDBOXED)
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
