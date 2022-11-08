import { Module } from '@nestjs/common';

import { AppController } from './controllers';
import { Config } from './services';

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
  ],
  exports: [
    Config
  ]
})
export class AppModule {}
