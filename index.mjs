import WebSocket from 'ws'
import { createServer } from 'http'
import { unlinkSync as rm, chmodSync as chmod, mkdirSync as mkdir, readdirSync as ls } from 'fs'
import { resolve } from 'path'
import net from 'net'

const __filename = decodeURIComponent(new URL(import.meta.url).pathname);

const sockDir = resolve(__filename, '..', 'sockets');

try{ mkdir(sockDir) } catch(e){}
try{ for(const file of ls(sockDir)) rm(`${sockDir}/${file}`) } catch(e){}

const args = process.argv.slice(2);
const verbose = args[0] === '-v';
if(verbose) args.shift();

for(const arg of args){
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
    client.pipe(wsStream).pipe(client);
    client.connect({ host, port });
    if(verbose){
        client.on('data', data => console.log('GOT:', data));
        wsStream.on('data', data => console.log('SENT:', data));
    }
}
