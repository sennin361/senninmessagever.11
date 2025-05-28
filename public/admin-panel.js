// 19. JavaScript (public/admin-panel.js)

let isAuthenticated = false; const correctPassword = 'sennin21345528';

function authenticate() { const input = document.getElementById('admin-password').value; if (input === correctPassword) { isAuthenticated = true; document.getElementById('auth-section').style.display = 'none'; document.getElementById('admin-section').style.display = 'block'; } else { alert('パスワードが間違っています'); } }

function sendGlobalMessage() { const message = document.getElementById('global-message').value; fetch('/admin/broadcast', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ message }) }); }

function sendRoomMessage() { const room = document.getElementById('target-room').value; const message = document.getElementById('room-message').value; fetch('/admin/room-broadcast', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ room, message }) }); }

function toggleMaintenance() { fetch('/admin/maintenance-toggle', { method: 'POST' }); }

function resetServer() { if (confirm('本当にリセットしますか？全データが削除されます。')) { fetch('/admin/reset', { method: 'POST' }); } }

function banUser() { const id = document.getElementById('ban-id').value; fetch('/admin/ban', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ id }) }); }

function loadKeywords() { fetch('/admin/keywords') .then(res => res.json()) .then(keywords => { const list = document.getElementById('keyword-list'); list.innerHTML = ''; keywords.forEach(k => { const li = document.createElement('li'); li.textContent = k; list.appendChild(li); }); }); }

setInterval(() => { fetch('/admin/connections') .then(res => res.json()) .then(data => { document.getElementById('connection-count').textContent = 接続中: ${data.count}人; });

loadKeywords(); }, 5000);

