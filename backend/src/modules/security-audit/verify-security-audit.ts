import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { SecurityAuditModule } from './security-audit.module';
import { SecurityAuditService } from './security-audit.service';
import AdmZip from 'adm-zip';
import * as assert from 'assert';

import { AppConfigModule } from '../../config/config.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
    }),
    AppConfigModule,
    SecurityAuditModule,
  ],
})
class TestModule {}

async function runVerification() {
  console.log('=== STARTING SECURITY AUDIT VERIFICATION ===');
  
  // 1. Initialize isolated NestJS application context
  const app = await NestFactory.createApplicationContext(TestModule);
  const service = app.get(SecurityAuditService);

  // 2. Generate a mock ZIP archive containing all 5 target security vulnerabilities
  console.log('Generating mock ZIP archive with vulnerabilities...');
  const zip = new AdmZip();

  // Vulnerability 1: Hardcoded secrets
  zip.addFile('src/config/aws.ts', Buffer.from(`
    export const AWS_CONFIG = {
      accessKeyId: "AKIAIOSFODNN7EXAMPLE",
      secretAccessKey: "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
    };
  `));

  // Vulnerability 2: SQL Injection
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

  // Vulnerability 3: Weak Authentication
  zip.addFile('src/auth/hash.ts', Buffer.from(`
    import * as crypto from 'crypto';
    export function hashPasswordInsecurely(password: string) {
      // Insecure MD5 hashing without salt for password management
      return crypto.createHash('md5').update(password).digest('hex');
    }
  `));

  // Vulnerability 4: Dependency Vulnerability
  zip.addFile('package.json', Buffer.from(JSON.stringify({
    name: "vulnerable-app",
    version: "1.0.0",
    dependencies: {
      "lodash": "4.17.15", // Known prototype pollution vulnerability
      "express": "4.16.0"   // Outdated version with vulnerabilities
    }
  }, null, 2)));

  // Vulnerability 5: Environment configuration risks
  zip.addFile('src/config/environment.ts', Buffer.from(`
    export const environment = {
      production: true,
      enableDebugMode: true, // Security risk: debug logs enabled in production environment
      allowedCorsOrigins: ["*"] // Security risk: wildcard CORS allowed in production
    };
  `));

  const zipBuffer = zip.toBuffer();

  const mockFile: Express.Multer.File = {
    fieldname: 'file',
    originalname: 'vulnerable-project.zip',
    encoding: '7bit',
    mimetype: 'application/zip',
    buffer: zipBuffer,
    size: zipBuffer.length,
    stream: null as any,
    destination: '',
    filename: '',
    path: '',
  };

  console.log('Invoking SecurityAuditService.audit(file) with mock zip...');
  try {
    const result = await service.audit(mockFile);
    console.log('\n=== SECURITY AUDIT RESULT RECEIVED ===');
    console.log(JSON.stringify(result, null, 2));

    // 3. Schema & Type Validations
    console.log('\nVerifying structured schema validation properties...');
    
    assert.ok(result.summary, 'Validation Error: summary must not be empty.');
    assert.ok(result.overallRiskLevel, 'Validation Error: overallRiskLevel must be defined.');
    assert.ok(
      ['Critical', 'High', 'Medium', 'Low', 'Info'].includes(result.overallRiskLevel),
      `Validation Error: overallRiskLevel is invalid: ${result.overallRiskLevel}`
    );
    assert.ok(typeof result.securityScore === 'number', 'Validation Error: securityScore must be a number.');
    assert.ok(result.securityScore >= 0 && result.securityScore <= 100, 'Validation Error: securityScore must be between 0 and 100.');
    
    assert.ok(typeof result.criticalCount === 'number', 'Validation Error: criticalCount must be a number.');
    assert.ok(typeof result.highCount === 'number', 'Validation Error: highCount must be a number.');
    assert.ok(typeof result.mediumCount === 'number', 'Validation Error: mediumCount must be a number.');
    assert.ok(typeof result.lowCount === 'number', 'Validation Error: lowCount must be a number.');
    
    assert.ok(Array.isArray(result.topRiskAreas), 'Validation Error: topRiskAreas must be an array.');
    assert.ok(Array.isArray(result.immediateActions), 'Validation Error: immediateActions must be an array.');

    assert.ok(Array.isArray(result.secretExposure), 'Validation Error: secretExposure must be an array.');
    assert.ok(Array.isArray(result.authenticationWeaknesses), 'Validation Error: authenticationWeaknesses must be an array.');
    assert.ok(Array.isArray(result.authorizationWeaknesses), 'Validation Error: authorizationWeaknesses must be an array.');
    assert.ok(Array.isArray(result.dependencyVulnerabilities), 'Validation Error: dependencyVulnerabilities must be an array.');
    assert.ok(Array.isArray(result.owaspTop10Risks), 'Validation Error: owaspTop10Risks must be an array.');
    assert.ok(Array.isArray(result.environmentConfigRisks), 'Validation Error: environmentConfigRisks must be an array.');
    assert.ok(Array.isArray(result.bestPracticeViolations), 'Validation Error: bestPracticeViolations must be an array.');
    assert.ok(Array.isArray(result.suggestedRemediations), 'Validation Error: suggestedRemediations must be an array.');

    // 4. Vulnerability Detection Validations
    console.log('\nVerifying specific vulnerability detections...');
    
    const hasSecretExposure = result.secretExposure.length > 0 || 
      result.topRiskAreas.some(a => /secret|key|aws/i.test(a)) ||
      result.suggestedRemediations.some(r => /aws|key/i.test(r.explanation + r.originalSnippet));
      
    const hasSqlInjection = result.owaspTop10Risks.some(r => /sql|injection/i.test(r.description + r.owaspCategory)) || 
      result.topRiskAreas.some(a => /sql|injection/i.test(a)) ||
      result.suggestedRemediations.some(r => /sql|query/i.test(r.explanation + r.originalSnippet));
      
    const hasWeakAuth = result.authenticationWeaknesses.length > 0 || 
      result.topRiskAreas.some(a => /auth|hash|md5/i.test(a)) ||
      result.suggestedRemediations.some(r => /md5|hash|auth/i.test(r.explanation + r.originalSnippet));
      
    const hasDepVulnerabilities = result.dependencyVulnerabilities.length > 0 || 
      result.topRiskAreas.some(a => /depend|package|lodash/i.test(a)) ||
      result.suggestedRemediations.some(r => /lodash/i.test(r.explanation + r.originalSnippet));
      
    const hasEnvConfigRisks = result.environmentConfigRisks.length > 0 || 
      result.topRiskAreas.some(a => /env|debug|production/i.test(a)) ||
      result.suggestedRemediations.some(r => /debug|production/i.test(r.explanation + r.originalSnippet));

    console.log('--- DETECTION RESULTS ---');
    console.log(`- [1/5] Hardcoded Secrets Detected:            ${hasSecretExposure ? '✅ YES' : '❌ NO'}`);
    console.log(`- [2/5] SQL Injection Detected:                ${hasSqlInjection ? '✅ YES' : '❌ NO'}`);
    console.log(`- [3/5] Weak Authentication Detected:          ${hasWeakAuth ? '✅ YES' : '❌ NO'}`);
    console.log(`- [4/5] Dependency Vulnerabilities Detected:   ${hasDepVulnerabilities ? '✅ YES' : '❌ NO'}`);
    console.log(`- [5/5] Environment Config Risks Detected:      ${hasEnvConfigRisks ? '✅ YES' : '❌ NO'}`);

    assert.ok(hasSecretExposure, 'Vulnerability Detection Failed: Hardcoded secrets were not detected.');
    assert.ok(hasSqlInjection, 'Vulnerability Detection Failed: SQL injection was not detected.');
    assert.ok(hasWeakAuth, 'Vulnerability Detection Failed: Weak authentication was not detected.');
    assert.ok(hasDepVulnerabilities, 'Vulnerability Detection Failed: Dependency vulnerabilities were not detected.');
    assert.ok(hasEnvConfigRisks, 'Vulnerability Detection Failed: Environment configuration risks were not detected.');

    console.log('\n=== ALL SECURITY ENGINE VERIFICATION TASKS PASSED SUCCESSFULLY ===');
  } catch (err: any) {
    console.error('\n❌ Verification Failed:', err.message);
    process.exit(1);
  } finally {
    await app.close();
  }
}

runVerification().catch(err => {
  console.error('\n❌ Fatal error running verification:', err);
  process.exit(1);
});
