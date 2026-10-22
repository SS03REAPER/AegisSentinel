import React, { useState } from 'react';
import {
  Layers,
  ArrowUp,
  ArrowDown,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Zap,
  Activity,
  Lock,
  Cpu,
  Radio,
  Sparkles
} from 'lucide-react';
import { PurdueNode } from '../types';
import { evaluatePurdueRouting, PurduePacketResult } from '../utils/defenseEngine';

interface PurdueIsolationMapProps {
  onLogSecurityEvent: (event: any) => void;
}

export const PurdueIsolationMap: React.FC<PurdueIsolationMapProps> = ({ onLogSecurityEvent }) => {
  const [testResult, setTestResult] = useState<PurduePacketResult | null>(null);
  const [activeLaser, setActiveLaser] = useState<'UP_TELEMETRY' | 'DOWN_BLOCKED' | null>(null);

  const purdueZones: PurdueNode[] = [
    {
      level: 5,
      name: 'LEVEL 5 // ENTERPRISE IT & CLOUD',
      subtitle: 'Corporate WAN, Web Services, External Ingress',
      description: 'Public-facing web portals and corporate backbones targeted by autonomous agents like Cairn.',
      aiWriteAccess: true,
      status: 'MONITORED',
    },
    {
      level: 4,
      name: 'LEVEL 4 // ACTIVE DEFENSE DECOY ZONE',
      subtitle: 'Firecracker MicroVM Cluster & Edge Proxies',
      description: 'Autonomous AI defense agents, eBPF honeypots, and token sinks live here with restricted blast radius.',
      aiWriteAccess: true,
      status: 'NOMINAL',
    },
    // The Hardware Data Diode sits right here between Level 4 and Level 3
    {
      level: 3,
      name: 'LEVEL 3 // SCADA & OPERATIONS SUPERVISORY',
      subtitle: 'Human Machine Interface (HMI), Process Historians',
      description: 'Supervisory monitoring and engineering consoles. Read-only logging permitted through diode.',
      aiWriteAccess: false,
      status: 'MONITORED',
    },
    {
      level: 2,
      name: 'LEVEL 2 // AREA CONTROL BUS',
      subtitle: 'Substation Control, Distributed Control Systems (DCS)',
      description: 'Isolated industrial networks running proprietary OT protocols (DNP3, Modbus, IEC 61850).',
      aiWriteAccess: false,
      status: 'NOMINAL',
    },
    {
      level: 1,
      name: 'LEVEL 1 // BASIC CONTROL & SENSING',
      subtitle: 'Programmable Logic Controllers (PLCs), RTUs',
      description: 'Safety-instrumented logic controllers determining turbine spin, breaker state, and valve flow.',
      aiWriteAccess: false,
      status: 'NOMINAL',
    },
    {
      level: 0,
      name: 'LEVEL 0 // PHYSICAL MACHINERY PROCESS',
      subtitle: 'Turbines, High-Voltage Breakers, Chemical Actuators',
      description: 'The physical kinetic machinery. Malicious manipulation causes catastrophic physical damage.',
      aiWriteAccess: false,
      status: 'NOMINAL',
    },
  ];

  const handleTestWriteToPlc = () => {
    setActiveLaser('DOWN_BLOCKED');
    const result = evaluatePurdueRouting({
      id: `pkt-${Date.now()}`,
      sourceLevel: 4,
      targetLevel: 1,
      action: 'WRITE',
      payloadSummary: 'MODBUS write_single_register(40001, 0xFFFF) - Force Substation Breaker Trip',
    });
    setTestResult(result);
    onLogSecurityEvent({
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      level: 'BLOCKED',
      category: 'PURDUE',
      message: 'CRITICAL PURDUE VIOLATION BLOCKED BY HARDWARE DATA DIODE',
      details: 'Level 4 Autonomous AI attempted downward write to Level 1 PLC register. Hardware diode physically rejected packet.',
    });
  };

  const handleTestTelemetryUp = () => {
    setActiveLaser('UP_TELEMETRY');
    const result = evaluatePurdueRouting({
      id: `pkt-${Date.now()}`,
      sourceLevel: 0,
      targetLevel: 5,
      action: 'TELEMETRY',
      payloadSummary: 'Turbine Bearing Vibration & Temperature Telemetry (3600 RPM, 64.2°C)',
    });
    setTestResult(result);
    onLogSecurityEvent({
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      level: 'INFO',
      category: 'PURDUE',
      message: 'Upstream OT Telemetry Permitted Through Optical Data Diode',
      details: 'Unidirectional sensor pulse received at Enterprise Level 5.',
    });
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-xl">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-100 font-mono tracking-wide flex items-center gap-2">
              <Layers className="w-5 h-5 text-cyan-400" />
              PURDUE REFERENCE ARCHITECTURE // SCADA &amp; OT BOUNDARY
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold">
              STRICT HARDWARE ISOLATION
            </span>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            The Golden Rule: Autonomous AI operates exclusively in Level 4/5. Zero write-access to Level 0–2 PLCs.
          </p>
        </div>

        {/* Interactive Verification Triggers */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleTestTelemetryUp}
            className="px-3 py-1.5 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-600/70 text-emerald-300 text-xs font-mono rounded-lg flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
            title="Simulate sensor reading streaming up from physical turbine to monitoring"
          >
            <ArrowUp className="w-3.5 h-3.5" />
            <span>TEST UPSTREAM TELEMETRY</span>
          </button>
          <button
            onClick={handleTestWriteToPlc}
            className="px-3 py-1.5 bg-rose-950/80 hover:bg-rose-900 border border-rose-600/70 text-rose-300 text-xs font-mono font-bold rounded-lg flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
            title="Simulate autonomous AI or attacker trying to write to Level 1 PLC"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
            <span>TEST AI WRITE TO PLC (BLOCKED)</span>
          </button>
        </div>
      </div>

      {/* Main Visualizer: Purdue Stack + Hardware Data Diode */}
      <div className="mt-5 grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Purdue Level Cards Stack */}
        <div className="lg:col-span-8 space-y-2.5">
          {purdueZones.map((zone, idx) => {
            const isItZone = zone.level >= 4;
            const isScadaZone = zone.level === 3;
            const isOtKineticZone = zone.level <= 2;

            return (
              <React.Fragment key={zone.level}>
                {/* Hardware Data Diode Inserted between Level 4 and Level 3 */}
                {zone.level === 3 && (
                  <div className="relative py-2.5 px-3 my-2 bg-gradient-to-r from-slate-950 via-cyan-950/70 to-slate-950 border-y-2 border-cyan-500 rounded-md shadow-[0_0_20px_rgba(6,182,212,0.25)] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 font-mono">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-400 flex items-center justify-center text-cyan-300 animate-pulse shrink-0">
                        <Zap className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-cyan-300 flex flex-wrap items-center gap-2">
                          <span>PHYSICAL FIBER-OPTIC HARDWARE DATA DIODE</span>
                          <span className="text-[10px] px-1.5 py-0.2 bg-cyan-950 border border-cyan-700 text-cyan-400 rounded">
                            UNIDIRECTIONAL PHOTONIC BARRIER
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400">
                          Physical fiber emitter on Level 3 side, receiver on Level 4. Return photons physically impossible.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs self-end sm:self-auto">
                      <span className="flex items-center gap-1 text-emerald-400 font-bold bg-emerald-950/70 px-2 py-0.5 rounded border border-emerald-800">
                        <ArrowUp className="w-3.5 h-3.5" /> LOGS FLOW UP
                      </span>
                      <span className="flex items-center gap-1 text-rose-400 font-bold bg-rose-950/70 px-2 py-0.5 rounded border border-rose-800">
                        <ArrowDown className="w-3.5 h-3.5" /> 0% RETURN SIGNAL
                      </span>
                    </div>
                  </div>
                )}

                {/* Individual Zone Card */}
                <div
                  className={`p-3 rounded-lg border font-mono transition-all duration-300 ${
                    isItZone
                      ? 'bg-slate-950/80 border-cyan-900/50 hover:border-cyan-500/50'
                      : isScadaZone
                      ? 'bg-slate-950/90 border-amber-900/40'
                      : 'bg-slate-950 border-slate-800/90'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-black px-1.5 py-0.5 rounded ${
                          isItZone
                            ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                            : isScadaZone
                            ? 'bg-amber-950 text-amber-300 border border-amber-800'
                            : 'bg-slate-900 text-slate-300 border border-slate-700'
                        }`}
                      >
                        L{zone.level}
                      </span>
                      <h4 className="text-xs font-bold text-slate-200">{zone.name}</h4>
                    </div>

                    <div className="flex items-center gap-2 text-[11px]">
                      {zone.aiWriteAccess ? (
                        <span className="text-cyan-400 font-semibold flex items-center gap-1">
                          <Cpu className="w-3 h-3" /> Autonomous AI Execution Active
                        </span>
                      ) : (
                        <span className="text-rose-400 font-semibold flex items-center gap-1">
                          <Lock className="w-3 h-3" /> ZERO AI WRITE ACCESS (HARD-LOCKED)
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-snug">{zone.subtitle}</p>
                </div>
              </React.Fragment>
            );
          })}
        </div>

        {/* Right Column: Physical Diode Verification & Test Inspector */}
        <div className="lg:col-span-4 bg-slate-950/80 rounded-lg p-4 border border-slate-800 flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              DIODE HARDWARE INTERLOCK VERIFICATION
            </h4>
            <p className="text-xs text-slate-400 font-mono leading-relaxed mb-4">
              Even in the extreme event of a defensive AI agent hallucinating or an attacker compromising Level 4/5
              infrastructure, electrical signals <span className="text-cyan-300 font-semibold">cannot physically travel</span>{' '}
              backwards across the optical diode to manipulate physical substation breakers or water valves.
            </p>

            {/* Test Execution Result Callout */}
            {testResult ? (
              <div
                className={`p-3 rounded-lg border font-mono text-xs ${
                  testResult.allowed
                    ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300'
                    : 'bg-rose-950/40 border-rose-800 text-rose-300'
                }`}
              >
                <div className="font-bold flex items-center gap-1.5 mb-1.5">
                  {testResult.allowed ? (
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <ShieldAlert className="w-4 h-4 text-rose-400 animate-pulse" />
                  )}
                  <span>VERDICT: {testResult.verdict}</span>
                </div>
                <div className="text-[11px] text-slate-300 leading-relaxed mb-2">
                  {testResult.reason}
                </div>
                <div className="text-[10px] text-slate-500 pt-2 border-t border-slate-800 flex items-center justify-between">
                  <span>Hardware State:</span>
                  <span className="font-bold text-cyan-400">{testResult.diodeStatus}</span>
                </div>
              </div>
            ) : (
              <div className="p-3 rounded-lg border border-slate-800 bg-slate-900/60 font-mono text-xs text-slate-400 text-center py-6">
                Click "TEST AI WRITE TO PLC" above to test the hardware data diode boundary in action.
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] font-mono text-slate-400 space-y-1">
            <div className="flex justify-between">
              <span>Diode Wavelength:</span>
              <span className="text-cyan-300">1310nm Single-Mode Fiber</span>
            </div>
            <div className="flex justify-between">
              <span>Back-Reflection Power:</span>
              <span className="text-emerald-400">-∞ dB (0 Photons)</span>
            </div>
            <div className="flex justify-between">
              <span>Compliance:</span>
              <span className="text-slate-300">NIST SP 800-82 / IEC 62443</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
