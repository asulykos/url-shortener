import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getTestString(): string {
    return 'test';
  }
}
