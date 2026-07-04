export type SeverityType = 'Critical' | 'High' | 'Medium' | 'Low' | 'Info';

export class SecurityIssue {
  severity!: SeverityType;
  file!: string;
  line!: string | number;
  description!: string;
  snippet!: string;
  owaspCategory?: string;
  remediation!: string;
}

export class SuggestedRemediation {
  file!: string;
  originalSnippet!: string;
  remediedSnippet!: string;
  explanation!: string;
}

export class SecurityAuditResponseDto {
  summary!: string;
  overallRiskLevel!: SeverityType;
  securityScore!: number;
  criticalCount!: number;
  highCount!: number;
  mediumCount!: number;
  lowCount!: number;
  topRiskAreas!: string[];
  immediateActions!: string[];
  secretExposure!: SecurityIssue[];
  authenticationWeaknesses!: SecurityIssue[];
  authorizationWeaknesses!: SecurityIssue[];
  dependencyVulnerabilities!: SecurityIssue[];
  owaspTop10Risks!: SecurityIssue[];
  environmentConfigRisks!: SecurityIssue[];
  bestPracticeViolations!: SecurityIssue[];
  suggestedRemediations!: SuggestedRemediation[];
}
