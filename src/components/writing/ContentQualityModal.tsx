import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  RefreshCw,
  Award,
  Zap,
  Check,
  TrendingUp,
  FileCheck,
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { ContentQualityAnalysis } from '../../types';

interface ContentQualityModalProps {
  content: string;
  language: string;
  onClose: () => void;
  onApplyImprovement?: (improvedText: string) => void;
}

export const ContentQualityModal: React.FC<ContentQualityModalProps> = ({
  content,
  language,
  onClose,
}) => {
  const { error, success } = useToast();
  const [analysis, setAnalysis] = useState<ContentQualityAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const runAnalysis = async () => {
      setIsLoading(true);
      try {
        const res = await fetch('/api/ai/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content, language }),
        });

        if (res.ok) {
          const data = await res.json();
          setAnalysis(data.analysis);
        } else {
          throw new Error('Analysis failed');
        }
      } catch {
        error('Could not complete quality analysis');
      } finally {
        setIsLoading(false);
      }
    };

    if (content.trim()) {
      runAnalysis();
    } else {
      setIsLoading(false);
    }
  }, [content, language]);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-[#0f1017] border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#131422]">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-2xl bg-purple-600/20 text-purple-400 border border-purple-500/30">
              <Award className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-base font-black text-white flex items-center gap-2">
                <span>AI Content Quality & Speech Audit</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                  Real-Time Neural Diagnostics
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Actionable feedback on readability, rhythm, vocal cadence, and engagement.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 text-sm font-bold"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto max-h-[75vh] space-y-6">
          {isLoading ? (
            <div className="py-16 text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-purple-400 animate-spin mx-auto" />
              <p className="text-xs font-semibold text-slate-400">
                Analyzing syntax, speech cadence, and retention hooks...
              </p>
            </div>
          ) : analysis ? (
            <div className="space-y-6">
              {/* Score Cards Grid */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-4 rounded-2xl bg-[#141523] border border-slate-800 text-center space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Readability Score
                  </span>
                  <div className="text-3xl font-black text-purple-400 font-mono">
                    {analysis.readabilityScore}
                    <span className="text-sm text-slate-500">/100</span>
                  </div>
                  <span className="text-[10px] text-purple-300">Natural speech cadence</span>
                </div>

                <div className="p-4 rounded-2xl bg-[#141523] border border-slate-800 text-center space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Grammar & Syntax
                  </span>
                  <div className="text-3xl font-black text-emerald-400 font-mono">
                    {analysis.grammarScore}
                    <span className="text-sm text-slate-500">/100</span>
                  </div>
                  <span className="text-[10px] text-emerald-300">Polished phrasing</span>
                </div>

                <div className="p-4 rounded-2xl bg-[#141523] border border-slate-800 text-center space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Clarity & Retention
                  </span>
                  <div className="text-3xl font-black text-blue-400 font-mono">
                    {analysis.clarityScore}
                    <span className="text-sm text-slate-500">/100</span>
                  </div>
                  <span className="text-[10px] text-blue-300">{analysis.toneConsistency}</span>
                </div>
              </div>

              {/* Assessment Statement */}
              <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-500/30 space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
                  <FileCheck className="w-4 h-4 text-purple-400" />
                  <span>Executive Assessment</span>
                </span>
                <p className="text-xs text-purple-100 leading-relaxed">
                  {analysis.overallAssessment}
                </p>
              </div>

              {/* Actionable Tips */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span>Actionable Delivery & Rhythm Tips</span>
                </span>
                <div className="space-y-2">
                  {analysis.actionableTips.map((tip, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start gap-2.5 text-xs text-slate-200"
                    >
                      <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 font-bold flex items-center justify-center shrink-0 font-mono text-[10px]">
                        {idx + 1}
                      </span>
                      <span className="leading-snug">{tip}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Weak Sentences */}
              {analysis.weakSentences && analysis.weakSentences.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-bold text-rose-300 uppercase tracking-wider flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-rose-400" />
                    <span>Sentences to Refine for Breathing Control</span>
                  </span>
                  <div className="space-y-2">
                    {analysis.weakSentences.map((s, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-rose-950/20 border border-rose-800/40 text-xs text-rose-200 leading-relaxed"
                      >
                        "{s}"
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* CTA Feedback */}
              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs space-y-1">
                <span className="font-bold text-slate-300">Call-to-Action Evaluation:</span>
                <p className="text-slate-400">{analysis.ctaFeedback}</p>
              </div>
            </div>
          ) : (
            <div className="text-center py-10 text-slate-500 text-xs">
              No content found to analyze.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
