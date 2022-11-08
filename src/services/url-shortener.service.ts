import * as crypto from 'crypto';
import { URL } from 'url';

import { BadRequestException, Injectable } from '@nestjs/common';

import { Config } from './config';
import { DatabaseService } from './database.service';

type EncodedId = string;

@Injectable()
export class UrlShortenerService {

  private static readonly CHARACTER_SET =
    [
      'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
      'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
      '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'
    ];

  constructor(private readonly config: Config,
              private readonly database: DatabaseService) {
  }

  /**
   * Creates a shortened version of the provided URL. The short URL is just a base and a unique ID encoded with alphanumeric characters.
   * @param originalUrl The URL to be shortened.
   * @returns The short URL version.
   */
  async shortenUrl(originalUrl: string): Promise<string> {
    // Test if the provided URL is a valid URL indeed
    try {
      new URL(originalUrl);
    } catch (error: unknown) {
      throw new BadRequestException(`The provided URL is invalid.`);
    }

    let encodedId: EncodedId;

    // Avoid generating duplicate IDs
    do {
      encodedId = this.generateRandomId(this.config.uniqueIdLength);
    } while (await this.database.hasEncodedId(encodedId));

    // Store mapping to memory
    await this.database.addUrlEntry(encodedId, originalUrl);

    return `${this.config.baseUrl}/${encodedId}`;
  }

  /**
   * Translates an encoded ID back to its belonging original URL.
   * @param encodedId An encoded ID composed of alphanumeric characters.
   * @returns The original URL, if found.
   */
  async resolveUniqueId(encodedId: EncodedId): Promise<string> {
    if (encodedId.length != this.config.uniqueIdLength) {
      throw new BadRequestException(`Invalid short URL.`);
    }

    const originalUrl: string | undefined = await this.database.getUrlByEncodedId(encodedId);
    if (!originalUrl) {
      throw new BadRequestException(`Invalid short URL.`);
    }

    // Keep track of the number of visits for the current short URL
    await this.database.trackVisit(encodedId);

    return originalUrl;
  }

  /**
   * @param encodedId An encoded ID composed of alphanumeric characters.
   * @returns The number of visits for the given short URL unique ID.
   */
  async getVisitCount(encodedId: EncodedId): Promise<number> {
    if (encodedId.length != this.config.uniqueIdLength) {
      throw new BadRequestException(`Invalid short URL.`);
    }

    const visitCount: number | undefined = await this.database.getVisitCount(encodedId);
    if (visitCount === undefined) {
      throw new BadRequestException(`Invalid short URL.`);
    }

    return visitCount;
  }

  /**
   * Generates a random ID encoded with of alphanumeric characters.
   * @returns The generated ID string.
   */
  private generateRandomId(length: number): EncodedId {
    const uniqueId = []; // Array of characters to contain the parts of the encoded ID

    // Generate a big random number
    let randomInt = crypto.randomInt(UrlShortenerService.CHARACTER_SET.length ** length);

    while (randomInt) {
      // Add new character indexed with the remainder to the beginning of the character array
      const remainder: number = randomInt % UrlShortenerService.CHARACTER_SET.length;
      uniqueId.unshift(UrlShortenerService.CHARACTER_SET[remainder]);

      // Update the current random integer with the quotient
      randomInt = Math.trunc(randomInt / UrlShortenerService.CHARACTER_SET.length);
    }

    // Join the characters to a string and pad its beginning with the lowest local value character
    return uniqueId.join('').padStart(length, UrlShortenerService.CHARACTER_SET[0]);
  }
}
