export class ProjectAnalysisResponseDto {
  projectType!: string;
  languages!: string[];
  frameworks!: string[];
  packageManager!: string;
  dependencies!: Record<string, string>;
  
  // Core reports
  architectureSummary!: string;
  technologyStackSummary!: string;
  folderStructureOverview!: string;
  recommendations!: string[];

  // Extended future-ready fields
  complexity!: {
    score: 'Low' | 'Medium' | 'High';
    filesCount: number;
    linesEstimate: string;
    description: string;
  };
  risks!: Array<{
    severity: 'Low' | 'Medium' | 'High';
    category: string; // e.g. Security, Performance, Maintainability
    description: string;
  }>;
  patterns!: string[]; // e.g. MVC, Dependency Injection, Observer, SPA
  bestPractices!: {
    adherenceScore: number; // 0-100
    detectedStrengths: string[];
    improvementAreas: string[];
  };
}
