// api/server.ts
import 'dotenv/config'; // Carrega o .env automaticamente
import Fastify from 'fastify';
import fastifyWebsocket from '@fastify/websocket';
import { connectDB } from './db/database';

const app = Fastify({ logger: true });
let activeWsClients = 0;

// Registra o plugin de WebSocket
app.register(fastifyWebsocket);

// Rota de teste simples para o chat
app.register(async function chatRoutes(fastify) {
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