import React, { useState } from 'react';
import {
  Play,
  Square,
  AlertTriangle,
  Flame,
  Terminal,
  Shield,
  Radio,
  FileCode,
  Zap,
  Activity,
  Layers
} from 'lucide-react';
import { AttackCampaign, SecurityEventLog } from '../types';

interface AttackSimulatorProps {
  campaigns: AttackCampaign[];
  activeCampaign: AttackCampaign | null;
  onLaunchCampaign: (campaign: AttackCampaign) => void;
  onStopCampaign: () => void;
  eventLogs: SecurityEventLog[];
  isAttacking: boolean;
}

export const AttackSimulator: React.FC<AttackSimulatorProps> = ({
  campaigns,
  activeCampaign,
  onLaunchCampaign,
  onStopCampaign,
  eventLogs,
  isAttacking,
}) => {
  const [selectedId, setSelectedId] = useState<string>(campaigns[0].id);

  const selectedCampaign = campaigns.find((c) => c.id === selectedId) || campaigns[0];

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-100 font-mono tracking-wide flex items-center gap-2">
              <Terminal className="w-5 h-5 text-rose-400" />
              THREAT CAMPAIGN SIMULATOR // CAIRN AI AGENT SCENARIOS
            </h2>
            {isAttacking && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800 font-bold animate-pulse">
                SIMULATION LIVE
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Real-world autonomous AI attack simulations based on documented multi-agent campaigns
          </p>
        </div>

        {/* Campaign Action Button */}
        <div>
          {isAttacking ? (
            <button
              onClick={onStopCampaign}
              className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-mono text-xs font-bold flex items-center gap-1.5 transition-all shadow-[0_0_12px_rgba(225,29,72,0.4)] active:scale-95"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
              HALT SIMULATION
            </button>
          ) : (
            <button
              onClick={() => onLaunchCampaign(selectedCampaign)}
              className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-mono text-xs font-bold flex items-center gap-1.5 transition-all shadow-[0_0_12px_rgba(6,182,212,0.4)] active:scale-95"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              LAUNCH CAMPAIGN
            </button>
          )}
        </div>
      </div>

      {/* Campaign Selector Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mt-5">
        {campaigns.map((camp) => {
          const isSelected = camp.id === selectedId;
          const isCurrentlyRunning = isAttacking && activeCampaign?.id === camp.id;

          return (
            <button
              key={camp.id}
              onClick={() => setSelectedId(camp.id)}
              className={`p-3 rounded-lg border text-left font-mono transition-all relative overflow-hidden ${
                isCurrentlyRunning
                  ? 'bg-rose-950/40 border-rose-600 ring-1 ring-rose-500'
                  : isSelected
                  ? 'bg-slate-800/90 border-cyan-500 shadow-md'
                  : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    camp.intensity === 'CATASTROPHIC'
                      ? 'bg-rose-950 text-rose-300 border border-rose-800'
                      : camp.intensity === 'CRITICAL'
                      ? 'bg-amber-950 text-amber-300 border border-amber-800'
                      : 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                  }`}
                >
                  {camp.intensity}
                </span>
                <span className="text-[10px] text-slate-400 font-medium">{camp.modelsUsed}</span>
              </div>
              <h4 className="text-xs font-bold text-slate-100 truncate">{camp.name}</h4>
              <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-tight">
                {camp.description}
              </p>
            </button>
          );
        })}
      </div>

      {/* Selected Campaign Breakdown & Active Intercepted Log */}
      <div className="mt-5 grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Campaign Anatomy */}
        <div className="lg:col-span-5 bg-slate-950/80 rounded-lg p-4 border border-slate-800 font-mono text-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-200 font-bold flex items-center gap-1.5">
                <FileCode className="w-3.5 h-3.5 text-cyan-400" />
                CAMPAIGN PROFILE
              </span>
              <span className="text-[10px] text-slate-500">Threat ID: {selectedCampaign.id}</span>
            </div>

            <div className="space-y-2 mt-3 text-slate-300">
              <div className="flex justify-between border-b border-slate-900 pb-1">
                <span className="text-slate-500">Threat Actor:</span>
                <span className="text-rose-400 font-bold">{selectedCampaign.threatActor}</span>
              </div>
              <div className="flex justify-between border-b border-slate-900 pb-1">
                <span className="text-slate-500">Autonomous Models:</span>
                <span className="text-cyan-300">{selectedCampaign.modelsUsed}</span>
              </div>
              <div className="flex justify-between border-b border-slate-900 pb-1">
                <span className="text-slate-500">Target Vector:</span>
                <span className="text-slate-200">{selectedCampaign.targetSurface}</span>
              </div>
              <div className="flex justify-between border-b border-slate-900 pb-1">
                <span className="text-slate-500">Attacker Token Rate:</span>
                <span className="text-amber-400">~{selectedCampaign.avgTokensPerTurn} tokens / query</span>
              </div>
            </div>

            <div className="mt-3">
              <span className="text-[11px] text-slate-500 block mb-1">Simulated Ingress Payload:</span>
              <div className="p-2 rounded bg-slate-900 border border-slate-800 text-[11px] text-rose-300 font-mono break-all">
                {selectedCampaign.initialPayload}
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400">
            Autonomous agent operates with 0 human supervision over ~23 hours per intrusion.
          </div>
        </div>

        {/* Right: Live Interception & Security Event Stream */}
        <div className="lg:col-span-7 bg-slate-950/80 rounded-lg p-4 border border-slate-800 font-mono flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-cyan-400" />
                LIVE INTERCEPTION EVENT STREAM
              </span>
              <span className="text-[10px] text-slate-500">{eventLogs.length} events logged</span>
            </div>

            {/* Scrollable Log Terminal */}
            <div className="h-56 overflow-y-auto space-y-1.5 pr-1 mt-2 text-xs">
              {eventLogs.length === 0 ? (
                <div className="h-full flex items-center justify-center text-slate-500 text-xs">
                  No active security events. Launch a campaign or adjust controls to generate traffic.
                </div>
              ) : (
                eventLogs.map((log) => {
                  return (
                    <div
                      key={log.id}
                      className="p-2 rounded bg-slate-900/60 border border-slate-800/80 flex flex-col gap-0.5"
                    >
                      <div className="flex items-center justify-between text-[11px]">
                        <div className="flex items-center gap-1.5">
                          <span className="text-slate-500">{log.timestamp}</span>
                          <span
                            className={`px-1 rounded text-[10px] font-bold ${
                              log.level === 'BLOCKED'
                                ? 'bg-rose-950 text-rose-300'
                                : log.level === 'DEFENSE'
                                ? 'bg-cyan-950 text-cyan-300'
                                : log.level === 'DEAD_MAN'
                                ? 'bg-amber-950 text-amber-300'
                                : 'bg-slate-800 text-slate-300'
                            }`}
                          >
                            [{log.category}]
                          </span>
                        </div>
                        {log.tokensBurned && log.tokensBurned > 0 && (
                          <span className="text-rose-400 text-[10px] font-bold">
                            +{log.tokensBurned.toLocaleString()} tokens burned
                          </span>
                        )}
                      </div>
                      <div className="text-slate-200 font-semibold">{log.message}</div>
                      {log.details && <div className="text-[11px] text-slate-400">{log.details}</div>}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
