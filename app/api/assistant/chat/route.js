import { NextResponse } from 'next/server';
import { getEmployeeById, getAllRoles } from '@/lib/db/queries';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const body = await request.json();
    const { candidateId = 'emp-101', message, history = [] } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required.' }, { status: 400 });
    }

    const employee = getEmployeeById(candidateId);
    const roles = getAllRoles();

    if (!employee) {
      return NextResponse.json({ error: 'Candidate profile not found.' }, { status: 404 });
    }

    const explicitSkills = (employee.explicit_skills || []).map((s) => (s.name || s));
    const inferredSkills = (employee.inferred_skills || []).map((s) => (s.name || s));
    const allSkills = [...explicitSkills, ...inferredSkills];
    const logs = employee.work_logs || [];

    let reply = '';
    const q = message.toLowerCase();

    if (q.includes('latent') || q.includes('hidden') || q.includes('detective') || q.includes('discovered')) {
      reply = `Based on your recent production telemetry in the database, our Hidden Skill Detective uncovered ${inferredSkills.length} unadvertised competencies:
1. **${inferredSkills[0] || 'Distributed Tracing & Zero-Copy Streaming'}**: Citing \`[LOG-002]\` for Kafka buffer allocation and backpressure tuning.
2. **${inferredSkills[1] || 'Raft Consensus Leadership'}**: Citing \`[LOG-001]\` for resolving SEV-1 split-brain lease coordinator outages.
3. **${inferredSkills[2] || 'Multi-Region CDC Pipeline Replication'}**: Citing \`[LOG-003]\` for zero-downtime CockroachDB shadow verifications.

These demonstrate senior architectural capabilities that go far beyond standard QA or backend development.`;
    } else if (q.includes('architect') || q.includes('gap') || q.includes('transition') || q.includes('frontend') || q.includes('reach')) {
      reply = `Looking at the **Staff Distributed Systems Architect** and **Frontend Architect** mandates:

• **Your Strongest Bridges**: You have solid foundations in ${explicitSkills.slice(0, 3).join(', ')}, and your telemetry shows deep hands-on concurrency engineering.
• **Primary Gaps to Close**:
  1. Formal consensus protocol verification (TLA+ modeling or Jepsen test suite creation).
  2. eBPF kernel tracing for real-time socket latency monitoring.
• **Estimated Timeframe**: With your current learning velocity (${Math.round((employee.learning_velocity || 0.85) * 100)}%), you can reach 90%+ readiness in 6–8 weeks by completing the 3 recommended milestones in your Career GPS.`;
    } else if (q.includes('role') || q.includes('match') || q.includes('highest')) {
      reply = `Analyzing all ${roles.length} enterprise engineering roles in Meridian Platform:

1. **Staff Distributed Systems Architect**: **94% Match** (Top tier fit for storage engine & consensus orchestration).
2. **Principal ML Platform Architect**: **88% Match** (High transferable systems score for GPU cluster scheduler).
3. **Senior Cloud Native Infrastructure Engineer**: **85% Match** (Kubernetes operator & container network telemetry).

You are eligible for internal mobility and your anonymous dossier is currently listed at the top of hiring manager Marcus Chen's review pool.`;
    } else {
      reply = `Hello ${employee.hidden?.name || 'Engineer'}! I am your TalentLens Career Copilot. I have full context on your ${allSkills.length} verified technical competencies and ${logs.length} production telemetry entries.

You can ask me:
• *"What are my strongest latent skills extracted from work logs?"*
• *"What is my exact gap for Staff Distributed Systems Architect?"*
• *"Which roles in Meridian have the highest match for my profile?"*
• *"How can I transition from my current role to Architect this quarter?"*`;
    }

    return NextResponse.json({
      reply,
      candidate: {
        id: employee.id,
        name: employee.hidden?.name,
        title: employee.hidden?.title,
      },
      cited_logs: logs.slice(0, 2).map((l, i) => ({
        id: `LOG-00${i + 1}`,
        type: l.type,
        quote: l.text.slice(0, 80) + '...',
      })),
    });
  } catch (error) {
    console.error('Career copilot error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
