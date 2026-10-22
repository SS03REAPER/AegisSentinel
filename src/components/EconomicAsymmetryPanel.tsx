import React from 'react';
import {
  Coins,
  Flame,
  Zap,
  TrendingDown,
  Layers,
  Cpu,
  Terminal,
  Shield,
  Clock,
  Sparkles,
  Server
} from 'lucide-react';
import { EconomicAnalysis } from '../utils/defenseEngine';
import { HoneypotDecoy } from '../types';

interface EconomicAsymmetryPanelProps {
  economicAnalysis: EconomicAnalysis;
  decoys: HoneypotDecoy[];
  onSpawnDecoy: () => void;
  canDeployDecoys: boolean;
}

export const EconomicAsymmetryPanel: React.FC<EconomicAsymmetryPanelProps> = ({
  economicAnalysis,
  decoys,
  onSpawnDecoy,
  canDeployDecoys,
}) => {
  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-100 font-mono tracking-wide flex items-center gap-2">
              <Coins className="w-5 h-5 text-amber-400" />
              ECONOMIC ASYMMETRY // THE "TOKEN SINK" TRAP
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold">
              {economicAnalysis.asymmetryRatio.toLocaleString()}x RATIO
            </span>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Bleeding autonomous AI attacker compute budgets dry via sub-cent Firecracker microVM decoys
          </p>
        </div>

        {/* Quick Spawn Button */}
        <button
          onClick={onSpawnDecoy}
          disabled={!canDeployDecoys}
          className={`px-3 py-1.5 rounded-lg font-mono text-xs font-semibold flex items-center gap-1.5 transition-all ${
            canDeployDecoys
              ? 'bg-cyan-950 hover:bg-cyan-900 border border-cyan-600 text-cyan-200 shadow-sm active:scale-95'
              : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
          }`}
          title={canDeployDecoys ? 'Deploy new Firecracker MicroVM decoy' : 'Decoy deployment frozen (Lease inactive)'}
        >
          <Server className="w-3.5 h-3.5" />
          <span>SPAWN MICRO-VM DECOY</span>
        </button>
      </div>

      {/* Hero Metric Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-5">
        {/* Attacker Token Burn */}
        <div className="bg-slate-950/80 rounded-lg p-4 border border-rose-900/40 relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono font-semibold text-rose-300 flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-rose-400 animate-pulse" />
              ATTACKER TOKEN BURN
            </span>
            <span className="text-[10px] font-mono text-rose-400/80 bg-rose-950/80 px-1.5 py-0.5 rounded border border-rose-800">
              CLAUDE / DEEPSEEK
            </span>
          </div>
          <div className="text-2xl font-black font-mono text-rose-300 tracking-tight">
            {economicAnalysis.attackerTokensBurned.toLocaleString()}
            <span className="text-xs font-normal text-rose-400/70 ml-1">tokens</span>
          </div>
          <div className="mt-2 text-xs font-mono text-rose-400 font-bold flex items-center gap-1">
            <span>COST TO ATTACKER:</span>
            <span className="text-sm font-extrabold text-rose-300">
              ${economicAnalysis.attackerCostUsd.toFixed(2)} USD
            </span>
          </div>
          <p className="text-[11px] text-slate-500 font-mono mt-1">
            ~{economicAnalysis.wastedAttackerHours}h compute wasted in labyrinth
          </p>
        </div>

        {/* Defender Sub-Cent Cost */}
        <div className="bg-slate-950/80 rounded-lg p-4 border border-emerald-900/40 relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono font-semibold text-emerald-300 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-emerald-400" />
              DEFENDER CLUSTER COST
            </span>
            <span className="text-[10px] font-mono text-emerald-400/80 bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-800">
              MICRO-VM / EBPF
            </span>
          </div>
          <div className="text-2xl font-black font-mono text-emerald-300 tracking-tight">
            ${economicAnalysis.defenderCostUsd.toFixed(5)}
            <span className="text-xs font-normal text-emerald-400/70 ml-1">USD</span>
          </div>
          <div className="mt-2 text-xs font-mono text-emerald-400 font-bold flex items-center gap-1">
            <span>RUNNING FLEET:</span>
            <span className="text-sm font-extrabold text-emerald-300">
              {decoys.length} DECOYS
            </span>
          </div>
          <p className="text-[11px] text-slate-500 font-mono mt-1">
            Avg $0.00004/min per ephemeral container
          </p>
        </div>

        {/* Asymmetry Advantage Factor */}
        <div className="bg-slate-950/80 rounded-lg p-4 border border-cyan-900/40 relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono font-semibold text-cyan-300 flex items-center gap-1.5">
              <TrendingDown className="w-4 h-4 text-cyan-400" />
              ASYMMETRY ADVANTAGE
            </span>
            <span className="text-[10px] font-mono text-cyan-400/80 bg-cyan-950/80 px-1.5 py-0.5 rounded border border-cyan-800">
              EXHAUSTION CURVE
            </span>
          </div>
          <div className="text-2xl font-black font-mono text-cyan-300 tracking-tight">
            {economicAnalysis.asymmetryRatio.toLocaleString()} : 1
          </div>
          <div className="mt-2 text-xs font-mono text-cyan-400/90 leading-tight">
            For every <span className="font-bold text-emerald-400">$1</span> spent defending, the attacker burns{' '}
            <span className="font-bold text-rose-300">${economicAnalysis.asymmetryRatio.toLocaleString()}</span>.
          </div>
          <p className="text-[11px] text-slate-500 font-mono mt-1">
            Forces attacker model token quota exhaustion
          </p>
        </div>

        {/* Threat Yield / Leakage Rate */}
        <div className="bg-slate-950/80 rounded-lg p-4 border border-slate-800 relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono font-semibold text-slate-300 flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-emerald-400" />
              PRODUCTION EXPLOIT YIELD
            </span>
            <span className="text-[10px] font-mono text-emerald-400/80 bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-800">
              ZERO LEAK
            </span>
          </div>
          <div className="text-2xl font-black font-mono text-emerald-400 tracking-tight">
            0.00%
          </div>
          <div className="mt-2 text-xs font-mono text-slate-400 leading-tight">
            100% of attacking agent commands diverted into isolated synthetic memory heaps.
          </div>
          <p className="text-[11px] text-slate-500 font-mono mt-1">
            Real corporate databases never touched
          </p>
        </div>
      </div>

      {/* Active MicroVM Decoy Fleet Table */}
      <div className="mt-5">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <span>EPHEMERAL MICRO-VM HONEYPOT FLEET</span>
            <span className="text-[10px] font-normal text-slate-500">
              • AWS Firecracker &amp; eBPF Sub-Cent Instances
            </span>
          </h3>
          <span className="text-[11px] font-mono text-slate-400">
            Total Fleet Memory: {decoys.reduce((acc, d) => acc + d.memoryMb, 0)} MB / 2048 MB Cap
          </span>
        </div>

        <div className="overflow-x-auto rounded-lg border border-slate-800">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">INSTANCE ID</th>
                <th className="py-2.5 px-3">ARCHITECTURE</th>
                <th className="py-2.5 px-3">PORT / BIND</th>
                <th className="py-2.5 px-3">STATUS</th>
                <th className="py-2.5 px-3 text-right">ATTACKER TOKENS DRAINED</th>
                <th className="py-2.5 px-3">INTERCEPTED BEHAVIOR</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 bg-slate-950/40">
              {decoys.map((decoy) => {
                const isTrapping = decoy.status === 'TRAPPING_AGENT';
                const isDecompiling = decoy.status === 'DECOMPILING_PAYLOAD';

                return (
                  <tr key={decoy.id} className="hover:bg-slate-900/50 transition-colors">
                    <td className="py-2.5 px-3 text-cyan-300 font-bold">{decoy.id}</td>
                    <td className="py-2.5 px-3 text-slate-300">
                      <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-[11px]">
                        {decoy.type}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-400">
                      {decoy.ip}:{decoy.port}
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                          isTrapping
                            ? 'bg-rose-950 text-rose-300 border border-rose-800 animate-pulse'
                            : isDecompiling
                            ? 'bg-amber-950 text-amber-300 border border-amber-800'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            isTrapping ? 'bg-rose-400' : isDecompiling ? 'bg-amber-400' : 'bg-slate-500'
                          }`}
                        />
                        {decoy.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right text-rose-300 font-bold">
                      {decoy.tokensDrained > 0 ? `${decoy.tokensDrained.toLocaleString()} tokens` : '0'}
                    </td>
                    <td className="py-2.5 px-3 text-slate-400 max-w-xs truncate" title={decoy.activePayload}>
                      {decoy.activePayload || 'Awaiting ingress probe traversal'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
