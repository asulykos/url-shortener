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
  generateShortenedUrl(@Body() data: GenerateShortenedUrlDto): string {
    if (!data.url) {
      throw new BadRequestException(`Request body should contain the 'url' property.`);
    }

    return this.urlShortenerService.shortenUrl(data.url);
  }

  @Get(':uniqueId')
  getOriginalUrl(@Param('uniqueId') uniqueId: string): string {
    return this.urlShortenerService.resolveUniqueId(uniqueId);
  }
}
