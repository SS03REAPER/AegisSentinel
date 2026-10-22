import React, { useState } from 'react';
import {
  Flame,
  Activity,
  Layers,
  Shield,
  Zap,
  Server,
  Filter,
  RefreshCw,
  Info,
  Radio,
  Sparkles,
  TrendingUp,
  MapPin
} from 'lucide-react';
import { HeatmapCell } from '../types';
import { analyzeGridHeatmap } from '../utils/defenseEngine';

interface CriticalInfraHeatmapProps {
  cells: HeatmapCell[];
  onSelectCell: (cell: HeatmapCell) => void;
  selectedCell: HeatmapCell | null;
  onSimulateSurge: () => void;
  onCoolDownGrid: () => void;
  onDeployHotspotDecoy: (cellId: string) => void;
}

export const CriticalInfraHeatmap: React.FC<CriticalInfraHeatmapProps> = ({
  cells,
  onSelectCell,
  selectedCell,
  onSimulateSurge,
  onCoolDownGrid,
  onDeployHotspotDecoy,
}) => {
  const [sectorFilter, setSectorFilter] = useState<string>('ALL');

  const filteredCells = sectorFilter === 'ALL' ? cells : cells.filter((c) => c.sector === sectorFilter);
  const metrics = analyzeGridHeatmap(cells);

  const getHeatmapColor = (temp: number) => {
    if (temp >= 0.75) {
      return {
        bg: 'bg-rose-500/80 hover:bg-rose-500',
        border: 'border-rose-400',
        text: 'text-rose-100',
        glow: 'shadow-[0_0_15px_rgba(244,63,94,0.6)] animate-pulse',
      };
    }
    if (temp >= 0.5) {
      return {
        bg: 'bg-amber-500/80 hover:bg-amber-500',
        border: 'border-amber-400',
        text: 'text-amber-100',
        glow: 'shadow-[0_0_12px_rgba(245,158,11,0.5)]',
      };
    }
    if (temp >= 0.25) {
      return {
        bg: 'bg-yellow-500/60 hover:bg-yellow-500',
        border: 'border-yellow-400',
        text: 'text-yellow-100',
        glow: '',
      };
    }
    return {
      bg: 'bg-cyan-950/60 hover:bg-cyan-900/80',
      border: 'border-cyan-800/60',
      text: 'text-cyan-300',
      glow: '',
    };
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-100 font-mono tracking-wide flex items-center gap-2">
              <Flame className="w-5 h-5 text-amber-400" />
              CRITICAL INFRASTRUCTURE THREAT &amp; DECOY HEAT MAP
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold">
              GRID TOPOLOGY DENSITY
            </span>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Thermal density monitoring across multi-facility sectors: Sub-cent honeypot decoy absorption vs active agent probes
          </p>
        </div>

        {/* Global Matrix Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onSimulateSurge}
            className="px-3 py-1.5 rounded-lg bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-600/70 text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
            title="Simulate coordinated Cairn autonomous agent probing wave across grid"
          >
            <Flame className="w-3.5 h-3.5 text-rose-400" />
            <span>SIMULATE CAIRN SURGE WAVE</span>
          </button>
          <button
            onClick={onCoolDownGrid}
            className="px-3 py-1.5 rounded-lg bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 border border-cyan-700/80 text-xs font-mono font-semibold flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
            title="Neutralize active attacks and return grid heat map to cool baseline"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>COOL DOWN GRID</span>
          </button>
        </div>
      </div>

      {/* Metric Callout Banner */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 my-4 font-mono text-xs">
        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
          <span className="text-slate-500 text-[11px] block">AVG GRID TEMPERATURE</span>
          <span className="text-lg font-black text-cyan-300">
            {(metrics.averageThreatTemp * 100).toFixed(1)}%
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5">Overall thermal load</span>
        </div>
        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
          <span className="text-slate-500 text-[11px] block">HIGHEST THREAT SECTOR</span>
          <span className="text-lg font-black text-rose-400 truncate block">
            {metrics.highestThreatSector.replace('_', ' ')}
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5">Primary adversary target</span>
        </div>
        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
          <span className="text-slate-500 text-[11px] block">TOTAL TOKENS SUNK IN MATRIX</span>
          <span className="text-lg font-black text-amber-300">
            {metrics.totalTokensSunk.toLocaleString()}
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5">Attacker budget drained</span>
        </div>
        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
          <span className="text-slate-500 text-[11px] block">CRITICAL HOTSPOTS TRAPPED</span>
          <span className="text-lg font-black text-emerald-400">
            {metrics.cellsAtRiskCount} / {cells.length}
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5">Contained in decoys</span>
        </div>
      </div>

      {/* Sector Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-4 border-b border-slate-800 font-mono text-xs">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-slate-500 text-[11px] mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3" /> Filter Sector:
          </span>
          {['ALL', 'POWER_GRID', 'WATER_TREATMENT', 'TELECOM', 'OIL_GAS', 'ENTERPRISE_CLOUD'].map((sec) => (
            <button
              key={sec}
              onClick={() => setSectorFilter(sec)}
              className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-all ${
                sectorFilter === sec
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-700'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {sec.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-[10px] text-slate-400">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded bg-cyan-800 border border-cyan-600" />
            Nominal (&lt;0.25)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded bg-yellow-500 border border-yellow-400" />
            Probe (0.25-0.50)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded bg-amber-500 border border-amber-400" />
            Decoy Trap (0.50-0.75)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded bg-rose-500 border border-rose-400" />
            Token Sink (0.75+)
          </span>
        </div>
      </div>

      {/* Main Heatmap Grid & Inspector Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Heat Map Matrix Grid */}
        <div className="lg:col-span-8 bg-slate-950 p-4 rounded-lg border border-slate-800">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {filteredCells.map((cell) => {
              const color = getHeatmapColor(cell.threatTemperature);
              const isSelected = selectedCell?.id === cell.id;

              return (
                <button
                  key={cell.id}
                  onClick={() => onSelectCell(cell)}
                  className={`p-3 rounded-lg border text-left font-mono transition-all flex flex-col justify-between relative overflow-hidden group ${
                    color.bg
                  } ${color.border} ${color.glow} ${
                    isSelected ? 'ring-2 ring-cyan-400 scale-[1.02]' : 'hover:scale-[1.01]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-950/80 text-slate-200">
                      L{cell.purdueLevel}
                    </span>
                    <span className={`text-xs font-black ${color.text}`}>
                      {(cell.threatTemperature * 100).toFixed(0)}°
                    </span>
                  </div>

                  <div className="my-1">
                    <div className="text-xs font-bold text-slate-100 truncate">{cell.facilityName}</div>
                    <div className="text-[10px] text-slate-300/90 truncate">{cell.region}</div>
                  </div>

                  <div className="mt-2 pt-1.5 border-t border-slate-900/60 flex items-center justify-between text-[10px] text-slate-200">
                    <span>{cell.activeDecoys} Decoys</span>
                    <span className="font-bold">{cell.tokensDrained.toLocaleString()} tok</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Selected Cell Inspector Panel */}
        <div className="lg:col-span-4 bg-slate-950/90 rounded-lg p-4 border border-slate-800 font-mono text-xs flex flex-col justify-between">
          {selectedCell ? (
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
                <span className="font-bold text-slate-100 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-cyan-400" />
                  FACILITY INSPECTOR
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold">
                  Purdue Level {selectedCell.purdueLevel}
                </span>
              </div>

              <div className="space-y-2.5 text-slate-300">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">Facility Identifier:</span>
                  <div className="text-sm font-bold text-cyan-300">{selectedCell.facilityName}</div>
                  <div className="text-[11px] text-slate-400">
                    {selectedCell.sector.replace('_', ' ')} • {selectedCell.region}
                  </div>
                </div>

                <div className="p-2.5 rounded bg-slate-900 border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-400">Threat Heat Index:</span>
                  <span
                    className={`font-black text-sm ${
                      selectedCell.threatTemperature >= 0.75
                        ? 'text-rose-400'
                        : selectedCell.threatTemperature >= 0.5
                        ? 'text-amber-400'
                        : 'text-cyan-400'
                    }`}
                  >
                    {(selectedCell.threatTemperature * 100).toFixed(1)}% THERMAL LOAD
                  </span>
                </div>

                <div className="space-y-1.5 text-[11px]">
                  <div className="flex justify-between border-b border-slate-900 pb-1">
                    <span className="text-slate-500">Active Firecracker Decoys:</span>
                    <span className="text-emerald-400 font-bold">{selectedCell.activeDecoys} MicroVMs</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-900 pb-1">
                    <span className="text-slate-500">Attacker Queries Intercepted:</span>
                    <span className="text-slate-200">{selectedCell.attackerQueriesBlocked} probes</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-900 pb-1">
                    <span className="text-slate-500">Attacker Tokens Sunk:</span>
                    <span className="text-amber-400 font-bold">{selectedCell.tokensDrained.toLocaleString()} tokens</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-900 pb-1">
                    <span className="text-slate-500">Optical Data Diode Status:</span>
                    <span className="text-emerald-400 font-bold">UNIDIRECTIONAL PASS (RX-ONLY)</span>
                  </div>
                </div>

                <div className="mt-3">
                  <button
                    onClick={() => onDeployHotspotDecoy(selectedCell.id)}
                    className="w-full py-2 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs rounded transition-all active:scale-95 flex items-center justify-center gap-1.5 shadow"
                  >
                    <Server className="w-3.5 h-3.5" />
                    DEPLOY MICRO-VM DECOY TO FACILITY
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 py-10">
              <Info className="w-6 h-6 mb-2 text-slate-600" />
              <span>Select any heat map facility cell to inspect live threat metrics and deploy localized decoys.</span>
            </div>
          )}

          <div className="mt-4 pt-3 border-t border-slate-800 text-[10px] text-slate-500">
            Real-time eBPF packet absorption matrix updated at 1Hz.
          </div>
        </div>
      </div>
    </div>
  );
};
