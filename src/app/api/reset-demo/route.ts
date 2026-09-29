import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

export async function POST() {
  try {
    await execPromise('node prisma/seed.js');
    return NextResponse.json({
      success: true,
      message: 'Demo workspace successfully re-seeded with realistic NovaTech dataset!',
    });
  } catch (error) {
    console.error('Failed to reset demo dataset:', error);
    return NextResponse.json({ error: 'Failed to reset demo data' }, { status: 500 });
  }
}
