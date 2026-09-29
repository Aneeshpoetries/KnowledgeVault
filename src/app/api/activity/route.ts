import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const activities = await prisma.activity.findMany({
      include: {
        employee: true,
        project: true,
        user: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return NextResponse.json({ activities });
  } catch (error) {
    console.error('Failed to get activities:', error);
    return NextResponse.json({ error: 'Failed to retrieve activity feed' }, { status: 500 });
  }
}
