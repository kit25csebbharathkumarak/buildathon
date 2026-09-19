/**
 * TalentLens Career GPS — Progression Roadmap Generator
 * Builds directed skill trees connecting current competencies to target role requirements.
 */

/**
 * Generates an intuitive branching roadmap graph locally based on skill overlap and prerequisites.
 * @param {string[]} currentSkills - Array of acquired skill strings.
 * @param {string} targetRole - Title of the target role.
 * @param {string[]} roleRequirements - Required skill strings for the target role.
 * @returns {{nodes: Array<{id: string, label: string, status: 'acquired'|'in_progress'|'recommended'|'target'}>, edges: Array<{from: string, to: string}>}}
 */
function localRoadmapGenerator(currentSkills, targetRole, roleRequirements) {
  const currentSet = new Set((currentSkills || []).map((s) => s.toLowerCase()));
  const nodes = [];
  const edges = [];

  // Add root / current foundation nodes (up to 3 most relevant)
  const baseSkills = (currentSkills || []).slice(0, 3);
  baseSkills.forEach((skill, idx) => {
    const id = `curr-${idx}`;
    nodes.push({
      id,
      label: skill,
      status: 'acquired',
    });
  });

  // Add bridge / in-progress nodes
  const reqs = roleRequirements || ['Distributed Systems', 'Cloud Architecture', 'System Design'];
  const bridgeCount = Math.min(2, reqs.length);

  for (let i = 0; i < bridgeCount; i++) {
    const req = reqs[i];
    const isAcquired = currentSet.has(req.toLowerCase());
    const id = `bridge-${i}`;
    nodes.push({
      id,
      label: req,
      status: isAcquired ? 'acquired' : 'in_progress',
    });

    // Connect from base skills
    if (baseSkills.length > 0) {
      edges.push({
        from: `curr-${i % baseSkills.length}`,
        to: id,
      });
    }
  }

  // Add advanced recommended milestone nodes
  const advancedReqs = reqs.slice(bridgeCount);
  advancedReqs.forEach((req, idx) => {
    const id = `adv-${idx}`;
    const isAcquired = currentSet.has(req.toLowerCase());
    nodes.push({
      id,
      label: req,
      status: isAcquired ? 'acquired' : 'recommended',
    });

    // Connect from bridge nodes
    if (nodes.some((n) => n.id === 'bridge-0')) {
      edges.push({
        from: `bridge-${idx % bridgeCount}`,
        to: id,
      });
    }
  });

  // Final Target Role Node
  const targetId = 'target-role-node';
  nodes.push({
    id: targetId,
    label: targetRole || 'Target Role',
    status: 'recommended',
  });

  // Connect advanced or bridge nodes to target
  if (advancedReqs.length > 0) {
    advancedReqs.forEach((_, idx) => {
      edges.push({
        from: `adv-${idx}`,
        to: targetId,
      });
    });
  } else {
    for (let i = 0; i < bridgeCount; i++) {
      edges.push({
        from: `bridge-${i}`,
        to: targetId,
      });
    }
  }

  return { nodes, edges };
}

/**
 * Generates a career progression roadmap skill graph connecting current skills to role requirements.
 * @param {Object} params - Input parameters.
 * @param {string[]} params.current_skills - Current skills already acquired by employee.
 * @param {string} params.target_role - Title or designation of the desired position.
 * @param {string[]} params.role_requirements - Skills required by the target role.
 * @returns {Promise<{nodes: Array<{id: string, label: string, status: string}>, edges: Array<{from: string, to: string}>}>} Structured skill roadmap graph.
 */
export async function generateRoadmap({
  current_skills = [],
  target_role = 'Target Role',
  role_requirements = [],
}) {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (apiKey) {
    try {
      const { Anthropic } = await import('@anthropic-ai/sdk');
      const client = new Anthropic({ apiKey });

      const prompt = `You are an elite career development architect at a high-growth technology enterprise.
Given an employee's current skills and a target role with requirements, generate a directed career skill progression roadmap.
Current Skills: ${JSON.stringify(current_skills)}
Target Role: "${target_role}"
Role Requirements: ${JSON.stringify(role_requirements)}

Return ONLY a valid, raw JSON object (no markdown, no backticks, no explanatory prose) with this exact schema:
{
  "nodes": [
    {
      "id": "string (unique node id, e.g. 'node-1')",
      "label": "string (skill name or milestone title)",
      "status": "acquired" | "in_progress" | "recommended"
    }
  ],
  "edges": [
    {
      "from": "string (source node id)",
      "to": "string (destination node id)"
    }
  ]
}
Structure the graph with 5 to 7 nodes transitioning smoothly from acquired foundations to final role requirements.`;

      const response = await client.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 600,
        temperature: 0.2,
        messages: [{ role: 'user', content: prompt }],
      });

      const responseText = response.content[0]?.text?.trim() || '{}';
      const cleanJson = responseText.replace(/^```json\s*/, '').replace(/```$/, '').trim();
      const parsed = JSON.parse(cleanJson);

      if (Array.isArray(parsed.nodes) && Array.isArray(parsed.edges)) {
        return parsed;
      }
    } catch (err) {
      // Fallback to local roadmap generation on API failure
      return localRoadmapGenerator(current_skills, target_role, role_requirements);
    }
  }

  // Local roadmap generator (no API key required)
  return localRoadmapGenerator(current_skills, target_role, role_requirements);
}
