"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// api/server.ts
require("dotenv/config"); // Carrega o .env automaticamente
const fastify_1 = __importDefault(require("fastify"));
const websocket_1 = __importDefault(require("@fastify/websocket"));
const database_1 = require("./db/database");
const app = (0, fastify_1.default)({ logger: true });
// Registra o plugin de WebSocket
app.register(websocket_1.default);
// Rota de teste simples para o chat
app.register(async function chatRoutes(fastify) {
    fastify.get('/terminal', { websocket: true }, (connection) => {
        fastify.log.info('Cliente conectado no terminal.');
        connection.socket.on('message', (message) => {
            connection.socket.send(JSON.stringify({
                system: true,
                text: `Echo: ${message.toString()}`
            }));
        });
    });
});
// Função principal de inicialização
const start = async () => {
    try {
        // 1. Conecta ao banco de dados PRIMEIRO
        await (0, database_1.connectDB)();
        // 2. Inicia o servidor Fastify DEPOIS
        const port = Number(process.env.PORT) || 3000;
        await app.listen({ port });
        console.log(`🚀 Terminal Server rodando em ws://localhost:${port}/terminal`);
    }
    catch (err) {
        app.log.error(err);
        process.exit(1);
    }
};
start();
