/* eslint-disable no-restricted-syntax */
/* eslint-disable guard-for-in */
import mongoose from 'mongoose';

export const connectDatabase = async () => {
  await mongoose.connect(
    'mongodb://127.0.0.1:27017/jest',
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
    },
    (err) => {
      if (err) {
        process.exit(1);
      }
    },
  );
};

export const clearDatabse = async () => {
  const collections = await mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    // eslint-disable-next-line no-await-in-loop
    await collection.deleteMany({});
  }
};

export const closeDatabase = async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
};
