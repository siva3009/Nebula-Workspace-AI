import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppConfigModule } from '../../config/config.module';
import { AnalysisReportModule } from './analysis-report.module';
import { AnalysisReportService } from './analysis-report.service';
import { AnalysisContextService, ArchiveService, TraversalService, ProfilingService, SourceReaderService } from '../analysis-core';
import AdmZip from 'adm-zip';
import * as assert from 'assert';
import * as fs from 'fs';
import * as path from 'path';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
    }),
    AppConfigModule,
    AnalysisReportModule,
  ],
})
class TestModule {}

async function runVerification() {
  console.log('=== STARTING ANALYSIS REPORT AGGREGATOR VERIFICATION ===');

  // 1. Boot NestJS Context in Isolation
  const app = await NestFactory.createApplicationContext(TestModule);
  const aggregatorService = app.get(AnalysisReportService);
  const contextService = app.get(AnalysisContextService);

  // Grab individual core components for performance simulation
  const archiveService = app.get(ArchiveService);
  const traversalService = app.get(TraversalService);
  const profilingService = app.get(ProfilingService);
  const sourceReaderService = app.get(SourceReaderService);

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
    name: "aggregator-test-app",
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
    originalname: 'aggregator-vulnerable-project.zip',
    encoding: '7bit',
    mimetype: 'application/zip',
    buffer: zipBuffer,
    size: zipBuffer.length,
    stream: null as any,
    destination: '',
    filename: '',
    path: '',
  };

  // 3. Performance Profiling: Single-Pass vs. Multi-Pass Operations
  console.log('\n--- PERFORMANCE BENCHMARK: FILESYSTEM OPERATIONS ---');
  
  // Benchmark A: Single Pass Context Creation
  const startSingle = performance.now();
  const context = await contextService.createContext(mockFile);
  const endSingle = performance.now();
  const timeSingle = endSingle - startSingle;
  console.log(`[A] Single-Pass Context Extraction/Profiling: ${timeSingle.toFixed(2)} ms`);

  // Cleanup temp directory from single pass
  fs.rmSync(context.tempDir, { recursive: true, force: true });

  // Benchmark B: Repeated Filesystem Operations (4 cycles of extract + traverse + profile + read)
  const startRepeated = performance.now();
  for (let i = 0; i < 4; i++) {
    const tempDir = await archiveService.extract(mockFile);
    const paths = traversalService.traverse(tempDir);
    const profile = profilingService.profile(tempDir, paths);
    const source = sourceReaderService.readSourceFiles(tempDir, paths);
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
  const endRepeated = performance.now();
  const timeRepeated = endRepeated - startRepeated;
  console.log(`[B] Multi-Pass (4x Repeated) Extraction/Profiling: ${timeRepeated.toFixed(2)} ms`);

  const speedup = timeRepeated / timeSingle;
  console.log(`\n==> Filesystem optimization speedup factor: ${speedup.toFixed(2)}x faster overhead`);

  // 4. Execute Real Aggregated Report using Gemini API
  console.log('\nInvoking Master AnalysisReportService.aggregate()...');
  try {
    const result = await aggregatorService.aggregate(mockFile);
    console.log('\n=== MASTER REPORT RECEIVED ===');
    console.log(JSON.stringify(result, null, 2));

    // 5. Assert DTO schema structure
    console.log('\nValidating Master DTO Schema...');
    assert.ok(result.executiveSummary, 'DTO Validation Failed: executiveSummary is empty.');
    assert.ok(Array.isArray(result.topIssues), 'DTO Validation Failed: topIssues must be an array.');
    assert.ok(Array.isArray(result.recommendedActions), 'DTO Validation Failed: recommendedActions must be an array.');
    assert.ok(Array.isArray(result.roadmap), 'DTO Validation Failed: roadmap must be an array.');

    assert.ok(typeof result.securityScore === 'number', 'DTO Validation Failed: securityScore must be a number.');
    assert.ok(typeof result.codeQualityScore === 'number', 'DTO Validation Failed: codeQualityScore must be a number.');
    assert.ok(typeof result.technicalDebtScore === 'number', 'DTO Validation Failed: technicalDebtScore must be a number.');
    assert.ok(typeof result.projectHealthScore === 'number', 'DTO Validation Failed: projectHealthScore must be a number.');

    // 6. Assert Health Score Weight Math
    console.log('Validating Health Score Math weight factors...');
    const expectedHealthScore = Math.round(
      result.securityScore * 0.40 +
      result.codeQualityScore * 0.35 +
      (100 - result.technicalDebtScore) * 0.25
    );
    assert.strictEqual(
      result.projectHealthScore,
      expectedHealthScore,
      `Health Score Math Mismatch: Got ${result.projectHealthScore}, expected ${expectedHealthScore} based on weights.`
    );
    console.log(`Health Score Math verified: ${result.projectHealthScore} === ${expectedHealthScore} ✅`);

    // 7. Check roadmap tasks structure
    assert.ok(result.roadmap.length > 0, 'Roadmap tasks array should not be empty');
    assert.ok(result.roadmap.every(task => typeof task.priority === 'number' && typeof task.task === 'string'), 'Roadmap task schema is invalid');
    console.log('Roadmap priorities and tasks structure verified ✅');

    console.log('\n=== ALL ANALYSIS REPORT AGGREGATOR TASKS PASSED SUCCESSFULLY ===');
  } catch (err: any) {
    console.error('\n❌ Aggregator Verification Failed:', err.message);
    process.exit(1);
  } finally {
    await app.close();
  }
}

runVerification().catch(err => {
  console.error('\n❌ Fatal error running aggregator verification:', err);
  process.exit(1);
});
