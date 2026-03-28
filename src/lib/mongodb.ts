import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI!;

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (!uri) {
  throw new Error("Please add MONGODB_URI to .env.local");
}

if (process.env.NODE_ENV === "development") {
  const globalAny = global as unknown as { _mongoClientPromise?: Promise<MongoClient> };

  if (!globalAny._mongoClientPromise) {
    client = new MongoClient(uri);
    globalAny._mongoClientPromise = client.connect();
  }

  clientPromise = globalAny._mongoClientPromise;
} else {
  client = new MongoClient(uri);
  clientPromise = client.connect();
}

export default clientPromise;