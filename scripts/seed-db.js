import { getDb } from '../lib/db/index.js';
import { seedDatabase } from '../lib/db/seed.js';

console.log('======================================================');
console.log('  TALENTLENS DATABASE MIGRATION & SEEDER');
console.log('======================================================');

const db = getDb();

// Clear existing tables for a clean seed run
db.transaction(() => {
  db.exec(`
    DELETE FROM inferred_extractions;
    DELETE FROM sessions;
    DELETE FROM otps;
    DELETE FROM users;
    DELETE FROM work_logs;
    DELETE FROM employees;
    DELETE FROM roles;
  `);
})();

console.log('[1/2] Cleared existing tables.');
console.log('[2/2] Running seed transaction...');
seedDatabase(db);

const counts = {
  employees: db.prepare('SELECT COUNT(*) as c FROM employees').get().c,
  work_logs: db.prepare('SELECT COUNT(*) as c FROM work_logs').get().c,
  roles: db.prepare('SELECT COUNT(*) as c FROM roles').get().c,
  users: db.prepare('SELECT COUNT(*) as c FROM users').get().c,
};

console.log('------------------------------------------------------');
console.log('  Database Seeding Completed Successfully:');
console.log(`  > Employees:  ${counts.employees}`);
console.log(`  > Work Logs:  ${counts.work_logs}`);
console.log(`  > Roles:      ${counts.roles}`);
console.log(`  > Users:      ${counts.users}`);
console.log('======================================================');
