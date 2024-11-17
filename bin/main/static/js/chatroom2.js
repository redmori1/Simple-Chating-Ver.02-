var stompClient = null;
var roomId = null;

function connect() {
    var socket = new SockJS('/ws');
    stompClient = Stomp.over(socket);
    stompClient.connect({}, function (frame) {
        console.log('Connected: ' + frame);
        stompClient.subscribe('/topic/public/' + roomId, function (messageOutput) {
            var message = JSON.parse(messageOutput.body);
            showReceivedMessage(message);
            stompClient.send("/app/chat.sendMessage/" + roomId, {}, JSON.stringify(sender.value + "님이 입장하였습니다."));
        });
    });
}

function sendMessage() {
    var message = {
        'sender': document.getElementById('sender').value,
        'content': document.getElementById('content').value,
        'chatRoom': { 'id': roomId }
    };
    stompClient.send("/app/chat.sendMessage/" + roomId, {}, JSON.stringify(message));
    showSendingMessage(message);
}


function showSendingMessage(message) {
    var sending = document.getElementById('sending');
    var div = document.createElement('div');
    div.className = 'chat-message-right pb-4';
    div.innerHTML = `
                <div>
                    <div class="text-muted small text-nowrap mt-2">${new Date().toLocaleString()}</div>
                </div>
                <div class="flex-shrink-1 bg-light rounded py-2 px-3 mr-3">
                    <div class="font-weight-bold mb-1" id="nickname">${message.sender}</div>
                    ${message.content}
                </div>
            `;
    sending.appendChild(div);
    if (message.fileName) {
        var link = document.createElement('a');
        link.href = '/uploads/' + message.fileName;
        link.textContent = message.fileName;
        sending.appendChild(link);
    }
}

function showReceivedMessage(message) {
    var response = document.getElementById('response');
    if (message.sender === document.getElementById("sender").value) {
        return;
    }
    var div = document.createElement('div');
    div.className = 'chat-message-left pb-4';
    div.innerHTML = `
        <div>
            <div class="text-muted small text-nowrap mt-2">${message.timestamp}</div>
        </div>
        <div class="flex-shrink-1 bg-light rounded py-2 px-3 mr-3">
            <div class="font-weight-bold mb-1" id="nickname">${message.sender}</div>
            ${message.content}
        </div>
    `;
    response.appendChild(div);
    if (message.fileName) {
        var link = document.createElement('a');
        link.href = '/uploads/' + message.fileName;
        link.textContent = message.fileName;
        response.appendChild(link);
    }
}


function joinRoom() {
    var roomIdInput = document.getElementById('roomId').value;
    var password = document.getElementById('password').value;
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "/joinRoom", true);
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.onload = function () {
        if (xhr.status === 200 && xhr.responseText === "success") {
            roomId = roomIdInput;
            connect();
            var xhrMessages = new XMLHttpRequest();
            xhrMessages.open("GET", "/getPreviousMessages?roomId=" + roomIdInput, true);
            xhrMessages.onload = function () {
                if (xhrMessages.status === 200) {
                    var responseData = JSON.parse(xhrMessages.responseText);
                    if (Array.isArray(responseData)) {
                        responseData.forEach(function (message) {
                            if (message.sender === document.getElementById("sender").value) {
                                showSendingMessage(message);
                            } else {
                                showReceivedMessage(message);
                            }
                        });
                    } else {
                        console.error("응답 데이터가 배열이 아닙니다");
                    }
                } else {
                    console.error("Failed to retrieve previous messages");
                }
            };
            xhrMessages.send();
            // 사용자가 방에 참여할 때 서버로 메시지 전송
            stompClient.send("/app/chat.addUser", {}, JSON.stringify({ 'sender': document.getElementById('sender').value }));
        } else {
            alert("해당 하는 방에 입장이 실패했습니다 방의 아이디와 비밀번호를 확인해주세요.");
        }
    };
    xhr.send("roomId=" + roomIdInput + "&password=" + password);
}


function createRoom() {
    var name = document.getElementById('newRoomName').value;
    var password = document.getElementById('newRoomPassword').value;

    var xhr = new XMLHttpRequest();
    xhr.open("POST", "/createRoom", true);
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.onload = function () {
        if (xhr.status === 200) {
            var room = JSON.parse(xhr.responseText);
            alert("방 생성이 완료되었습니다. 생성된 채팅 방 번호는  " + room.id + "입니다");
        } else {
            alert("방 생성이 실패했습니다. 잠시후에 다시 시도해주세요");
        }
    };
    xhr.send("name=" + name + "&password=" + password);
}

function uploadFile() {
    var formData = new FormData();
    formData.append("file", document.getElementById('file').files[0]);

    var xhr = new XMLHttpRequest();
    xhr.open("POST", "/uploadFile", true);
    xhr.onload = function () {
        if (xhr.status === 200) {
            console.log("File uploaded successfully");
        } else {
            console.error("File upload failed");
        }
    };
    xhr.send(formData);
}
