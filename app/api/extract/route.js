import { NextResponse } from 'next/server';
import { getEmployeeById, addInferredSkill, recordExtraction } from '../../../lib/db/queries';
import { extractSkills } from '../../../lib/ai/extract-skills';

// Dynamic ESM import of socket emitter matching lib/ai pattern
let emitExtractionProgress = () => false;
try {
  const socketModule = await import('../../../server/socket.js');
  if (socketModule && (socketModule.emitExtractionProgress || socketModule.default?.emitExtractionProgress)) {
    emitExtractionProgress = socketModule.emitExtractionProgress || socketModule.default.emitExtractionProgress;
  }
} catch (e) {
  // Socket fallback
}

/**
 * API route to trigger real-time AI skill extraction for an employee's work logs.
 * Emits Socket.IO extraction:progress events per log entry and permanently records
 * discoveries in the SQLite database.
 * @param {Request} request - Next.js HTTP request.
 * @returns {Promise<NextResponse>} JSON response with extracted competencies.
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { employeeId } = body;

    const employee = getEmployeeById(employeeId) || getEmployeeById('emp-001') || getEmployeeById('emp-101');
    if (!employee) {
      return NextResponse.json({ error: 'Employee not found in database' }, { status: 404 });
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

      // Persist newly discovered skill into SQLite database
      if (result.detected_skill) {
        addInferredSkill(employee.id, result.detected_skill);
        recordExtraction(extractionRecord);
      }

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
