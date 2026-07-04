export class BugIssue {
  severity!: 'Critical' | 'High' | 'Medium' | 'Low' | 'Info';
  file!: string;
  line!: string | number;
  description!: string;
  snippet!: string;
}

export class SuggestedFix {
  file!: string;
  originalSnippet!: string;
  suggestedSnippet!: string;
  explanation!: string;
}

export class BugAnalysisResponseDto {
  summary!: string;
  overallRiskScore!: 'Critical' | 'High' | 'Medium' | 'Low' | 'Info';
  estimatedFixEffort!: 'Low' | 'Medium' | 'High'; // e.g. Low, Medium, High
  criticalBugs!: BugIssue[];
  warnings!: BugIssue[];
  securityIssues!: BugIssue[];
  performanceIssues!: BugIssue[];
  dependencyIssues!: BugIssue[];
  codeSmells!: BugIssue[];
  suggestedFixes!: SuggestedFix[];
}
