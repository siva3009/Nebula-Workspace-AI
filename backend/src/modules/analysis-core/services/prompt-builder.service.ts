import { Injectable } from '@nestjs/common';

@Injectable()
export class PromptBuilderService {
  /**
   * Format configuration files content for prompt context
   */
  formatConfigFiles(configFiles: Record<string, string>): string {
    return Object.entries(configFiles)
      .map(([filepath, content]) => `File: ${filepath}\n\`\`\`\n${content}\n\`\`\``)
      .join('\n\n');
  }

  /**
   * Format source files content for prompt context
   */
  formatSourceFiles(sourceFiles: Record<string, string>): string {
    return Object.entries(sourceFiles)
      .map(([filepath, content]) => `File: ${filepath}\n\`\`\`\n${content}\n\`\`\``)
      .join('\n\n');
  }

  /**
   * Construct the prompt for Project Structure & Stack analysis
   */
  buildProjectAnalysisPrompt(params: {
    projectType: string;
    detectedLanguages: string[];
    detectedFrameworks: string[];
    detectedPackageManager: string;
    detectedDependencies: Record<string, string>;
    totalFiles: number;
    totalSize: number;
    directoryStructureStr: string;
    hasMoreFiles: boolean;
    configFilesContent: Record<string, string>;
  }): string {
    const configSummary = this.formatConfigFiles(params.configFilesContent);
    return `
You are an expert Software Architect and Project Analyzer. Your task is to perform an analysis of an uploaded codebase's metadata and structure, and return a comprehensive JSON report matching the specified schema.

Here is the extracted metadata and folder structure:
- Initial Detected Project Type: ${params.projectType}
- Total Files count (excluding node_modules/build folders): ${params.totalFiles}
- Total Project Size: ${params.totalSize} bytes
- Detected Languages: ${params.detectedLanguages.join(', ')}
- Detected Frameworks: ${params.detectedFrameworks.join(', ')}
- Detected Package Manager: ${params.detectedPackageManager}

Detected Configuration Files and their contents:
${configSummary}

Directory Structure Overview (subset of paths):
${params.directoryStructureStr}
${params.hasMoreFiles ? '... [truncated for brevity]' : ''}

You must return a single JSON object. The response MUST adhere strictly to the following structure:
{
  "projectType": "A descriptive name of the project type (e.g. Next.js App Router Project, Rust REST API, Python Flask Service, etc.)",
  "languages": ["List of languages present sorted by dominance"],
  "frameworks": ["List of frameworks identified"],
  "packageManager": "The active package manager (e.g., npm, yarn, pnpm, cargo, pip, go, gradle)",
  "dependencies": {
    "dep_name": "version_specifier"
  },
  "architectureSummary": "A detailed multi-paragraph overview of the project architecture, design patterns, entrypoints, and file flow.",
  "technologyStackSummary": "A structured description of the frontend/backend/database/tooling libraries found and how they integrate.",
  "folderStructureOverview": "A formatted text representation of the folder structure (e.g. using tree formatting or lists), explaining what each major folder is responsible for.",
  "recommendations": [
    "Specific actionable recommendation 1",
    "Specific actionable recommendation 2",
    "Specific actionable recommendation 3"
  ],
  "complexity": {
    "score": "Low" | "Medium" | "High",
    "filesCount": ${params.totalFiles},
    "linesEstimate": "Estimated lines of code range (e.g., 2,000 - 5,000 lines)",
    "description": "Justification of the complexity rating based on frameworks, depth, and dependencies."
  },
  "risks": [
    {
      "severity": "Low" | "Medium" | "High",
      "category": "Category of risk (e.g. Security, Performance, Maintainability, Dependencies)",
      "description": "Explanation of the risk and why it is a concern."
    }
  ],
  "patterns": ["Design and architectural patterns detected (e.g. MVC, Dependency Injection, Repository Pattern, SPA, Modular)"],
  "bestPractices": {
    "adherenceScore": 85, // Integer score between 0 and 100
    "detectedStrengths": [
      "Key strength 1 (e.g., modular service structure, strict TypeScript usage, clean config files)"
    ],
    "improvementAreas": [
      "Improvement area 1 (e.g., missing lockfile, outdated dependencies, lacking test directories)"
    ]
  }
}

Important Instructions:
- Only output the raw JSON object. Do NOT wrap it in markdown code blocks like \`\`\`json. Do not include introductory text.
- Be precise, detailed, and realistic in your architectural assessment.
- Analyze dependencies to map accurate versions in the "dependencies" JSON field.
- Analyze the directories to detect design pattern adherence (e.g., NestJS modules suggest Dependency Injection and MVC/Repository pattern).
- Return only valid, parseable JSON. Ensure keys are in double quotes.
`;
  }

  /**
   * Construct the prompt for static bug and code issues analysis
   */
  buildBugAnalysisPrompt(params: {
    sourceFiles: Record<string, string>;
    configFiles: Record<string, string>;
  }): string {
    const configSummary = this.formatConfigFiles(params.configFiles);
    const sourceSummary = this.formatSourceFiles(params.sourceFiles);

    return `
You are an expert static analysis tool and bug detection engine. Your task is to perform an analysis of an uploaded codebase's source code files and configurations, identify bugs, security vulnerabilities, type-safety issues, performance concerns, and code smells, and return a comprehensive JSON analysis report matching the specified schema.

Below are the configuration files:
${configSummary}

Below are the primary source files and their code contents:
${sourceSummary}

You must return a single JSON object. The response MUST adhere strictly to the following structure:
{
  "summary": "A high-level summary of the bug analysis findings (1-2 paragraphs), listing the main areas of concern and overall health.",
  "overallRiskScore": "Critical" | "High" | "Medium" | "Low" | "Info",
  "estimatedFixEffort": "Low" | "Medium" | "High", // Low is minor fixes, Medium is architectural adjustment or multiple bugs, High is deep overhaul
  "criticalBugs": [
    {
      "severity": "Critical" | "High" | "Medium" | "Low" | "Info",
      "file": "path/to/file.ts",
      "line": 12, // The line number where the issue starts or occurs (integer)
      "description": "Detailed explanation of the bug, why it occurs, and the impact.",
      "snippet": "The specific line or block of code containing the issue"
    }
  ],
  "warnings": [
    {
      "severity": "Critical" | "High" | "Medium" | "Low" | "Info",
      "file": "path/to/file.ts",
      "line": 45,
      "description": "Explanation of the runtime risk or type safety warning.",
      "snippet": "The warning code snippet"
    }
  ],
  "securityIssues": [
    {
      "severity": "Critical" | "High" | "Medium" | "Low" | "Info",
      "file": "path/to/file.ts",
      "line": 89,
      "description": "Explanation of the vulnerability (e.g. injection, weak crypt, hardcoded secrets).",
      "snippet": "The vulnerability code snippet"
    }
  ],
  "performanceIssues": [
    {
      "severity": "Critical" | "High" | "Medium" | "Low" | "Info",
      "file": "path/to/file.ts",
      "line": 120,
      "description": "Explanation of the performance bottleneck (e.g. unindexed query, memory leak, sync operations).",
      "snippet": "The bottleneck code snippet"
    }
  ],
  "dependencyIssues": [
    {
      "severity": "Critical" | "High" | "Medium" | "Low" | "Info",
      "file": "package.json",
      "line": 15,
      "description": "Explanation of the dependency risk (e.g. deprecated library, vulnerable package versions).",
      "snippet": "The dependency declaration snippet"
    }
  ],
  "codeSmells": [
    {
      "severity": "Critical" | "High" | "Medium" | "Low" | "Info",
      "file": "path/to/file.ts",
      "line": 204,
      "description": "Explanation of the code smell (e.g. duplicate code, magic numbers, too large class, useless imports).",
      "snippet": "The code smell snippet"
    }
  ],
  "suggestedFixes": [
    {
      "file": "path/to/file.ts",
      "originalSnippet": "The original code snippet",
      "suggestedSnippet": "The corrected drop-in code snippet to replace the original",
      "explanation": "Explanation of the fix and what is changed."
    }
  ]
}

Important Instructions:
- Only output the raw JSON object. Do NOT wrap it in markdown code blocks like \`\`\`json. Do not include introductory or conversational text.
- Be highly thorough and analyze the code logic, syntax, variables, imports, and security implications carefully.
- Each issue object MUST include all fields: severity, file, line, description, and snippet.
- Make sure "line" is a valid number if possible (1-indexed), or a string/null if not easily determined.
- Ensure that you map the severity value strictly to one of: Critical, High, Medium, Low, Info.
- Return only valid, parseable JSON. Ensure keys are in double quotes.
`;
  }

  /**
   * Construct the prompt for architectural and code quality review
   */
  buildCodeReviewPrompt(params: {
    sourceFiles: Record<string, string>;
    configFiles: Record<string, string>;
  }): string {
    const configSummary = this.formatConfigFiles(params.configFiles);
    const sourceSummary = this.formatSourceFiles(params.sourceFiles);

    return `
You are an expert Software Architect, Senior Technical Lead, and Code Review Engine. Your task is to perform an architectural and code-quality review of an uploaded codebase's source files and configurations, and return a comprehensive JSON report matching the specified schema.

Below are the configuration files:
${configSummary}

Below are the primary source files and their code contents:
${sourceSummary}

You must return a single JSON object. The response MUST adhere strictly to the following structure:
{
  "overallCodeQualityScore": 85, // Integer score between 0 and 100
  "maintainabilityScore": 80, // Integer score between 0 and 100
  "architectureScore": 90, // Integer score between 0 and 100
  "readabilityScore": 85, // Integer score between 0 and 100
  "scalabilityScore": 75, // Integer score between 0 and 100
  "technicalDebtScore": 25, // Integer score between 0 and 100. Higher value = more technical debt
  "projectMaturity": "Early Stage" | "Intermediate" | "Advanced" | "Production Ready",
  "estimatedRefactorEffort": "Low" | "Medium" | "High",
  "summary": "A detailed high-level summary (1-2 paragraphs) of the codebase quality, main architectural strengths, and key areas for improvement.",
  "quickWins": [
    "Small improvement with immediate value 1",
    "Small improvement with immediate value 2"
  ],
  "highImpactImprovements": [
    "Larger architectural improvement 1",
    "Larger architectural improvement 2"
  ],
  "recommendedRefactorOrder": [
    "Ordered list of modules/components/files that should be improved first (e.g., 'src/db.js', 'src/ReactComponent.tsx')"
  ],
  "architectureIssues": [
    {
      "severity": "Critical" | "High" | "Medium" | "Low" | "Info",
      "file": "path/to/file.ts",
      "line": 15,
      "description": "Detailed explanation of the architectural issue (e.g. violation of layering, tight coupling).",
      "recommendation": "Actionable recommendation to resolve the issue."
    }
  ],
  "maintainabilityIssues": [
    {
      "severity": "Critical" | "High" | "Medium" | "Low" | "Info",
      "file": "path/to/file.ts",
      "line": 34,
      "description": "Explanation of the maintainability issue (e.g. hardcoded configuration, high complexity, lack of modularity).",
      "recommendation": "Actionable steps to improve maintainability."
    }
  ],
  "readabilityIssues": [
    {
      "severity": "Critical" | "High" | "Medium" | "Low" | "Info",
      "file": "path/to/file.ts",
      "line": 56,
      "description": "Explanation of readability issue (e.g. magic numbers, poor naming, undocumented logic, over-nested code).",
      "recommendation": "Actionable recommendation for readability."
    }
  ],
  "scalabilityConcerns": [
    {
      "severity": "Critical" | "High" | "Medium" | "Low" | "Info",
      "file": "path/to/file.ts",
      "line": 102,
      "description": "Explanation of scalability concern (e.g. synchronous resource blocks, unindexed loop iteration, memory leakage).",
      "recommendation": "Actionable scalability advice."
    }
  ],
  "bestPracticeViolations": [
    {
      "severity": "Critical" | "High" | "Medium" | "Low" | "Info",
      "file": "path/to/file.ts",
      "line": 42,
      "description": "Explanation of best practice violation (e.g. not utilizing NestJS DI correctly, raw SQL query, bad variable scope).",
      "recommendation": "Recommendation for adherence."
    }
  ],
  "refactoringSuggestions": [
    {
      "severity": "Critical" | "High" | "Medium" | "Low" | "Info",
      "file": "path/to/file.ts",
      "line": 68,
      "description": "Identify code patterns that can be simplified, modularized, or extracted.",
      "recommendation": "Specific refactoring strategy."
    }
  ],
  "folderStructureConcerns": [
    {
      "severity": "Critical" | "High" | "Medium" | "Low" | "Info",
      "file": "src/folder",
      "line": 0,
      "description": "Identify inconsistencies in directory organization or circular modular references.",
      "recommendation": "Proposed restructurings."
    }
  ]
}

Important Instructions:
- Only output the raw JSON object. Do NOT wrap it in markdown code blocks like \`\`\`json. Do not include introductory or conversational text.
- Be highly thorough, detailed, and realistic in your architectural and code review.
- Each issue object MUST include all fields: severity, file, line, description, and recommendation.
- Make sure "line" is a valid number if possible (1-indexed), or a string/null if not easily determined.
- Ensure that you map the severity value strictly to one of: Critical, High, Medium, Low, Info.
- Return only valid, parseable JSON. Ensure keys are in double quotes.
`;
  }

  /**
   * Construct the prompt for security audit analysis
   */
  buildSecurityAuditPrompt(params: {
    sourceFiles: Record<string, string>;
    configFiles: Record<string, string>;
  }): string {
    const configSummary = this.formatConfigFiles(params.configFiles);
    const sourceSummary = this.formatSourceFiles(params.sourceFiles);

    return `
You are an expert Static Application Security Testing (SAST) and Security Audit Engine. Your task is to perform an analysis of an uploaded codebase's source files and configurations, identify security vulnerabilities, secrets exposure, authentication/authorization weaknesses, OWASP Top 10 risks, configuration risks, and security best-practice violations, and return a comprehensive JSON security report matching the specified schema.

Below are the configuration files:
${configSummary}

Below are the primary source files and their code contents:
${sourceSummary}

You must return a single JSON object. The response MUST adhere strictly to the following structure:
{
  "summary": "A high-level summary of the security audit findings (1-2 paragraphs), listing the main areas of concern and overall security posture.",
  "overallRiskLevel": "Critical" | "High" | "Medium" | "Low" | "Info",
  "securityScore": 85, // Integer score between 0 and 100 based on severity and count of vulnerabilities. 100 is no vulnerabilities.
  "criticalCount": 0, // Integer count of critical severity issues found
  "highCount": 0, // Integer count of high severity issues found
  "mediumCount": 0, // Integer count of medium severity issues found
  "lowCount": 0, // Integer count of low severity issues found
  "topRiskAreas": ["Area 1 (e.g. Hardcoded secrets in config)", "Area 2 (e.g. Unauthenticated access control)"],
  "immediateActions": ["Action 1 (e.g. Rotate the database credentials immediately)", "Action 2 (e.g. Implement middleware check on /admin route)"],
  "secretExposure": [
    {
      "severity": "Critical" | "High" | "Medium" | "Low" | "Info",
      "file": "path/to/file.ts",
      "line": 12, // The line number where the issue occurs (integer)
      "description": "Explanation of the exposed secret, API key, password or token, and its impact.",
      "snippet": "The line of code containing the secret",
      "remediation": "Instructions to rotate and move the secret to environment variables or vault."
    }
  ],
  "authenticationWeaknesses": [
    {
      "severity": "Critical" | "High" | "Medium" | "Low" | "Info",
      "file": "path/to/file.ts",
      "line": 45,
      "description": "Explanation of authentication weakness (e.g. weak hash, empty passwords, JWT secret shared, short tokens).",
      "snippet": "The weak authentication code snippet",
      "remediation": "How to strengthen the authentication code"
    }
  ],
  "authorizationWeaknesses": [
    {
      "severity": "Critical" | "High" | "Medium" | "Low" | "Info",
      "file": "path/to/file.ts",
      "line": 78,
      "description": "Explanation of authorization weakness (e.g. missing role check on admin APIs, insecure direct object reference IDOR).",
      "snippet": "The weak authorization code snippet",
      "remediation": "How to validate roles/permissions"
    }
  ],
  "dependencyVulnerabilities": [
    {
      "severity": "Critical" | "High" | "Medium" | "Low" | "Info",
      "file": "package.json",
      "line": 10,
      "description": "Explanation of dependency vulnerability (e.g. vulnerable library version with active CVEs).",
      "snippet": "The dependency declaration snippet",
      "remediation": "Upgrade package to version X or apply patch"
    }
  ],
  "owaspTop10Risks": [
    {
      "severity": "Critical" | "High" | "Medium" | "Low" | "Info",
      "file": "path/to/file.ts",
      "line": 112,
      "description": "Explanation of the OWASP risk (e.g. SQL Injection, XSS, CSRF, broken access control).",
      "snippet": "Vulnerable code snippet",
      "owaspCategory": "A03:2021-Injection", // Specify the category ID and name
      "remediation": "Use parametrized query, escape output, etc."
    }
  ],
  "environmentConfigRisks": [
    {
      "severity": "Critical" | "High" | "Medium" | "Low" | "Info",
      "file": "path/to/file.ts",
      "line": 8,
      "description": "Explanation of configuration risk (e.g. debug flags enabled in production config, insecure CORS, missing secure flags).",
      "snippet": "Configuration snippet",
      "remediation": "How to secure the configuration settings"
    }
  ],
  "bestPracticeViolations": [
    {
      "severity": "Critical" | "High" | "Medium" | "Low" | "Info",
      "file": "path/to/file.ts",
      "line": 56,
      "description": "Explanation of general security best practice violation.",
      "snippet": "Violation code snippet",
      "remediation": "Recommendation to align with best practices"
    }
  ],
  "suggestedRemediations": [
    {
      "file": "path/to/file.ts",
      "originalSnippet": "The original vulnerable code snippet",
      "remediedSnippet": "The secure, corrected drop-in code snippet to replace the original",
      "explanation": "Explanation of what security flaw is fixed and how."
    }
  ]
}

Important Instructions:
- Only output the raw JSON object. Do NOT wrap it in markdown code blocks like \`\`\`json. Do not include introductory or conversational text.
- Be highly thorough, detailed, and realistic in your security audit.
- Each vulnerability object MUST include all fields.
- Make sure "line" is a valid number if possible (1-indexed), or a string/null if not easily determined.
- Ensure that you map the severity value strictly to one of: Critical, High, Medium, Low, Info.
- Return only valid, parseable JSON. Ensure keys are in double quotes.
`;
  }

  /**
   * Helper to format shared context and report information for documentation prompts
   */
  formatDocContext(context: any, report: any): string {
    const fileTree = context.filePaths.slice(0, 100).join('\n');
    const dependencyList = Object.entries(context.dependencies || {})
      .map(([dep, ver]) => `- ${dep}: ${ver}`)
      .join('\n');

    return `
PROJECT METADATA:
- Project Type: ${context.projectType}
- Active Languages: ${context.languages?.join(', ')}
- Frameworks Detected: ${context.frameworks?.join(', ')}
- Package Manager: ${context.packageManager}
- Health Score: ${report.projectHealthScore}/100
- Core Dependencies:
${dependencyList}

FILE STRUCTURE (Subset of file paths):
${fileTree}

EXECUTIVE SUMMARY:
${report.executiveSummary}
`;
  }

  buildReadmePrompt(context: any, report: any): string {
    const contextStr = this.formatDocContext(context, report);
    return `
You are an expert Technical Writer. Your task is to write a professional, high-quality, comprehensive README.md file for this codebase.
Use standard GitHub-Flavored Markdown.

Codebase Context:
${contextStr}

Requirements for README.md:
- Include a descriptive project title, professional badges (e.g., build status, license), introduction/purpose, list of features, project prerequisites, quickstart usage commands, and contribution guidelines.
- Do NOT wrap your output in markdown code blocks like \`\`\`markdown or \`\`\`json. Output ONLY the raw Markdown text itself. Do not include introductory or conversational notes.
`;
  }

  buildArchitecturePrompt(context: any, report: any): string {
    const contextStr = this.formatDocContext(context, report);
    return `
You are an expert Software Architect. Your task is to write a professional, high-quality ARCHITECTURE.md file for this codebase.
Use standard GitHub-Flavored Markdown.

Codebase Context:
${contextStr}

Requirements for ARCHITECTURE.md:
- Provide a detailed explanation of the project's folder layout, design patterns used (e.g., MVC, Dependency Injection, Observer, SPA), entrypoints, data modeling flow, module coupling, and layering principles.
- Do NOT wrap your output in markdown code blocks like \`\`\`markdown. Output ONLY the raw Markdown text itself. Do not include introductory or conversational notes.
`;
  }

  buildApiDocsPrompt(context: any, report: any): string {
    const contextStr = this.formatDocContext(context, report);
    return `
You are an expert API Designer. Your task is to write a professional, high-quality API.md documentation file for this codebase.
Use standard GitHub-Flavored Markdown.

Codebase Context:
${contextStr}

Requirements for API.md:
- Detail the HTTP REST/GraphQL API endpoints or websocket gateways detected in the file list.
- For key routes, provide HTTP method, URL pattern, required headers, query params, request body parameters, response status codes, and mock JSON payloads for request/response bodies.
- Do NOT wrap your output in markdown code blocks like \`\`\`markdown. Output ONLY the raw Markdown text itself. Do not include introductory or conversational notes.
`;
  }

  buildSetupGuidePrompt(context: any, report: any): string {
    const contextStr = this.formatDocContext(context, report);
    return `
You are an expert Developer Advocate. Your task is to write a professional, high-quality SETUP.md guide for this codebase.
Use standard GitHub-Flavored Markdown.

Codebase Context:
${contextStr}

Requirements for SETUP.md:
- Detail all steps needed to run this application locally from scratch.
- Include dependencies installation command (yarn/npm/pip/cargo etc.), local config files configuration, database migration and seeding, and development startup execution commands.
- Do NOT wrap your output in markdown code blocks like \`\`\`markdown. Output ONLY the raw Markdown text itself. Do not include introductory or conversational notes.
`;
  }

  buildDeploymentGuidePrompt(context: any, report: any): string {
    const contextStr = this.formatDocContext(context, report);
    return `
You are an expert DevOps Engineer. Your task is to write a professional, high-quality DEPLOYMENT.md guide for this codebase.
Use standard GitHub-Flavored Markdown.

Codebase Context:
${contextStr}

Requirements for DEPLOYMENT.md:
- Provide comprehensive instructions on how to build and deploy the application in production.
- Include production build commands, docker-compose configuration script outlines, TLS/SSL configuration, host setup guidelines, and target hosting platforms (e.g. AWS, Vercel, Docker).
- Do NOT wrap your output in markdown code blocks like \`\`\`markdown. Output ONLY the raw Markdown text itself. Do not include introductory or conversational notes.
`;
  }

  buildEnvGuidePrompt(context: any, report: any): string {
    const contextStr = this.formatDocContext(context, report);
    return `
You are an expert Security Engineer. Your task is to write a professional, high-quality ENV.md guide for this codebase.
Use standard GitHub-Flavored Markdown.

Codebase Context:
${contextStr}

Requirements for ENV.md:
- List all required and optional environment variables for the application.
- Format this as a markdown table with columns: Variable Name, Required?, Default Value, Security Severity Level (e.g., Sensitive, Non-Sensitive), and Description.
- Include security considerations for sensitive variables (such as JWT secrets or AWS credentials).
- Do NOT wrap your output in markdown code blocks like \`\`\`markdown. Output ONLY the raw Markdown text itself. Do not include introductory or conversational notes.
`;
  }

  buildOnboardingGuidePrompt(context: any, report: any): string {
    const contextStr = this.formatDocContext(context, report);
    return `
You are an expert Engineering Manager. Your task is to write a professional, high-quality ONBOARDING.md guide for this codebase.
Use standard GitHub-Flavored Markdown.

Codebase Context:
${contextStr}

Requirements for ONBOARDING.md:
- Write a developer onboarding guide for new team members.
- Include developer environment setup, git workflow guidelines (e.g. branch naming, commits), pull request code review checklist, style/linting guidelines, testing guidelines, and architecture adherence checklist.
- Do NOT wrap your output in markdown code blocks like \`\`\`markdown. Output ONLY the raw Markdown text itself. Do not include introductory or conversational notes.
`;
  }
}
