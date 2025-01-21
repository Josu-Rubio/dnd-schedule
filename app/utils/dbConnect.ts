import mongoose from 'mongoose';

const connections = {}; // Cache for connections

export async function connectToDatabase(dbName: string) {
  if (connections[dbName]) {
    // If the connection already exists, reuse it
    return connections[dbName];
  }

  const uri = process.env.MONGO_URI || '';

  // Replace the default database name with the dynamic dbName
  const dbUri = uri.replace(/\/[^/]+$/, `/${dbName}`);

  const connection = await mongoose
    .createConnection(dbUri)
    .asPromise();

  connections[dbName] = connection;
  return connection;
}
