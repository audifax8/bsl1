import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthController } from './health/health.controller';
import { PetController } from './pet/pet.controller';
import { NestjsKnexModule } from 'nestjs-knexjs';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'docs'),
    }),
    NestjsKnexModule.register({
      client: 'mysql',
      connection: {
        host: 'remotemysql.com',
        user: 'mdGDPU7iCF',
        password: 'yceEFugYqt',
        database: 'mdGDPU7iCF',
        port: 3306,
      },
    }),
    HttpModule,
  ],
  controllers: [AppController, HealthController, PetController],
  providers: [AppService],
})
export class AppModule {}
