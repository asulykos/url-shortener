import * as request from 'supertest';

import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { AppModule } from './../src/app.module';
import { Config, DatabaseService, UrlShortenerService } from '../src/services';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let config: Config;
  let database: DatabaseService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    config = app.get<Config>(Config);

    database = app.get(DatabaseService);
    await database.connect('test'); // connect to 'test' database instead of the production DB
  });

  afterAll(async () => {
    // Remove test collections
    await database.cleanup();

    // Wait for app termination
    await Promise.all([
      app.close(),
      database.disconnect()
    ]);
  });

  it('/shorten (POST) should return 201 with the correctly formed short URL', () => {
    const matcher = new RegExp(`${config.baseUrl.replace('.', '\\.')}\/[A-Za-z0-9]{6}`);
    return request(app.getHttpServer())
      .post('/shorten')
      .send({ url: 'https://dummy' })
      .expect(201)
      .expect(matcher);
  });

  it('/shorten (POST) should return 400 on missing url', () => {
    return request(app.getHttpServer())
      .post('/shorten')
      .send({ url: '' })
      .expect(400);
  });

  it('/shorten (POST) should return 400 on malformed url', () => {
    return request(app.getHttpServer())
      .post('/shorten')
      .send({ url: 'invalid_URL' })
      .expect(400);
  });

  it('/ (GET) should return 404', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(404)
  });

  it('/ (GET) should return 400 with a malformed unique ID', () => {
    return request(app.getHttpServer())
      .get('/invalid_ID')
      .expect(400)
  });

  it('/ (GET) should return 400 when a correctly formed unique ID cannot be found', () => {
    const validEncodedIdFormat = (UrlShortenerService as any).CHARACTER_SET[0].repeat(config.uniqueIdLength);
    return request(app.getHttpServer())
      .get(`/${validEncodedIdFormat}`)
      .expect(400)
  });

  it('/ (GET) should return the correct original URL when called with a valid unique ID', async () => {
    const dummyUrl = 'https://dummy';
    const result = await request(app.getHttpServer())
      .post('/shorten')
      .send({ url: dummyUrl })
      .expect(201);

    return request(app.getHttpServer())
      .get(`/${result.text.substring(config.baseUrl.length + 1)}`)
      .expect(200)
      .expect(dummyUrl);
  });
});
