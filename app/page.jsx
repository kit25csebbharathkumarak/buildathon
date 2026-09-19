import employees from '../data/employees.json';
import roles from '../data/roles.json';
import Dashboard from '../components/Dashboard';

/**
 * TalentLens Dashboard page rendering employee overview and entry points to all 3 core features.
 * @returns {JSX.Element}
 */
export default function Page() {
  return <Dashboard employees={employees} roles={roles} />;
}
