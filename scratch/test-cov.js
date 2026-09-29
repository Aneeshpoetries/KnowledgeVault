const { calculateCoverageForEmployee } = require('./src/lib/coverage-engine');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const rahul = await prisma.employee.findFirst({ where: { name: 'Rahul Sharma' } });
  const rep = await calculateCoverageForEmployee(rahul.id);
  console.log('Rahul baseline coverage:', rep.overallCoverage + '%');
  console.log('Critical gaps count:', rep.criticalGapsCount);
  for (const c of rep.categories) {
    console.log(' - ' + c.category + ': ' + c.score + '% (' + c.status + ')');
  }
}

run().finally(() => prisma.$disconnect());
