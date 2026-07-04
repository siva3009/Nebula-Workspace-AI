import { AnalysisReportResponseDto } from './analysis-report.dto';
import { ProjectAnalysisResponseDto } from '../../project-analyzer/dto/project-analysis-response.dto';
import { BugAnalysisResponseDto } from '../../bug-detector/dto/bug-analysis-response.dto';
import { CodeReviewResponseDto } from '../../code-review/dto/code-review-response.dto';
import { SecurityAuditResponseDto } from '../../security-audit/dto/security-audit-response.dto';
import { DocumentationResponseDto } from '../../documentation-generator/dto/documentation-response.dto';

export class UnifiedAnalysisResponseDto {
  id!: string;
  fileName!: string;
  fileSize!: number;
  projectName?: string;
  projectType!: string;
  languages!: string[];
  healthScore!: number;
  securityScore?: number;
  codeQualityScore?: number;
  technicalDebtScore?: number;
  analysisType!: string;
  summary?: string;
  workspacePath?: string;
  workspaceName?: string;
  lastAnalyzedAt?: string;
  createdAt!: string;

  // Nested full detailed results
  aggregator!: AnalysisReportResponseDto;
  project!: ProjectAnalysisResponseDto;
  bugs!: BugAnalysisResponseDto;
  review!: CodeReviewResponseDto;
  security!: SecurityAuditResponseDto;
  documentation!: DocumentationResponseDto;
}
