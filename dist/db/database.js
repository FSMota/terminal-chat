"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = connectDB;
// api/db/database.ts
const mongoose_1 = __importDefault(require("mongoose"));
async function connectDB() {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
        throw new Error('A variável de ambiente MONGODB_URI não está definida.');
    }
    try {
        // Tenta conectar ao banco de dados
        await mongoose_1.default.connect(uri);
        console.log('📦 Conectado ao MongoDB com sucesso!');
    }
    catch (error) {
        console.error('❌ Erro ao conectar ao MongoDB:', error);
        // Encerra o processo caso o banco falhe, pois a API não funciona sem ele
        process.exit(1);
    }
}
