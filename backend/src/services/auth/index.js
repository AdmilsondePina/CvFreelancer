import dotenv from "dotenv";
import nodemailer from "nodemailer";
import randomToken from "random-token";
import bcrypt from "bcrypt";
import jwt from 'jsonwebtoken';
import pg from 'pg';
const { Pool } = pg;

dotenv.config();

// Configuração do pool para conexão com PostgreSQL
const pool = new Pool({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT,
});

// Configuração do transporte de email
const transporter = nodemailer.createTransport({
  host: "smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: process.env.MAILTRAP_USER,
    pass: process.env.MAILTRAP_PASSWORD,
  },
});

// Função para login
export const loginRouteHandler = async (req, res, email, password) => {
  try {
    const client = await pool.connect();

    // Verificar se o usuário existe
    const result = await client.query('SELECT * FROM users WHERE email = $1', [email]);
    const foundUser = result.rows[0];

    if (!foundUser) {
      return res.status(400).json({
        errors: [{ detail: "Credenciais não correspondem a nenhum usuário existente" }],
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
  try {
    const client = await pool.connect();

    // Verificar se o usuário já existe
    const result = await client.query('SELECT * FROM users WHERE email = $1', [email]);
    const foundUser = result.rows[0];

    if (foundUser) {
      return res.status(400).json({ message: "Email já está em uso" });
    }

    // Verificar se a senha existe e tem pelo menos 8 caracteres
    if (!password || password.length < 8) {
      return res.status(400).json({ message: "A senha deve ter pelo menos 8 caracteres." });
    }

    // Hash da senha para salvar no banco de dados
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    // Inserir novo usuário no banco de dados
    await client.query(
      'INSERT INTO users (name, email, password) VALUES ($1, $2, $3)',
      [name, email, hashPassword]
    );

    // Gerar token JWT
    const token = jwt.sign({ email: email }, process.env.JWT_SECRET, { expiresIn: "24h" });
    return res.status(200).json({
      token_type: "Bearer",
      expires_in: "24h",
      access_token: token,
      refresh_token: token,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erro interno do servidor" });
  }
};

// Função para recuperação de senha
export const forgotPasswordRouteHandler = async (req, res, email) => {
  try {
    const client = await pool.connect();

    const result = await client.query('SELECT * FROM users WHERE email = $1', [email]);
    const foundUser = result.rows[0];

    if (!foundUser) {
      return res.status(400).json({
        errors: { email: ["O email não corresponde a nenhum usuário existente."] },
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
        errors: { email: ["O email ou token não correspondem a nenhum usuário existente."] },
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
