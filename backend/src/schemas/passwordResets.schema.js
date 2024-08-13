import { dbConnect } from '../postgres/index.js';

export const createPasswordResetTable = async () => {
  const client = dbConnect();

  const query = `
    CREATE TABLE IF NOT EXISTS password_resets (
      id SERIAL PRIMARY KEY,
      email VARCHAR(100) NOT NULL,
      token TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;
  
  await client.query(query);
  client.end();
};

export const insertPasswordReset = async (passwordReset) => {
  const client = dbConnect();

  const query = `
    INSERT INTO password_resets (email, token, created_at)
    VALUES ($1, $2, $3)
    RETURNING *
  `;

  const values = [passwordReset.email, passwordReset.token, passwordReset.created_at];

  const result = await client.query(query, values);
  client.end();

  return result.rows[0];
};

export const findPasswordResetByToken = async (token) => {
  const client = dbConnect();

  const query = `
    SELECT * FROM password_resets WHERE token = $1
  `;

  const result = await client.query(query, [token]);
  client.end();

  return result.rows[0];
};
