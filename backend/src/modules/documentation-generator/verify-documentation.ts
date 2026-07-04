import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppConfigModule } from '../../config/config.module';
import { DocumentationGeneratorModule } from './documentation-generator.module';
import { DocumentationGeneratorService } from './documentation-generator.service';
import AdmZip from 'adm-zip';
import axios from 'axios';
import * as assert from 'assert';
import * as fs from 'fs';
import * as path from 'path';

// Store original post function to allow fallback
const originalPost = axios.post;

// Mock Axios Post to intercept all Gemini API calls and prevent hitting rate limits
axios.post = async (url: string, data: any, config: any): Promise<any> => {
  const promptText = data?.contents?.[0]?.parts?.[0]?.text || '';

  // Intercept Project Analyzer Service query
  if (promptText.includes('Project Analyzer') || promptText.includes('descriptive name of the project type')) {
    return {
      data: {
        candidates: [{
          content: {
            parts: [{
              text: JSON.stringify({
                projectType: 'TypeScript NestJS',
                languages: ['TypeScript', 'JavaScript'],
                frameworks: ['NestJS'],
                packageManager: 'npm',
                dependencies: { "lodash": "4.17.15", "express": "4.16.0" },
                architectureSummary: 'Mock architecture summary',
                technologyStackSummary: 'Mock tech stack summary',
                folderStructureOverview: 'Mock folder structure',
                recommendations: ['Mock recommendation'],
                complexity: { score: 'Low', filesCount: 5, linesEstimate: '100-200 lines', description: 'Mock' },
                risks: [],
                patterns: [],
                bestPractices: { adherenceScore: 90, detectedStrengths: [], improvementAreas: [] }
              })
            }]
          }
        }]
      }
    };
  }

  // Intercept Bug Detector Service query
  if (promptText.includes('bug detection engine') || promptText.includes('static bug and code issues')) {
    return {
      data: {
        candidates: [{
          content: {
            parts: [{
              text: JSON.stringify({
                summary: 'Mock bug summary',
                overallRiskScore: 'Low',
                estimatedFixEffort: 'Low',
                criticalBugs: [],
                warnings: [],
                securityIssues: [],
                performanceIssues: [],
                dependencyIssues: [],
                codeSmells: [],
                suggestedFixes: []
              })
            }]
          }
        }]
      }
    };
  }

  // Intercept Code Review Service query
  if (promptText.includes('Code Review Engine') || promptText.includes('architectural and code-quality review')) {
    return {
      data: {
        candidates: [{
          content: {
            parts: [{
              text: JSON.stringify({
                overallCodeQualityScore: 90,
                maintainabilityScore: 90,
                architectureScore: 90,
                readabilityScore: 90,
                scalabilityScore: 90,
                technicalDebtScore: 10,
                projectMaturity: 'Advanced',
                estimatedRefactorEffort: 'Low',
                summary: 'Mock code quality summary',
                quickWins: [],
                highImpactImprovements: [],
                recommendedRefactorOrder: [],
                architectureIssues: [],
                maintainabilityIssues: [],
                readabilityIssues: [],
                scalabilityConcerns: [],
                bestPracticeViolations: [],
                refactoringSuggestions: [],
                folderStructureConcerns: []
              })
            }]
          }
        }]
      }
    };
  }

  // Intercept Security Audit Service query
  if (promptText.includes('Security Audit Engine') || promptText.includes('Static Application Security Testing')) {
    return {
      data: {
        candidates: [{
          content: {
            parts: [{
              text: JSON.stringify({
                summary: 'Mock security summary',
                overallRiskLevel: 'Low',
                securityScore: 95,
                criticalCount: 0,
                highCount: 0,
                mediumCount: 0,
                lowCount: 0,
                topRiskAreas: [],
                immediateActions: [],
                secretExposure: [],
                authenticationWeaknesses: [],
                authorizationWeaknesses: [],
                dependencyVulnerabilities: [],
                owaspTop10Risks: [],
                environmentConfigRisks: [],
                bestPracticeViolations: [],
                suggestedRemediations: []
              })
            }]
          }
        }]
      }
    };
  }

  // Intercept the 7 documentation prompt generations
  if (promptText.includes('README.md')) {
    return {
      data: {
        candidates: [{
          content: {
            parts: [{
              text: '# Mock Project README\n\nThis is a mock README file generated for verification.'
            }]
          }
        }]
      }
    };
  }
  if (promptText.includes('ARCHITECTURE.md')) {
    return {
      data: {
        candidates: [{
          content: {
            parts: [{
              text: '# Mock Project Architecture\n\nThis is a mock ARCHITECTURE file generated for verification.'
            }]
          }
        }]
      }
    };
  }
  if (promptText.includes('API.md')) {
    return {
      data: {
        candidates: [{
          content: {
            parts: [{
              text: '# Mock API Documentation\n\nThis is a mock API file generated for verification.'
            }]
          }
        }]
      }
    };
  }
  if (promptText.includes('SETUP.md')) {
    return {
      data: {
        candidates: [{
          content: {
            parts: [{
              text: '# Mock Setup Guide\n\nThis is a mock SETUP file generated for verification.'
            }]
          }
        }]
      }
    };
  }
  if (promptText.includes('DEPLOYMENT.md')) {
    return {
      data: {
        candidates: [{
          content: {
            parts: [{
              text: '# Mock Deployment Guide\n\nThis is a mock DEPLOYMENT file generated for verification.'
            }]
          }
        }]
      }
    };
  }
  if (promptText.includes('ENV.md')) {
    return {
      data: {
        candidates: [{
          content: {
            parts: [{
              text: '# Mock Environment Variables Guide\n\nThis is a mock ENV file generated for verification.'
            }]
          }
        }]
      }
    };
  }
  if (promptText.includes('ONBOARDING.md')) {
    return {
      data: {
        candidates: [{
          content: {
            parts: [{
              text: '# Mock Onboarding Guide\n\nThis is a mock ONBOARDING file generated for verification.'
            }]
          }
        }]
      }
    };
  }

  // Fallback to real HTTP requests if no mock rule matched
  return originalPost(url, data, config);
};

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
    }),
    AppConfigModule,
    DocumentationGeneratorModule,
  ],
})
class TestModule {}

function validateMarkdown(content: string, name: string): void {
  assert.ok(content, `${name} must not be empty.`);
  assert.ok(content.length > 20, `${name} is too short (length is ${content.length}).`);
  assert.ok(!content.includes('Failed to generate'), `${name} contains generation failure: "${content}"`);
  
  // Basic markdown structure check
  const lines = content.split('\n');
  const hasHeaders = lines.some(line => line.trim().startsWith('#'));
  assert.ok(hasHeaders, `${name} must contain at least one Markdown header (line starting with '#').`);
  console.log(`Markdown validation passed for ${name} ✅ (Length: ${content.length} chars)`);
}

async function runVerification() {
  console.log('=== STARTING DOCUMENTATION GENERATOR E2E VERIFICATION (WITH MOCKED GEMINI) ===');

  const startTime = performance.now();

  // 1. Boot NestJS Context in Isolation
  console.log('Booting NestJS Application Context...');
  const app = await NestFactory.createApplicationContext(TestModule);
  const docService = app.get(DocumentationGeneratorService);

  // 2. Generate a mock project ZIP containing typical code files
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

  zip.addFile('src/auth/hash.ts', Buffer.from(`
    import * as crypto from 'crypto';
    export function hashPasswordInsecurely(password: string) {
      return crypto.createHash('md5').update(password).digest('hex');
    }
  `));

  zip.addFile('package.json', Buffer.from(JSON.stringify({
    name: "documentation-test-app",
    version: "1.0.0",
    dependencies: {
      "lodash": "4.17.15",
      "express": "4.16.0"
    }
  }, null, 2)));

  zip.addFile('src/config/environment.ts', Buffer.from(`
    export const environment = {
      production: true,
      enableDebugMode: true,
      allowedCorsOrigins: ["*"]
    };
  `));

  const zipBuffer = zip.toBuffer();
  const mockFile: Express.Multer.File = {
    fieldname: 'file',
    originalname: 'doc-generator-test-project.zip',
    encoding: '7bit',
    mimetype: 'application/zip',
    buffer: zipBuffer,
    size: zipBuffer.length,
    stream: null as any,
    destination: '',
    filename: '',
    path: '',
  };

  console.log('\nGenerating All 7 Documents in Parallel...');
  const apiStart = performance.now();
  
  try {
    const result = await docService.generate(mockFile);
    const apiEnd = performance.now();
    const durationSec = (apiEnd - apiStart) / 1000;
    
    console.log(`\n=== ALL 7 DOCUMENTS GENERATED SUCCESSFULLY IN ${durationSec.toFixed(3)} SECONDS ===`);
    console.log(`generatedAt: ${result.generatedAt}`);
    console.log(`projectType: ${result.projectType}`);
    
    // 3. Assert DTO schema structure and extend fields
    assert.strictEqual(typeof result.generatedAt, 'string', 'DTO Validation Failed: generatedAt must be a string.');
    assert.ok(result.generatedAt.length > 0, 'DTO Validation Failed: generatedAt is empty.');
    assert.strictEqual(typeof result.projectType, 'string', 'DTO Validation Failed: projectType must be a string.');
    assert.ok(result.projectType.length > 0, 'DTO Validation Failed: projectType is empty.');

    // 4. Validate Markdown quality for each of the 7 documents
    console.log('\nValidating all 7 Markdown guides...');
    validateMarkdown(result.readme, 'readme (README.md)');
    validateMarkdown(result.architecture, 'architecture (ARCHITECTURE.md)');
    validateMarkdown(result.apiDocs, 'apiDocs (API.md)');
    validateMarkdown(result.setupGuide, 'setupGuide (SETUP.md)');
    validateMarkdown(result.deploymentGuide, 'deploymentGuide (DEPLOYMENT.md)');
    validateMarkdown(result.envVariablesGuide, 'envVariablesGuide (ENV.md)');
    validateMarkdown(result.developerOnboarding, 'developerOnboarding (ONBOARDING.md)');

    // 5. Cleanup Verification
    console.log('\nVerifying cleanup operations...');
    
    const tmpDirRoot = require('os').tmpdir();
    const activeNebulaDirs = fs.readdirSync(tmpDirRoot)
      .filter(name => name.startsWith('nebula-upload-'))
      .map(name => path.join(tmpDirRoot, name));
    
    console.log(`Active uploads under temp directory (${tmpDirRoot}):`, activeNebulaDirs);
    
    assert.ok(activeNebulaDirs.length === 0, 'Temporary directories were NOT cleaned up correctly! Remaining: ' + activeNebulaDirs.join(', '));
    console.log('Temporary upload directories completely cleaned up! Cleanup verified. ✅');

    const totalTime = (performance.now() - startTime) / 1000;
    console.log(`\n=== E2E VERIFICATION COMPLETED SUCCESSFULLY IN ${totalTime.toFixed(3)} SECONDS ===`);

  } catch (err: any) {
    console.error('\n❌ Verification Failed:', err.message);
    process.exit(1);
  } finally {
    await app.close();
  }
}

runVerification().catch(err => {
  console.error('\n❌ Fatal error running documentation verification:', err);
  process.exit(1);
});
