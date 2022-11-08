import { BadRequestException, Body, Controller, Get, Param, Post } from '@nestjs/common';

import { UrlShortenerService } from '../services';

interface GenerateShortenedUrlDto {
  url: string;
}

@Controller()
export class AppController {

  constructor(private readonly urlShortenerService: UrlShortenerService) {
  }

  @Post('shorten')
  async generateShortenedUrl(@Body() data: GenerateShortenedUrlDto): Promise<string> {
    if (!data.url) {
      throw new BadRequestException(`Request body should contain the 'url' property.`);
    }

    return this.urlShortenerService.shortenUrl(data.url);
  }

  @Get(':uniqueId')
  async getOriginalUrl(@Param('uniqueId') uniqueId: string): Promise<string> {
    return this.urlShortenerService.resolveUniqueId(uniqueId);
  }
}
