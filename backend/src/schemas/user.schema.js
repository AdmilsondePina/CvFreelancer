// user.schema.js
import pg from 'pg';
const { Pool } = pg;
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  user: process.env.POSTGRES_USER,
  host: 'localhost',
  database: process.env.POSTGRES_DB,
  password: process.env.POSTGRES_PASSWORD,
  port: 5432,
});

export const getAllUsers = async () => {
  const client = await pool.connect();
  try {
    const query = 'SELECT * FROM users';
    const result = await client.query(query);
    return result.rows;
  } finally {
    client.release();
  }
};

export const getUserById = async (id) => {
  const client = await pool.connect();
  try {
    const query = 'SELECT * FROM users WHERE id = $1';
    const result = await client.query(query, [id]);
    return result.rows[0];
  } finally {
    client.release();
  }
};

export const findUserByEmail = async (email) => {
  const client = await pool.connect();
  try {
    const query = 'SELECT * FROM users WHERE email = $1';
    const result = await client.query(query, [email]);
    return result.rows[0];
  } finally {
    client.release();
  }
};

// Adicione a função updateUserProfile se não existir
export const updateUserProfile = async (id, updates) => {
  const client = await pool.connect();
  try {
    const query = `
      UPDATE users
      SET name = $1, email = $2, password = $3
      WHERE id = $4
      RETURNING *;
    `;
    const values = [updates.name, updates.email, updates.password || null, id];
    const result = await client.query(query, values);
    return result.rows[0];
  } finally {
    client.release();
  }
};
