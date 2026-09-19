/**
 * One-time seed script to precompute and cache 384-dimensional dense embeddings
 * for all employee and role competencies using TalentLens local AI engine (Transformers.js).
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { embed } from '../lib/ai/embeddings.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const employeesPath = path.resolve(__dirname, '../data/employees.json');
const rolesPath = path.resolve(__dirname, '../data/roles.json');

/**
 * Transforms a skill (string or object) into a cached object with precomputed embedding.
 * @param {string|{name: string, embedding?: number[]}} skill - Skill name or object.
 * @returns {Promise<{name: string, embedding: number[]}>}
 */
async function processSkill(skill) {
  const name = typeof skill === 'object' && skill !== null ? (skill.name || skill.skill || '') : String(skill || '');
  if (typeof skill === 'object' && Array.isArray(skill.embedding) && skill.embedding.length === 384) {
    return { name, embedding: skill.embedding };
  }
  const vector = await embed(name);
  return {
    name,
    embedding: vector.map((v) => Number(v.toFixed(6))),
  };
}

async function run() {
  console.log('⚡ [TalentLens] Precomputing skill embeddings via local AI engine...');

  // 1. Process Employees
  const employeesRaw = fs.readFileSync(employeesPath, 'utf8');
  const employees = JSON.parse(employeesRaw);

  for (const emp of employees) {
    console.log(`  -> Embedding competencies for ${emp.hidden?.name || emp.id}...`);
    emp.explicit_skills = await Promise.all((emp.explicit_skills || []).map(processSkill));
    emp.inferred_skills = await Promise.all((emp.inferred_skills || []).map(processSkill));
  }

  fs.writeFileSync(employeesPath, JSON.stringify(employees, null, 2), 'utf8');
  console.log(`✓ Cached embeddings written to ${employeesPath}`);

  // 2. Process Roles
  const rolesRaw = fs.readFileSync(rolesPath, 'utf8');
  const roles = JSON.parse(rolesRaw);

  for (const role of roles) {
    console.log(`  -> Embedding requirements for ${role.title}...`);
    role.required_skills = await Promise.all((role.required_skills || []).map(processSkill));
  }

  fs.writeFileSync(rolesPath, JSON.stringify(roles, null, 2), 'utf8');
  console.log(`✓ Cached embeddings written to ${rolesPath}`);

  console.log('✨ [TalentLens] Precomputation completed successfully.');
  process.exit(0);
}

run().catch((err) => {
  console.error('Fatal error during embedding precomputation:', err);
  process.exit(1);
});
