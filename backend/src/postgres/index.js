import { Client } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

export const dbConnect = () => {
  const client = new Client({
    user: process.env.POSTGRES_USER,
    host: 'localhost',
    database: process.env.POSTGRES_DB,
    password: process.env.POSTGRES_PASSWORD,
    port: 5432,
  });

  client.connect()
    .then(() => console.log("DB connection"))
    .catch(err => console.error('Connection error', err.stack));

  return client;
};

