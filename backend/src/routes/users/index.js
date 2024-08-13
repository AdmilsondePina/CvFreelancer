import express from 'express';
import { getAllUsers } from '../../schemas/user.schema.js'; // Função que faz a consulta ao banco de dados

const router = express.Router();

router.get('/', async (req, res) => {
  const users = await getAllUsers(); // Faz a consulta para buscar todos os usuários

  res.send({
    data: users.map(user => ({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
    })),
  });
});

export default router;

