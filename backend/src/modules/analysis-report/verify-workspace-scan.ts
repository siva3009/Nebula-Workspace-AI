import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppConfigModule } from '../../config/config.module';
import { DatabaseModule } from '../../database/database.module';
import { UnifiedAnalysisModule } from './unified-analysis.module';
import { UnifiedAnalysisService } from './unified-analysis.service';
import * as assert from 'assert';
import { Role } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

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

async function runWorkspaceVerification() {
  console.log('===========================================================');
  console.log('=== STARTING REAL LOCAL WORKSPACE SCAN VERIFICATION ===');
  console.log('===========================================================');

  const app = await NestFactory.createApplicationContext(TestModule);
  const unifiedService = app.get(UnifiedAnalysisService);

  // Define a temporary test workspace directory inside our project
  const testWorkspaceDir = path.resolve('temp-test-workspace');
  console.log(`Setting up local test workspace directory: ${testWorkspaceDir}`);

  if (fs.existsSync(testWorkspaceDir)) {
    fs.rmSync(testWorkspaceDir, { recursive: true, force: true });
  }
  fs.mkdirSync(testWorkspaceDir, { recursive: true });

  // Add sample project files
  fs.writeFileSync(
    path.join(testWorkspaceDir, 'package.json'),
    JSON.stringify({
      name: 'workspace-test-app',
      version: '1.0.0',
      dependencies: {
        'express': '^4.18.0',
        'pg': '^8.7.0'
      }
    }, null, 2)
  );

  const awsConfigPath = path.join(testWorkspaceDir, 'aws.ts');
  fs.writeFileSync(
    awsConfigPath,
    `export const AWS_CREDS = {
      accessKeyId: "AKIAIOSFODNN7EXAMPLE",
      secretAccessKey: "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
    };`
  );

  const dbPath = path.join(testWorkspaceDir, 'db.ts');
  fs.writeFileSync(
    dbPath,
    `import { Client } from 'pg';
    export async function findUser(id: string) {
      const client = new Client();
      const query = "SELECT * FROM users WHERE id = '" + id + "'";
      return client.query(query);
    }`
  );

  try {
    console.log(`\nTriggering local workspace scan on path: ${testWorkspaceDir}...`);
    const start = performance.now();
    const result = await unifiedService.runWorkspaceAnalysis('verify-user', testWorkspaceDir);
    const end = performance.now();
    console.log(`Workspace analysis completed in ${((end - start) / 1000).toFixed(2)} seconds.`);

    // 1. Verify schema elements
    console.log('\n=== CACHE METADATA VERIFICATION ===');
    console.log('- ID:', result.id);
    console.log('- File Name:', result.fileName);
    console.log('- Project Name:', result.projectName);
    console.log('- Health Score:', result.healthScore);
    console.log('- Security Score:', result.securityScore);
    console.log('- Workspace Path:', result.workspacePath);
    console.log('- Workspace Name:', result.workspaceName);
    console.log('- Last Analyzed At:', result.lastAnalyzedAt);

    assert.strictEqual(result.workspacePath, testWorkspaceDir, 'Workspace path does not match');
    assert.strictEqual(result.workspaceName, 'temp-test-workspace', 'Workspace name does not match');
    assert.ok(result.lastAnalyzedAt, 'lastAnalyzedAt metadata is missing');
    assert.strictEqual(result.analysisType, 'FULL_ANALYSIS');

    // 2. Verify no cleanup has occurred on the workspace directory!
    console.log('\n=== VERIFYING NO CLEANUP OF SOURCE FILES ===');
    assert.ok(fs.existsSync(testWorkspaceDir), 'Workspace directory was deleted!');
    assert.ok(fs.existsSync(awsConfigPath), 'Workspace source file (aws.ts) was deleted!');
    assert.ok(fs.existsSync(dbPath), 'Workspace source file (db.ts) was deleted!');
    console.log('✔ Workspace files are fully preserved on disk.');

    // 3. Verify history retrieve contains new fields
    console.log('\n=== VERIFYING HISTORY VIEW RETRIEVAL ===');
    const history = await unifiedService.getHistory('verify-user', Role.ADMIN);
    const target = history.find(h => h.id === result.id);
    assert.ok(target, 'Report not found in history');
    assert.strictEqual(target.workspacePath, testWorkspaceDir);
    assert.strictEqual(target.workspaceName, 'temp-test-workspace');
    assert.ok(target.lastAnalyzedAt);
    console.log('✔ History query returned workspace fields successfully.');

    // 4. Verify details returns fields
    console.log('\n=== VERIFYING DETAILS RETRIEVAL ===');
    const details = await unifiedService.getDetails(result.id, 'verify-user', Role.ADMIN);
    assert.strictEqual(details.workspacePath, testWorkspaceDir);
    assert.strictEqual(details.workspaceName, 'temp-test-workspace');
    assert.ok(details.lastAnalyzedAt);
    console.log('✔ Detailed cached report contains workspace fields.');

    // Cleanup DB entry
    await unifiedService.deleteRecord(result.id, 'verify-user', Role.ADMIN);
    console.log('\n✔ Verification record deleted from cache database.');

    console.log('\n===========================================================');
    console.log('✔ WORKSPACE SCAN VERIFICATION PASSED SUCCESSFULLY');
    console.log('===========================================================');

  } catch (err: any) {
    console.error('\n❌ Verification failed:', err.message);
    console.error(err);
    process.exit(1);
  } finally {
    // Clean up temporary workspace directory from disk
    if (fs.existsSync(testWorkspaceDir)) {
      fs.rmSync(testWorkspaceDir, { recursive: true, force: true });
    }
    await app.close();
  }
}

runWorkspaceVerification().catch(err => {
  console.error('\n❌ Fatal error running verification:', err);
  process.exit(1);
});
