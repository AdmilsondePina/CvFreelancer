import bcrypt from 'bcrypt';
import { connectDB, disconnectDB, createUserTable, insertUser, findUserByEmail } from './index.js';

const ReseedAction = async () => {
  async function clear() {
    try {
      await connectDB(); // Conecta ao banco de dados
      await client.query('DELETE FROM users'); // Limpa a tabela de utilizadors
      console.log("DB cleared");
    } catch (error) {
      console.error("Error clearing DB", error.stack);
    } finally {
      await disconnectDB(); // Desconecta do banco de dados
    }
  }

  async function seedDB() {
    await clear(); // Limpa a tabela antes de inserir dados

    try {
      await connectDB(); // Conecta ao banco de dados
      const salt = await bcrypt.genSalt(10);
      const hashPassword = await bcrypt.hash("secret", salt);

      const user = {
        id: 1,
        name: "Admin",
        email: "admin@jsonapi.com",
        password: hashPassword,
        created_at: new Date(),
        profile_image: "../../images/admin.jpg",
      };

      const query = `
        INSERT INTO users (id, name, email, password, created_at, profile_image)
        VALUES ($1, $2, $3, $4, $5, $6)
      `;
      await client.query(query, [user.id, user.name, user.email, user.password, user.created_at, user.profile_image]);

      console.log("DB seeded");
    } catch (error) {
      console.error("Error seeding DB", error.stack);
    } finally {
      await disconnectDB(); // Desconecta do banco de dados
    }
  }

  await seedDB(); // Executa a função seedDB
};

export default ReseedAction;
