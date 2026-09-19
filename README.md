# TalentLens — AI-Powered Internal Talent Discovery & Mobility

> **Built for Hackathon Evaluation**  
> **Team:** 4D Developers  
> **Repository:** [https://github.com/kit25csebbharathkumarak/buildathon.git](https://github.com/kit25csebbharathkumarak/buildathon.git)

---

## 1. Problem Statement

In modern technology enterprises, **up to 70% of engineering capabilities remain hidden** within unstructured work logs: incident postmortems, complex pull request reviews, architecture RFCs, and emergency debug threads. 

Traditional HR and talent mobility platforms rely exclusively on static, self-reported resume skills. This creates three critical institutional failures:
1. **The Latent Competency Blind Spot**: Engineers demonstrate deep production skills (e.g., Raft consensus troubleshooting, zero-copy serialization, micro-frontend federation) that never appear on their formal HR profile.
2. **Opaque Career Progression**: Employees lack clear, directed guidance showing exactly what competencies bridge their current skills to target engineering roles.
3. **Unconscious Demographic Bias**: Internal talent scouting frequently suffers from pedigree bias, tenure favoritism, and demographic affinity rather than objective, audited technical fit.

---

## 2. The 3-Pillar Solution

TalentLens solves this through a dual-engine architecture combining an autonomous local AI engine and targeted generative capabilities:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              TALENTLENS MVP                                 │
├──────────────────────┬──────────────────────────┬───────────────────────────┤
│  1. HIDDEN SKILL     │      2. CAREER GPS       │    3. BLIND MATCHING      │
│     DETECTIVE        │                          │                           │
│                      │                          │                           │
│ Real-time inference  │ Directed skill trees     │ Pure mathematical scoring │
│ parsing work logs    │ with native SVG curves   │ without LLM bias + 3-line │
│ via Socket.IO stream │ to target roles          │ anonymous talent pitches  │
└──────────────────────┴──────────────────────────┴───────────────────────────┘
```

1. **Hidden Skill Detective**: Ingests unstructured engineering work logs and extracts latent technical capabilities with strict JSON schemas. Dispatches real-time inference telemetry via Socket.IO to a terminal-style live dashboard.
2. **Career GPS**: Computes dynamic skill progression roadmaps connecting current competencies to open target roles. Renders custom branching graphs using absolute-positioned components with native SVG cubic-bezier connector curves (zero external graph library bloat).
3. **Blind Matching**: Evaluates internal candidates using a **pure mathematical weighted formula** with strictly zero demographic data. Employs local semantic embeddings (`all-MiniLM-L6-v2`) and generates objective 3-sentence blind talent pitches with an interactive reveal toggle.

---

## 3. Architecture & System Flow

```mermaid
flowchart TD
    subgraph DataLayer [Data Layer - Static JSON]
        EMP[data/employees.json\nRaw Work Logs & Skills]
        ROLES[data/roles.json\nTarget Role Requirements]
    end

    subgraph OwnEngine [TalentLens Own AI Engine]
        EMB[lib/ai/embeddings.js\n@xenova/transformers\nall-MiniLM-L6-v2 Local 384-Dim]
    end

    subgraph DeterministicScoring [Mathematical Core - Pure Function]
        FORMULA[lib/ai/score-match.js\n0.4 Explicit + 0.3 Transferable +\n0.2 Recency + 0.1 Velocity]
    end

    subgraph RealtimeServer [Realtime Server Layer]
        EXPRESS[server/index.js\nExpress + Next.js App Router]
        SOCKET[server/socket.js\nSocket.IO extraction:progress]
    end

    subgraph GenerativeLayer [Generative Layer - Claude Sonnet 4.6]
        EXTRACT[lib/ai/extract-skills.js\nStrict-JSON Work Log Parser]
        ROADMAP[lib/ai/generate-roadmap.js\nCareer GPS Graph Generator]
        PITCH[lib/ai/generate-pitch.js\nAnonymized 3-Sentence Synthesis]
    end

    subgraph ClientUI [Editorial Dark UI - Next.js App Router]
        DASH[app/page.jsx\nDashboard & Metrics]
        PROFILE[app/employee/id/page.jsx\nLiveExtractionFeed]
        TREE[app/roadmap/id/role/page.jsx\nNative SVG SkillTree]
        MATCH[app/match/role/page.jsx\nBlind PitchCard Grid]
    end

    EMP --> EXTRACT
    EXTRACT --> SOCKET
    SOCKET --> PROFILE
    
    EMP --> EMB
    ROLES --> EMB
    EMB --> FORMULA
    FORMULA --> PITCH
    PITCH --> MATCH

    EMP --> ROADMAP
    ROLES --> ROADMAP
    ROADMAP --> TREE
```

---

## 4. Requirement to File Mapping

The following matrix provides an explicit 1-to-1 mapping verifying every requirement specified in the hackathon brief:

| Brief Requirement | Implementation File | Architecture Description & Verification |
|---|---|---|
| **Tech Stack: Dark Editorial UI** | `tailwind.config.js`, `app/globals.css`, `app/layout.jsx` | Near-black `#0B0D12` background, `#1D9E75` teal, `#7F77DD` purple accents, custom glowing shadows, Inter typography. |
| **Backend: Express + Next.js** | `server/index.js` | Express server bootstrap mounting Next.js App Router handler on a single port (`3000`). |
| **Realtime: Socket.IO** | `server/socket.js` | Dispatches `extraction:progress` events streaming AI inference results. |
| **Own AI Engine: Transformers.js** | `lib/ai/embeddings.js` | Runs `Xenova/all-MiniLM-L6-v2` locally for 384-dimensional dense vectors and normalized `cosineSim(a, b)`. |
| **Generative Layer: Anthropic SDK** | `lib/ai/extract-skills.js`, `lib/ai/generate-roadmap.js`, `lib/ai/generate-pitch.js` | Target model `claude-sonnet-4-6` with strict JSON schema prompts and local autonomous fallback. |
| **Data Models: Static JSON** | `data/employees.json`, `data/roles.json` | 7 realistic employee records with hidden demographic objects and raw logs; 6 engineering roles. |
| **Feature 1: Hidden Skill Detective** | `lib/ai/extract-skills.js`, `components/LiveExtractionFeed.jsx`, `app/api/extract/route.js` | Extracts `{ detected_skill, confidence, evidence_quote, category }` and streams live via terminal UI. |
| **Feature 2: Career GPS** | `lib/ai/generate-roadmap.js`, `components/SkillTree.jsx`, `app/roadmap/[employeeId]/[roleId]/page.jsx` | Generates `{ nodes, edges }` and renders branching tree with pure absolute divs + SVG connector paths. |
| **Feature 3: Blind Matching** | `lib/ai/score-match.js`, `lib/ai/generate-pitch.js`, `components/PitchCard.jsx`, `app/match/[roleId]/page.jsx` | Pure scoring formula: $0.4\text{E} + 0.3\text{T} + 0.2\text{R} + 0.1\text{V}$, 3-sentence blind pitch, and reveal toggle. |
| **Dashboard Page** | `app/page.jsx`, `components/Dashboard.jsx` | Talent directory, high-level metrics, and quick entry points to all 3 pillars. |
| **Profile & Feed Page** | `app/employee/[id]/page.jsx` | Deep telemetry explorer with mounted `LiveExtractionFeed`. |
| **SkillTree Graph Page** | `app/roadmap/[employeeId]/[roleId]/page.jsx` | Career GPS transition view between employee competencies and role. |
| **Blind Match Pool Page** | `app/match/[roleId]/page.jsx` | Ranked candidate pool with anonymized `PitchCard` items and formula explainers. |
| **Architecture Documentation** | `ARCHITECTURE.md` | Deep dive into Own AI vs Generative layer, scoring formula, and telemetry flow. |
| **Automated Verification Suite** | `tests/score-match.test.js`, `tests/embeddings.test.js` | Pure function mathematical accuracy and embedding vector unit tests. |

---

## 5. Quick Start Instructions

TalentLens is engineered to work out-of-the-box on a fresh clone with no external database requirements.

### Prerequisites
- Node.js 18.x, 20.x, or 24.x
- npm 9.x+

### 1. Clone & Install
```bash
git clone https://github.com/kit25csebbharathkumarak/buildathon.git
cd buildathon
npm install
```

### 2. Environment Configuration (Optional)
```bash
cp .env.example .env.local
```
*(Note: An Anthropic API key is entirely optional. When omitted, TalentLens automatically engages its autonomous local engine so all UI features, Socket.IO streams, and pure scoring algorithms remain 100% operational).*

### 3. Run Development Server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

### 4. Run Automated Tests
```bash
npm run test
```

---

## 6. Team & Standards

- **Team:** 4D Developers
- **Engineering Standards:**
  - Every exported function includes a one-line JSDoc comment.
  - Zero dead code, zero commented-out blocks, zero placeholder "lorem ipsum".
  - Clean modular separation of pure mathematical logic and generative layers.
