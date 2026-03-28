import mongoose from "mongoose";

declare global {
  // eslint-disable-next-line no-var
  var __mongooseConnectionPromise: Promise<typeof mongoose> | undefined;
}

async function connectMongo() {
  if (mongoose.connection.readyState === 1) return mongoose;

  const { MONGODB_URI, MONGODB_DB } = process.env;
  if (!MONGODB_URI) throw new Error("MONGODB_URI is not defined");
  if (!MONGODB_DB) throw new Error("MONGODB_DB is not defined");

  if (!globalThis.__mongooseConnectionPromise) {
    globalThis.__mongooseConnectionPromise = mongoose
      .connect(MONGODB_URI, { dbName: MONGODB_DB })
      .then(() => mongoose);
  }

  return globalThis.__mongooseConnectionPromise;
}

export async function ensureMongoConnected() {
  await connectMongo();
  if (!mongoose.connection.db) {
    throw new Error("MongoDB connection is not ready (missing .db handle)");
  }
}

