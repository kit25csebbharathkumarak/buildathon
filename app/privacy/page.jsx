'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Download,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Eye,
  FileText,
  ToggleLeft,
  ToggleRight,
  Database,
} from 'lucide-react';

export default function PrivacyPage() {
  const [telemetryOptIn, setTelemetryOptIn] = useState(true);
  const [allowMatching, setAllowMatching] = useState(true);
  const [logs, setLogs] = useState([]);
  const [candidate, setCandidate] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const candidateId = 'emp-101';

  useEffect(() => {
    async function loadPrivacy() {
      try {
        const res = await fetch(`/api/privacy?candidateId=${candidateId}`);
        if (res.ok) {
          const data = await res.json();
          setTelemetryOptIn(data.consent?.telemetry_opt_in === 1);
          setAllowMatching(data.consent?.allow_matching === 1);
          setLogs(data.telemetryLogs || []);
          setCandidate(data.candidate);
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadPrivacy();
  }, []);

  const handleToggleOptIn = async () => {
    const nextVal = !telemetryOptIn;
    setTelemetryOptIn(nextVal);
    try {
      await fetch('/api/privacy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidateId,
          telemetryOptIn: nextVal,
          allowMatching,
        }),
      });
      setFeedback(`Telemetry analysis ${nextVal ? 'enabled' : 'disabled'}.`);
      setTimeout(() => setFeedback(null), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleMatching = async () => {
    const nextVal = !allowMatching;
    setAllowMatching(nextVal);
    try {
      await fetch('/api/privacy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidateId,
          telemetryOptIn,
          allowMatching: nextVal,
        }),
      });
      setFeedback(`Internal mobility pool inclusion ${nextVal ? 'enabled' : 'disabled'}.`);
      setTimeout(() => setFeedback(null), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleExportData = () => {
    const dataToExport = {
      candidate_id: candidateId,
      exported_at: new Date().toISOString(),
      privacy_preferences: {
        telemetry_opt_in: telemetryOptIn,
        allow_matching: allowMatching,
      },
      indexed_work_logs: logs,
    };

    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `talentlens-privacy-export-${candidateId}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDeleteData = async () => {
    if (!confirm('Are you sure you want to purge all telemetry logs and inferred skills? This action cannot be undone.')) {
      return;
    }

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/privacy?candidateId=${candidateId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setLogs([]);
        setFeedback('All telemetry logs and inferred skills permanently erased.');
        setTimeout(() => setFeedback(null), 4000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-talent-border pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-talent-teal/20 text-talent-teal">
              <ShieldCheck className="h-4 w-4" />
            </span>
            <span className="font-mono text-xs font-bold uppercase tracking-widest text-talent-teal">
              Candidate Sovereignty & Transparency
            </span>
            <span className="rounded bg-talent-card px-2 py-0.5 font-mono text-[10px] text-talent-purple border border-talent-purple/30">
              Zero Surveillance Guarantee
            </span>
          </div>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-talent-text">
            Privacy & Telemetry Consent Center
          </h1>
          <p className="mt-1 text-sm text-talent-muted max-w-2xl">
            TalentLens is built on employee sovereignty. You control what work logs are read, whether
            your profile is discoverable in blind pools, and can export or purge your data anytime.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportData}
            className="flex items-center gap-1.5 rounded-xl border border-talent-border bg-talent-card px-3.5 py-2 font-mono text-xs font-semibold text-talent-text hover:border-talent-teal/50 transition-colors"
          >
            <Download className="h-3.5 w-3.5 text-talent-teal" />
            <span>Export My Data</span>
          </button>
        </div>
      </div>

      {feedback && (
        <div className="flex items-center gap-2.5 rounded-xl border border-talent-teal/30 bg-talent-teal/10 p-3.5 text-xs text-talent-teal animate-fadeIn">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Consent Toggles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Toggle 1: Telemetry Scanning */}
        <div className="rounded-2xl border border-talent-border bg-talent-card p-6 shadow-card-elevated space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-talent-teal" />
              <h3 className="text-sm font-bold text-talent-text">Autonomous Telemetry Extraction</h3>
            </div>
            <button
              type="button"
              onClick={handleToggleOptIn}
              className="text-talent-teal hover:opacity-80 transition-opacity"
            >
              {telemetryOptIn ? (
                <ToggleRight className="h-7 w-7 text-talent-teal" />
              ) : (
                <ToggleLeft className="h-7 w-7 text-talent-muted" />
              )}
            </button>
          </div>
          <p className="text-xs text-talent-muted leading-relaxed">
            Allow TalentLens local embeddings to scan your Git commits, PR reviews, and postmortems to
            infer latent engineering skills.
          </p>
          <div className="text-[11px] font-mono text-talent-teal font-semibold">
            Status: {telemetryOptIn ? 'Opted In (Active Scanning)' : 'Opted Out (Paused)'}
          </div>
        </div>

        {/* Toggle 2: Internal Mobility Pool */}
        <div className="rounded-2xl border border-talent-border bg-talent-card p-6 shadow-card-elevated space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-talent-purple" />
              <h3 className="text-sm font-bold text-talent-text">Blind Mobility Pool Discoverability</h3>
            </div>
            <button
              type="button"
              onClick={handleToggleMatching}
              className="text-talent-purple hover:opacity-80 transition-opacity"
            >
              {allowMatching ? (
                <ToggleRight className="h-7 w-7 text-talent-purple" />
              ) : (
                <ToggleLeft className="h-7 w-7 text-talent-muted" />
              )}
            </button>
          </div>
          <p className="text-xs text-talent-muted leading-relaxed">
            Allow hiring managers to view your anonymous dossier in Blind Matching pools. Personal
            identity is never exposed until you approve in the Reveal Inbox.
          </p>
          <div className="text-[11px] font-mono text-talent-purple font-semibold">
            Status: {allowMatching ? 'Discoverable (100% Anonymized)' : 'Concealed from Pool'}
          </div>
        </div>
      </div>

      {/* Transparency: What Was Read */}
      <div className="rounded-2xl border border-talent-border bg-talent-card p-6 shadow-card-elevated space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-talent-teal" />
            <h2 className="text-base font-bold text-talent-text">
              Telemetry Transparency Log ({logs.length} Indexed)
            </h2>
          </div>
          <span className="text-xs text-talent-muted font-mono">
            Directly Audit What The AI Has Seen
          </span>
        </div>

        {logs.length === 0 ? (
          <div className="p-8 text-center text-xs text-talent-muted">
            No active telemetry logs indexed in database.
          </div>
        ) : (
          <div className="space-y-2.5">
            {logs.map((log, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-talent-surface border border-talent-border text-xs space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] font-bold text-talent-purple">
                    [LOG-00{idx + 1}] {log.type}
                  </span>
                  <span className="text-[10px] text-talent-muted font-mono">
                    Ingested from Production
                  </span>
                </div>
                <p className="text-talent-subtext leading-relaxed font-mono text-[11px]">
                  &ldquo;{log.text}&rdquo;
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Danger Zone: GDPR Erasure */}
      <div className="rounded-2xl border border-red-500/30 bg-red-500/5 p-6 space-y-4">
        <div className="flex items-center gap-2 text-red-400">
          <AlertTriangle className="h-5 w-5" />
          <h3 className="text-base font-bold">Data Sovereignty & Permanent Erasure (GDPR)</h3>
        </div>
        <p className="text-xs text-talent-muted leading-relaxed max-w-2xl">
          Permanently delete all indexed work logs, PR reviews, and AI-inferred latent skills from the
          database. This cannot be undone.
        </p>
        <button
          type="button"
          disabled={isDeleting || logs.length === 0}
          onClick={handleDeleteData}
          className="flex items-center gap-1.5 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-2 font-mono text-xs font-bold text-red-400 hover:bg-red-500 hover:text-white transition-all disabled:opacity-40"
        >
          <Trash2 className="h-4 w-4" />
          <span>{isDeleting ? 'Erasing...' : 'Purge All My Telemetry Data'}</span>
        </button>
      </div>
    </div>
  );
}
