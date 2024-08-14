import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import authRoutes from './routes/auth/index.js'; // Certifique-se de que este caminho está correto
import meRoutes from './routes/me/index.js';
import userRoutes from './routes/users/index.js';
import { connectDB } from './postgres/index.js'; 
import cron from 'node-cron';
import ReseedAction from './postgres/ReseedAction.js'; 

dotenv.config();

const PORT = process.env.PORT || 5000;
const app = express();

const whitelist = [process.env.APP_URL_CLIENT];
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
};

connectDB();

app.use(cors(corsOptions));
app.use(bodyParser.json({ type: "application/vnd.api+json", strict: false }));

app.get("/", function (req, res) {
  const __dirname = fs.realpathSync(".");
  res.sendFile(path.join(__dirname, "/src/landing/index.html"));
});

app.use("/auth", authRoutes);  // Verifique se a rota está corretamente configurada
app.use("/me", meRoutes);
app.use("/users", userRoutes);

if (process.env.SCHEDULE_HOUR) {
  cron.schedule(`0 */${process.env.SCHEDULE_HOUR} * * *`, () => {
    ReseedAction();
  });
}

app.listen(PORT, () => console.log(`Server listening to port ${PORT}`));



