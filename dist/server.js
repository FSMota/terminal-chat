"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// api/server.ts
require("dotenv/config"); // Carrega o .env automaticamente
const fastify_1 = __importDefault(require("fastify"));
const websocket_1 = __importDefault(require("@fastify/websocket"));
const node_crypto_1 = require("node:crypto");
const database_1 = require("./db/database");
const room_1 = require("./models/room");
const session_1 = require("./models/session");
const app = (0, fastify_1.default)({ logger: true });
let activeWsClients = 0;
// Registra o plugin de WebSocket
app.register(websocket_1.default);
// Rota de teste simples para o chat
app.register(async function chatRoutes(fastify) {
    fastify.post('/rooms/anonymous', async (request, reply) => {
        const displayName = request.body.displayName?.trim() || `anon-${(0, node_crypto_1.randomUUID)().slice(0, 8)}`;
        const roomName = request.body.roomName?.trim() || `room-${(0, node_crypto_1.randomUUID)().slice(0, 8)}`;
        const topic = request.body.topic?.trim();
        if (displayName.length < 3 || displayName.length > 30) {
            return reply.code(400).send({
                message: 'displayName deve ter entre 3 e 30 caracteres.',
            });
        }
        const now = Date.now();
        const expiresAt = new Date(now + 60 * 60 * 1000);
        try {
            const session = await session_1.Session.create({
                socketId: request.body.socketId,
                token: (0, node_crypto_1.randomUUID)(),
                displayName,
                isAnonymous: true,
                expiresAt,
            });
            const sessionId = session._id.toString();
            const room = await room_1.Room.create({
                name: roomName,
                topic,
                isAnonymous: true,
                participants: [sessionId],
                createdBySessionId: sessionId,
                hostSessionId: sessionId,
                status: 'active',
            });
            return reply.code(201).send({
                room: {
                    id: room._id,
                    name: room.name,
                    topic: room.topic,
                    status: room.status,
                    hostSessionId: room.hostSessionId,
                },
                session: {
                    id: session._id,
                    token: session.token,
                    displayName: session.displayName,
                    expiresAt: session.expiresAt,
                    isAnonymous: session.isAnonymous,
                },
            });
        }
        catch (error) {
            if (error.code === 11000) {
                return reply.code(409).send({
                    message: 'Nome de sala em uso. Tente outro roomName.',
                });
            }
            fastify.log.error(error);
            return reply.code(500).send({ message: 'Erro ao criar sala anonima.' });
        }
    });
    fastify.get('/terminal', { websocket: true }, (socket) => {
        fastify.log.info('Cliente conectado no terminal.');
        activeWsClients += 1;
        socket.on('close', () => {
            activeWsClients = Math.max(0, activeWsClients - 1);
        });
        socket.on('message', (message) => {
            socket.send(JSON.stringify({
                system: true,
                text: `Echo: ${message.toString()}`
            }));
        });
    });
    fastify.get('/health', async () => {
        return {
            status: 'ok',
            websocket: {
                route: '/terminal',
                registered: fastify.hasRoute({ method: 'GET', url: '/terminal' }),
                activeClients: activeWsClients,
            },
        };
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
