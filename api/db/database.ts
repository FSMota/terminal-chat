// api/db/database.ts
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const DB_USERNAME = process.env.DB_USERNAME;
const DB_PASSWORD = process.env.DB_PASSWORD;
const DB_CLUSTER = process.env.DB_CLUSTER;
const DB_APP_NAME = process.env.DB_APP_NAME;

export async function connectDB() {
  const uri = `mongodb+srv://${DB_USERNAME}:${DB_PASSWORD}@${DB_CLUSTER}/?appName=${DB_APP_NAME}&retryWrites=true&w=majority`;

  if (!uri) {
    throw new Error('A variável de ambiente MONGODB_URI não está definida.');
  }

  try {
    // Tenta conectar ao banco de dados
    await mongoose.connect(uri);
    console.log('📦 Conectado ao MongoDB com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao conectar ao MongoDB:', error);
    // Encerra o processo caso o banco falhe, pois a API não funciona sem ele
    process.exit(1); 
  }
}