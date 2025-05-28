// 3. JavaScript（public/main.js） // ファイル名を public/main.js から public/chat.js に変更

// チャットアプリのクライアント側ロジック const socket = io();

const chatWindow = document.getElementById('chatWindow'); const messageInput = document.getElementById('messageInput'); const sendButton = document.getElementById('sendButton'); const roomInput = document.getElementById('keyword'); const joinRoomBtn = document.getElementById('joinRoom'); const leaveRoomBtn = document.getElementById('leaveRoom'); const mediaInput = document.getElementById('mediaInput');

let currentRoom = ''; let userId = localStorage.getItem('userId') || Math.random().toString(36).substring(2); localStorage.setItem('userId', userId);

function appendMessage(data, isOwn) { const div = document.createElement('div'); div.className = message ${isOwn ? 'own' : 'other'};

if (data.type === 'image') { div.innerHTML = <img src="${data.content}" /><div class="meta">${data.time} ${data.read ? '既読' : ''}</div>; } else if (data.type === 'video') { div.innerHTML = <video src="${data.content}" controls></video><div class="meta">${data.time} ${data.read ? '既読' : ''}</div>; } else { div.innerHTML = <p>${data.content}</p><div class="meta">${data.time} ${data.read ? '既読' : ''}</div>; }

chatWindow.appendChild(div); chatWindow.scrollTop = chatWindow.scrollHeight; }

sendButton.onclick = () => { const text = messageInput.value; if (text.trim() === '') return; const encrypted = encryptMessage(text); socket.emit('chat message', { room: currentRoom, content: encrypted, type: 'text', userId }); messageInput.value = ''; };

joinRoomBtn.onclick = () => { const room = roomInput.value.trim(); if (!room) return; currentRoom = room; socket.emit('join room', room); chatWindow.innerHTML = ''; };

leaveRoomBtn.onclick = () => { socket.emit('leave room', currentRoom); currentRoom = ''; chatWindow.innerHTML = ''; };

mediaInput.onchange = () => { const file = mediaInput.files[0]; const reader = new FileReader(); reader.onload = function () { const result = reader.result; const type = file.type.startsWith('video') ? 'video' : 'image'; const encrypted = encryptMessage(result); socket.emit('chat message', { room: currentRoom, content: encrypted, type, userId }); }; reader.readAsDataURL(file); };

socket.on('chat message', msg => { const decrypted = decryptMessage(msg.content); appendMessage({ ...msg, content: decrypted }, msg.userId === userId); });

window.addEventListener('load', () => { if ('serviceWorker' in navigator) { navigator.serviceWorker.register('/sw.js'); } });

