import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken'; // Certifique-se de importar jwt para gerar tokens
import {
  forgotPasswordRouteHandler,
  registerRouteHandler,
  resetPasswordRouteHandler,
} from '../../services/auth/index.js';
import { findUserByEmail } from '../../schemas/user.schema.js'; 

const router = express.Router();

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body.data.attributes;
    
    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid password" });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/logout", (req, res) => {
  return res.sendStatus(204);
});

router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body.data.attributes;
    await registerRouteHandler(req, res, name, email, password);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/password-forgot", async (req, res) => {
  try {
    const { email } = req.body.data.attributes;
    await forgotPasswordRouteHandler(req, res, email);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/password-reset", async (req, res) => {
  try {
    await resetPasswordRouteHandler(req, res);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
