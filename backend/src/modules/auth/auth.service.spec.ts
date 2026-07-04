import { Test, TestingModule } from '@nestjs/testing';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { PrismaService } from '../../database/prisma.service';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;

  beforeEach(async () => {
    const mockUsersService = {
      findByUsername: jest.fn(),
    };

    const mockPrismaService = {};

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        JwtModule.register({
          secret: 'test-secret',
          signOptions: { expiresIn: '60s' },
        }),
      ],
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('should return user info without password on valid credentials', async () => {
      const plainPassword = 'password123';
      const hashedPassword = await bcrypt.hash(plainPassword, 10);
      const mockUser = {
        id: 'user-id',
        username: 'testuser',
        email: 'test@email.com',
        password: hashedPassword,
        role: 'USER',
      };

      jest.spyOn(usersService, 'findByUsername').mockResolvedValue(mockUser as any);

      const result = await service.validateUser('testuser', plainPassword);
      expect(result).toBeDefined();
      expect(result.id).toBe('user-id');
      expect(result.password).toBeUndefined();
    });

    it('should return null on invalid credentials', async () => {
      jest.spyOn(usersService, 'findByUsername').mockResolvedValue(null);

      const result = await service.validateUser('testuser', 'password');
      expect(result).toBeNull();
    });
  });
});
