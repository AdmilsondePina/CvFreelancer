import { dbConnect } from './index.js';

async function clear() {
  const client = dbConnect();
  await client.query('DELETE FROM users');
  console.log("DB cleared");
  client.end();
}

clear();
