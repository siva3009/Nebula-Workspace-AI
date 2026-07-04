import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Cleaning up non-system database records...');

  await prisma.activityLog.deleteMany({});
  await prisma.findingStatus.deleteMany({});
  await prisma.taskAssignment.deleteMany({});
  await prisma.comment.deleteMany({});
  
  await prisma.analysisReportCache.deleteMany({});
  
  await prisma.knowledgeChunk.deleteMany({});
  await prisma.knowledgeFile.deleteMany({});
  await prisma.knowledgeDocument.deleteMany({});
  await prisma.knowledgeBase.deleteMany({});
  
  await prisma.file.deleteMany({});
  
  await prisma.memory.deleteMany({});
  await prisma.message.deleteMany({});
  await prisma.conversation.deleteMany({});

  console.log('Cleanup complete. Preserved User, SystemConfig, and UserSetting records.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
