import { Injectable } from '@nestjs/common';

type EncodedId = string;

@Injectable()
export class DatabaseServiceMock {

  private urlMap = new Map< EncodedId, string >();

  connect(): Promise<void> {
    return Promise.resolve();
  }

  disconnect(): Promise<void> {
    return Promise.resolve();
  }

  addUrlEntry(shortUrlEncodedId: string, originalUrl: string): Promise<void> {
    this.urlMap.set(shortUrlEncodedId, originalUrl);
    return Promise.resolve();
  }

  hasEncodedId(shortUrlEncodedId: string): Promise<boolean> {
    return Promise.resolve(this.urlMap.has(shortUrlEncodedId));
  }

  getUrlByEncodedId(shortUrlEncodedId: string): Promise<string | undefined> {
    return Promise.resolve(this.urlMap.get(shortUrlEncodedId));
  }

  cleanup(): Promise<boolean> {
    return Promise.resolve(true);
  }
}
