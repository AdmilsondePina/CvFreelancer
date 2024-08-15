// src/postgres/index.js
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Client } = pg;

// Configuração do cliente PostgreSQL
const client = new Client({
  user: process.env.POSTGRES_USER,
  host: 'localhost',
  database: process.env.POSTGRES_DB,
  password: process.env.POSTGRES_PASSWORD,
  port: 5432,
});

// Conectar ao banco de dados
export const connectDB = async () => {
  try {
    await client.connect();
    console.log("DB connected");
  } catch (error) {
    console.error("Connection error", error.stack);
  }
};

// Desconectar do banco de dados
export const disconnectDB = async () => {
  try {
    await client.end();
    console.log("DB disconnected");
  } catch (error) {
    console.error("Disconnection error", error.stack);
  }
};

// Função para criar a tabela de utilizadors
export const createUserTable = async () => {
  try {
    await connectDB();
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
  } catch (error) {
    console.error("Error creating table", error.stack);
  } finally {
    await disconnectDB();
  }
};

// Função para inserir um utilizador
export const insertUser = async (user) => {
  try {
    await connectDB();
    const query = `
      INSERT INTO users (name, email, password, created_at, profile_image)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const values = [user.name, user.email, user.password, user.created_at, user.profile_image];
    const result = await client.query(query, values);
    return result.rows[0];
  } catch (error) {
    console.error("Error inserting user", error.stack);
  } finally {
    await disconnectDB();
  }
};

// Função para encontrar um utilizador pelo e-mail
export const findUserByEmail = async (email) => {
  try {
    await connectDB();
    const query = `
      SELECT * FROM users WHERE email = $1
    `;
    const result = await client.query(query, [email]);
    return result.rows[0];
  } catch (error) {
    console.error("Error finding user", error.stack);
  } finally {
    await disconnectDB();
  }
};
