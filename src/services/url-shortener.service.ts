import * as crypto from 'crypto';
import { URL } from 'url';

import { BadRequestException, Injectable } from '@nestjs/common';

import { Config } from './config';

type EncodedId = string;

@Injectable()
export class UrlShortenerService {

  private urlMap = new Map< EncodedId, string >();

  private static readonly CHARACTER_SET =
    [
      'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
      'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
      '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'
    ];

  constructor(private readonly config: Config) {
  }

  /**
   * Creates a shortened version of the provided URL. The short URL is just a base and a unique ID encoded with alphanumeric characters.
   * @param originalUrl The URL to be shortened.
   * @returns The short URL version.
   */
  public shortenUrl(originalUrl: string): string {
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
    } while (this.urlMap.get(encodedId));

    // Store mapping to memory
    this.urlMap.set(encodedId, originalUrl);

    return `${this.config.baseUrl}/${encodedId}`;
  }

  /**
   * Translates an encoded ID back to its belonging original URL.
   * @param encodedId An encoded ID composed of alphanumeric characters.
   * @returns The original URL, if found.
   */
  public resolveUniqueId(encodedId: EncodedId): string {
    if (encodedId.length != this.config.uniqueIdLength) {
      throw new BadRequestException(`Invalid short URL.`);
    }

    const originalUrl: string | undefined = this.urlMap.get(encodedId);
    if (!originalUrl) {
      throw new BadRequestException(`Invalid short URL.`);
    }

    return originalUrl;
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
