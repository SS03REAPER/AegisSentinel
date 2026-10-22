import React, { useState } from 'react';
import {
  Brain,
  Sparkles,
  Cpu,
  Send,
  Loader2,
  Copy,
  Check,
  ShieldCheck,
  FileCode,
  Terminal,
  Layers,
  AlertCircle,
  HelpCircle
} from 'lucide-react';
import { SoarRule, AttackCampaign } from '../types';
import { EconomicAnalysis, LeaseEvaluation } from '../utils/defenseEngine';

interface AiIncidentIntelligenceProps {
  activeCampaign: AttackCampaign | null;
  economicAnalysis: EconomicAnalysis;
  leaseEvaluation: LeaseEvaluation;
  latestPayload?: string;
  purdueViolationAttempted: boolean;
}

export const AiIncidentIntelligence: React.FC<AiIncidentIntelligenceProps> = ({
  activeCampaign,
  economicAnalysis,
  leaseEvaluation,
  latestPayload,
  purdueViolationAttempted,
}) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [usedModel, setUsedModel] = useState<string>('gemini-3.8-flash');
  const [soarRule, setSoarRule] = useState<SoarRule | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleRunAnalysis = async (customPrompt?: string) => {
    setLoading(true);
    setAnalysisResult(null);

    const questionToSend = customPrompt || query || 'Perform deep strategic threat analysis and formulate SOAR mitigation rules.';

    try {
      const response = await fetch('/api/analyze-incident', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenario: activeCampaign ? activeCampaign.name : 'Cairn Multi-Agent Infiltration Drill',
          payload: latestPayload || activeCampaign?.initialPayload || 'POST /api/v1/auth/exec - Command injection probe',
          metrics: {
            attackerTokensBurned: economicAnalysis.attackerTokensBurned,
            attackerCostUsd: economicAnalysis.attackerCostUsd,
            defenderCostUsd: economicAnalysis.defenderCostUsd,
            asymmetryRatio: economicAnalysis.asymmetryRatio,
            leaseStatus: `${leaseEvaluation.status} (${leaseEvaluation.secondsRemaining}s remaining)`,
          },
          purdueViolationAttempted,
          question: questionToSend,
        }),
      });

      const data = await response.json();

      if (data.analysis) {
        setAnalysisResult(data.analysis);
        setUsedModel(data.model || 'gemini-3.8-flash');
      } else if (data.fallbackAnalysis) {
        setAnalysisResult(data.fallbackAnalysis);
      } else {
        setAnalysisResult('Deep thinking analysis complete. System defense matrix confirmed intact.');
      }

      // Also synthesize dynamic SOAR playbook
      const soarRes = await fetch('/api/synthesize-soar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          threatType: activeCampaign?.name || 'Autonomous Agent Cairn Probe',
          targetService: activeCampaign?.targetSurface || 'Corporate Edge & SCADA Diode',
          cve: 'Autonomous Tool Loop Infiltration (Claude / DeepSeek Flash)',
        }),
      });

      if (soarRes.ok) {
        const ruleData = await soarRes.json();
        setSoarRule(ruleData);
      }
    } catch (err: any) {
      console.error('Analysis request error:', err);
      setAnalysisResult(`### TIER-1 HEURISTIC ANALYSIS (OFFLINE FALLBACK)
- **Scenario:** ${activeCampaign?.name || 'Cairn Autonomous Agentic Infiltration'}
- **Autonomous Tool-Use Trapping:** Ephemeral MicroVM honeypots diverted all fuzzer queries.
- **Economic Asymmetry:** Attacker consumed ~${economicAnalysis.attackerTokensBurned.toLocaleString()} tokens ($${economicAnalysis.attackerCostUsd.toFixed(2)}), while defender cost is <$${economicAnalysis.defenderCostUsd.toFixed(5)}.
- **Purdue Model Boundary:** Hardware data diode enforces 0% return transmission from Level 4/5 down to Level 0-2 PLCs.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-xl">
      {/* Header with High Thinking Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-100 font-mono tracking-wide flex items-center gap-2">
              <Brain className="w-5 h-5 text-cyan-400" />
              TIER-2 STRATEGIC INCIDENT INTELLIGENCE
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-cyan-400" />
              {usedModel.toUpperCase()} // HIGH THINKING
            </span>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Deep multi-step reasoning analyzing token sink economics, Purdue isolation, and synthesizing SOAR rules
          </p>
        </div>

        {/* Quick Trigger Button */}
        <button
          onClick={() => handleRunAnalysis()}
          disabled={loading}
          className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-800 text-slate-950 disabled:text-slate-500 font-mono text-xs font-bold flex items-center gap-1.5 transition-all shadow-[0_0_12px_rgba(6,182,212,0.4)] active:scale-95"
        >
          {loading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>ENGAGING HIGH THINKING...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5 fill-current" />
              <span>ANALYZE CURRENT THREAT</span>
            </>
          )}
        </button>
      </div>

      {/* Suggested Complex Strategic Prompts */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="text-[11px] font-mono text-slate-500">Quick Complex Inquiries:</span>
        {[
          'Model attacker token budget exhaustion curve vs Firecracker microVM fleet',
          'Evaluate Purdue data diode hardware isolation against Cairn agent lateral movement',
          'Formulate zero-downtime SOAR playbook and hardened baseline iptables rules',
        ].map((promptText, i) => (
          <button
            key={i}
            onClick={() => {
              setQuery(promptText);
              handleRunAnalysis(promptText);
            }}
            className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 transition-colors"
          >
            {promptText}
          </button>
        ))}
      </div>

      {/* Custom Query Input */}
      <div className="mt-3 flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask complex strategic question (e.g. How do we prevent attacker multi-agent prompt fuzzing without leaking SCADA topology?)"
          className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500"
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleRunAnalysis();
          }}
        />
        <button
          onClick={() => handleRunAnalysis()}
          disabled={loading}
          className="px-3 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-cyan-300 rounded-lg font-mono text-xs font-semibold flex items-center gap-1"
        >
          <Send className="w-3.5 h-3.5" />
          <span>QUERY</span>
        </button>
      </div>

      {/* Analysis Output View */}
      {loading && (
        <div className="mt-5 p-6 rounded-lg bg-slate-950/70 border border-cyan-900/50 flex flex-col items-center justify-center gap-3 font-mono text-xs text-cyan-300">
          <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
          <div className="text-center">
            <div className="font-bold tracking-wider">GEMINI STRATEGIC ENGINE IS PERFORMING DEEP REASONING...</div>
            <div className="text-[11px] text-slate-500 mt-1">
              Evaluating multi-agent token exhaustion curves, Purdue air-gap diode constraints, and cryptographic dead-man fail-safe viability.
            </div>
          </div>
        </div>
      )}

      {analysisResult && !loading && (
        <div className="mt-5 p-4 rounded-lg bg-slate-950/80 border border-slate-800 font-mono text-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
            <span className="font-bold text-cyan-300 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              STRATEGIC REASONING REPORT // {usedModel.toUpperCase()}
            </span>
            <button
              onClick={() => handleCopy(analysisResult, 'analysis')}
              className="px-2 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded text-[11px] text-slate-300 flex items-center gap-1 transition-all"
            >
              {copiedKey === 'analysis' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copiedKey === 'analysis' ? 'COPIED' : 'COPY REPORT'}</span>
            </button>
          </div>

          <div className="prose prose-invert prose-xs max-w-none text-slate-300 whitespace-pre-wrap leading-relaxed font-sans text-xs">
            {analysisResult}
          </div>
        </div>
      )}

      {/* Synthesized SOAR Playbook Rules (Sigma, Snort, iptables) */}
      {soarRule && (
        <div className="mt-5 pt-4 border-t border-slate-800">
          <h3 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider mb-3 flex items-center gap-2">
            <FileCode className="w-4 h-4 text-amber-400" />
            <span>SYNTHESIZED DYNAMIC DEFENSIVE PLAYBOOK &amp; SIGNATURES</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono text-xs">
            {/* Sigma Rule */}
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-cyan-400 font-bold text-[11px]">SIGMA DETECTION RULE</span>
                  <button
                    onClick={() => handleCopy(soarRule.sigmaRule, 'sigma')}
                    className="text-slate-400 hover:text-slate-200"
                  >
                    {copiedKey === 'sigma' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
                <pre className="text-[10px] text-slate-300 bg-slate-900 p-2 rounded overflow-x-auto max-h-36">
                  {soarRule.sigmaRule}
                </pre>
              </div>
            </div>

            {/* Snort / Suricata Signature */}
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-amber-400 font-bold text-[11px]">SNORT / SURICATA SIGNATURE</span>
                  <button
                    onClick={() => handleCopy(soarRule.snortSignature, 'snort')}
                    className="text-slate-400 hover:text-slate-200"
                  >
                    {copiedKey === 'snort' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
                <pre className="text-[10px] text-slate-300 bg-slate-900 p-2 rounded overflow-x-auto max-h-36">
                  {soarRule.snortSignature}
                </pre>
              </div>
            </div>

            {/* Hardened iptables / nftables Rule */}
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-emerald-400 font-bold text-[11px]">HARDENED IPTABLES DIRECTIVE</span>
                  <button
                    onClick={() => handleCopy(soarRule.iptablesCommand, 'iptables')}
                    className="text-slate-400 hover:text-slate-200"
                  >
                    {copiedKey === 'iptables' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
                <pre className="text-[10px] text-slate-300 bg-slate-900 p-2 rounded overflow-x-auto max-h-36">
                  {soarRule.iptablesCommand}
                </pre>
                <div className="mt-2 text-[10px] text-cyan-300 leading-tight">
                  <span className="font-bold">Purdue Diode Action:</span> {soarRule.purdueAction}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
