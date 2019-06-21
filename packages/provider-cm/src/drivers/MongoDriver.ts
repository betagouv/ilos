import { ConnectionInterface } from "../ConnectionInterface";

export class MongoDriver implements ConnectionInterface {
  async up(): Promise<void> {

  }

  async down(): Promise<void> {

  }

  getClient(): any {
    return this;
  }
}