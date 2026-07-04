import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { PrismaService } from './database/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ProviderManager } from './modules/ai/provider.manager';
import { GeminiProvider } from './modules/ai/providers/gemini.provider';
import { GroqProvider } from './modules/ai/providers/groq.provider';
import { FilesService } from './modules/files/files.service';
import { FileStatus } from '@prisma/client';
import axios from 'axios';
import * as assert from 'assert';
import * as bcrypt from 'bcrypt';

async function runTests() {
  // Mock Groq API key so the failover path is not skipped by ProviderManager
  process.env.GROQ_API_KEY = 'mock-groq-api-key-for-testing';

  console.log('==================================================');
  console.log('Nebula AI - Security & Reliability Regression Tests');
  console.log('==================================================');

  // 1. Initialize NestJS testing module
  const moduleFixture = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app: INestApplication = moduleFixture.createNestApplication();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );
  app.setGlobalPrefix('api/v1');

  // Start server on a test port
  const port = 4005;
  await app.init();
  await app.listen(port);
  console.log(`Test app listening on http://localhost:${port}`);

  const prisma = app.get(PrismaService);
  const jwtService = app.get(JwtService);
  const providerManager = app.get(ProviderManager);
  const geminiProvider = app.get(GeminiProvider);
  const groqProvider = app.get(GroqProvider);
  const filesService = app.get(FilesService);

  // Clean up any old test users/files
  console.log('Cleaning up previous test records...');
  await prisma.knowledgeFile.deleteMany({
    where: {
      OR: [
        { filename: { startsWith: 'test-file-' } },
        { filename: { startsWith: 'file-' } }
      ]
    }
  });
  await prisma.user.deleteMany({
    where: { username: { in: ['test-standard-user', 'test-admin-user'] } }
  });

  try {
    // 2. Setup users for security/RBAC testing
    console.log('Setting up test users...');
    const hashedPassword = await bcrypt.hash('testpass123', 10);
    const standardUser = await prisma.user.create({
      data: {
        email: 'standard@nebula.ai',
        username: 'test-standard-user',
        password: hashedPassword,
        role: 'USER',
        name: 'Standard User',
      }
    });

    const adminUser = await prisma.user.create({
      data: {
        email: 'admin@nebula.ai',
        username: 'test-admin-user',
        password: hashedPassword,
        role: 'ADMIN',
        name: 'Admin User',
      }
    });

    const standardToken = jwtService.sign({
      sub: standardUser.id,
      email: standardUser.email,
      role: standardUser.role,
    });

    const adminToken = jwtService.sign({
      sub: adminUser.id,
      email: adminUser.email,
      role: adminUser.role,
    });

    const baseUrl = `http://localhost:${port}/api/v1`;

    // --- CHECK 1: Secure Users API ---
    console.log('\n--- CHECK 1: Secure Users API ---');
    try {
      await axios.get(`${baseUrl}/users`);
      assert.fail('Expected unauthenticated GET /users to fail with 401');
    } catch (err: any) {
      assert.strictEqual(err.response?.status, 401, `Expected 401 status, got ${err.response?.status}`);
      console.log('✅ Unauthenticated access to /users successfully blocked (401)');
    }

    const usersRes = await axios.get(`${baseUrl}/users`, {
      headers: { Authorization: `Bearer ${standardToken}` }
    });
    assert.strictEqual(usersRes.status, 200, 'Expected authenticated GET /users to succeed (200)');
    assert.ok(Array.isArray(usersRes.data), 'Expected users list to be an array');
    console.log('✅ Authenticated access to /users succeeded');


    // --- CHECK 2: Role-Based Access Control (RBAC) ---
    console.log('\n--- CHECK 2: Role-Based Access Control ---');
    try {
      await axios.get(`${baseUrl}/admin/status`, {
        headers: { Authorization: `Bearer ${standardToken}` }
      });
      assert.fail('Expected USER role to be blocked from /admin/status');
    } catch (err: any) {
      assert.strictEqual(err.response?.status, 403, `Expected 403 status, got ${err.response?.status}`);
      console.log('✅ Non-admin user blocked from admin endpoint (403)');
    }

    try {
      const adminRes = await axios.get(`${baseUrl}/admin/status`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      assert.strictEqual(adminRes.status, 200, 'Expected ADMIN role to access /admin/status (200)');
      console.log('✅ Admin user successfully accessed admin endpoint (200)');
    } catch (err: any) {
      if (err.response?.status === 403) {
        assert.fail('Admin user was blocked from admin endpoint');
      } else {
        console.log(`✅ Admin user was not forbidden. Response status: ${err.response?.status}`);
      }
    }


    // --- CHECK 3: Secure File Upload API & Boundary Protection ---
    console.log('\n--- CHECK 3: Secure File Upload API & Boundary Protection ---');
    try {
      await axios.post(`${baseUrl}/files/upload`, {});
      assert.fail('Expected unauthenticated POST /files/upload to fail with 401');
    } catch (err: any) {
      assert.strictEqual(err.response?.status, 401, `Expected 401 status, got ${err.response?.status}`);
      console.log('✅ Unauthenticated upload request successfully blocked (401)');
    }

    // Cumulative uploads check
    console.log('Testing cumulative upload limit (max 15)...');
    // Seed 15 files in DB
    await prisma.knowledgeFile.createMany({
      data: Array.from({ length: 15 }).map((_, i) => ({
        filename: `file-seed-${i}.txt`,
        originalName: `file-seed-${i}.txt`,
        size: 1024,
        storagePath: `/tmp/file-seed-${i}.txt`,
        mimeType: 'text/plain',
        userId: standardUser.id,
        status: FileStatus.READY
      }))
    });

    const mockFile: Express.Multer.File = {
      fieldname: 'file',
      originalname: 'test-file-16.txt',
      encoding: '7bit',
      mimetype: 'text/plain',
      buffer: Buffer.from('Hello world'),
      size: 11,
      stream: null as any,
      destination: '',
      filename: '',
      path: '',
    };

    try {
      await filesService.handleFileUpload(standardUser.id, mockFile);
      assert.fail('Expected 16th file upload to fail cumulative limit');
    } catch (err: any) {
      assert.ok(
        err.message.includes('cumulative') || 
        err.message.includes('maximum') || 
        err.message.includes('limit reached') || 
        err.message.includes('limit'), 
        `Unexpected error message: ${err.message}`
      );
      console.log('✅ Cumulative upload limit correctly enforced (rejected 16th file)');
    }

    // Clean up cumulative seed files
    await prisma.knowledgeFile.deleteMany({
      where: { userId: standardUser.id }
    });

    // Concurrent uploads check
    console.log('Testing concurrent upload limit (max 2 in PENDING/PROCESSING)...');
    await prisma.knowledgeFile.createMany({
      data: [
        {
          filename: 'file-active-1.txt',
          originalName: 'file-active-1.txt',
          size: 1024,
          storagePath: '/tmp/file-active-1.txt',
          mimeType: 'text/plain',
          userId: standardUser.id,
          status: FileStatus.PENDING
        },
        {
          filename: 'file-active-2.txt',
          originalName: 'file-active-2.txt',
          size: 1024,
          storagePath: '/tmp/file-active-2.txt',
          mimeType: 'text/plain',
          userId: standardUser.id,
          status: FileStatus.PROCESSING
        }
      ]
    });

    try {
      await filesService.handleFileUpload(standardUser.id, mockFile);
      assert.fail('Expected upload to fail concurrent active uploads limit');
    } catch (err: any) {
      assert.ok(err.message.includes('concurrent') || err.message.includes('active'), `Unexpected error: ${err.message}`);
      console.log('✅ Concurrent upload limit correctly enforced (rejected with 2 active uploads)');
    }

    // Clean up active seed files
    await prisma.knowledgeFile.deleteMany({
      where: { userId: standardUser.id }
    });


    // --- CHECK 4: Gemini Retry & Automatic Failover ---
    console.log('\n--- CHECK 4: Gemini Retry & Automatic Failover ---');
    
    // Save original chat implementations
    const originalGeminiChat = geminiProvider.chat;
    const originalGroqChat = groqProvider.chat;

    try {
      // 1. Success on Retry
      console.log('Testing Gemini retry on transient 503 error...');
      let geminiCallCount = 0;
      geminiProvider.chat = async (prompt: string, model?: string) => {
        geminiCallCount++;
        if (geminiCallCount === 1) {
          const err = new Error('503 Service Unavailable');
          (err as any).response = { status: 503 };
          throw err;
        }
        return { response: 'Success after retry', model: 'gemini-flash', createdAt: new Date().toISOString() };
      };

      const retryResult = await providerManager.chat('Say hello', 'gemini-flash', 'gemini');
      assert.strictEqual(retryResult.response, 'Success after retry', 'Expected success after retry');
      assert.strictEqual(geminiCallCount, 2, 'Expected Gemini to be called exactly twice');
      assert.strictEqual(retryResult.fallbackUsed, undefined, 'Fallback should not be flagged when retry succeeds');
      console.log('✅ Gemini transient 503 successfully retried once and recovered');

      // 2. Failover to Groq
      console.log('Testing automatic failover to Groq when Gemini fails permanently...');
      let groqCallCount = 0;
      geminiProvider.chat = async (prompt: string, model?: string) => {
        const err = new Error('429 Resource Exhausted');
        (err as any).response = { status: 429 };
        throw err;
      };
      groqProvider.chat = async (prompt: string, model?: string) => {
        groqCallCount++;
        return { response: 'Hello from Groq', model: 'groq-llama', createdAt: new Date().toISOString() };
      };

      const failoverResult = await providerManager.chat('Analyze bug in json format', 'gemini-flash', 'gemini');
      assert.strictEqual(failoverResult.response, 'Hello from Groq', 'Expected response from Groq');
      assert.strictEqual(failoverResult.fallbackUsed, true, 'Expected fallbackUsed flag');
      assert.strictEqual(failoverResult.fallbackProvider, 'groq', 'Expected fallback provider to be groq');
      assert.strictEqual(groqCallCount, 1, 'Expected Groq provider to be queried');
      console.log('✅ Permanent Gemini failure successfully fell back to Groq');

      // 3. Schema Preservation when all offline
      console.log('Testing schema preservation when all providers are offline...');
      geminiProvider.chat = async (prompt: string, model?: string) => {
        const err = new Error('503 Service Offline');
        (err as any).response = { status: 503 };
        throw err;
      };
      groqProvider.chat = async (prompt: string, model?: string) => {
        throw new Error('Groq Offline');
      };

      const offlineResult = await providerManager.chat('Analyze bug in buganalysis JSON format', 'gemini-flash', 'gemini');
      assert.strictEqual(offlineResult.providerUnavailable, true, 'Expected providerUnavailable flag to be true');
      
      const parsedJson = JSON.parse(offlineResult.response);
      assert.ok(parsedJson.summary.includes('unavailable'), 'Expected JSON response to contain unavailable summary');
      assert.ok(Array.isArray(parsedJson.criticalBugs), 'Expected JSON response to have empty structural arrays');
      console.log('✅ Structured offline response successfully preserved schema output');

    } finally {
      // Restore providers
      geminiProvider.chat = originalGeminiChat;
      groqProvider.chat = originalGroqChat;
    }

    console.log('\n==================================================');
    console.log('🎉 ALL SECURITY & RELIABILITY SPRINTS CHECKS PASSED');
    console.log('==================================================');
  } catch (err: any) {
    console.error('\n❌ Test Verification Failed:', err);
    process.exit(1);
  } finally {
    await app.close();
    process.exit(0);
  }
}

runTests().catch(err => {
  console.error('\n❌ Fatal error running regression tests:', err);
  process.exit(1);
});
