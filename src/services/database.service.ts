import * as MongoDB from 'mongodb';

import { Injectable } from '@nestjs/common';

import { Config } from './config';

interface UrlEntry {
  originalUrl:        string;
  shortUrlEncodedId:  string;
}

@Injectable()
export class DatabaseService {

  private static readonly URL_COLLECTION_NAME = 'urls';

  private readonly client: MongoDB.MongoClient;
  private database?: MongoDB.Db;
  private urls: MongoDB.Collection;

  constructor(private readonly config: Config) {
    this.client = new MongoDB.MongoClient(config.databaseConnectionString);
  }

  /**
   * Connects to the database
   * @param databaseName An optional database name. Used for testing purposes.
   */
  async connect(databaseName?: string): Promise<void> {
    if (!this.database) {
      await this.client.connect();
      this.database = this.client.db(databaseName ?? this.config.databaseName);
      this.urls = this.database.collection(DatabaseService.URL_COLLECTION_NAME);

      await this.setupCollections();
    }
  }

  /**
   * Closes an open database connection.
   */
  disconnect(): Promise<void> {
    return this.client.close();
  }

  /**
   * Adds a new entry to the URL collection which holds the ID part of the shortened URL and also the complete original URL.
   * @param shortUrlEncodedId The short URL's encoded unique ID.
   * @param originalUrl The original URL to be resolved in the future for the unique ID.
   */
  async addUrlEntry(shortUrlEncodedId: string, originalUrl: string): Promise<void> {
    await this.urls.insertOne({ shortUrlEncodedId, originalUrl });
  }

  /**
   * @param shortUrlEncodedId A short URL's encoded unique ID.
   * @returns True, if the unique ID exists in the database.
   */
  async hasEncodedId(shortUrlEncodedId: string): Promise<boolean> {
    const result: UrlEntry | null = await this.urls.findOne<UrlEntry>({ shortUrlEncodedId });
    return !!result;
  }

  /**
   * @param shortUrlEncodedId A short URL's encoded unique ID.
   * @returns The original URL belonging to the short URL's ID, if exists.
   */
  async getUrlByEncodedId(shortUrlEncodedId: string): Promise<string | undefined> {
    const result: UrlEntry | null = await this.urls.findOne<UrlEntry>({ shortUrlEncodedId });
    return result ? result.originalUrl : undefined;
  }

  /**
   * Removes every entry from the URL collection. Used only for testing!
   */
  cleanup(): Promise<boolean> {
    return this.urls.drop();
  }

  /**
   * Executes setup steps for the used database collections. (It creates one index for the URL collection.)
   */
  private async setupCollections(): Promise<string> {
    return this.urls.createIndex({ shortUrlEncodedId: 1 }, { unique: true });
  }
}
