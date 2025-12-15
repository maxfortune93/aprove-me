import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { UserPrismaRepository } from './repositories/user.prisma.repository';
import { AssignorPrismaRepository } from './repositories/assignor.prisma.repository';
import { PayablePrismaRepository } from './repositories/payable.prisma.repository';
import { TOKENS } from '../../shared/di/tokens';

@Module({
  imports: [PrismaModule],
  providers: [
    { provide: TOKENS.IUserRepository, useClass: UserPrismaRepository },
    { provide: TOKENS.IAssignorRepository, useClass: AssignorPrismaRepository },
    { provide: TOKENS.IPayableRepository, useClass: PayablePrismaRepository },
  ],
  exports: [
    TOKENS.IUserRepository,
    TOKENS.IAssignorRepository,
    TOKENS.IPayableRepository,
  ],
})
export class PersistenceModule {}
