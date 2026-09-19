'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Cpu,
  Send,
  Sparkles,
  User,
  Trash2,
  FileText,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Compass,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function AssistantPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: "Hello Elena! I am your TalentLens Career Copilot. I've indexed your verified competencies, 4 production work logs, and all open engineering mandates. How can I help guide your internal mobility today?",
      cited_logs: [],
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const suggestedPrompts = [
    'What are my strongest latent skills extracted from work logs?',
    'What is my exact gap for Staff Distributed Systems Architect?',
    'Which engineering roles am I an 85%+ match for?',
    'How can I bridge from QA Lead to Principal Architect?',
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (textToSend) => {
    const query = textToSend || input;
    if (!query.trim() || isLoading) return;

    const userMsg = { role: 'user', text: query };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/assistant/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidateId: 'emp-101',
          message: query,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            text: data.reply,
            cited_logs: data.cited_logs || [],
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            text: 'I encountered an issue analyzing your profile telemetry. Please try again.',
          },
        ]);
      }
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: 'Network error communicating with the Career Copilot service.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setMessages([
      {
        role: 'assistant',
        text: 'Chat history cleared. How can I assist with your career progression or role gap analysis?',
      },
    ]);
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-talent-border pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-talent-teal/20 text-talent-teal">
              <Cpu className="h-4 w-4" />
            </span>
            <span className="font-mono text-xs font-bold uppercase tracking-widest text-talent-teal">
              Autonomous Guidance Layer
            </span>
            <span className="rounded bg-talent-card px-2 py-0.5 font-mono text-[10px] text-talent-purple border border-talent-purple/30">
              Telemetry Grounded
            </span>
          </div>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-talent-text">
            Career Copilot Assistant
          </h1>
          <p className="mt-1 text-sm text-talent-muted max-w-xl">
            Conversational career intelligence synthesizing your production telemetry logs, inferred latent
            skills, and open internal target roles.
          </p>
        </div>

        <button
          type="button"
          onClick={handleClear}
          className="self-start sm:self-center flex items-center gap-1.5 rounded-xl border border-talent-border bg-talent-surface px-3 py-1.5 text-xs font-mono text-talent-muted hover:text-red-400 hover:border-red-500/30 transition-colors"
        >
          <Trash2 className="h-3.5 w-3.5" />
          <span>Clear Chat</span>
        </button>
      </div>

      {/* Suggested Prompt Chips */}
      <div className="space-y-2">
        <div className="text-[10px] font-mono uppercase text-talent-muted font-bold flex items-center gap-1.5">
          <Sparkles className="h-3 w-3 text-talent-teal" />
          <span>Suggested Career Queries</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {suggestedPrompts.map((prompt, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleSend(prompt)}
              className="rounded-xl border border-talent-border bg-talent-card px-3 py-1.5 text-xs font-medium text-talent-subtext hover:border-talent-teal hover:text-talent-teal hover:bg-talent-teal/5 transition-all text-left"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Container */}
      <div className="rounded-2xl border border-talent-border bg-talent-card shadow-card-elevated flex flex-col h-[520px] overflow-hidden">
        {/* Messages Feed */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.map((msg, i) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={i}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'} animate-fadeIn`}
              >
                {!isUser && (
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-talent-teal/15 text-talent-teal border border-talent-teal/30 shrink-0">
                    <Cpu className="h-4 w-4" />
                  </div>
                )}

                <div
                  className={`max-w-2xl rounded-2xl p-4 text-xs sm:text-sm leading-relaxed space-y-2 ${
                    isUser
                      ? 'bg-gradient-to-r from-talent-teal to-teal-500 text-talent-bg font-medium shadow-glow-teal'
                      : 'bg-talent-surface border border-talent-border text-talent-text'
                  }`}
                >
                  <div className="whitespace-pre-line leading-relaxed">{msg.text}</div>

                  {/* Cited Work Logs */}
                  {msg.cited_logs && msg.cited_logs.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-talent-border/80 space-y-1">
                      <div className="text-[10px] font-mono text-talent-muted uppercase font-bold flex items-center gap-1">
                        <FileText className="h-3 w-3 text-talent-purple" />
                        <span>CITING VERIFIED TELEMETRY AUDIT</span>
                      </div>
                      {msg.cited_logs.map((log, idx) => (
                        <div
                          key={idx}
                          className="rounded bg-talent-card p-2 border border-talent-border font-mono text-[11px] text-talent-subtext"
                        >
                          <span className="text-talent-purple font-bold">[{log.id}] {log.type}:</span> {log.quote}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {isUser && (
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-talent-surface text-talent-subtext border border-talent-border shrink-0 font-mono text-xs font-bold">
                    ER
                  </div>
                )}
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-3 items-center text-xs font-mono text-talent-muted animate-pulse">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-talent-teal/15 text-talent-teal border border-talent-teal/30 shrink-0">
                <Cpu className="h-4 w-4" />
              </div>
              <span>Copilot synthesizing telemetry & matching algorithms...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="border-t border-talent-border bg-talent-surface/60 p-3 sm:p-4 flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your skills, role gaps, or internal mobility..."
            className="flex-1 rounded-xl border border-talent-border bg-talent-card px-4 py-2 text-xs sm:text-sm text-talent-text focus:outline-none focus:border-talent-teal"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="flex items-center gap-1 rounded-xl bg-talent-teal px-4 py-2 font-mono text-xs font-bold text-talent-bg shadow-glow-teal hover-lift transition-all disabled:opacity-50"
          >
            <Send className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Send</span>
          </button>
        </form>
      </div>
    </div>
  );
}
