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
    const envPath = ('APP_ROOT_PATH' in process.env) ? process.env.APP_ROOT_PATH : process.cwd();
    this.loadFromProcess();
    this.loadEnvFile(envPath);
  }

  loadFromProcess() {
    Reflect.ownKeys(process.env)
      .filter((key: string) => key === key.toUpperCase() && key.startsWith('APP_'))
      .forEach((key: string) => {
        this.env.set(key, process.env[key]);
      });
  }

  loadEnvFile(envDirectory: string, envFile?: string) {
    const envPath = path.resolve(envDirectory, envFile ? envFile : '.env');

    if (!fs.existsSync(envPath)) {
      return;
    }
    const result = dotenv.config({ path: envPath });

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
