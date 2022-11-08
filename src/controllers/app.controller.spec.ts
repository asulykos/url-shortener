import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { AppController } from './app.controller';
import { Config, DatabaseService, UrlShortenerService } from '../services';
import { DatabaseServiceMock } from '../mocks';

describe('AppController', () => {
  let appController: AppController;
  let config: Config;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [ AppController ],
      providers: [
        {
          provide: Config,
          useValue: {
            port:           3000,
            baseUrl:        'tier.app',
            uniqueIdLength: 6
          }
        },
        {
          provide: DatabaseService,
          useClass: DatabaseServiceMock
        },
        UrlShortenerService
      ]
    })
    .compile();

    appController = app.get<AppController>(AppController);
    config = app.get<Config>(Config);
  });

  it('should return a valid shortened URL', () => {
    // Build a regular expressions that matches the generated short URL pattern
    const matcher = new RegExp(`${config.baseUrl.replace('.', '\\.')}\/[A-Za-z0-9]{6}`);
    expect(appController.generateShortenedUrl({ url: 'https://dummy' })).resolves.toMatch(matcher);
  });

  it('should be able to return the original URL', async () => {
    const dummyUrl = 'https://dummy';
    const shortenedUrl = await appController.generateShortenedUrl({ url: dummyUrl });
    expect(appController.getOriginalUrl(shortenedUrl.substring(config.baseUrl.length + 1))).resolves.toBe(dummyUrl);
  });

  it('should throw a BadRequestException if the original URL is missing from the body or invalid', () => {
    expect(appController.generateShortenedUrl({ url: '' })).rejects.toThrow(BadRequestException);
    expect(appController.generateShortenedUrl({ url: 'invalid_URL' })).rejects.toThrow(BadRequestException);
  });

  it('should throw a BadRequestException if the provided short URL is invalid', () => {
    expect(appController.getOriginalUrl('=invalid=')).rejects.toThrow(BadRequestException);

    // It should throw even if the string matches the expected format
    const validEncodedIdFormat = (UrlShortenerService as any).CHARACTER_SET[0].repeat(config.uniqueIdLength);
    expect(appController.getOriginalUrl(validEncodedIdFormat)).rejects.toThrow(BadRequestException);
  });

  it('should be able to return the correct visit count', async () => {
    const VISIT_COUNT = 5;

    const dummyUrl = 'https://dummy';
    const shortenedUrl = await appController.generateShortenedUrl({ url: dummyUrl });
    const shortenedUrlUniqueId = shortenedUrl.substring(config.baseUrl.length + 1);

    for (let i = 0; i < VISIT_COUNT; i++) {
      await appController.getOriginalUrl(shortenedUrlUniqueId);
    }

    expect(appController.getVisitCount(shortenedUrlUniqueId)).resolves.toBe(VISIT_COUNT);
  });

  it('should throw a BadRequestException if the provided short URL is invalid when querying the visit count', () => {
    expect(appController.getVisitCount('=invalid=')).rejects.toThrow(BadRequestException);

    // It should throw even if the string matches the expected format
    const validEncodedIdFormat = (UrlShortenerService as any).CHARACTER_SET[0].repeat(config.uniqueIdLength);
    expect(appController.getVisitCount(validEncodedIdFormat)).rejects.toThrow(BadRequestException);
  });
});
