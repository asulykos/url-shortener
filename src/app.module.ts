import { Module } from '@nestjs/common';

import { AppController } from './controllers';
import { Config, UrlShortenerService } from './services';

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
    UrlShortenerService
  ],
  exports: [
    Config
  ]
})
export class AppModule {}
