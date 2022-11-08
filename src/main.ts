import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';
import { Config, DatabaseService } from './services';

(async () => {
  // Create the Nest application
  const app = await NestFactory.create(AppModule);

  // Connect to database. Any thrown exceptions will exit the application.
  const db: DatabaseService = app.get(DatabaseService);
  await db.connect();

  // Start listening on the port specified in config
  const config: Config = app.get(Config);
  app.listen(config.port);
})();
