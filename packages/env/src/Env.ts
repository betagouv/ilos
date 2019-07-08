import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { Container } from '@ilos/core';

import { EnvInterface } from './EnvInterfaces';

/**
 * Env provider
 * @export
 * @class EnvProvider
 * @implements {EnvInterface}
 */
@Container.provider()
export class Env implements EnvInterface {
  private env: Map<string, any> = new Map();

  async init() {
    this.loadFromProcess();
  }

  loadFromProcess() {
    Reflect.ownKeys(process.env)
      .filter((key: string) => key === key.toUpperCase() && key.startsWith('APP_'))
      .forEach((key: string) => {
        this.env.set(key, process.env[key]);
      });
  }

  loadEnvFile(envFileOrDirectoryPath: string) {
    let envFilePath = envFileOrDirectoryPath;
    if (fs.existsSync(envFileOrDirectoryPath) && fs.lstatSync(envFileOrDirectoryPath).isDirectory()) {
      envFilePath = path.resolve(envFileOrDirectoryPath, '.env');
    }
    
    if (!fs.existsSync(envFilePath)) {
      // throw new Error(`Unable to load env from ${envFileOrDirectoryPath}`);
      return;
    }

    const result = dotenv.config({ path: envFilePath });

    if (!result.error) {
      Reflect.ownKeys(result.parsed).forEach((key: string) => {
        if (this.env.has(key)) {
          throw new Error(`Duplicate env key ${key}`);
        }
        this.env.set(key, result.parsed[key]);
      });
    }
  }

  get(key: string, fallback?: any): any {
    if (!this.env.has(key)) {
      if (fallback !== undefined) {
        return fallback;
      }
      throw new Error(`Unknown env key ${key}`);
    }
    return this.env.get(key);
  }
}
