import express from 'express';
const router = express.Router();
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken'; // Certifique-se de importar jwt para gerar tokens
import {
  forgotPasswordRouteHandler,
  registerRouteHandler,
  resetPasswordRouteHandler,
} from '../../services/auth/index.js';
import { findUserByEmail } from '../../schemas/user.schema.js'; 



router.post('/login', async (req, res) => {
  try {
   
    if (!req.body || !req.body.data || !req.body.data.attributes) {
      return res.status(400).json({ error: "Invalid request format" });
    }
    const { email, password } = req.body.data.attributes;

    const user = await findUserByEmail(email);
    if (!user) {
      console.log('User not found');
      return res.status(401).json({ error: "User not found" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      console.log('Invalid password');
      return res.status(401).json({ error: "Invalid password" });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
    return res.json({ token });

  } catch (error) {
    console.error('Error during login:', error);
    if (!res.headersSent) {
      return res.status(500).json({ error: "Internal Server Error" });
    }
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
    if (!res.headersSent) {
      res.status(500).json({ error: "Internal Server Error" });
    } else {
      console.error("Cannot send response, headers already sent.", error);
    }
  }
});


router.post("/password-forgot", async (req, res) => {
  try {
    const { email } = req.body.data.attributes;
    await forgotPasswordRouteHandler(req, res, email);
  } catch (error) {
    if (!res.headersSent) {
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }
});


router.post("/password-reset", async (req, res) => {
  
  try {
    await resetPasswordRouteHandler(req, res);
  } catch (error) {
    if (!res.headersSent) {
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }
});


export default router;
