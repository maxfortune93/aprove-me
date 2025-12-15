import { Module, Global } from '@nestjs/common';
import { MailService } from './mail.service';
import { TOKENS } from '../../shared/di/tokens';

@Global()
@Module({
  providers: [
    {
      provide: TOKENS.IMailService,
      useClass: MailService,
    },
  ],
  exports: [TOKENS.IMailService],
})
export class MailModule {}
