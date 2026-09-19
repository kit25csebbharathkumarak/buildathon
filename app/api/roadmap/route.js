import { NextResponse } from 'next/server';
import employees from '../../../data/employees.json';
import roles from '../../../data/roles.json';
import { generateRoadmap } from '../../../lib/ai/generate-roadmap';

/**
 * API route to generate a directed Career GPS skill roadmap between an employee and a target role.
 * @param {Request} request - Next.js HTTP request.
 * @returns {Promise<NextResponse>} JSON response with roadmap nodes and edges.
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { employeeId, roleId } = body;

    const employee = employees.find((e) => e.id === employeeId) || employees[0];
    const role = roles.find((r) => r.id === roleId) || roles[0];

    if (!employee || !role) {
      return NextResponse.json({ error: 'Employee or Role not found' }, { status: 404 });
    }

    const getSkillName = (s) => (typeof s === 'object' && s !== null ? (s.name || s.skill || '') : String(s || ''));

    const currentSkills = [
      ...(employee.explicit_skills || []),
      ...(employee.inferred_skills || []),
    ].map(getSkillName);

    const roadmap = await generateRoadmap({
      current_skills: currentSkills,
      target_role: role.title,
      role_requirements: (role.required_skills || []).map(getSkillName),
    });

    return NextResponse.json({
      success: true,
      employeeId: employee.id,
      employeeName: employee.hidden?.name,
      roleId: role.id,
      roleTitle: role.title,
      roadmap,
    });
  } catch (error) {
    console.error('Roadmap API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate career roadmap', details: error.message },
      { status: 500 }
    );
  }
}
