export interface RoadmapTask {
  priority: number;
  task: string;
}

export class AnalysisReportResponseDto {
  projectHealthScore!: number;
  securityScore!: number;
  codeQualityScore!: number;
  technicalDebtScore!: number;
  executiveSummary!: string;
  topIssues!: string[];
  recommendedActions!: string[];
  roadmap!: RoadmapTask[];
}
