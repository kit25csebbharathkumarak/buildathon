import { NextResponse } from 'next/server';
import { addInferredSkill, removeSkillFromEmployee, updateInferredSkill } from '@/lib/db/queries';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const body = await request.json();
    const { action, employeeId, skill, oldSkillName, newSkill } = body;

    if (!employeeId) {
      return NextResponse.json({ error: 'employeeId is required.' }, { status: 400 });
    }

    if (action === 'confirm') {
      const added = addInferredSkill(employeeId, skill);
      return NextResponse.json({ success: true, action: 'confirmed', skill: added });
    }

    if (action === 'reject') {
      const skillName = typeof skill === 'string' ? skill : skill?.name;
      removeSkillFromEmployee(employeeId, skillName);
      return NextResponse.json({ success: true, action: 'rejected', skillName });
    }

    if (action === 'edit') {
      updateInferredSkill(employeeId, oldSkillName, newSkill);
      return NextResponse.json({ success: true, action: 'edited', newSkill });
    }

    return NextResponse.json({ error: 'Invalid triage action.' }, { status: 400 });
  } catch (error) {
    console.error('Skill triage API error:', error);
    return NextResponse.json({ error: error.message || 'Failed to update skill triage.' }, { status: 500 });
  }
}
