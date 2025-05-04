import express from 'express';
import { createServer } from 'http';
import { Server as SocketIO } from 'socket.io';
import { SerialPort, ReadlineParser } from 'serialport';

const app = express();
const httpServer = createServer(app);
const io = new SocketIO(httpServer);

app.use(express.static('public'));

const port = new SerialPort({  path: 'COM6', baudRate: 9600 });
const parser = port.pipe(new ReadlineParser());

parser.on('data', line => {
  // Broadcast update dari Arduino ke semua klien
  io.emit('status', line.trim());
});

io.on('connection', socket => {
  console.log('Klien terhubung:', socket.id);
  socket.on('command', cmd => {
    // Kirim perintah ke Arduino lewat serial
    port.write(cmd + '\n');
  });
});

httpServer.listen(3000, () => {
  console.log('Server berjalan di http://localhost:3000');
});
