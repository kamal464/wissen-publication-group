import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { JournalsModule } from './journals/journals.module';
import { ArticlesModule } from './articles/articles.module';
import { AdminModule } from './admin/admin.module';
import { FilesModule } from './files/files.module';
import { NewsModule } from './news/news.module';

@Module({
  imports: [
    PrismaModule,
    JournalsModule,
    ArticlesModule,
    AdminModule,
    FilesModule,
    NewsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
