import { ProviderInterface } from '../core';

export type RepositoryModelType = any;

export interface RepositoryInterface extends ProviderInterface {
  find(id: string): Promise<RepositoryModelType>;
  all(): Promise<RepositoryModelType[]>;
  create(data: RepositoryModelType): Promise<RepositoryModelType>;
  delete(data: RepositoryModelType | { _id: string }): Promise<void>;
  update(data: RepositoryModelType, patch?: any): Promise<RepositoryModelType>;
  patch(id: string, patch?: any): Promise<RepositoryModelType>;
  clear(): Promise<void>;
  updateOrCreate(data: RepositoryModelType): Promise<RepositoryModelType>;
  getDriver(): Promise<any>;
}

export abstract class RepositoryInterfaceResolver implements RepositoryInterface {
  async find(id: string): Promise<RepositoryModelType> {
    throw new Error();
  }

  async all(): Promise<RepositoryModelType[]> {
    throw new Error();
  }

  async create(data: RepositoryModelType): Promise<RepositoryModelType> {
    throw new Error();
  }

  async delete(data: RepositoryModelType | { _id: string }): Promise<void> {
    throw new Error();
  }

  async update(data: RepositoryModelType, patch?: any): Promise<RepositoryModelType> {
    throw new Error();
  }
  async patch(id: string, patch?: any): Promise<RepositoryModelType> {
    throw new Error();
  }

  async clear(): Promise<void> {
    throw new Error();
  }

  async updateOrCreate(data: RepositoryModelType): Promise<RepositoryModelType> {
    throw new Error();
  }

  async getDriver(): Promise<any> {
    throw new Error();
  }
}
