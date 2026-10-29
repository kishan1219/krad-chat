import { Server } from 'node:http';
import { WebSocketServer, WebSocket } from 'ws';
import { Actor, Auth } from './auth';
import { Chat } from './chat';
import { Config } from './config';

export class Realtime {
  private clients = new Map<WebSocket, Actor>();
  private wss?: WebSocketServer;
  constructor(private auth: Auth, private cfg: Config) {}
  attach(server: Server, chat: Chat) {
    this.wss = new WebSocketServer({ server, path: '/ws', maxPayload: 16384 });
    this.wss.on('connection', (socket, request) => {
      if (!this.cfg.CORS_ORIGINS.split(',').map(s => s.trim()).includes(request.headers.origin || '')) { socket.close(1008, 'Origin denied'); return; }
      const timeout = setTimeout(() => socket.close(1008, 'Authenticate first'), 10000);
      let pending = false; let count = 0; let window = Date.now();
      socket.on('message', async bytes => {
        if (pending) return;
        if (Date.now() - window > 60000) { count = 0; window = Date.now(); }
        if (++count > 120) { socket.close(1008, 'Rate limit'); return; }
        pending = true;
        try {
          const payload = JSON.parse(bytes.toString());
          const actor = await this.auth.authenticate(`Bearer ${String(payload.token || '')}`);
          // Validate the session on every command, not just initial connection.
          this.clients.set(socket, actor); clearTimeout(timeout);
          if (payload.command === 'register') socket.send(JSON.stringify({ command: 'registered', data: { id: actor.id } }));
          else if (payload.command === 'disconnect') socket.close();
          else if (['getusers','getuserwithmessage'].includes(payload.command)) socket.send(JSON.stringify({ command: payload.command, data: (await chat.conversations(actor)).data }));
          else if (payload.command === 'getmessages') socket.send(JSON.stringify({ command: payload.command, data: (await chat.messages(actor, payload)).data }));
          else if (payload.command === 'message') await chat.reply(actor, payload);
          else if (payload.command === 'readmessages') socket.send(JSON.stringify({ command: 'readmessages', data: { acknowledged: true } }));
          else socket.send(JSON.stringify({ error: true, message: 'Unsupported socket command.' }));
        } catch { socket.send(JSON.stringify({ error: true, message: 'Invalid command, expired session, or insufficient permission.' })); }
        finally { pending = false; }
      });
      socket.on('close', () => { clearTimeout(timeout); this.clients.delete(socket); });
      socket.on('error', () => { clearTimeout(timeout); this.clients.delete(socket); });
    });
  }
  async broadcast(tenant: number, event: any) {
    for (const [socket, actor] of this.clients) {
      if (actor.tenant_id !== tenant || socket.readyState !== WebSocket.OPEN) continue;
      if (event.data?.user_id && !await this.auth.mayViewUser(actor, Number(event.data.user_id))) continue;
      // Token revocation/expiry must also prevent passive subscriptions receiving data.
      // Session validation is performed against its authoritative database row by the auth service.
      if (await this.auth.sessionActive(actor)) socket.send(JSON.stringify(event));
      else socket.close(1008, 'Session expired');
    }
  }
  close() { for (const socket of this.clients.keys()) socket.close(1001, 'Server stopping'); this.wss?.close(); }
}
