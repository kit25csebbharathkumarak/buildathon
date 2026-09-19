'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Inbox,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  Sparkles,
  AlertCircle,
  Eye,
  Lock,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function RevealInboxPage() {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusAction, setStatusAction] = useState(null);

  const candidateId = 'emp-101'; // Elena Rostova demo profile

  const loadRequests = async () => {
    try {
      const res = await fetch(`/api/reveal-request?candidateId=${candidateId}`);
      if (res.ok) {
        const data = await res.json();
        setRequests(data);
      }
    } catch (err) {
      console.error('Error loading reveal requests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleRespond = async (id, status) => {
    try {
      const res = await fetch('/api/reveal-request', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });

      if (res.ok) {
        setStatusAction(`Consent successfully ${status === 'ACCEPTED' ? 'granted' : 'declined'}.`);
        loadRequests();
        setTimeout(() => setStatusAction(null), 4000);
      }
    } catch (err) {
      console.error('Error responding to reveal request:', err);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-talent-border pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-talent-purple/20 text-talent-purple">
              <Inbox className="h-4 w-4" />
            </span>
            <span className="font-mono text-xs font-bold uppercase tracking-widest text-talent-purple">
              Privacy & Consent Portal
            </span>
            <span className="rounded bg-talent-card px-2 py-0.5 font-mono text-[10px] text-talent-teal border border-talent-teal/30">
              Employee Sovereignty
            </span>
          </div>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-talent-text">
            Identity Reveal Inbox
          </h1>
          <p className="mt-1 text-sm text-talent-muted max-w-2xl">
            Review identity requests from hiring managers who shortlisted your blind dossier. You hold
            complete sovereignty to grant or decline identity disclosure.
          </p>
        </div>

        {/* Candidate Badge */}
        <div className="flex items-center gap-3 bg-talent-card p-3 rounded-2xl border border-talent-border shadow-card-elevated">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-talent-teal/15 text-talent-teal font-mono font-bold text-sm border border-talent-teal/30">
            ER
          </div>
          <div>
            <div className="text-xs font-bold text-talent-text">Elena Rostova</div>
            <div className="text-[10px] font-mono text-talent-muted">Candidate #P101 • Verified</div>
          </div>
        </div>
      </div>

      {/* Action Notice */}
      {statusAction && (
        <div className="flex items-center gap-2.5 rounded-xl border border-talent-teal/30 bg-talent-teal/10 p-3.5 text-xs text-talent-teal animate-fadeIn">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{statusAction}</span>
        </div>
      )}

      {/* Requests List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-talent-text flex items-center gap-2">
            <span>Pending & Historical Requests</span>
            <span className="rounded-full bg-talent-purple/15 px-2 py-0.5 font-mono text-xs text-talent-purple border border-talent-purple/30">
              {requests.length} Total
            </span>
          </h2>
        </div>

        {loading && (
          <div className="text-center py-12 text-talent-muted text-xs font-mono">
            Loading reveal requests from database...
          </div>
        )}

        {!loading && requests.length === 0 && (
          <div className="rounded-2xl border border-talent-border bg-talent-card p-12 text-center space-y-3">
            <Lock className="h-10 w-10 text-talent-muted mx-auto" />
            <h3 className="text-sm font-bold text-talent-text">No Reveal Requests Yet</h3>
            <p className="text-xs text-talent-muted max-w-md mx-auto">
              When an engineering hiring manager shortlists your anonymized telemetry profile, their
              formal disclosure request will appear here for your explicit consent.
            </p>
          </div>
        )}

        <div className="space-y-4">
          {requests.map((req) => {
            const isPending = req.status === 'PENDING';
            const isAccepted = req.status === 'ACCEPTED';
            const isDeclined = req.status === 'DECLINED';

            return (
              <div
                key={req.id}
                className={`rounded-2xl border p-5 sm:p-6 transition-all ${
                  isPending
                    ? 'border-talent-purple/40 bg-talent-purple/5 shadow-glow-purple'
                    : isAccepted
                      ? 'border-talent-teal/40 bg-talent-card'
                      : 'border-talent-border bg-talent-card/60 opacity-70'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-talent-border/60 pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-talent-text">
                      {req.manager_name || 'Hiring Manager'}
                    </span>
                    <span className="text-talent-muted text-xs">•</span>
                    <span className="text-xs text-talent-teal font-medium">
                      {req.role_title || 'Target Role'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {isPending && (
                      <span className="flex items-center gap-1 rounded bg-amber-400/15 px-2.5 py-0.5 font-mono text-[11px] font-bold text-amber-300 border border-amber-400/30">
                        <Clock className="h-3 w-3" />
                        <span>ACTION REQUIRED</span>
                      </span>
                    )}
                    {isAccepted && (
                      <span className="flex items-center gap-1 rounded bg-teal-500/15 px-2.5 py-0.5 font-mono text-[11px] font-bold text-talent-teal border border-talent-teal/30">
                        <CheckCircle2 className="h-3 w-3" />
                        <span>DISCLOSED</span>
                      </span>
                    )}
                    {isDeclined && (
                      <span className="flex items-center gap-1 rounded bg-red-500/15 px-2.5 py-0.5 font-mono text-[11px] font-bold text-red-400 border border-red-500/30">
                        <XCircle className="h-3 w-3" />
                        <span>DECLINED (ANONYMOUS)</span>
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="rounded-xl bg-talent-surface p-3.5 border border-talent-border text-xs space-y-1">
                    <div className="text-[10px] font-mono text-talent-muted uppercase font-bold">
                      MANAGER DISCLOSURE RATIONALE
                    </div>
                    <p className="text-talent-subtext leading-relaxed">
                      &ldquo;{req.note || 'Candidate demonstrated top-tier engineering fit in recent telemetry.'}&rdquo;
                    </p>
                  </div>

                  {isPending && (
                    <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
                      <p className="text-[11px] text-talent-muted">
                        Accepting will disclose your real name, current title, and verified email to this manager only.
                      </p>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleRespond(req.id, 'DECLINED')}
                          className="flex items-center gap-1 rounded-xl border border-talent-border bg-talent-surface px-3 py-1.5 text-xs font-mono font-semibold text-talent-subtext hover:text-red-400 hover:border-red-500/30 transition-colors"
                        >
                          <XCircle className="h-3.5 w-3.5" />
                          <span>Decline (Keep Anonymous)</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRespond(req.id, 'ACCEPTED')}
                          className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-talent-teal to-teal-400 px-4 py-1.5 text-xs font-mono font-bold text-talent-bg shadow-glow-teal hover-lift transition-all"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>Accept & Disclose Identity</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
