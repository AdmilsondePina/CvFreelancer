import bcrypt from "bcrypt";
import dotenv from 'dotenv';
import { findUserByEmail, updateUserProfile } from "../../schemas/user.schema.js";

import jwt from 'jsonwebtoken';

dotenv.config();

export const getProfileRouteHandler = (req, res) => {
  const meUser = req.user;
  const sentData = {
    data: {
      type: 'users',
      id: meUser.id,
      attributes: {
        name: meUser.name,
        email: meUser.email,
        profile_image: meUser.profile_image || null,
        createdAt: meUser.created_at,
        updatedAt: meUser.updated_at
      },
      links: {
        self: `${process.env.APP_URL_API}/users/${meUser.id}`
      }
    }
  };
  res.send(sentData);
};


export const patchProfileRouteHandler = async (req, res) => {
  const currentDataOfUser = req.user;
  const { name, email, newPassword, confirmPassword } = req.body.data.attributes;
  
  // Fetch the user from the database
  const foundUser = await findUserByEmail(currentDataOfUser.email);

  if (!foundUser) {
    return res.status(400).json({ error: 'Nenhum utilizador corresponde às credenciais' });
  }

  // Validation checks
  if (newPassword && (newPassword.length < 8 || newPassword !== confirmPassword)) {
    return res.status(400).json({ errors: { password: ["A palavra-passe deve ter pelo menos 8 caracteres e corresponder à confirmação da palavra-passe."] } });
  }

  // Update user data
  try {
    const updatedFields = { name, email };
    if (newPassword && newPassword.length >= 8 && newPassword === confirmPassword) {
      const salt = await bcrypt.genSalt(10);
      const hashPassword = await bcrypt.hash(newPassword, salt);
      updatedFields.password = hashPassword;
    }

    await updateUser(foundUser.id, updatedFields);

    const sentData = {
      data: {
        type: 'users',
        id: foundUser.id,
        attributes: {
          name: name,
          email: email,
          profile_image: null,
        }
      }
    };
    res.send(sentData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao atualizar o perfil' });
  }
};
