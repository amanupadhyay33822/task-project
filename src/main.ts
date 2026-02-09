import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable validation pipes globally
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`🚀 Energy Ingestion Engine running on port ${port}`);
  console.log(`📊 Ingestion endpoints: POST /v1/ingest/meter, POST /v1/ingest/vehicle`);
  console.log(`📈 Analytics endpoint: GET /v1/analytics/performance/:vehicleId`);
}

bootstrap();
