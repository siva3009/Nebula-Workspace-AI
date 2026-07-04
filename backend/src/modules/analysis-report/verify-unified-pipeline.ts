import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppConfigModule } from '../../config/config.module';
import { DatabaseModule } from '../../database/database.module';
import { UnifiedAnalysisModule } from './unified-analysis.module';
import { UnifiedAnalysisService } from './unified-analysis.service';
import { Role } from '@prisma/client';
import AdmZip from 'adm-zip';
import * as assert from 'assert';
import axios from 'axios';

// Intercept Axios requests to Google Gemini API and mock successful responses
axios.interceptors.request.use(async (config) => {
  if (config.url && config.url.includes('generativelanguage.googleapis.com')) {
    const promptText = (config.data?.contents?.[0]?.parts?.[0]?.text || '').toString();
    let textContent = '';

    if (promptText.includes('Project Analyzer') || promptText.includes('folder structure') || promptText.includes('ProjectAnalysisResponseDto')) {
      textContent = JSON.stringify({
        projectType: 'TypeScript/NodeJS',
        languages: ['TypeScript', 'JavaScript'],
        frameworks: ['Express', 'Prisma'],
        packageManager: 'npm',
        dependencies: { 'express': '^4.18.2', '@prisma/client': '^5.0.0' },
        architectureSummary: 'An Express REST API service structured with clean layered modules.',
        technologyStackSummary: 'TypeScript Node.js stack with Prisma ORM.',
        folderStructureOverview: 'src/ for routes, controllers, services, database/.',
        recommendations: ['Add unit testing', 'Implement winston logger'],
        complexity: { score: 'Medium', filesCount: 15, linesEstimate: '1,500', description: 'Small service backend codebase' },
        risks: [{ severity: 'Low', category: 'Security', description: 'Exposed port default config' }],
        patterns: ['Layered Architecture', 'Singleton'],
        bestPractices: { adherenceScore: 85, detectedStrengths: ['TypeScript types usage'], improvementAreas: ['Add error middlewares'] }
      });
    } else if (promptText.includes('Bug Detector') || promptText.includes('runtime bugs') || promptText.includes('BugAnalysisResponseDto')) {
      textContent = JSON.stringify({
        summary: 'Detected a SQL injection warning and an insecure password hashing smell.',
        overallRiskScore: 'High',
        estimatedFixEffort: 'Low',
        criticalBugs: [
          { severity: 'Critical', file: 'src/database/users.ts', line: 55, description: 'Direct string concatenation in pg client query leads to SQL injection vulnerability.', snippet: 'const query = "SELECT * FROM users WHERE id = \'" + clientId + "\'";' }
        ],
        warnings: [],
        securityIssues: [],
        performanceIssues: [],
        dependencyIssues: [],
        codeSmells: [
          { severity: 'Medium', file: 'src/auth/hash.ts', line: 63, description: 'MD5 is cryptographically broken and insecure for password hashing.', snippet: 'return crypto.createHash(\'md5\').update(password).digest(\'hex\');' }
        ],
        suggestedFixes: [
          { file: 'src/database/users.ts', originalSnippet: 'const query = "SELECT * FROM users WHERE id = \'" + clientId + "\'";\nconst res = await client.query(query);', suggestedSnippet: 'const query = "SELECT * FROM users WHERE id = $1";\nconst res = await client.query(query, [clientId]);', explanation: 'Use parameterized query values to securely sanitize user inputs.' }
        ]
      });
    } else if (promptText.includes('Code Review') || promptText.includes('readability') || promptText.includes('CodeReviewResponseDto')) {
      textContent = JSON.stringify({
        overallCodeQualityScore: 82,
        maintainabilityScore: 85,
        readabilityScore: 80,
        architectureScore: 85,
        scalabilityScore: 80,
        technicalDebtScore: 15,
        projectMaturity: 'Intermediate',
        estimatedRefactorEffort: 'Low',
        summary: 'The codebase is mostly structured cleanly, but can be improved with environment isolation and parameterization.',
        quickWins: ['Parametrize SQL query in database service'],
        highImpactImprovements: ['Migrate from MD5 to bcrypt hashing'],
        recommendedRefactorOrder: ['Secure SQL database queries', 'Upgrade authentication password hashing'],
        architectureIssues: [],
        maintainabilityIssues: [],
        readabilityIssues: [],
        scalabilityConcerns: [],
        bestPracticeViolations: [],
        refactoringSuggestions: [],
        folderStructureConcerns: []
      });
    } else if (promptText.includes('Security Audit') || promptText.includes('vulnerability') || promptText.includes('SecurityAuditResponseDto')) {
      textContent = JSON.stringify({
        summary: 'Exposed AWS secret credentials found in config files, along with vulnerable direct query patterns.',
        overallRiskLevel: 'Critical',
        securityScore: 45,
        criticalCount: 2,
        highCount: 1,
        mediumCount: 1,
        lowCount: 1,
        topRiskAreas: ['Credential Exposure', 'Injection Attacks'],
        immediateActions: [
          'Rotate AWS access keys immediately and move them to environment variables.',
          'Rewrite SQL queries using placeholders.'
        ],
        secretExposure: [
          { severity: 'Critical', file: 'src/config/aws.ts', line: 5, description: 'Hardcoded AWS config credentials leaked in source repository.', snippet: 'accessKeyId: "AKIAIOSFODNN7EXAMPLE"', remediation: 'Move secret access credentials to .env configuration.' }
        ],
        authenticationWeaknesses: [],
        authorizationWeaknesses: [],
        dependencyVulnerabilities: [],
        owaspTop10Risks: [],
        environmentConfigRisks: [],
        bestPracticeViolations: [],
        suggestedRemediations: [
          { file: 'src/config/aws.ts', originalSnippet: 'accessKeyId: "AKIAIOSFODNN7EXAMPLE"\nsecretAccessKey: "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"', remediedSnippet: 'accessKeyId: process.env.AWS_ACCESS_KEY_ID\nsecretAccessKey: process.env.AWS_SECRET_ACCESS_KEY', explanation: 'Use process.env variables to retrieve AWS config to avoid leakage.' }
        ]
      });
    } else {
      textContent = `## Mock Guide\nThis is a mock documentation guide generated for verification.`;
    }

    return Promise.reject({
      config,
      mockResponse: {
        status: 200,
        statusText: 'OK',
        headers: {},
        config,
        data: {
          candidates: [
            {
              content: {
                parts: [
                  {
                    text: textContent
                  }
                ]
              }
            }
          ],
          usageMetadata: {
            promptTokenCount: 100,
            candidatesTokenCount: 50,
            totalTokenCount: 150
          }
        }
      }
    });
  }
  return config;
});

axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error && error.mockResponse) {
      return error.mockResponse;
    }
    return Promise.reject(error);
  }
);

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
    }),
    AppConfigModule,
    DatabaseModule,
    UnifiedAnalysisModule,
  ],
})
class TestModule {}

async function runVerification() {
  console.log('=== STARTING UNIFIED ANALYSIS PIPELINE VERIFICATION ===');

  const app = await NestFactory.createApplicationContext(TestModule);
  const unifiedService = app.get(UnifiedAnalysisService);

  // Generate a mock project ZIP containing typical code files
  console.log('Generating dummy project ZIP archive...');
  const zip = new AdmZip();

  zip.addFile('src/config/aws.ts', Buffer.from(`
    export const AWS_CONFIG = {
      accessKeyId: "AKIAIOSFODNN7EXAMPLE",
      secretAccessKey: "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
    };
  `));

  zip.addFile('src/database/users.ts', Buffer.from(`
    import { Client } from 'pg';
    export async function getUser(clientId: string) {
      const client = new Client();
      await client.connect();
      const query = "SELECT * FROM users WHERE id = '" + clientId + "'";
      const res = await client.query(query);
      return res.rows[0];
    }
  `));

  zip.addFile('package.json', Buffer.from(JSON.stringify({
    name: "unified-test-app",
    version: "1.0.0",
    dependencies: {
      "lodash": "4.17.15",
      "express": "4.16.0"
    }
  }, null, 2)));

  const zipBuffer = zip.toBuffer();
  const mockFile: Express.Multer.File = {
    fieldname: 'file',
    originalname: 'unified-vulnerable-project.zip',
    encoding: '7bit',
    mimetype: 'application/zip',
    buffer: zipBuffer,
    size: zipBuffer.length,
    stream: null as any,
    destination: '',
    filename: '',
    path: '',
  };

  try {
    console.log('\nRunning runUnifiedAnalysis()... (This may take a few seconds due to mock AI calls)');
    const start = performance.now();
    const result = await unifiedService.runUnifiedAnalysis('verify-user', mockFile);
    const end = performance.now();
    console.log(`Unified single-pass analysis took ${(end - start).toFixed(2)} ms.`);

    console.log('\n=== UNIFIED ANALYSIS RESPONSE SCHEMA VERIFICATION ===');
    console.log('ID:', result.id);
    console.log('File Name:', result.fileName);
    console.log('File Size:', result.fileSize);
    console.log('Project Name:', result.projectName);
    console.log('Project Type:', result.projectType);
    console.log('Languages:', result.languages);
    console.log('Health Score:', result.healthScore);
    console.log('Security Score:', result.securityScore);
    console.log('Code Quality Score:', result.codeQualityScore);
    console.log('Technical Debt Score:', result.technicalDebtScore);
    console.log('Summary:', result.summary);

    // Schema assertions
    assert.ok(result.id, 'Record ID is missing');
    assert.strictEqual(result.fileName, 'unified-vulnerable-project.zip');
    assert.strictEqual(result.projectName, 'Unified Vulnerable Project');
    assert.ok(result.projectType, 'Project Type is missing');
    assert.ok(result.healthScore >= 0 && result.healthScore <= 100, 'Invalid healthScore');
    assert.ok(result.aggregator, 'Aggregator DTO is missing');
    assert.ok(result.project, 'Project DTO is missing');
    assert.ok(result.bugs, 'Bugs DTO is missing');
    assert.ok(result.review, 'Code Review DTO is missing');
    assert.ok(result.security, 'Security Audit DTO is missing');
    assert.ok(result.documentation, 'Documentation DTO is missing');
    assert.ok(result.documentation.readme, 'Readme is missing in documentation');
    assert.ok(result.documentation.architecture, 'Architecture is missing in documentation');

    console.log('\n=== TESTING LIGHTWEIGHT HISTORY RETRIEVAL ===');
    const history = await unifiedService.getHistory('verify-user', Role.ADMIN);
    console.log('History Count:', history.length);
    assert.ok(history.length > 0, 'History should contain at least 1 record');
    const matched = history.find(h => h.id === result.id);
    assert.ok(matched, 'Uploaded record should be in history');
    assert.strictEqual(matched.projectName, 'Unified Vulnerable Project');
    assert.strictEqual(matched.healthScore, result.healthScore);
    assert.strictEqual(matched.securityScore, result.securityScore);
    assert.strictEqual(matched.summary, result.summary);
    assert.ok(!('results' in matched), 'History items should not contain full results JSON');

    console.log('\n=== TESTING INSTANT DETAILS LOADING FROM CACHE ===');
    const detailsStart = performance.now();
    const details = await unifiedService.getDetails(result.id, 'verify-user', Role.ADMIN);
    const detailsEnd = performance.now();
    console.log(`Details retrieval took ${(detailsEnd - detailsStart).toFixed(2)} ms (Zero AI calls expected).`);
    assert.strictEqual(details.id, result.id);
    assert.ok(details.project, 'Details should contain full project analyzer results');
    assert.ok(details.documentation, 'Details should contain full generated documentation');

    console.log('\n=== TESTING CACHED RECORD DELETION ===');
    const deleteRes = await unifiedService.deleteRecord(result.id, 'verify-user', Role.ADMIN);
    assert.ok(deleteRes.success, 'Deletion failed');
    console.log('Deletion confirmed.');

    const historyAfter = await unifiedService.getHistory('verify-user', Role.ADMIN);
    const matchedAfter = historyAfter.find(h => h.id === result.id);
    assert.ok(!matchedAfter, 'Record should be removed from history after deletion');

    console.log('\n=== ALL UNIFIED ANALYSIS PIPELINE VERIFICATION PASSED SUCCESSFULLY ===');
  } catch (err: any) {
    console.error('\n❌ Verification failed:', err.message);
    console.error(err);
    process.exit(1);
  } finally {
    await app.close();
  }
}

runVerification().catch(err => {
  console.error('\n❌ Fatal error running verification script:', err);
  process.exit(1);
});
