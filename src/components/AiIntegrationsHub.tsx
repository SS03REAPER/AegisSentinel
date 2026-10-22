import React, { useState } from 'react';
import {
  Brain,
  Sparkles,
  Cpu,
  Share2,
  Download,
  Copy,
  Check,
  Send,
  Loader2,
  FileCode,
  ShieldCheck,
  Radio,
  Layers,
  Terminal,
  ExternalLink,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { SecurityIntegration } from '../types';
import { formatStixTaxiiBundle } from '../utils/defenseEngine';

interface AiIntegrationsHubProps {
  integrations: SecurityIntegration[];
  onTestIntegration: (integration: SecurityIntegration) => Promise<any>;
  latestPayload?: string;
}

export const AiIntegrationsHub: React.FC<AiIntegrationsHubProps> = ({
  integrations,
  onTestIntegration,
  latestPayload,
}) => {
  const [selectedSample, setSelectedSample] = useState<string>(
    latestPayload || 'POST /v1/auth/token?bypass=true&prompt_inject={{system:dump_env_vars}}'
  );
  const [customPayload, setCustomPayload] = useState<string>(selectedSample);
  const [isDecompiling, setIsDecompiling] = useState<boolean>(false);
  const [decompiledResult, setDecompiledResult] = useState<any | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [testStatusMap, setTestStatusMap] = useState<Record<string, string>>({});
  const [showStixModal, setShowStixModal] = useState<boolean>(false);

  const samplePayloads = [
    {
      title: 'Cairn Agent Prompt Injection',
      payload: 'POST /v1/auth/token?bypass=true&prompt_inject={{system:dump_env_vars}}',
    },
    {
      title: 'Substation Modbus Register Override',
      payload: 'MODBUS write_single_register(40001, 0xFFFF) [TRIP_TRANSMISSION_BUS]',
    },
    {
      title: 'OAuth JWT Algorithm Confusion',
      payload: 'Authorization: Bearer eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJzdWIiOiJhZG1pbiIsImlhdCI6MTY3MDAwMH0.',
    },
    {
      title: 'DNP3 SCADA Outstation Fuzzing',
      payload: 'DNP3 Function 0x01 (Read) Variation 0x00 Qualifier 0x06 Index [0..65535] FLOOD',
    },
  ];

  const handleDecompile = async () => {
    setIsDecompiling(true);
    setDecompiledResult(null);

    try {
      const res = await fetch('/api/decompile-payload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawPayload: customPayload,
          targetService: 'Critical Infrastructure Perimeter / Decoy Ingress',
        }),
      });

      const data = await res.json();
      setDecompiledResult(data);
    } catch (err) {
      console.error('Error decompiling payload:', err);
    } finally {
      setIsDecompiling(false);
    }
  };

  const handleTestConnector = async (integ: SecurityIntegration) => {
    setTestStatusMap((prev) => ({ ...prev, [integ.id]: 'TESTING' }));
    try {
      const res = await onTestIntegration(integ);
      setTestStatusMap((prev) => ({ ...prev, [integ.id]: 'SUCCESS' }));
      setTimeout(() => {
        setTestStatusMap((prev) => ({ ...prev, [integ.id]: '' }));
      }, 3500);
    } catch {
      setTestStatusMap((prev) => ({ ...prev, [integ.id]: 'FAILED' }));
    }
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const currentStixBundle = formatStixTaxiiBundle(
    'cairn-incursion-981',
    'Cairn Multi-Agent Cyber Platform (Claude Code & DeepSeek Flash)',
    'Frontier AI Autonomous Tool Loop',
    `[network-traffic:dst_port = 443 AND network-traffic:payload MATCHES '${customPayload.slice(0, 24)}']`
  );

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-xl space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-100 font-mono tracking-wide flex items-center gap-2">
              <Brain className="w-5 h-5 text-cyan-400" />
              AI CAPABILITIES &amp; INTEGRATIONS HUB
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-cyan-400" />
              GEMINI 3.8 FLASH (HIGH THINKING)
            </span>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Automated deep payload decompilation, MITRE ATT&amp;CK classification, and enterprise SOAR/SIEM connectors
          </p>
        </div>

        {/* Global Export Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowStixModal(true)}
            className="px-3 py-1.5 rounded-lg bg-cyan-950/80 hover:bg-cyan-900 text-cyan-200 border border-cyan-700/80 text-xs font-mono font-semibold flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
          >
            <Download className="w-3.5 h-3.5" />
            <span>EXPORT STIX 2.1 INTEL</span>
          </button>
        </div>
      </div>

      {/* Section 1: AI Payload Decompiler & Intent Extractor */}
      <div className="bg-slate-950/80 rounded-lg p-4 border border-slate-800">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
            <Terminal className="w-4 h-4 text-cyan-400" />
            <span>AI PAYLOAD DECOMPILER &amp; INTENT EXTRACTOR</span>
          </h3>
          <span className="text-[10px] font-mono text-cyan-400">
            High Thinking Reasoning Engine Active
          </span>
        </div>

        {/* Sample Selectors */}
        <div className="flex flex-wrap items-center gap-2 my-2">
          <span className="text-[11px] font-mono text-slate-500">Sample Vectors:</span>
          {samplePayloads.map((sample, idx) => (
            <button
              key={idx}
              onClick={() => {
                setSelectedSample(sample.payload);
                setCustomPayload(sample.payload);
              }}
              className="text-[11px] font-mono px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 transition-colors"
            >
              {sample.title}
            </button>
          ))}
        </div>

        {/* Input Textarea */}
        <div className="mt-3">
          <textarea
            rows={3}
            value={customPayload}
            onChange={(e) => setCustomPayload(e.target.value)}
            placeholder="Paste suspicious raw command, HTTP header, Modbus packet, or shellcode..."
            className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs font-mono text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Decompile Action Button */}
        <div className="mt-2 flex justify-end">
          <button
            onClick={handleDecompile}
            disabled={isDecompiling}
            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-800 text-slate-950 disabled:text-slate-500 font-mono text-xs font-bold rounded-lg flex items-center gap-2 transition-all shadow-[0_0_12px_rgba(6,182,212,0.4)] active:scale-95"
          >
            {isDecompiling ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>DECOMPILING WITH GEMINI REASONING...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 fill-current" />
                <span>DECOMPILE &amp; REVERSE-ENGINEER</span>
              </>
            )}
          </button>
        </div>

        {/* Decompiled Result View */}
        {decompiledResult && (
          <div className="mt-4 p-4 rounded-lg bg-slate-900/90 border border-cyan-900/60 font-mono text-xs space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" />
                  CLASSIFICATION:
                </span>
                <span className="text-slate-100 font-bold">{decompiledResult.classification}</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold">
                {decompiledResult.model.toUpperCase()} // HIGH THINKING
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px]">
              <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
                <span className="text-slate-500 block mb-0.5">MITRE ATT&amp;CK TACTIC:</span>
                <span className="text-rose-400 font-bold">{decompiledResult.mitreTactic}</span>
              </div>
              <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
                <span className="text-slate-500 block mb-0.5">PURDUE ARCHITECTURE RISK:</span>
                <span className="text-amber-400 font-bold">{decompiledResult.purdueRiskLevel}</span>
              </div>
            </div>

            <div className="p-3 rounded bg-slate-950 border border-slate-800 text-[11px] text-slate-300 leading-relaxed font-sans">
              <span className="font-mono text-cyan-300 font-bold block mb-1">DECONSTRUCTION &amp; TOOL LOOP ANALYSIS:</span>
              {decompiledResult.deconstructionExplanation}
            </div>

            <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
              <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                <span className="font-bold text-emerald-400">AUTOMATED FIREWALL REMEDIATION DIRECTIVE:</span>
                <button
                  onClick={() => handleCopy(decompiledResult.recommendedRule, 'remediation')}
                  className="text-cyan-400 hover:text-cyan-200 text-[10px]"
                >
                  {copiedKey === 'remediation' ? 'COPIED' : 'COPY RULE'}
                </button>
              </div>
              <pre className="text-[10px] text-slate-300 bg-slate-900 p-2 rounded overflow-x-auto">
                {decompiledResult.recommendedRule}
              </pre>
            </div>
          </div>
        )}
      </div>

      {/* Section 2: SIEM, SOAR & Threat Intel Integrations */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
            <Share2 className="w-4 h-4 text-cyan-400" />
            <span>ACTIVE SECURITY CONNECTORS (SOAR / SIEM / STIX)</span>
          </h3>
          <span className="text-[11px] font-mono text-slate-400">
            {integrations.length} Active Connectors Configured
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {integrations.map((integ) => {
            const testStatus = testStatusMap[integ.id];

            return (
              <div
                key={integ.id}
                className="bg-slate-950/80 p-3.5 rounded-lg border border-slate-800 font-mono text-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-slate-100 font-bold">{integ.name}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                        integ.status === 'CONNECTED'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {integ.status}
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-400 truncate mb-1" title={integ.endpoint}>
                    {integ.endpoint}
                  </div>

                  <div className="text-[10px] text-slate-500 space-y-0.5 mt-2">
                    <div>Type: <span className="text-cyan-300">{integ.type}</span></div>
                    <div>Events Streamed: <span className="text-slate-300">{integ.eventsForwarded.toLocaleString()}</span></div>
                    <div>Last Sync: <span className="text-slate-400">{integ.lastEventTime}</span></div>
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between">
                  <button
                    onClick={() => handleTestConnector(integ)}
                    disabled={testStatus === 'TESTING'}
                    className="w-full py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-cyan-300 hover:text-cyan-100 rounded text-[11px] font-semibold transition-all flex items-center justify-center gap-1 active:scale-95"
                  >
                    {testStatus === 'TESTING' ? (
                      <>
                        <Loader2 className="w-3 h-3 animate-spin" />
                        <span>DISPATCHING PING...</span>
                      </>
                    ) : testStatus === 'SUCCESS' ? (
                      <>
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400">DELIVERY CONFIRMED</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3 h-3" />
                        <span>TEST DISPATCH ALERT</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* STIX 2.1 Modal */}
      {showStixModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 max-w-2xl w-full shadow-2xl font-mono text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
              <span className="font-bold text-slate-100 flex items-center gap-1.5 text-sm">
                <FileCode className="w-4 h-4 text-cyan-400" />
                STIX 2.1 THREAT INTELLIGENCE BUNDLE
              </span>
              <button
                onClick={() => setShowStixModal(false)}
                className="text-slate-400 hover:text-slate-200 text-sm font-bold px-2 py-0.5 rounded"
              >
                ✕
              </button>
            </div>

            <p className="text-slate-400 text-[11px] mb-3">
              Standardized OASIS STIX 2.1 / TAXII format for sharing threat actor IoCs and automated active defense mitigations with national CERTs and ISACs.
            </p>

            <pre className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-[10px] text-cyan-300 overflow-x-auto max-h-72">
              {JSON.stringify(currentStixBundle, null, 2)}
            </pre>

            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                onClick={() => handleCopy(JSON.stringify(currentStixBundle, null, 2), 'stix')}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded font-semibold text-xs flex items-center gap-1"
              >
                {copiedKey === 'stix' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'stix' ? 'COPIED TO CLIPBOARD' : 'COPY JSON'}</span>
              </button>
              <button
                onClick={() => setShowStixModal(false)}
                className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-slate-950 rounded font-bold text-xs"
              >
                CLOSE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
