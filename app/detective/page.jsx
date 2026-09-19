'use client';

import React, { useState, useEffect } from 'react';
import {
  Eye,
  Play,
  Square,
  RotateCcw,
  Sparkles,
  FileText,
  Upload,
  Check,
  X,
  Edit2,
  Terminal,
  ShieldCheck,
  AlertCircle,
  Database,
  ArrowRight,
  Code2,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function DetectivePage() {
  const { user } = useAuth();
  const [selectedCandidate, setSelectedCandidate] = useState('emp-101');
  const [sourceMode, setSourceMode] = useState('sample'); // 'sample' | 'paste' | 'upload'
  const [pastedText, setPastedText] = useState(
    'Authored high-throughput WebSocket backpressure controller in Node.js and Rust. Resolved memory starvation under 50,000 concurrent socket connections by introducing bounded ring-buffer queues with exponential backoff backpressure propagation.'
  );
  const [pastedType, setPastedType] = useState('PR_REVIEW');
  const [uploadedFileName, setUploadedFileName] = useState(null);

  const [candidates, setCandidates] = useState([]);
  const [employee, setEmployee] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [logsToProcess, setLogsToProcess] = useState([]);
  const [results, setResults] = useState([]);
  const [editingSkill, setEditingSkill] = useState(null);
  const [editSkillName, setEditSkillName] = useState('');
  const [statusMessage, setStatusMessage] = useState('Ready to ingest telemetry.');

  // Fetch candidate roster
  useEffect(() => {
    async function loadCandidates() {
      try {
        const res = await fetch('/api/employees');
        if (res.ok) {
          const data = await res.json();
          setCandidates(data);
        }
      } catch (err) {
        console.error('Failed to load candidates:', err);
      }
    }
    loadCandidates();
  }, []);

  // Fetch selected employee details
  useEffect(() => {
    async function loadEmployee() {
      try {
        const res = await fetch(`/api/employee/${selectedCandidate}`);
        if (res.ok) {
          const data = await res.json();
          setEmployee(data);
          if (Array.isArray(data.work_logs)) {
            setLogsToProcess(data.work_logs);
          }
        }
      } catch (err) {
        console.error('Failed to load employee:', err);
      }
    }
    loadEmployee();
  }, [selectedCandidate]);

  // Handle File Upload
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadedFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === 'string') {
        setPastedText(content);
        setSourceMode('paste');
        setStatusMessage(`Ingested ${file.name} (${content.length} bytes). Click Run Detective.`);
      }
    };
    reader.readAsText(file);
  };

  // Run Detective Engine
  const handleStartInference = async () => {
    setIsRunning(true);
    setStatusMessage('Scanning telemetry logs through local embeddings and extraction pipeline...');

    let logs = [];
    if (sourceMode === 'sample') {
      logs = employee?.work_logs || [];
    } else {
      logs = [
        {
          id: 'PASTED-01',
          type: pastedType,
          text: pastedText,
        },
      ];
    }

    if (logs.length === 0) {
      setStatusMessage('No logs found to process.');
      setIsRunning(false);
      return;
    }

    const newResults = [];
    for (let i = 0; i < logs.length; i++) {
      const log = logs[i];
      setStatusMessage(`Analyzing [LOG-${i + 1}]: ${log.type}...`);

      try {
        const response = await fetch('/api/extract', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            employeeId: selectedCandidate,
            logText: log.text,
            logIndex: i,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.skill) {
            newResults.unshift({
              id: `ext_${Date.now()}_${i}`,
              logId: log.id || `LOG-${i + 1}`,
              logType: log.type || 'TELEMETRY',
              logSnippet: log.text.slice(0, 100) + '...',
              skill: data.skill.detected_skill || data.skill.detectedSkill || 'High-Throughput Concurrency',
              confidence: data.skill.confidence || 0.89,
              evidenceQuote: data.skill.evidence_quote || data.skill.evidenceQuote || log.text.slice(0, 80),
              status: 'PENDING', // PENDING | CONFIRMED | REJECTED
            });
            setResults([...newResults]);
          }
        }
      } catch (err) {
        console.error('Inference step failed:', err);
      }
    }

    setIsRunning(false);
    setStatusMessage(`Completed analysis. Discovered ${newResults.length} latent skills.`);
  };

  // Skill Triage: Confirm
  const handleConfirm = async (item) => {
    try {
      const res = await fetch('/api/skills/triage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'confirm',
          employeeId: selectedCandidate,
          skill: {
            name: item.skill,
            confidence: item.confidence,
            evidence: item.evidenceQuote,
          },
        }),
      });

      if (res.ok) {
        setResults((prev) =>
          prev.map((r) => (r.id === item.id ? { ...r, status: 'CONFIRMED' } : r))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Skill Triage: Reject
  const handleReject = async (item) => {
    try {
      const res = await fetch('/api/skills/triage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reject',
          employeeId: selectedCandidate,
          skill: item.skill,
        }),
      });

      if (res.ok) {
        setResults((prev) =>
          prev.map((r) => (r.id === item.id ? { ...r, status: 'REJECTED' } : r))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Skill Triage: Edit
  const handleSaveEdit = async (item) => {
    if (!editSkillName.trim()) return;
    try {
      const res = await fetch('/api/skills/triage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'edit',
          employeeId: selectedCandidate,
          oldSkillName: item.skill,
          newSkill: {
            name: editSkillName.trim(),
            confidence: item.confidence,
            evidence: item.evidenceQuote,
          },
        }),
      });

      if (res.ok) {
        setResults((prev) =>
          prev.map((r) => (r.id === item.id ? { ...r, skill: editSkillName.trim(), status: 'CONFIRMED' } : r))
        );
        setEditingSkill(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Engine Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-talent-border pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-talent-teal/20 text-talent-teal">
              <Eye className="h-4 w-4" />
            </span>
            <span className="font-mono text-xs font-bold uppercase tracking-widest text-talent-teal">
              Engine 01
            </span>
            <span className="rounded bg-talent-card px-2 py-0.5 font-mono text-[10px] text-talent-purple border border-talent-purple/30">
              Zero External Key
            </span>
          </div>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-talent-text">
            Hidden Skill Detective
          </h1>
          <p className="mt-1 text-sm text-talent-muted max-w-2xl">
            Surfaces unadvertised, high-value engineering capabilities buried in Git commits, PR
            reviews, incident postmortems, and RFC drafts. 100% explainable with cited evidence IDs.
          </p>
        </div>

        {/* Candidate Selector */}
        <div className="flex items-center gap-3 bg-talent-card p-3 rounded-2xl border border-talent-border shadow-card-elevated">
          <Database className="h-5 w-5 text-talent-teal shrink-0" />
          <div>
            <div className="text-[10px] font-mono uppercase text-talent-muted font-bold">
              Target Candidate
            </div>
            <select
              value={selectedCandidate}
              onChange={(e) => setSelectedCandidate(e.target.value)}
              className="mt-0.5 bg-talent-surface border border-talent-border text-talent-text rounded-lg px-2.5 py-1 text-xs font-semibold focus:outline-none focus:border-talent-teal"
            >
              <option value="emp-101">Elena Rostova (QA Lead → Hidden Architect)</option>
              {candidates
                .filter((c) => c.id !== 'emp-101')
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.hidden?.name || c.name || c.id} — {c.hidden?.title || c.title}
                  </option>
                ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Grid: Source Intake vs Live Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Intake Controls (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Source Picker Tabs */}
          <div className="rounded-2xl border border-talent-border bg-talent-card p-5 space-y-4 shadow-card-elevated">
            <h2 className="text-sm font-bold uppercase tracking-wider text-talent-text font-mono flex items-center justify-between">
              <span>Telemetry Ingestion Source</span>
              <span className="text-[10px] text-talent-teal">Multi-Input</span>
            </h2>

            <div className="grid grid-cols-3 gap-1 rounded-xl bg-talent-surface p-1 border border-talent-border text-xs font-semibold">
              <button
                type="button"
                onClick={() => setSourceMode('sample')}
                className={`py-2 rounded-lg transition-all ${
                  sourceMode === 'sample'
                    ? 'bg-talent-card text-talent-teal border border-talent-teal/30 shadow-glow-teal'
                    : 'text-talent-muted hover:text-talent-text'
                }`}
              >
                Production Logs
              </button>
              <button
                type="button"
                onClick={() => setSourceMode('paste')}
                className={`py-2 rounded-lg transition-all ${
                  sourceMode === 'paste'
                    ? 'bg-talent-card text-talent-purple border border-talent-purple/30 shadow-glow-purple'
                    : 'text-talent-muted hover:text-talent-text'
                }`}
              >
                Direct Paste
              </button>
              <button
                type="button"
                onClick={() => setSourceMode('upload')}
                className={`py-2 rounded-lg transition-all ${
                  sourceMode === 'upload'
                    ? 'bg-talent-card text-talent-teal border border-talent-teal/30 shadow-glow-teal'
                    : 'text-talent-muted hover:text-talent-text'
                }`}
              >
                File Upload
              </button>
            </div>

            {/* Source Mode: Sample Logs */}
            {sourceMode === 'sample' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-talent-muted">
                  <span>Available logs in database:</span>
                  <span className="font-mono text-talent-teal font-bold">{logsToProcess.length} entries</span>
                </div>
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {logsToProcess.map((log, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-talent-surface border border-talent-border text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] font-bold text-talent-teal">
                          [LOG-{idx + 1}] {log.type}
                        </span>
                      </div>
                      <p className="text-talent-subtext line-clamp-2 leading-relaxed">{log.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Source Mode: Direct Paste */}
            {sourceMode === 'paste' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-talent-subtext">Telemetry Log Type</label>
                  <select
                    value={pastedType}
                    onChange={(e) => setPastedType(e.target.value)}
                    className="bg-talent-surface border border-talent-border text-talent-text rounded px-2 py-0.5 text-xs font-mono"
                  >
                    <option value="PR_REVIEW">PR_REVIEW</option>
                    <option value="INCIDENT_POSTMORTEM">INCIDENT_POSTMORTEM</option>
                    <option value="ARCHITECTURE_NOTE">ARCHITECTURE_NOTE</option>
                    <option value="SLACK_THREAD">SLACK_THREAD</option>
                  </select>
                </div>
                <textarea
                  rows={6}
                  value={pastedText}
                  onChange={(e) => setPastedText(e.target.value)}
                  placeholder="Paste raw Git commit message, PR review comments, or incident debug logs..."
                  className="w-full rounded-xl border border-talent-border bg-talent-surface p-3 font-mono text-xs text-talent-text focus:border-talent-purple focus:outline-none leading-relaxed"
                />
              </div>
            )}

            {/* Source Mode: Upload */}
            {sourceMode === 'upload' && (
              <div className="rounded-xl border-2 border-dashed border-talent-border p-6 text-center space-y-3">
                <Upload className="h-8 w-8 text-talent-teal mx-auto" />
                <div className="text-xs text-talent-text font-bold">
                  {uploadedFileName || 'Drop CSV, JSON, or text logs here'}
                </div>
                <p className="text-[11px] text-talent-muted">
                  Supports exported Jira tickets, GitHub PRs, or candidate resumes
                </p>
                <input
                  type="file"
                  accept=".txt,.json,.csv,.md"
                  onChange={handleFileUpload}
                  className="block w-full text-xs text-talent-muted file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-talent-teal/15 file:text-talent-teal hover:file:bg-talent-teal/25 cursor-pointer"
                />
              </div>
            )}

            {/* Action Execution Bar */}
            <div className="pt-2 flex items-center gap-3">
              <button
                type="button"
                disabled={isRunning}
                onClick={handleStartInference}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-talent-teal to-teal-500 py-2.5 font-mono text-xs font-bold text-talent-bg shadow-glow-teal hover:opacity-95 hover-lift transition-all disabled:opacity-50"
              >
                <Play className="h-3.5 w-3.5 fill-talent-bg" />
                <span>{isRunning ? 'Analyzing Telemetry...' : 'Start Detective Run'}</span>
              </button>
              <button
                type="button"
                onClick={() => setResults([])}
                className="rounded-xl border border-talent-border bg-talent-surface p-2.5 text-talent-muted hover:text-talent-text transition-colors"
                title="Reset Results"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Engine Status Terminal */}
          <div className="rounded-2xl border border-talent-border bg-talent-card p-4 space-y-2 font-mono text-xs shadow-card-elevated">
            <div className="flex items-center justify-between text-talent-muted text-[10px] uppercase font-bold">
              <span className="flex items-center gap-1.5 text-talent-teal">
                <Terminal className="h-3.5 w-3.5" />
                <span>Detective Inference Status</span>
              </span>
              <span>{isRunning ? 'ACTIVE' : 'IDLE'}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-talent-bg border border-talent-border/80 text-talent-subtext text-[11px] leading-relaxed">
              <span className="text-talent-teal mr-2">&gt;</span>
              {statusMessage}
            </div>
          </div>
        </div>

        {/* Right Column: Live Discovered Skills & Interactive Triage (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-talent-text flex items-center gap-2">
                <span>Discovered Latent Competencies</span>
                <span className="rounded-full bg-talent-teal/15 px-2 py-0.5 font-mono text-xs text-talent-teal border border-talent-teal/30">
                  {results.length} Found
                </span>
              </h2>
              <p className="text-xs text-talent-muted mt-0.5">
                Review, confirm, or edit latent skills to immediately persist into the employee profile.
              </p>
            </div>
          </div>

          {/* Empty State */}
          {results.length === 0 && (
            <div className="rounded-2xl border border-talent-border bg-talent-card/60 p-12 text-center space-y-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-talent-surface mx-auto border border-talent-border text-talent-teal">
                <Sparkles className="h-6 w-6 animate-pulse" />
              </div>
              <h3 className="text-sm font-bold text-talent-text">No Telemetry Ingested Yet</h3>
              <p className="text-xs text-talent-muted max-w-md mx-auto leading-relaxed">
                Select sample production logs from the left panel or paste raw code diffs to run the
                Hidden Skill Detective engine. Discovered skills appear here live with audit citations.
              </p>
            </div>
          )}

          {/* Results Feed */}
          <div className="space-y-3">
            {results.map((item) => {
              const isConfirmed = item.status === 'CONFIRMED';
              const isRejected = item.status === 'REJECTED';

              return (
                <div
                  key={item.id}
                  className={`rounded-2xl border p-4 transition-all duration-200 ${
                    isConfirmed
                      ? 'border-talent-teal/40 bg-talent-teal/5 shadow-glow-teal'
                      : isRejected
                        ? 'border-red-500/30 bg-red-500/5 opacity-60 line-through'
                        : 'border-talent-border bg-talent-card shadow-card-elevated'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-talent-border/60 pb-2.5 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] font-bold text-talent-purple bg-talent-purple/10 px-2 py-0.5 rounded border border-talent-purple/30">
                        {item.logId}
                      </span>
                      <span className="text-[11px] text-talent-muted font-mono">{item.logType}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 text-[11px] font-mono text-talent-teal font-bold">
                        <span>Confidence:</span>
                        <span>{Math.round(item.confidence * 100)}%</span>
                      </div>
                      {isConfirmed && (
                        <span className="flex items-center gap-1 text-[10px] font-mono font-bold text-talent-teal bg-talent-teal/15 px-2 py-0.5 rounded border border-talent-teal/30">
                          <CheckCircle2 className="h-3 w-3" />
                          <span>CONFIRMED</span>
                        </span>
                      )}
                      {isRejected && (
                        <span className="text-[10px] font-mono font-bold text-red-400 bg-red-500/15 px-2 py-0.5 rounded border border-red-500/30">
                          REJECTED
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Skill Title & Evidence Quote */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      {editingSkill?.id === item.id ? (
                        <div className="flex items-center gap-2 w-full">
                          <input
                            type="text"
                            value={editSkillName}
                            onChange={(e) => setEditSkillName(e.target.value)}
                            className="bg-talent-surface border border-talent-teal text-talent-text rounded px-2.5 py-1 text-xs font-bold w-full"
                          />
                          <button
                            type="button"
                            onClick={() => handleSaveEdit(item)}
                            className="p-1 rounded bg-talent-teal text-talent-bg font-bold"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingSkill(null)}
                            className="p-1 rounded bg-talent-surface text-talent-muted"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <h3 className="text-sm font-bold text-talent-text">{item.skill}</h3>
                      )}
                    </div>

                    {/* Cited Evidence Block */}
                    <div className="rounded-xl bg-talent-surface p-3 border border-talent-border/80 space-y-1">
                      <div className="text-[10px] font-mono text-talent-muted uppercase font-bold">
                        CITED AUDIT EVIDENCE
                      </div>
                      <p className="font-mono text-xs text-talent-subtext italic leading-relaxed">
                        &ldquo;{item.evidenceQuote}&rdquo;
                      </p>
                    </div>

                    {/* Triage Buttons: Confirm, Reject, Edit */}
                    {!isConfirmed && !isRejected && (
                      <div className="pt-2 flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingSkill(item);
                            setEditSkillName(item.skill);
                          }}
                          className="flex items-center gap-1 rounded-lg border border-talent-border bg-talent-surface px-2.5 py-1 text-xs font-mono font-semibold text-talent-subtext hover:text-talent-text transition-colors"
                        >
                          <Edit2 className="h-3 w-3" />
                          <span>Edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleReject(item)}
                          className="flex items-center gap-1 rounded-lg border border-red-500/30 bg-red-500/10 px-2.5 py-1 text-xs font-mono font-semibold text-red-400 hover:bg-red-500/20 transition-colors"
                        >
                          <X className="h-3 w-3" />
                          <span>Reject</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleConfirm(item)}
                          className="flex items-center gap-1 rounded-lg border border-talent-teal/40 bg-talent-teal/20 px-3 py-1 text-xs font-mono font-bold text-talent-teal hover:bg-talent-teal hover:text-talent-bg shadow-glow-teal transition-all"
                        >
                          <Check className="h-3.5 w-3.5" />
                          <span>Confirm Skill</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
