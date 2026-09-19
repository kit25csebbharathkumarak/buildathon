import { NextResponse } from 'next/server';
import employees from '../../../data/employees.json';
import { extractSkills } from '../../../lib/ai/extract-skills';

// Safe dynamic access to socket emitter
let emitExtractionProgress = () => false;
try {
  const socketModule = require('../../../server/socket');
  if (socketModule && socketModule.emitExtractionProgress) {
    emitExtractionProgress = socketModule.emitExtractionProgress;
  }
} catch (e) {
  // Socket fallback
}

/**
 * API route to trigger real-time AI skill extraction for an employee's work logs.
 * Emits Socket.IO extraction:progress events per log entry.
 * @param {Request} request - Next.js HTTP request.
 * @returns {Promise<NextResponse>} JSON response with extracted competencies.
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { employeeId } = body;

    const employee = employees.find((e) => e.id === employeeId) || employees[0];
    if (!employee) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }

    const extractions = [];
    const logs = employee.raw_logs || [];

    for (let i = 0; i < logs.length; i++) {
      const logEntry = logs[i];
      const result = await extractSkills(logEntry);

      const extractionRecord = {
        employeeId: employee.id,
        logIndex: i,
        totalLogs: logs.length,
        entryType: logEntry.type,
        detected_skill: result.detected_skill,
        confidence: result.confidence,
        evidence_quote: result.evidence_quote,
        category: result.category,
      };

      extractions.push(extractionRecord);

      // Emit realtime Socket.IO event
      emitExtractionProgress(extractionRecord);
    }

    return NextResponse.json({
      success: true,
      employeeId: employee.id,
      totalProcessed: logs.length,
      extractions,
    });
  } catch (error) {
    console.error('Extraction API error:', error);
    return NextResponse.json(
      { error: 'Internal server error during skill extraction', details: error.message },
      { status: 500 }
    );
  }
}
