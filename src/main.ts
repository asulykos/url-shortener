import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';
import { Config } from './services';

(async () => {
  // Create the Nest application
  const app = await NestFactory.create(AppModule);

  // Set global HTTP route prefix
  const config: Config = app.get(Config);
  app.setGlobalPrefix(config.globalRoutePrefix);

  // Start listening on the port specified in config
  app.listen(config.port);
})();
