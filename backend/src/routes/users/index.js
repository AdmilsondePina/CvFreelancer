import express from 'express';
import { getAllUsers } from '../../schemas/user.schema.js'; // Função que faz a consulta ao banco de dados

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const users = await getAllUsers(); // Faz a consulta para buscar todos os utilizadors
    res.send({
      data: users.map(user => ({
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
      })),
    });
  } catch (error) {
    res.status(500).send({ error: 'Failed to retrieve users' });
  }
});

export default router;
