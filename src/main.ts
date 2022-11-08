import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';
import { Config } from './services';

(async () => {
  // Create the Nest application
  const app = await NestFactory.create(AppModule);

  // Start listening on the port specified in config
  const config: Config = app.get(Config);
  app.listen(config.port);
})();
