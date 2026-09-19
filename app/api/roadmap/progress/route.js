import { NextResponse } from 'next/server';
import { getRoadmapProgress, toggleRoadmapNode } from '@/lib/db/queries';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const candidateId = searchParams.get('candidateId') || 'emp-101';
    const roleId = searchParams.get('roleId') || 'role_distributed_systems';

    const completed = getRoadmapProgress(candidateId, roleId);
    return NextResponse.json({ candidateId, roleId, completed_node_ids: completed });
  } catch (error) {
    console.error('Error fetching roadmap progress:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { candidateId = 'emp-101', roleId = 'role_distributed_systems', nodeId } = body;

    if (!nodeId) {
      return NextResponse.json({ error: 'nodeId is required.' }, { status: 400 });
    }

    const result = toggleRoadmapNode(candidateId, roleId, nodeId);
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error('Error toggling roadmap node:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
