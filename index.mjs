import WebSocket from 'ws'
import { createServer } from 'http'
import { rmdirSync as rm, chmodSync as chmod, mkdirSync as mkdir } from 'fs'
import { resolve } from 'path'
import net from 'net'

const __filename = decodeURIComponent(new URL(import.meta.url).pathname);

const sockDir = resolve(__filename, '..', 'sockets');

try{ rm(sockDir, { recursive: true }) } catch(e){}
try{ mkdir(sockDir) } catch(e){}

for(const arg of process.argv.slice(2)){
    let [ hostport, name, mode ] = arg.split(',');
    let [ host, port ] = hostport.split(':');
    if(!host) host = '127.0.0.1';
    port = +port;
    if(mode === undefined) mode = 0o777;
    else mode = parseInt(mode, 8);
    const server = createServer();
    const sockPath = `${sockDir}/${name}.sock`;
    server.listen(sockPath, () => chmod(sockPath, mode));
    const ws = new WebSocket.Server({ server });
    const wsStream = WebSocket.createWebSocketStream(ws);
    const client = new net.Socket();
    client.pipe(wsStream).pipe(client)
}
