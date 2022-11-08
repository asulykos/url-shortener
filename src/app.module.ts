import { Module } from '@nestjs/common';

import { AppController } from './controllers';
import { Config, DatabaseService, UrlShortenerService } from './services';

@Module({
  imports: [],
  controllers: [
    AppController
  ],
  providers: [
    {
      provide: Config,
      useFactory: Config.create
    },
    DatabaseService,
    UrlShortenerService
  ],
  exports: [
    Config
  ]
})
export class AppModule {}
