import React from 'react';
import { Shield, ShieldAlert, ShieldCheck, KeyRound, Radio, Cpu, RefreshCw, AlertTriangle } from 'lucide-react';
import { OperationalMode, LeaseEvaluation } from '../utils/defenseEngine';

interface HeaderProps {
  operationalMode: OperationalMode;
  leaseEvaluation: LeaseEvaluation;
  onEmergencyPull: () => void;
  onRenewLease: () => void;
  serverOnline: boolean;
  activeAttackName: string | null;
  hsmScore?: number;
  onNavigateToHsm?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  operationalMode,
  leaseEvaluation,
  onEmergencyPull,
  onRenewLease,
  serverOnline,
  activeAttackName,
  hsmScore = 98,
  onNavigateToHsm,
}) => {
  const isRevokedOrExpired = leaseEvaluation.status === 'REVOKED' || leaseEvaluation.status === 'EXPIRED';

  return (
    <header className="border-b border-cyan-900/40 bg-slate-950/95 backdrop-blur-md z-40 px-3 sm:px-6 py-2.5">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Brand & System Identity */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <div
              className={`w-11 h-11 rounded-lg flex items-center justify-center font-mono font-black text-xl transition-all duration-300 ${
                isRevokedOrExpired
                  ? 'bg-amber-950/60 text-amber-400 border border-amber-600/60 shadow-[0_0_15px_rgba(245,158,11,0.25)]'
                  : 'bg-cyan-950/80 text-cyan-400 border border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.3)] animate-pulse'
              }`}
            >
              {isRevokedOrExpired ? <ShieldAlert className="w-6 h-6" /> : <ShieldCheck className="w-6 h-6" />}
            </div>
            <span
              className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-slate-950 ${
                serverOnline ? 'bg-emerald-500 animate-ping' : 'bg-rose-500'
              }`}
            />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg lg:text-xl font-bold tracking-wider text-slate-100 font-mono flex items-center gap-2">
                AEGIS<span className="text-cyan-400">SENTINEL</span>
                <span className="text-xs px-2 py-0.5 rounded font-mono font-medium tracking-normal bg-cyan-950 text-cyan-300 border border-cyan-800/60">
                  CIP DEFENSE OS v4.8
                </span>
              </h1>
            </div>
            <p className="text-xs text-slate-400 font-mono flex items-center gap-2">
              <span>CRITICAL INFRASTRUCTURE DEFENSE</span>
              <span className="text-slate-600">•</span>
              <span className="text-emerald-400/90 flex items-center gap-1">
                <Radio className="w-3 h-3" /> FIPS-140-3 HSM AIRGAP
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-cyan-400 font-semibold">GEMINI 3.8 FLASH (HIGH THINKING)</span>
            </p>
          </div>
        </div>

        {/* Operational Status Indicators & Dead-Man Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Active Attack Status Pill */}
          {activeAttackName && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-rose-950/60 border border-rose-500/50 text-rose-300 text-xs font-mono animate-pulse">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <span className="font-semibold">INTERCEPTING:</span> {activeAttackName}
            </div>
          )}

          {/* Mode Pill */}
          <div
            className={`px-3 py-1.5 rounded-lg border font-mono text-xs flex items-center gap-2 ${
              operationalMode === 'ACTIVE_DEFENSE'
                ? 'bg-emerald-950/70 border-emerald-500/50 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.15)]'
                : 'bg-amber-950/70 border-amber-500/50 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.15)]'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                operationalMode === 'ACTIVE_DEFENSE' ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'
              }`}
            />
            <span className="font-bold">
              {operationalMode === 'ACTIVE_DEFENSE' ? 'ACTIVE DEFENSE SHIELD' : 'PASSIVE OBSERVABILITY'}
            </span>
          </div>

          {/* HSM Health Pill */}
          <button
            onClick={onNavigateToHsm}
            className={`px-3 py-1.5 rounded-lg border font-mono text-xs flex items-center gap-1.5 transition-all active:scale-95 ${
              hsmScore >= 80
                ? 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-300'
                : 'bg-rose-950/80 hover:bg-rose-900 border-rose-600 text-rose-300 animate-pulse'
            }`}
            title="Inspect FIPS 140-3 Hardware Security Module Root-of-Trust Health"
          >
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span>HSM:</span>
            <span className={`font-bold ${hsmScore >= 80 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {hsmScore}%
            </span>
          </button>

          {/* Dead-man's Lease Timer Counter */}
          <div
            className={`px-3 py-1.5 rounded-lg border font-mono text-xs flex items-center gap-2 ${
              leaseEvaluation.status === 'ACTIVE'
                ? 'bg-slate-900 border-slate-700 text-cyan-300'
                : leaseEvaluation.status === 'WARNING'
                ? 'bg-amber-950/80 border-amber-600 text-amber-300 animate-pulse'
                : 'bg-rose-950/80 border-rose-600 text-rose-300'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5 text-cyan-400" />
            <span>LEASE:</span>
            <span className="font-bold tracking-widest text-sm">
              {leaseEvaluation.secondsRemaining}s
            </span>
          </div>

          {/* Quick Lease Renewal Button */}
          <button
            onClick={onRenewLease}
            className="px-3 py-1.5 rounded-lg bg-cyan-950/80 hover:bg-cyan-900/90 text-cyan-300 hover:text-cyan-100 border border-cyan-700/60 text-xs font-mono flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
            title="Sign 60-second cryptographic lease extension via operator HSM token"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>RENEW LEASE</span>
          </button>

          {/* Quick Pull Key button in header */}
          {!isRevokedOrExpired && (
            <button
              onClick={onEmergencyPull}
              className="px-3 py-1.5 rounded-lg bg-rose-950/80 hover:bg-rose-900 text-rose-300 hover:text-rose-100 border border-rose-600/70 text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow-[0_0_12px_rgba(225,29,72,0.3)] active:scale-95"
              title="Activate Emergency Dead-Man Pull-Key: Instantly revokes dynamic permissions"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
              <span>PULL KEY</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
