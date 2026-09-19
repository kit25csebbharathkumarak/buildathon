'use client';

import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { Terminal, Play, RotateCcw, Sparkles, CheckCircle2, ShieldAlert, Cpu } from 'lucide-react';

/**
 * Terminal-style live feed displaying real-time AI skill extraction events received via Socket.IO.
 * @param {Object} props - Component properties.
 * @param {string} props.employeeId - Identifier of employee being analyzed.
 * @param {Array} [props.rawLogs=[]] - Raw work logs to scan.
 * @returns {JSX.Element}
 */
export default function LiveExtractionFeed({ employeeId, rawLogs = [] }) {
  const [events, setEvents] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const feedEndRef = useRef(null);
  const socketRef = useRef(null);

  useEffect(() => {
    // Connect to Socket.IO server
    const socket = io({
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('extraction:progress', (data) => {
      if (!employeeId || data.employeeId === employeeId) {
        setEvents((prev) => [...prev, data]);
        if (data.totalLogs && data.logIndex !== undefined) {
          setProgress(Math.round(((data.logIndex + 1) / data.totalLogs) * 100));
        }
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [employeeId]);

  useEffect(() => {
    feedEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [events]);

  const handleStartScan = async () => {
    if (isScanning) return;
    setIsScanning(true);
    setEvents([]);
    setProgress(0);

    try {
      const res = await fetch('/api/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeId }),
      });
      const data = await res.json();

      // If socket events were not received (or offline fallback), populate from API response
      if (data.extractions && data.extractions.length > 0 && events.length === 0) {
        data.extractions.forEach((item, idx) => {
          setTimeout(() => {
            setEvents((prev) => [
              ...prev,
              {
                employeeId,
                logIndex: idx,
                totalLogs: data.extractions.length,
                ...item,
                timestamp: new Date().toISOString(),
              },
            ]);
            setProgress(Math.round(((idx + 1) / data.extractions.length) * 100));
          }, (idx + 1) * 350);
        });
      }
    } catch (err) {
      console.error('Extraction trigger error:', err);
    } finally {
      setTimeout(() => {
        setIsScanning(false);
      }, (rawLogs.length || 4) * 400);
    }
  };

  const handleClearFeed = () => {
    setEvents([]);
    setProgress(0);
  };

  return (
    <div className="overflow-hidden rounded-xl border border-talent-border bg-talent-card shadow-card-elevated">
      {/* Terminal Window Header */}
      <div className="flex items-center justify-between border-b border-talent-border bg-talent-surface px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded-full bg-red-500/80"></div>
            <div className="h-3 w-3 rounded-full bg-yellow-500/80"></div>
            <div className="h-3 w-3 rounded-full bg-emerald-500/80"></div>
          </div>
          <div className="flex items-center gap-2 font-mono text-xs text-talent-muted">
            <Terminal className="h-3.5 w-3.5 text-talent-teal" />
            <span>live-telemetry://skill-detective/{employeeId || 'stream'}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Realtime Status Indicator */}
          <div className="flex items-center gap-2 font-mono text-xs">
            <span className={`h-2 w-2 rounded-full ${isConnected ? 'bg-talent-teal shadow-glow-teal' : 'bg-amber-500 animate-pulse'}`} />
            <span className="text-[11px] text-talent-muted">
              {isConnected ? 'Socket.IO Online' : 'Polling Ready'}
            </span>
          </div>

          {/* Action buttons */}
          <button
            onClick={handleClearFeed}
            disabled={events.length === 0}
            aria-label="Clear live telemetry feed"
            className="rounded p-1.5 text-talent-muted hover:bg-talent-card hover:text-talent-text disabled:opacity-30 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-talent-teal"
            title="Clear Feed"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={handleStartScan}
            disabled={isScanning}
            aria-label={isScanning ? 'Running skill detective scan on telemetry logs' : 'Run skill detective scan on telemetry logs'}
            className="flex items-center gap-1.5 rounded-md bg-talent-teal px-3 py-1.5 font-mono text-xs font-semibold text-talent-bg shadow-glow-teal hover:bg-talent-teal-light disabled:opacity-50 transition-all hover-lift focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-talent-teal"
          >
            {isScanning ? (
              <>
                <Cpu className="h-3.5 w-3.5 animate-spin" />
                <span>Scanning...</span>
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5 fill-current" />
                <span>Run Detective Scan</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      {isScanning && (
        <div className="h-1 w-full bg-talent-surface">
          <div
            className="h-full bg-gradient-to-r from-talent-teal via-talent-purple to-talent-teal-light transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* Terminal Body */}
      <div className="h-80 overflow-y-auto p-4 font-mono text-xs scrollbar-thin">
        {events.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center text-talent-muted">
            <Sparkles className="mb-2 h-8 w-8 text-talent-purple/50 animate-pulse" />
            <p className="font-sans text-sm font-medium text-talent-subtext">
              Real-time Inferred Competency Channel Idle
            </p>
            <p className="mt-1 text-xs text-talent-muted">
              Click &quot;Run Detective Scan&quot; to parse raw logs and stream latent skills via Socket.IO.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {events.map((evt, idx) => (
              <div
                key={idx}
                className="group relative rounded-lg border border-talent-border/80 bg-talent-surface/70 p-3 hover:border-talent-teal/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-talent-muted">
                      [{new Date(evt.timestamp || Date.now()).toLocaleTimeString()}]
                    </span>
                    <span className="font-semibold text-talent-teal">
                      LOG #{evt.logIndex !== undefined ? evt.logIndex + 1 : idx + 1}
                    </span>
                    <span className="rounded bg-talent-purple/20 px-2 py-0.5 text-[10px] font-medium text-talent-purple border border-talent-purple/30">
                      {evt.category || 'Competency'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
                    <CheckCircle2 className="h-3 w-3" />
                    <span>{Math.round((evt.confidence || 0.9) * 100)}% Match</span>
                  </div>
                </div>

                <div className="mt-2 text-sm font-bold text-talent-text">
                  ✨ Detected: <span className="text-white">{evt.detected_skill}</span>
                </div>

                {evt.evidence_quote && (
                  <div className="mt-2 rounded bg-talent-bg/70 p-2.5 text-xs text-talent-subtext border-l-2 border-talent-teal">
                    <span className="text-talent-muted italic font-serif">
                      &ldquo;{evt.evidence_quote}&rdquo;
                    </span>
                  </div>
                )}
              </div>
            ))}
            <div ref={feedEndRef} />
          </div>
        )}
      </div>

      {/* Terminal Footer */}
      <div className="flex items-center justify-between border-t border-talent-border bg-talent-surface/50 px-4 py-2 text-[11px] text-talent-muted">
        <span>Channel: extraction:progress</span>
        <span>Events Processed: {events.length}</span>
      </div>
    </div>
  );
}
