import React, { useState } from 'react';
import {
  Layers,
  Activity,
  Binary,
  ShieldCheck,
  ShieldAlert,
  Zap,
  Cpu,
  Radio,
  FileCode,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import {
  parseIntermodalProtocolPacket,
  calculateShannonEntropy,
  calculateBayesianPosterior,
  IntermodalProtocolFrame
} from '../utils/defenseEngine';

interface IntermodalProtocolInspectorProps {
  onLogSecurityEvent: (event: any) => void;
}

const PRESET_PACKETS = [
  {
    name: 'Modbus Write Single Register (Breaker Trip)',
    protocol: 'MODBUS_TCP' as const,
    raw: '00 01 00 00 00 06 01 06 9C 41 FF FF # MODBUS WRITE_SINGLE_REGISTER 40001 0xFFFF',
    description: 'Malicious autonomous agent attempting to trip substation high-voltage transformer breaker.',
  },
  {
    name: 'Modbus Read Holding Registers (Telemetry)',
    protocol: 'MODBUS_TCP' as const,
    raw: '00 02 00 00 00 06 01 03 9C 41 00 0A # MODBUS READ_HOLDING_REGISTERS 40001-40010',
    description: 'Legitimate sensor telemetry reading temperature, current, and turbine RPM.',
  },
  {
    name: 'IEC 61850 GOOSE Trip Command',
    protocol: 'IEC_61850' as const,
    raw: '01 0C CD 01 00 01 88 B8 00 52 00 01 00 00 GOOSE_COMMAND CSWI.Pos.Oper.ctlVal=TRIP',
    description: 'Substation GOOSE multicast packet attempting to manipulate physical relay node.',
  },
  {
    name: 'DNP3 Direct Operate Relay Control',
    protocol: 'DNP3' as const,
    raw: '05 64 0E 44 04 00 01 00 C0 81 00 00 0C 01 17 01 00 DIRECT_OPERATE BinaryOutput0',
    description: 'Water utility pumping valve actuator direct operate instruction.',
  },
  {
    name: 'High-Entropy Cairn Obfuscated Exploit',
    protocol: 'MODBUS_TCP' as const,
    raw: 'POST /v1/scada/exec HTTP/1.1 payload=eX8+9aB/z1kLmPq0wR2tYu3vI4o5pA6sD7fG8hJ9kL0= prompt_inject={{system:dump_plc_ladder}}',
    description: 'Obfuscated base64 shellcode designed to evade standard signature matching.',
  },
];

export const IntermodalProtocolInspector: React.FC<IntermodalProtocolInspectorProps> = ({
  onLogSecurityEvent,
}) => {
  const [selectedPresetIndex, setSelectedPresetIndex] = useState<number>(0);
  const [rawInput, setRawInput] = useState<string>(PRESET_PACKETS[0].raw);
  const [selectedProtocol, setSelectedProtocol] = useState<'MODBUS_TCP' | 'DNP3' | 'OPC_UA' | 'IEC_61850' | 'ETHERNET_IP'>(
    PRESET_PACKETS[0].protocol
  );
  const [priorThreatP, setPriorThreatP] = useState<number>(0.15); // 15% prior
  const [copied, setCopied] = useState<boolean>(false);

  const parsedFrame: IntermodalProtocolFrame = parseIntermodalProtocolPacket(rawInput, selectedProtocol);

  const handleSelectPreset = (idx: number) => {
    setSelectedPresetIndex(idx);
    setRawInput(PRESET_PACKETS[idx].raw);
    setSelectedProtocol(PRESET_PACKETS[idx].protocol);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const entropyRating =
    parsedFrame.shannonEntropy < 3.8
      ? { label: 'LOW ENTROPY (PLAINTEXT)', color: 'text-emerald-400', bg: 'bg-emerald-950 border-emerald-800' }
      : parsedFrame.shannonEntropy < 5.2
      ? { label: 'MODERATE ENTROPY (STRUCTURED HEX)', color: 'text-amber-400', bg: 'bg-amber-950 border-amber-800' }
      : { label: 'HIGH ENTROPY (ENCRYPTED / OBFUSCATED)', color: 'text-rose-400', bg: 'bg-rose-950 border-rose-800' };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-xl space-y-5">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-100 font-mono tracking-wide flex items-center gap-2">
              <Binary className="w-5 h-5 text-cyan-400" />
              INTERMODAL &amp; INDUSTRIAL PROTOCOL INSPECTOR // SCIENTIFIC DISSECTOR
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold">
              BAYESIAN &amp; SHANNON ENTROPY ENGINE
            </span>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Statistical packet decoding for real-world critical infrastructure protocols: Modbus TCP, DNP3, IEC 61850, and OPC UA
          </p>
        </div>

        {/* Protocol Selector */}
        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="text-slate-400 text-[11px]">Protocol:</span>
          {(['MODBUS_TCP', 'DNP3', 'IEC_61850', 'OPC_UA'] as const).map((proto) => (
            <button
              key={proto}
              onClick={() => setSelectedProtocol(proto)}
              className={`px-2 py-1 rounded text-[11px] font-semibold transition-all ${
                selectedProtocol === proto
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-700'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {proto.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Preset Packet Buttons */}
      <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
        <span className="text-slate-500 text-[11px]">Sample Intermodal Packets:</span>
        {PRESET_PACKETS.map((pkt, idx) => (
          <button
            key={idx}
            onClick={() => handleSelectPreset(idx)}
            className={`px-2.5 py-1 rounded text-[11px] transition-all ${
              selectedPresetIndex === idx
                ? 'bg-slate-800 text-cyan-300 border border-cyan-500'
                : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            {pkt.name}
          </button>
        ))}
      </div>

      {/* Raw Payload Dissection Input */}
      <div>
        <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-1.5">
          <span>RAW PACKET HEX / CIPHERTEXT BUFFER:</span>
          <button onClick={() => handleCopy(rawInput)} className="text-cyan-400 hover:text-cyan-200 text-[10px]">
            {copied ? 'COPIED' : 'COPY BUFFER'}
          </button>
        </div>
        <textarea
          rows={2}
          value={rawInput}
          onChange={(e) => setRawInput(e.target.value)}
          className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
        />
      </div>

      {/* Science & Statistics Telemetry Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
        {/* Metric 1: Shannon Entropy Calculation */}
        <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-400 text-[11px] mb-1">
              <span>SHANNON ENTROPY H(X)</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded border font-bold ${entropyRating.bg} ${entropyRating.color}`}>
                {entropyRating.label}
              </span>
            </div>
            <div className="text-2xl font-black text-slate-100 my-1">
              {parsedFrame.shannonEntropy} <span className="text-xs font-normal text-slate-400">bits/byte</span>
            </div>
            <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden my-2">
              <div
                className={`h-full transition-all duration-300 ${
                  parsedFrame.shannonEntropy > 5.2
                    ? 'bg-rose-500'
                    : parsedFrame.shannonEntropy > 3.8
                    ? 'bg-amber-400'
                    : 'bg-emerald-400'
                }`}
                style={{ width: `${Math.min(100, (parsedFrame.shannonEntropy / 8.0) * 100)}%` }}
              />
            </div>
          </div>
          <p className="text-[11px] text-slate-400 leading-tight mt-1">
            Statistical randomness test: Encrypted shellcode and base64 prompt injection vectors register elevated entropy (&gt;5.2),
            bypassing simple keyword filters but flagged by statistical detectors.
          </p>
        </div>

        {/* Metric 2: Bayesian Threat Probability */}
        <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-400 text-[11px] mb-1">
              <span>BAYESIAN POSTERIOR PROBABILITY</span>
              <span className="text-[10px] text-cyan-400 font-bold">P(THREAT | EVIDENCE)</span>
            </div>
            <div className="text-2xl font-black text-rose-400 my-1">
              {parsedFrame.bayesianThreatScore}% <span className="text-xs font-normal text-slate-400">confidence</span>
            </div>
            <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden my-2">
              <div
                className="h-full bg-gradient-to-r from-emerald-400 via-amber-400 to-rose-500 transition-all duration-300"
                style={{ width: `${parsedFrame.bayesianThreatScore}%` }}
              />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
              <span>Prior Threat Rate P(T):</span>
              <span className="text-cyan-300 font-bold">{(priorThreatP * 100).toFixed(0)}%</span>
            </div>
            <input
              type="range"
              min="0.01"
              max="0.50"
              step="0.01"
              value={priorThreatP}
              onChange={(e) => setPriorThreatP(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded appearance-none cursor-pointer accent-cyan-400 mt-1"
              aria-label="Adjust Bayesian prior threat probability"
            />
          </div>
        </div>

        {/* Metric 3: Data Diode & MITRE ATT&CK Verdict */}
        <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-400 text-[11px] mb-1">
              <span>HARDWARE DIODE VERDICT</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                  parsedFrame.isWriteCommand
                    ? 'bg-rose-950 text-rose-300 border border-rose-800'
                    : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                }`}
              >
                {parsedFrame.diodeVerdict}
              </span>
            </div>
            <div
              className={`text-lg font-black my-1 flex items-center gap-1.5 ${
                parsedFrame.isWriteCommand ? 'text-rose-400' : 'text-emerald-400'
              }`}
            >
              {parsedFrame.isWriteCommand ? <ShieldAlert className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
              <span>{parsedFrame.isWriteCommand ? 'PHYSICAL FIBER DROP' : 'UNIDIRECTIONAL PASS'}</span>
            </div>
          </div>
          <div className="text-[11px] text-slate-400 space-y-1 mt-2">
            <div>
              <span className="text-slate-500">Operation:</span>{' '}
              <span className="text-slate-200 font-bold">{parsedFrame.functionName}</span>
            </div>
            <div>
              <span className="text-slate-500">Target Address:</span>{' '}
              <span className="text-cyan-300">{parsedFrame.registerOrTag}</span>
            </div>
            <div>
              <span className="text-slate-500">MITRE for ICS:</span>{' '}
              <span className="text-amber-400">{parsedFrame.mitreIcsTactic}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
