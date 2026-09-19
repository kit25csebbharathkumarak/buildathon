import { NextResponse } from 'next/server';
import {
  getPrivacyConsent,
  updatePrivacyConsent,
  deleteCandidateTelemetry,
  getEmployeeById,
} from '@/lib/db/queries';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const candidateId = searchParams.get('candidateId') || 'emp-101';

    const consent = getPrivacyConsent(candidateId);
    const employee = getEmployeeById(candidateId);

    return NextResponse.json({
      consent,
      telemetryLogs: employee?.work_logs || [],
      candidate: {
        id: employee?.id,
        name: employee?.hidden?.name,
        title: employee?.hidden?.title,
      },
    });
  } catch (error) {
    console.error('Error fetching privacy settings:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { candidateId = 'emp-101', telemetryOptIn = true, allowMatching = true } = body;

    const updated = updatePrivacyConsent(candidateId, telemetryOptIn, allowMatching);
    return NextResponse.json({ success: true, updated, telemetryOptIn, allowMatching });
  } catch (error) {
    console.error('Error updating privacy consent:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const candidateId = searchParams.get('candidateId') || 'emp-101';

    const deleted = deleteCandidateTelemetry(candidateId);
    return NextResponse.json({ success: true, deleted, message: 'All telemetry logs and inferred skills purged.' });
  } catch (error) {
    console.error('Error deleting telemetry:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
