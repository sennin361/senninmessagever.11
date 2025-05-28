const socket = io();

const messageForm = document.getElementById("messageForm");
const messageInput = document.getElementById("messageInput");
const chatMessages = document.getElementById("chatMessages");
const roomInput = document.getElementById("roomInput");
const joinRoomBtn = document.getElementById("joinRoomBtn");
const leaveRoomBtn = document.getElementById("leaveRoomBtn");
const userList = document.getElementById("userList");

let currentRoom = null;

function appendMessage(message, isSent, time, isRead) {
  const div = document.createElement("div");
  div.classList.add("message");
  if (isSent) div.classList.add("sent");
  div.innerHTML = `
    <div>${message}</div>
    <div class="message-footer">
      <span>${time}</span>
      ${isSent && isRead ? '<span>既読</span>' : ""}
    </div>
  `;
  chatMessages.appendChild(div);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

messageForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const message = messageInput.value.trim();
  if (message && currentRoom) {
    const timestamp = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    socket.emit("chat message", { room: currentRoom, message, time: timestamp });
    appendMessage(message, true, timestamp, false);
    messageInput.value = "";
  }
});

joinRoomBtn.addEventListener("click", () => {
  const room = roomInput.value.trim();
  if (room) {
    socket.emit("join room", room);
    currentRoom = room;
  }
});

leaveRoomBtn.addEventListener("click", () => {
  if (currentRoom) {
    socket.emit("leave room", currentRoom);
    currentRoom = null;
    chatMessages.innerHTML = "";
  }
});

socket.on("chat message", ({ message, time }) => {
  appendMessage(message, false, time, true);
});

socket.on("user count", (count) => {
  userList.textContent = `接続中ユーザー: ${count}`;
});
