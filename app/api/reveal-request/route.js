import { NextResponse } from 'next/server';
import {
  getRevealRequests,
  getManagerRevealRequests,
  createRevealRequest,
  updateRevealRequestStatus,
} from '@/lib/db/queries';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const candidateId = searchParams.get('candidateId');
    const managerId = searchParams.get('managerId');

    if (candidateId) {
      const requests = getRevealRequests(candidateId);
      return NextResponse.json(requests);
    }

    if (managerId) {
      const requests = getManagerRevealRequests(managerId);
      return NextResponse.json(requests);
    }

    // Default to candidate emp-101
    const requests = getRevealRequests('emp-101');
    return NextResponse.json(requests);
  } catch (error) {
    console.error('Error fetching reveal requests:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      candidateId,
      managerId = 'usr-demo-002',
      managerName = 'Marcus Chen (Hiring Lead)',
      roleId,
      roleTitle,
      note,
    } = body;

    if (!candidateId || !roleId) {
      return NextResponse.json({ error: 'candidateId and roleId are required.' }, { status: 400 });
    }

    const created = createRevealRequest({
      candidateId,
      managerId,
      managerName,
      roleId,
      roleTitle,
      note,
    });

    return NextResponse.json({ success: true, request: created });
  } catch (error) {
    console.error('Error creating reveal request:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const body = await request.json();
    const { id, status } = body;

    if (!id || !['ACCEPTED', 'DECLINED'].includes(status)) {
      return NextResponse.json({ error: 'Valid id and status (ACCEPTED|DECLINED) required.' }, { status: 400 });
    }

    const updated = updateRevealRequestStatus(id, status);
    return NextResponse.json({ success: true, updated, status });
  } catch (error) {
    console.error('Error updating reveal request status:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
