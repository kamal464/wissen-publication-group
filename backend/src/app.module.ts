import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { JournalsModule } from './journals/journals.module';
import { ArticlesModule } from './articles/articles.module';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [
    PrismaModule,
    JournalsModule,
    ArticlesModule,
    AdminModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
