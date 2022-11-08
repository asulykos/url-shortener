import * as path from 'path';

export class Config {
  /**
   * Listen for the connections on this port number.
   */
  public readonly port: string;

  /**
   * Base URL of the shortened URLs.
   */
  public readonly baseUrl: string;

  /**
   * The number of characters that make up the unique IDs.
   */
  public readonly uniqueIdLength: number;

  /**
   * Connection string to a MongoDB server
   */
  public readonly databaseConnectionString: string;

  /**
   * Name of the MongoDB database
   */
  public readonly databaseName: string;

  /**
   * Loads configuration parameters asynchronously from a configuration file then creates a configuration instance from that data.
   * @returns The configuration service instance.
   */
  static async create(): Promise< Config > {
    const configData: Record<string, unknown> = await import(path.join(__dirname, '..', '..', 'config/config.json'));
    return new Config(configData);
  }

  constructor(config: Record<string, unknown>) {
    Object.assign(this, config);
  }
}
