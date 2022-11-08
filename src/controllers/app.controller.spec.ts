import { BadRequestException } from '@nestjs/common';
import { InstanceToken } from '@nestjs/core/injector/module';
import { Test, TestingModule } from '@nestjs/testing';

import { AppController } from './app.controller';
import { Config, UrlShortenerService } from '../services';

describe('AppController', () => {
  let appController: AppController;
  let config: Config;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [ AppController ],
      providers: [ UrlShortenerService ]
    })
    .useMocker((token: InstanceToken) => {
      if (token === Config) {
        // Provide a default configuration object
        return {
          port:           3000,
          baseUrl:        'tier.app',
          uniqueIdLength: 6
        }
      }
    })
    .compile();

    appController = app.get<AppController>(AppController);
    config = app.get<Config>(Config);
  });

  it('should return a valid shortened URL', () => {
    // Build a regular expressions that matches the generated short URL pattern
    const matcher = new RegExp(`${config.baseUrl.replace('.', '\\.')}\/[A-Za-z0-9]{6}`);
    expect(appController.generateShortenedUrl({ url: 'https://dummy' })).toMatch(matcher);
  });

  it('should be able to return the original URL', () => {
    const dummyUrl = 'https://dummy';
    const shortenedUrl = appController.generateShortenedUrl({ url: dummyUrl });
    expect(appController.getOriginalUrl(shortenedUrl.substring(config.baseUrl.length + 1))).toBe(dummyUrl);
  });

  it('should throw a BadRequestException if the original URL is missing from the body or invalid', () => {
    expect(() => appController.generateShortenedUrl({ url: '' })).toThrow(BadRequestException);
    expect(() => appController.generateShortenedUrl({ url: 'invalid_URL' })).toThrow(BadRequestException);
  });

  it('should throw a BadRequestException if the provided short URL is invalid', () => {
    expect(() => appController.getOriginalUrl('=invalid=')).toThrow(BadRequestException);

    const validEncodedIdFormat = (UrlShortenerService as any).CHARACTER_SET[0].repeat(config.uniqueIdLength);

    // It should throw even if the string matches the expected format
    expect(() => appController.getOriginalUrl(validEncodedIdFormat)).toThrow(BadRequestException);
  });
});
