import { NextResponse } from 'next/server';
import { getShortlist, addToShortlist, removeFromShortlist } from '@/lib/db/queries';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const managerId = searchParams.get('managerId') || 'usr-demo-002';
    const roleId = searchParams.get('roleId');

    const shortlist = getShortlist(managerId, roleId);
    return NextResponse.json(shortlist);
  } catch (error) {
    console.error('Error fetching shortlist:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { action, managerId = 'usr-demo-002', roleId, candidateId, notes } = body;

    if (!roleId || !candidateId) {
      return NextResponse.json({ error: 'roleId and candidateId are required.' }, { status: 400 });
    }

    if (action === 'remove') {
      const removed = removeFromShortlist(managerId, roleId, candidateId);
      return NextResponse.json({ success: true, action: 'removed', removed });
    }

    const added = addToShortlist({ managerId, roleId, candidateId, notes });
    return NextResponse.json({ success: true, action: 'added', added });
  } catch (error) {
    console.error('Error modifying shortlist:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
