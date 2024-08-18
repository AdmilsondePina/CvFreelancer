import express from "express";
import passport from "passport";
import Joi from 'joi';
import bcrypt from 'bcrypt'; // Não se esqueça de importar o bcrypt
import { findUserByEmail, updateUserProfile } from "../../schemas/user.schema.js";

const router = express.Router();

// Esquema de validação com Joi
const userSchema = Joi.object({
  name: Joi.string().optional(),
  email: Joi.string().email().optional(),
  password: Joi.string().min(6).optional(),
  profile_image: Joi.string().uri().optional(),
});

// Rota para obter o perfil do usuário
router.post("/", passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const email = req.user.email;
    const user = await findUserByEmail(email);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.json({
      data: {
        type: 'users',
        id: user.id,
        attributes: {
          name: user.name,
          email: user.email,
          profile_image: user.profile_image || null,
          createdAt: user.created_at
        }
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro interno ao obter o perfil" });
  }
});

// Rota para atualizar o perfil do usuário
router.patch("/", passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    // Validação dos dados recebidos
    const { error } = userSchema.validate(req.body.data.attributes);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const email = req.user.email;
    const { name, email: newEmail, password, profile_image } = req.body.data.attributes;

    const user = await findUserByEmail(email);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Atualizar campos
    const updatedFields = {
      name: name || user.name,
      email: newEmail || user.email,
      profile_image: profile_image || user.profile_image
    };

    if (password) {
      const salt = await bcrypt.genSalt(10);
      updatedFields.password = await bcrypt.hash(password, salt);
    }

    const updatedUser = await updateUserProfile(user.id, updatedFields);

    if (!updatedUser) {
      return res.status(400).json({ error: "Falha ao atualizar o perfil" });
    }

    return res.json({
      data: {
        type: 'users',
        id: updatedUser.id,
        attributes: {
          name: updatedUser.name,
          email: updatedUser.email,
          profile_image: updatedUser.profile_image
        }
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro interno ao atualizar o perfil" });
  }
});

export default router;


