import { NextResponse } from 'next/server';
import { getEmployeeHidden } from '../../../../lib/db/queries';

/**
 * Secure on-demand identity reveal endpoint for Blind Matching.
 * Returns candidate identity metadata queried directly from SQLite database only when explicitly requested.
 * @param {Request} request - Next.js HTTP request.
 * @param {{params: {id: string}}} context - Dynamic route parameters.
 * @returns {Promise<NextResponse>} JSON response containing { id, name, title, age }.
 */
export async function GET(request, { params }) {
  try {
    const { id } = params;
    const employee = getEmployeeHidden(id);

    if (!employee || !employee.name) {
      return NextResponse.json({ error: 'Candidate profile not found in database' }, { status: 404 });
    }

    return NextResponse.json({
      id: employee.id,
      name: employee.name,
      title: employee.title,
      age: employee.age,
    });
  } catch (error) {
    console.error('Identity reveal API error:', error);
    return NextResponse.json(
      { error: 'Failed to reveal candidate identity', details: error.message },
      { status: 500 }
    );
  }
}
