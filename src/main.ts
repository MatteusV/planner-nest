import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import { env } from './env';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: env.WEB_BASE_URL,
    credentials: true,
  });
  app.use(cookieParser());
  await app.listen(3000);
}
bootstrap();
