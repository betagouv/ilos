import { Interfaces } from '@ilos/core';
import { Collection, Db } from 'mongodb';

export interface MongoProviderInterface extends Interfaces.ProviderInterface {
  getDb(name: string): Promise<Db>;
  getCollectionFromDb(collection: string, db: string): Promise<Collection>;
  close(): Promise<void>;
}

export abstract class MongoProviderInterfaceResolver implements MongoProviderInterface {
  async boot() {
    return;
  }

  async getDb(name: string): Promise<Db> {
    throw new Error();
  }

  async getCollectionFromDb(collection: string, db: string): Promise<Collection> {
    throw new Error();
  }

  async close(): Promise<void> {
    throw new Error();
  }
}
