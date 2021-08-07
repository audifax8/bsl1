import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const PORT = parseInt(process.env.PORT, 10) || 3000;
  Logger.log(`App running on: ${PORT}`);
  Logger.debug(`App running on: ${PORT}`);
  Logger.error(`App running on: ${PORT}`);
  Logger.warn(`App running on: ${PORT}`);
  console.log(`App running on: ${PORT}`);
  await app.listen(PORT);
}
bootstrap();
