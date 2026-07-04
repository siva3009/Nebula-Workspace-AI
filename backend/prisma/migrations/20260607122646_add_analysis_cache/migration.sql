-- CreateTable
CREATE TABLE "analysis_report_caches" (
    "id" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "projectName" TEXT,
    "projectType" TEXT NOT NULL,
    "languages" TEXT[],
    "healthScore" INTEGER NOT NULL,
    "securityScore" INTEGER,
    "codeQualityScore" INTEGER,
    "technicalDebtScore" INTEGER,
    "analysisType" TEXT NOT NULL DEFAULT 'FULL_ANALYSIS',
    "summary" TEXT,
    "results" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "analysis_report_caches_pkey" PRIMARY KEY ("id")
);
