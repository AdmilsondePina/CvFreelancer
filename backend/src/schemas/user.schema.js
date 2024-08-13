import { dbConnect } from '../postgres/index.js';

export const createUserTable = async () => {
  const client = dbConnect();

  const query = `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      profile_image TEXT
    )
  `;
  
  await client.query(query);
  client.end();
};

export const insertUser = async (user) => {
  const client = dbConnect();

  const query = `
    INSERT INTO users (name, email, password, created_at, profile_image)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
  `;

  const values = [user.name, user.email, user.password, user.created_at, user.profile_image];

  const result = await client.query(query, values);
  client.end();

  return result.rows[0];
};

export const findUserByEmail = async (email) => {
  const client = dbConnect();

  const query = `
    SELECT * FROM users WHERE email = $1
  `;

  const result = await client.query(query, [email]);
  client.end();

  return result.rows[0];
};
