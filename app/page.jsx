import { getAllEmployees, getAllRoles } from '../lib/db/queries';
import Dashboard from '../components/Dashboard';

export const dynamic = 'force-dynamic';

/**
 * TalentLens Dashboard page querying candidate directory and roles directly from SQLite database.
 * @returns {JSX.Element}
 */
export default function Page() {
  const employees = getAllEmployees();
  const roles = getAllRoles();

  return <Dashboard employees={employees} roles={roles} />;
}
