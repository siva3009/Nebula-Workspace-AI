-- AlterTable
ALTER TABLE "analysis_report_caches" ADD COLUMN     "lastAnalyzedAt" TIMESTAMP(3),
ADD COLUMN     "workspaceName" TEXT,
ADD COLUMN     "workspacePath" TEXT;
