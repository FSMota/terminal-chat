import { fastify } from 'fastify';


const server = fastify();

// change host to local host
server.listen({ port: 8080, host: '127.0.0.1' }, (err, address) => { if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server is running at ${address}`);
});

server.get('/hello', async (request, reply) => {
  return { message: 'Hello, World!' };
});

export default server;