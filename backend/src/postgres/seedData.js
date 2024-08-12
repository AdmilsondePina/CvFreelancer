import bcrypt from 'bcrypt';
import { dbConnect } from './index.js';

async function seedDB() {
  const client = dbConnect();
  const salt = await bcrypt.genSalt(10);
  const hashPassword = await bcrypt.hash("k1m2ll345", salt);

  const user = {
    id: 1,
    name: "Admin",
    email: "admilsonpina18@gmail.com",
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
  client.end();
}

seedDB();

