import { NextResponse } from 'next/server';
import employees from '../../../../data/employees.json';

/**
 * Secure on-demand identity reveal endpoint for Blind Matching.
 * Returns candidate identity metadata only when explicitly requested by an auditor.
 * @param {Request} request - Next.js HTTP request.
 * @param {{params: {id: string}}} context - Dynamic route parameters.
 * @returns {Promise<NextResponse>} JSON response containing { id, name, title, age }.
 */
export async function GET(request, { params }) {
  try {
    const { id } = params;
    const employee = employees.find((e) => e.id === id);

    if (!employee || !employee.hidden) {
      return NextResponse.json({ error: 'Candidate profile not found' }, { status: 404 });
    }

    return NextResponse.json({
      id: employee.id,
      name: employee.hidden.name,
      title: employee.hidden.title,
      age: employee.hidden.age,
    });
  } catch (error) {
    console.error('Identity reveal API error:', error);
    return NextResponse.json(
      { error: 'Failed to reveal candidate identity', details: error.message },
      { status: 500 }
    );
  }
}
