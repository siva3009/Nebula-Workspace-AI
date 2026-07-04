export class CodeReviewIssue {
  severity!: 'Critical' | 'High' | 'Medium' | 'Low' | 'Info';
  file!: string;
  line!: string | number;
  description!: string;
  recommendation!: string;
}

export class CodeReviewResponseDto {
  overallCodeQualityScore!: number;
  maintainabilityScore!: number;
  architectureScore!: number;
  readabilityScore!: number;
  scalabilityScore!: number;
  technicalDebtScore!: number; // 0 to 100
  projectMaturity!: 'Early Stage' | 'Intermediate' | 'Advanced' | 'Production Ready';
  estimatedRefactorEffort!: 'Low' | 'Medium' | 'High';
  summary!: string;
  quickWins!: string[];
  highImpactImprovements!: string[];
  recommendedRefactorOrder!: string[];
  architectureIssues!: CodeReviewIssue[];
  maintainabilityIssues!: CodeReviewIssue[];
  readabilityIssues!: CodeReviewIssue[];
  scalabilityConcerns!: CodeReviewIssue[];
  bestPracticeViolations!: CodeReviewIssue[];
  refactoringSuggestions!: CodeReviewIssue[];
  folderStructureConcerns!: CodeReviewIssue[];
}
