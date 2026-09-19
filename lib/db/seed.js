import fs from 'fs';
import path from 'path';

/**
 * Seeds the database with all candidate profiles, production telemetry logs, target roles, and seed users.
 * @param {import('better-sqlite3').Database} db
 */
export function seedDatabase(db) {
  const employeesPath = path.join(process.cwd(), 'data', 'employees.json');
  const rolesPath = path.join(process.cwd(), 'data', 'roles.json');

  let employees = [];
  let roles = [];

  if (fs.existsSync(employeesPath)) {
    employees = JSON.parse(fs.readFileSync(employeesPath, 'utf8'));
  }
  if (fs.existsSync(rolesPath)) {
    roles = JSON.parse(fs.readFileSync(rolesPath, 'utf8'));
  }

  const insertEmployee = db.prepare(`
    INSERT OR REPLACE INTO employees (
      id, name, title, age, learning_velocity, recency_score, explicit_skills, inferred_skills, created_at
    ) VALUES (
      @id, @name, @title, @age, @learning_velocity, @recency_score, @explicit_skills, @inferred_skills, @created_at
    )
  `);

  const insertWorkLog = db.prepare(`
    INSERT INTO work_logs (employee_id, type, text, created_at)
    VALUES (?, ?, ?, ?)
  `);

  const insertRole = db.prepare(`
    INSERT OR REPLACE INTO roles (
      id, title, department, description, required_skills, created_at
    ) VALUES (
      @id, @title, @department, @description, @required_skills, @created_at
    )
  `);

  const insertUser = db.prepare(`
    INSERT OR REPLACE INTO users (
      id, name, email, phone, role, department, password, avatar, email_verified, phone_verified, created_at
    ) VALUES (
      @id, @name, @email, @phone, @role, @department, @password, @avatar, @email_verified, @phone_verified, @created_at
    )
  `);

  // Execute all inserts inside a single atomic transaction
  const seedTx = db.transaction(() => {
    // 1. Seed Employees & Telemetry Work Logs
    for (const emp of employees) {
      insertEmployee.run({
        id: emp.id,
        name: emp.hidden?.name || 'Candidate ' + emp.id,
        title: emp.hidden?.title || 'Staff Engineer',
        age: emp.hidden?.age || 32,
        learning_velocity: emp.learning_velocity ?? 0.85,
        recency_score: emp.recency_score ?? 0.9,
        explicit_skills: JSON.stringify(emp.explicit_skills || []),
        inferred_skills: JSON.stringify(emp.inferred_skills || []),
        created_at: new Date().toISOString(),
      });

      if (Array.isArray(emp.raw_logs)) {
        for (const log of emp.raw_logs) {
          insertWorkLog.run(emp.id, log.type || 'LOG_ENTRY', log.text || '', new Date().toISOString());
        }
      }
    }

    // 2. Seed Engineering Target Roles
    for (const role of roles) {
      insertRole.run({
        id: role.id,
        title: role.title,
        department: role.department || 'Engineering',
        description: role.description || '',
        required_skills: JSON.stringify(role.required_skills || []),
        created_at: new Date().toISOString(),
      });
    }

    // 3. Seed Verified Demo Candidate Users (Employee, Manager, HR)
    insertUser.run({
      id: 'usr-demo-001',
      name: 'Elena Rostova',
      email: 'demo@talentlens.internal',
      phone: '+1 (555) 234-5678',
      role: 'employee',
      department: 'Quality & Platform Engineering',
      password: 'TalentLens2026!',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      email_verified: 1,
      phone_verified: 1,
      created_at: new Date('2026-01-15T10:00:00Z').toISOString(),
    });

    insertUser.run({
      id: 'usr-demo-002',
      name: 'Marcus Chen',
      email: 'marcus.chen@meridian.io',
      phone: '+1 (555) 876-5432',
      role: 'manager',
      department: 'Core Platform Infrastructure',
      password: 'TalentLens2026!',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      email_verified: 1,
      phone_verified: 1,
      created_at: new Date('2026-02-01T12:00:00Z').toISOString(),
    });

    insertUser.run({
      id: 'usr-demo-003',
      name: 'Sarah Jenkins',
      email: 'sarah.jenkins@meridian.io',
      phone: '+1 (555) 432-9876',
      role: 'hr',
      department: 'People Operations & Mobility',
      password: 'TalentLens2026!',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      email_verified: 1,
      phone_verified: 1,
      created_at: new Date('2026-02-10T09:00:00Z').toISOString(),
    });

    // 4. Seed Initial Manager Reveal Requests (Consent Workflow Demo)
    const insertReveal = db.prepare(`
      INSERT OR REPLACE INTO reveal_requests (id, candidate_id, manager_id, manager_name, role_id, role_title, status, note, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertReveal.run(
      'rev-init-001',
      'emp-101',
      'usr-demo-002',
      'Marcus Chen (Director of Platform)',
      'role_distributed_systems',
      'Staff Distributed Systems Architect',
      'PENDING',
      'Candidate demonstrated top 3% Raft lease consensus & Kafka zero-copy telemetry. We would love to discuss leading our storage engine team.',
      new Date(Date.now() - 3600000 * 4).toISOString()
    );

    insertReveal.run(
      'rev-init-002',
      'emp-101',
      'usr-demo-002',
      'Marcus Chen (Director of Platform)',
      'role_ml_platform',
      'Principal ML Platform Architect',
      'ACCEPTED',
      'Shortlisted for high transferable systems rating and GPU cluster orchestration.',
      new Date(Date.now() - 3600000 * 24).toISOString()
    );

    // 5. Seed Manager Shortlists
    const insertShortlist = db.prepare(`
      INSERT OR REPLACE INTO shortlists (id, manager_id, role_id, candidate_id, notes, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    insertShortlist.run('sh-001', 'usr-demo-002', 'role_distributed_systems', 'emp-101', 'Top candidate: 94% composite score', new Date().toISOString());
    insertShortlist.run('sh-002', 'usr-demo-002', 'role_distributed_systems', 'emp-104', 'Strong Go & Kubernetes background', new Date().toISOString());

    // 6. Seed Privacy Opt-Ins
    const insertPrivacy = db.prepare(`
      INSERT OR REPLACE INTO candidate_privacy (candidate_id, telemetry_opt_in, allow_matching, updated_at)
      VALUES (?, ?, ?, ?)
    `);
    insertPrivacy.run('emp-101', 1, 1, new Date().toISOString());
    insertPrivacy.run('emp-102', 1, 1, new Date().toISOString());

    // 7. Seed Roadmap Progress
    const insertRoadmapProgress = db.prepare(`
      INSERT OR REPLACE INTO roadmap_progress (candidate_id, role_id, completed_node_ids, updated_at)
      VALUES (?, ?, ?, ?)
    `);
    insertRoadmapProgress.run('emp-101', 'role_distributed_systems', JSON.stringify(['node_raft', 'node_kafka']), new Date().toISOString());
  });

  seedTx();
  console.log(`[TalentLens DB] Seeded ${employees.length} employees, their work logs, ${roles.length} roles, and 3 demo personas successfully.`);
}
