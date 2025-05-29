// server.js
const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');
const fs = require('fs');
const crypto = require('crypto');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

// チャット履歴保存用
let chatLogs = [];
let connectedUsers = {};
let bannedUsers = new Set();
let maintenanceMode = false;

// AES鍵とIV
const AES_KEY = crypto.randomBytes(32); // 256bit
const AES_IV = crypto.randomBytes(16);  // 128bit

// 静的ファイル
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// 管理画面パスワード
const ADMIN_PASSWORD = 'sennin21345528';

// 管理画面表示
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// 管理API：パスワード認証
app.post('/admin/login', (req, res) => {
  const { password } = req.body;
  res.json({ success: password === ADMIN_PASSWORD });
});

// 管理API：現在のユーザー数
app.get('/admin/users', (req, res) => {
  res.json({ count: Object.keys(connectedUsers).length });
});

// 管理API：チャットログ
app.get('/admin/logs', (req, res) => {
  res.json(chatLogs);
});

// 管理API：キーワード抽出
app.get('/admin/keywords', (req, res) => {
  const keywords = new Set();
  chatLogs.forEach(log => {
    const match = log.message.match(/あいことば[:：]\s*(\S+)/);
    if (match) keywords.add(match[1]);
  });
  res.json(Array.from(keywords));
});

// 管理API：BAN
app.post('/admin/ban', (req, res) => {
  const { id } = req.body;
  if (connectedUsers[id]) {
    bannedUsers.add(id);
    connectedUsers[id].disconnect();
    delete connectedUsers[id];
  }
  res.json({ success: true });
});

// 管理API：サーバーリセット
app.post('/admin/reset', (req, res) => {
  chatLogs = [];
  bannedUsers.clear();
  maintenanceMode = false;
  io.emit('serverReset');
  res.json({ success: true });
});

// 管理API：メンテナンス切替
app.post('/admin/maintenance', (req, res) => {
  maintenanceMode = req.body.enabled;
  io.emit('maintenance', maintenanceMode);
  res.json({ success: true });
});

// Socket.io
io.on('connection', (socket) => {
  const userId = socket.id;
  connectedUsers[userId] = socket;

  socket.on('join', (data) => {
    if (bannedUsers.has(userId)) return socket.disconnect();
    if (maintenanceMode) return socket.emit('maintenance', true);
    socket.join(data.room);
    io.to(data.room).emit('log', `${data.name}が入室しました`);
  });

  socket.on('chat message', (data) => {
    const timestamp = new Date().toISOString();
    const encrypted = encryptMessage(data.message);
    const log = { ...data, message: data.message, time: timestamp };
    chatLogs.push(log);
    io.to(data.room).emit('chat message', {
      ...data,
      encrypted,
      time: timestamp,
    });
  });

  socket.on('read', (data) => {
    io.to(data.room).emit('read', data);
  });

  socket.on('image', (data) => {
    const log = { ...data, time: new Date().toISOString() };
    chatLogs.push(log);
    io.to(data.room).emit('image', log);
  });

  socket.on('video', (data) => {
    const log = { ...data, time: new Date().toISOString() };
    chatLogs.push(log);
    io.to(data.room).emit('video', log);
  });

  socket.on('disconnect', () => {
    delete connectedUsers[userId];
    io.emit('log', `${userId}が退室しました`);
  });
});

// AES暗号化関数
function encryptMessage(text) {
  const cipher = crypto.createCipheriv('aes-256-cbc', AES_KEY, AES_IV);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
}

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
