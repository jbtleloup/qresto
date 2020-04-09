import { MongoClient } from 'mongodb';

// console.log(process.env.MONGODB_URI);
const client = new MongoClient(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

export async function setUpDb(db) {
  console.log('set up Db');
  await db
    .collection('tokens')
    .createIndex('expireAt', { expireAfterSeconds: 0 });
}

export default async function database(req, res, next) {
  try {
    if (!client.isConnected()) {
      await client.connect();
      console.log('not connected');
    } else {
      console.log('connected!');
    }
  } catch (e) {
    console.log('error: ');
    console.log(e);
  }
  console.log('new db');
  req.dbClient = client;
  req.db = client.db(process.env.DB_NAME);
  await setUpDb(req.db);
  return next();
}
