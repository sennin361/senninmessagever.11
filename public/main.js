const socket = io();
const chat = document.getElementById('chat');
const form = document.getElementById('messageForm');
const input = document.getElementById('messageInput');
const imageInput = document.getElementById('imageInput');
const leaveBtn = document.getElementById('leaveBtn');
const roomList = document.getElementById('roomList');

// ルーム情報（クエリやセッションから取得可能）
const room = sessionStorage.getItem('room') || prompt("あいことばを入力してください");
sessionStorage.setItem('room', room);
socket.emit('joinRoom', room);

socket.on('chatMessage', ({ message, time, sender, read }) => {
  const div = document.createElement('div');
  div.classList.add('chat-bubble');
  if (sender === socket.id) div.classList.add('self');

  div.innerHTML = `
    <div>${message}</div>
    <div class="meta">
      <span>${time}</span>
      ${read && sender === socket.id ? '<span>既読</span>' : ''}
    </div>
  `;
  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
});

form.addEventListener('submit', (e) => {
  e.preventDefault();
  if (!input.value.trim()) return;

  const msg = input.value;
  const time = new Date().toLocaleTimeString();
  socket.emit('chatMessage', { message: msg, time, room });
  input.value = '';
});

leaveBtn.addEventListener('click', () => {
  socket.emit('leaveRoom', room);
  sessionStorage.removeItem('room');
  location.reload();
});

socket.on('roomList', (rooms) => {
  roomList.innerHTML = '';
  rooms.forEach(r => {
    const li = document.createElement('li');
    li.textContent = r;
    li.addEventListener('click', () => {
      sessionStorage.setItem('room', r);
      location.reload();
    });
    roomList.appendChild(li);
  });
});

imageInput.addEventListener('change', () => {
  const file = imageInput.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    const msg = `<img src="${reader.result}" style="max-width: 200px;" />`;
    const time = new Date().toLocaleTimeString();
    socket.emit('chatMessage', { message: msg, time, room });
  };
  reader.readAsDataURL(file);
});

socket.emit('getRoomList');
