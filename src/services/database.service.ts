import * as MongoDB from 'mongodb';

import { Injectable } from '@nestjs/common';

import { Config } from './config';

interface UrlEntry {
  shortUrlEncodedId:  string;
  originalUrl:        string;
}

interface VisitEntry {
  shortUrlEncodedId:  string;
  count:              number;
}

@Injectable()
export class DatabaseService {

  private static readonly URLS_COLLECTION_NAME = 'urls';
  private static readonly VISITS_COLLECTION_NAME = 'visits';

  private readonly client: MongoDB.MongoClient;
  private database?: MongoDB.Db;

  private urls: MongoDB.Collection;
  private visits: MongoDB.Collection;

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
      this.urls = this.database.collection(DatabaseService.URLS_COLLECTION_NAME);
      this.visits = this.database.collection(DatabaseService.VISITS_COLLECTION_NAME);

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
   * Increases the total visit number of a short URL by 1 in the visits collection.
   * @param shortUrlEncodedId A short URL's encoded unique ID.
   */
  async trackVisit(shortUrlEncodedId: string): Promise<void>{
    await this.visits.updateOne({ shortUrlEncodedId }, { $inc:{count:1} }, { upsert: true });
  }

  /**
   * @param shortUrlEncodedId A short URL's encoded unique ID.
   * @returns The number of visits for the given short URL unique ID.
   */
  async getVisitCount(shortUrlEncodedId: string): Promise<number | undefined>{
    const result: VisitEntry | null = await this.visits.findOne<VisitEntry>({ shortUrlEncodedId });
    return result ? result.count : undefined;
  }

  /**
   * Removes every entry from the database collections. Used only for testing!
   */
  async cleanup(): Promise<void> {
    await Promise.all([
      this.urls.drop(),
      this.visits.drop()
    ]);
  }

  /**
   * Executes setup steps for the used database collections. (It creates one index for the URL collection.)
   */
  private async setupCollections(): Promise<string> {
    return this.urls.createIndex({ shortUrlEncodedId: 1 }, { unique: true });
  }
}
