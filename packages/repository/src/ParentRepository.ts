import { MongoConnection, CollectionInterface, MongoException, ObjectId, DbInterface } from '@ilos/connection-mongo';
import {
  NotFoundException,
  ConfigInterfaceResolver,
  RepositoryInterface,
  NewableType,
  RepositoryModelType,
} from '@ilos/common';

export abstract class ParentRepository implements RepositoryInterface {
  protected readonly castObjectIds: string[] = ['_id'];

  constructor(protected config: ConfigInterfaceResolver, protected connection: MongoConnection) {}

  public getDbName(): string {
    throw new Error('Database not set');
  }

  public getKey(): string {
    throw new Error('Key not set');
  }

  public getDatabase(): string {
    // TODO : remove useless method
    throw new Error('Database not set');
  }

  public getModel(): NewableType<any> {
    return Object;
  }

  async getDriver(): Promise<CollectionInterface> {
    return this.getCollection();
  }

  get client() {
    return this.connection.getClient();
  }

  async getDb(name: string): Promise<DbInterface> {
    return this.client.db(name);
  }

  async getCollectionFromDb(collection: string, db: string): Promise<CollectionInterface> {
    return this.client.db(db).collection(collection);
  }

  async getCollection() {
    return this.getCollectionFromDb(this.getKey(), this.getDbName());
  }

  async find(id: string | ObjectId): Promise<RepositoryModelType> {
    const collection = await this.getCollection();
    const result = await collection.findOne({ _id: new ObjectId(id) });
    if (!result) throw new NotFoundException('id not found');
    return this.instanciate(result);
  }

  async all(): Promise<RepositoryModelType[]> {
    const collection = await this.getCollection();
    const results = await collection.find().toArray();
    return this.instanciateMany(results);
  }

  async create(data: RepositoryModelType): Promise<RepositoryModelType> {
    const normalizedData = this.castObjectIdFromString(data);
    const collection = await this.getCollection();
    const { result, ops } = await collection.insertOne(normalizedData);
    if (result.ok !== 1) {
      throw new MongoException();
    }
    return this.instanciate(ops[0]);
  }

  async delete(data: RepositoryModelType | string | ObjectId): Promise<void> {
    const collection = await this.getCollection();
    const id = typeof data === 'string' ? data : '_id' in data ? data._id : data;
    const result = await collection.deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount !== 1) {
      throw new MongoException();
    }
    return;
  }

  async update(data: RepositoryModelType): Promise<RepositoryModelType> {
    const normalizedData = this.castObjectIdFromString(data);
    const collection = await this.getCollection();
    const selector = { _id: normalizedData._id };
    const { modifiedCount } = await collection.replaceOne(selector, normalizedData);
    if (modifiedCount !== 1) {
      throw new MongoException();
    }
    return this.instanciate(data);
  }

  async updateOrCreate(data: RepositoryModelType): Promise<RepositoryModelType> {
    const collection = await this.getCollection();
    const selector = { _id: data._id };
    const { modifiedCount } = await collection.replaceOne(selector, data, { upsert: true });
    if (modifiedCount !== 1) {
      throw new MongoException();
    }
    return data;
  }

  async patch(id: ObjectId | string, patch: any): Promise<RepositoryModelType> {
    const castedPatch = this.castObjectIdFromString(patch);
    const collection = await this.getCollection();
    const normalizedId = typeof id === 'string' ? new ObjectId(id) : id;
    const result = await collection.findOneAndUpdate(
      { _id: normalizedId },
      {
        $set: castedPatch,
      },
      {
        returnOriginal: false,
      },
    );
    if (result.ok !== 1) {
      throw new MongoException();
    }
    return this.instanciate(result.value);
  }

  async clear(): Promise<void> {
    const collection = await this.getCollection();
    const { result } = await collection.deleteMany({});
    if (result.ok !== 1) {
      throw new MongoException();
    }
    return;
  }

  protected instanciate(data: any): RepositoryModelType {
    const constructor = this.getModel();

    return new constructor(this.castStringFromObjectId(data));
  }

  protected instanciateMany(data: any[]): RepositoryModelType[] {
    return data.map((d) => this.instanciate(d));
  }

  protected castObjectIdFromString(data: RepositoryModelType) {
    const castedData = { ...data };
    this.castObjectIds.forEach((path: string) => {
      if (path in castedData && typeof castedData[path] === 'string') {
        castedData[path] = new ObjectId(castedData[path]);
      }
    });
    return castedData;
  }

  protected castStringFromObjectId(data) {
    const castedData = { ...data };
    this.castObjectIds.forEach((path: string) => {
      if (path in castedData && castedData[path] instanceof ObjectId) {
        castedData[path] = castedData[path].toString();
      }
    });
    return castedData;
  }
}
