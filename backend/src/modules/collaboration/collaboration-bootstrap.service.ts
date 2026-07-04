import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class CollaborationBootstrapService implements OnModuleInit {
  private readonly logger = new Logger(CollaborationBootstrapService.name);

  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    this.logger.log('Bootstrapping default collaboration team users...');
    const defaultTeam = [
      { email: 'alex@nebula.app', username: 'alex', name: 'Alex Stratos', title: 'Founding designer', avatar: 'from-violet-500 to-sky-400' },
      { email: 'mira@nebula.app', username: 'mira', name: 'Mira Chen', title: 'Engineering lead', avatar: 'from-emerald-400 to-cyan-300' },
      { email: 'priya@nebula.app', username: 'priya', name: 'Priya Nair', title: 'Strategy & ops', avatar: 'from-fuchsia-400 to-indigo-500' },
      { email: 'jordan@nebula.app', username: 'jordan', name: 'Jordan Reed', title: 'Senior engineer', avatar: 'from-amber-300 to-rose-400' },
      { email: 'sam@nebula.app', username: 'sam', name: 'Sam Okafor', title: 'Writer', avatar: 'from-rose-400 to-orange-300' },
    ];

    const hashedPassword = await bcrypt.hash('nebula-dev-pass', 10);

    for (const u of defaultTeam) {
      const existing = await this.prisma.user.findFirst({
        where: { OR: [{ email: u.email }, { username: u.username }] }
      });

      if (!existing) {
        await this.prisma.user.create({
          data: {
            email: u.email,
            username: u.username,
            password: hashedPassword,
            role: 'USER',
            name: u.name,
            title: u.title,
            avatar: u.avatar,
            isActive: true,
          }
        });
        this.logger.log(`Created team user: ${u.name}`);
      }
    }
  }
}
