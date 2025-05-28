const socket = io();
let maintenanceMode = false;

document.getElementById('sendAllBtn').onclick = () => {
  const msg = document.getElementById('adminMessage').value;
  if (msg) socket.emit('admin_broadcast', msg);
};

document.getElementById('sendRoomBtn').onclick = () => {
  const msg = document.getElementById('adminMessage').value;
  const room = document.getElementById('targetRoom').value;
  if (msg && room) socket.emit('admin_room_broadcast', { room, message: msg });
};

document.getElementById('banUserBtn').onclick = () => {
  const userId = document.getElementById('banUserId').value;
  if (userId) socket.emit('ban_user', userId);
};

document.getElementById('resetServerBtn').onclick = () => {
  if (confirm('本当にサーバーをリセットしますか？')) {
    socket.emit('reset_server');
  }
};

document.getElementById('toggleMaintenanceBtn').onclick = () => {
  maintenanceMode = !maintenanceMode;
  socket.emit('toggle_maintenance', maintenanceMode);
  document.getElementById('maintenanceStatus').innerText =
    maintenanceMode ? 'オン' : 'オフ';
};

socket.on('user_count', (count) => {
  document.getElementById('userCount').innerText = `現在の接続ユーザー数: ${count}`;
});

socket.on('keyword_list', (keywords) => {
  const keywordList = document.getElementById('keywordList');
  keywordList.innerHTML = '';
  keywords.forEach((word) => {
    const li = document.createElement('li');
    li.textContent = word;
    keywordList.appendChild(li);
  });
});

document.getElementById('refreshKeywordsBtn').onclick = () => {
  socket.emit('get_keywords');
};

// 管理パスワードチェック
window.onload = () => {
  const password = prompt('管理画面パスワードを入力してください:');
  if (password !== 'sennin21345528') {
    alert('パスワードが違います');
    document.body.innerHTML = '<h1>アクセス拒否</h1>';
  } else {
    socket.emit('get_keywords');
    socket.emit('get_user_count');
  }
};
