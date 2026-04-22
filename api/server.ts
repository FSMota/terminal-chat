// api/server.ts
import 'dotenv/config'; // Carrega o .env automaticamente
import Fastify from 'fastify';
import fastifyWebsocket from '@fastify/websocket';
import { randomUUID } from 'node:crypto';
import { connectDB } from './db/database';
import { Room } from './models/room';
import { Session } from './models/session';

const app = Fastify({ logger: true });
let activeWsClients = 0;

// Registra o plugin de WebSocket
app.register(fastifyWebsocket);

// Rota de teste simples para o chat
app.register(async function chatRoutes(fastify) {
  fastify.post<{
    Body: {
      roomName?: string;
      topic?: string;
      displayName?: string;
      socketId?: string;
    }
  }>('/rooms/anonymous', async (request, reply) => {
    const displayName = request.body.displayName?.trim() || `anon-${randomUUID().slice(0, 8)}`;
    const roomName = request.body.roomName?.trim() || `room-${randomUUID().slice(0, 8)}`;
    const topic = request.body.topic?.trim();

    if (displayName.length < 3 || displayName.length > 30) {
      return reply.code(400).send({
        message: 'displayName deve ter entre 3 e 30 caracteres.',
      });
    }

    const now = Date.now();
    const expiresAt = new Date(now + 60 * 60 * 1000);

    try {
      const session = await Session.create({
        socketId: request.body.socketId,
        token: randomUUID(),
        displayName,
        isAnonymous: true,
        expiresAt,
      });

      const sessionId = session._id.toString();
      const room = await Room.create({
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
    } catch (error) {
      if ((error as { code?: number }).code === 11000) {
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

    socket.on('message', (message: Buffer) => {
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
    await connectDB();

    // 2. Inicia o servidor Fastify DEPOIS
    const port = Number(process.env.PORT) || 3000;
    await app.listen({ port });
    console.log(`🚀 Terminal Server rodando em ws://localhost:${port}/terminal`);
    
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();