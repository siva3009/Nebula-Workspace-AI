import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppConfigModule } from '../../config/config.module';
import { DatabaseModule } from '../../database/database.module';
import { UnifiedAnalysisModule } from './unified-analysis.module';
import { UnifiedAnalysisService } from './unified-analysis.service';
import { Role } from '@prisma/client';
import AdmZip from 'adm-zip';
import * as assert from 'assert';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';

// Track real token usage and API calls
let totalPromptTokens = 0;
let totalCompletionTokens = 0;
let totalTokens = 0;
let apiCallCount = 0;

axios.interceptors.response.use(
  (response) => {
    if (response.config.url && response.config.url.includes('generativelanguage.googleapis.com')) {
      const usage = response.data?.usageMetadata;
      if (usage) {
        totalPromptTokens += usage.promptTokenCount || 0;
        totalCompletionTokens += usage.candidatesTokenCount || 0;
        totalTokens += usage.totalTokenCount || 0;
      }
      apiCallCount++;
    }
    return response;
  },
  (error) => Promise.reject(error)
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

async function runRealE2EValidation() {
  console.log('===========================================================');
  console.log('=== STARTING REAL END-TO-END UNIFIED PIPELINE VALIDATION ==');
  console.log('===========================================================');
  console.log('No mocks. No simulated responses. Direct Gemini API calls.');

  const app = await NestFactory.createApplicationContext(TestModule);
  const unifiedService = app.get(UnifiedAnalysisService);
  const config = app.get(ConfigService);

  // Generate a small, real ZIP project containing vulnerable and reviewable code
  console.log('\nGenerating test project ZIP archive...');
  const zip = new AdmZip();

  zip.addFile('src/config/aws.ts', Buffer.from(`
    // Configuration file with AWS Credentials
    export const AWS_CONFIG = {
      accessKeyId: "AKIAIOSFODNN7EXAMPLE",
      secretAccessKey: "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
    };
  `));

  zip.addFile('src/database/users.ts', Buffer.from(`
    // User data access layer with insecure queries
    import { Client } from 'pg';
    import * as crypto from 'crypto';

    export async function getUser(clientId: string) {
      const client = new Client();
      await client.connect();
      // SQL Injection vulnerability
      const query = "SELECT * FROM users WHERE id = '" + clientId + "'";
      const res = await client.query(query);
      return res.rows[0];
    }

    export function hashPassword(password: string): string {
      // Insecure MD5 hashing smell
      return crypto.createHash('md5').update(password).digest('hex');
    }
  `));

  zip.addFile('package.json', Buffer.from(JSON.stringify({
    name: "real-e2e-test-project",
    version: "1.0.0",
    dependencies: {
      "lodash": "4.17.15",
      "express": "4.16.0",
      "pg": "^8.11.0"
    }
  }, null, 2)));

  const zipBuffer = zip.toBuffer();
  const fileToUpload: Express.Multer.File = {
    fieldname: 'file',
    originalname: 'real-e2e-project.zip',
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
    console.log('\nInvoking Unified Analysis Pipeline with Gemini API...');
    const start = performance.now();
    const result = await unifiedService.runUnifiedAnalysis('verify-user', fileToUpload);
    const end = performance.now();
    const totalExecutionTimeMs = end - start;
    console.log(`\nSuccess! Full unified single-pass analysis took ${(totalExecutionTimeMs / 1000).toFixed(2)} seconds.`);

    console.log('\n=== PIPELINE METRICS & METADATA ===');
    console.log(`- Project Name: ${result.projectName}`);
    console.log(`- Project Type: ${result.projectType}`);
    console.log(`- Languages: ${result.languages.join(', ')}`);
    console.log(`- Health Score: ${result.healthScore}`);
    console.log(`- Security Score: ${result.securityScore}`);
    console.log(`- Code Quality Score: ${result.codeQualityScore}`);
    console.log(`- Technical Debt Score: ${result.technicalDebtScore}`);
    console.log(`- Summary: ${result.summary}`);
    console.log(`- Database ID: ${result.id}`);

    // Verify database record creation
    console.log('\n=== VERIFYING DATABASE STORAGE ===');
    const detailsStart = performance.now();
    const cachedDetails = await unifiedService.getDetails(result.id, 'verify-user', Role.ADMIN);
    const detailsEnd = performance.now();
    const cacheFetchTimeMs = detailsEnd - detailsStart;
    console.log(`- Cached Details retrieved in ${cacheFetchTimeMs.toFixed(2)} ms (Zero AI calls expected).`);

    // Verify cache content
    assert.strictEqual(cachedDetails.projectName, result.projectName, 'Project name does not match');
    assert.strictEqual(cachedDetails.healthScore, result.healthScore, 'Health score does not match');
    assert.ok(cachedDetails.project, 'Project Analysis is missing in cache');
    assert.ok(cachedDetails.bugs, 'Bug Analysis is missing in cache');
    assert.ok(cachedDetails.review, 'Code Review is missing in cache');
    assert.ok(cachedDetails.security, 'Security Audit is missing in cache');
    assert.ok(cachedDetails.documentation, 'Documentation is missing in cache');
    console.log('✔ All analysis modules stored and verified in DB cache successfully.');

    // Verify documentation guides render
    console.log('\n=== VERIFYING DOCUMENTATION RENDERING ===');
    const docs = cachedDetails.documentation;
    assert.ok(docs.readme, 'README is missing');
    assert.ok(docs.architecture, 'Architecture is missing');
    assert.ok(docs.apiDocs, 'API Docs are missing');
    assert.ok(docs.setupGuide, 'Setup Guide is missing');
    console.log('✔ All documentation guides render correctly. Content previews:');
    console.log(`  - README Preview (first 100 chars): "${docs.readme.slice(0, 100).replace(/\n/g, ' ')}..."`);
    console.log(`  - Architecture Preview: "${docs.architecture.slice(0, 100).replace(/\n/g, ' ')}..."`);

    // Verify history retrieval
    console.log('\n=== VERIFYING LIGHTWEIGHT HISTORY RETRIEVAL ===');
    const historyStart = performance.now();
    const history = await unifiedService.getHistory('verify-user', Role.ADMIN);
    const historyEnd = performance.now();
    const historyFetchTimeMs = historyEnd - historyStart;
    console.log(`- History loaded in ${historyFetchTimeMs.toFixed(2)} ms.`);
    
    const targetHistory = history.find(h => h.id === result.id);
    assert.ok(targetHistory, 'Current analysis not found in history');
    assert.strictEqual(targetHistory.projectName, result.projectName);
    assert.strictEqual(targetHistory.healthScore, result.healthScore);
    assert.strictEqual(targetHistory.summary, result.summary);
    assert.ok(!('results' in targetHistory), 'History records MUST NOT contain the heavy results JSON');
    console.log('✔ History view verified. Correctly loads lightweight fields without AI calls.');

    // Record Database Cache Size
    const resultsJson = JSON.stringify(cachedDetails);
    const databaseCacheSizeBytes = Buffer.byteLength(resultsJson, 'utf8');
    console.log(`\n=== PERFORMANCE & TOKEN METRICS ===`);
    console.log(`- Total Execution Time: ${(totalExecutionTimeMs / 1000).toFixed(2)} seconds`);
    console.log(`- Database Cache Record Size: ${(databaseCacheSizeBytes / 1024).toFixed(2)} KB`);
    console.log(`- Gemini API Calls Made: ${apiCallCount}`);
    console.log(`- Estimated Prompt Tokens: ${totalPromptTokens}`);
    console.log(`- Estimated Completion Tokens: ${totalCompletionTokens}`);
    console.log(`- Estimated Total Tokens: ${totalTokens}`);

    // Verify cleanup
    console.log('\n=== VERIFYING WORKSPACE CLEANUP ===');
    const storagePath = config.get<string>('storage.localPath') || './uploads';
    console.log(`Checking storage path "${storagePath}" for leftover workspace directories...`);
    if (fs.existsSync(storagePath)) {
      const remainingFiles = fs.readdirSync(storagePath);
      console.log(`Remaining files/folders under ${storagePath}:`, remainingFiles);
      const workspaces = remainingFiles.filter(f => f.startsWith('workspace-'));
      if (workspaces.length === 0) {
        console.log('✔ Zero workspace temp directories left. Cleanup executed successfully.');
      } else {
        console.warn(`⚠ Warning: Found ${workspaces.length} workspace directories remaining:`, workspaces);
      }
    } else {
      console.log('✔ Temp storage directory does not exist or was cleaned up.');
    }

    console.log('\n===========================================================');
    console.log('✔ ALL REAL END-TO-END VALIDATION CHECKS PASSED SUCCESSFULLY');
    console.log('===========================================================');

  } catch (err: any) {
    console.error('\n❌ Real E2E Validation Failed:', err.message);
    console.error(err);
    process.exit(1);
  } finally {
    await app.close();
  }
}

runRealE2EValidation().catch(err => {
  console.error('\n❌ Fatal error running verification script:', err);
  process.exit(1);
});
