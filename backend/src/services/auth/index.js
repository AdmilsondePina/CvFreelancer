import dotenv from "dotenv";
import nodemailer from "nodemailer";
import randomToken from "random-token";
import bcrypt from "bcrypt";
import jwt from 'jsonwebtoken';
import pg from 'pg';
import express from 'express';
const { Pool } = pg;

dotenv.config();

const router = express.Router(); // Definindo o router

// Configuração do pool para conexão com PostgreSQL
const pool = new Pool({
  user: process.env.POSTGRES_USER,
  host: 'localhost',
  database: process.env.POSTGRES_DB,
  password: process.env.POSTGRES_PASSWORD,
  port: 5432,
});

// Configuração do transporte de email
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER, // Seu email do Gmail
    pass: process.env.GMAIL_PASSWORD, // Sua senha do Gmail ou App Password
  },
});

// Função para login
export const loginRouteHandler = async (req, res, email, password) => {
  try {
    const client = await pool.connect();

    // Verificar se o utilizador existe
    const result = await client.query('SELECT * FROM users WHERE email = $1', [email]);
    const foundUser = result.rows[0];

    if (!foundUser) {
      return res.status(400).json({
        errors: [{ detail: "Credenciais não correspondem a nenhum utilizador existente" }],
      });
    }

    const validPassword = await bcrypt.compare(password, foundUser.password);
    if (validPassword) {
      // Gerar token JWT
      const token = jwt.sign(
        { id: foundUser.id, email: foundUser.email },
        process.env.JWT_SECRET,
        { expiresIn: "24h" }
      );
      return res.json({
        token_type: "Bearer",
        expires_in: "24h",
        access_token: token,
        refresh_token: token,
      });
    } else {
      return res.status(400).json({
        errors: [{ detail: "Senha inválida" }],
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erro interno do servidor" });
  }
};

// Função para registro
export const registerRouteHandler = async (req, res, name, email, password) => {
  let client;
  try {
    if (typeof password !== 'string') {
      return res.status(400).json({ message: "Password must be a string" });
    }

    client = await pool.connect();

    const result = await client.query('SELECT * FROM users WHERE email = $1', [email]);
    const foundUser = result.rows[0];

    if (foundUser) {
      return res.status(400).json({ message: "Email já está em uso" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await client.query(
      'INSERT INTO users (name, email, password) VALUES ($1, $2, $3)',
      [name, email, hashedPassword]
    );

    return res.status(201).json({ message: "utilizador registrado com sucesso" });
  } catch (error) {
    console.error("Error during user registration:", error);
    if (!res.headersSent) {
      return res.status(500).json({ error: "Internal Server Error" });
    }
  } finally {
    if (client) client.release();
  }
};


// Rota de registro
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body.data.attributes;
    await registerRouteHandler(req, res, name, email, password);
  } catch (error) {
    if (!res.headersSent) {
      res.status(500).json({ error: "Internal Server Error" });
    } else {
      console.error("Cannot send response, headers already sent.", error);
    }
  }
});



// Função para recuperação de senha
export const forgotPasswordRouteHandler = async (req, res, email) => {
  try {
    const client = await pool.connect();

    const result = await client.query('SELECT * FROM users WHERE email = $1', [email]);
    const foundUser = result.rows[0];

    if (!foundUser) {
      return res.status(400).json({
        errors: { email: ["O email não corresponde a nenhum utilizador existente."] },
      });
    } else {
      const token = randomToken(20);

      // Enviar email de redefinição de senha
      await transporter.sendMail({
        from: "admin@jsonapi.com", // endereço do remetente
        to: email, // lista de destinatários
        subject: "Redefinir Senha", // linha do assunto
        html: `<p>Você solicitou a mudança de senha. Se esta solicitação não foi feita por você, por favor, entre em contato conosco. Acesse <a href='${process.env.APP_URL_CLIENT}/auth/reset-password?token=${token}&email=${email}'>este link</a> para redefinir sua senha.</p>`, // corpo do email em HTML
      });

      // Salvar token no banco de dados
      await client.query(
        'INSERT INTO password_resets (email, token, created_at) VALUES ($1, $2, $3)',
        [email, token, new Date()]
      );

      return res.status(204).json({
        data: "password-forgot",
        attributes: {
          redirect_url: `${process.env.APP_URL_API}/password-reset`,
          email: email,
        },
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erro interno do servidor" });
  }
};

// Função para redefinir senha
export const resetPasswordRouteHandler = async (req, res) => {
  try {
    const client = await pool.connect();

    const { email, token, password, password_confirmation } = req.body.data.attributes;

    const userResult = await client.query('SELECT * FROM users WHERE email = $1', [email]);
    const foundUser = userResult.rows[0];

    const tokenResult = await client.query('SELECT * FROM password_resets WHERE token = $1', [token]);
    const foundToken = tokenResult.rows[0];

    if (!foundUser || !foundToken) {
      return res.status(400).json({
        errors: { email: ["O email ou token não correspondem a nenhum utilizador existente."] },
      });
    }

    // Validação da senha
    if (password.length < 8) {
      return res.status(400).json({
        errors: { password: ["A senha deve ter pelo menos 8 caracteres."] },
      });
    }

    if (password !== password_confirmation) {
      return res.status(400).json({
        errors: { password: ["A senha e a confirmação de senha devem corresponder."] },
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    // Atualizar a senha no banco de dados
    await client.query('UPDATE users SET password = $1 WHERE email = $2', [hashPassword, email]);

    // Deletar o token de redefinição de senha após o uso
    await client.query('DELETE FROM password_resets WHERE token = $1', [token]);

    return res.sendStatus(204);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erro interno do servidor" });
  }
};
