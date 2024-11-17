var stompClient = null;
var roomId = null;
var NewChat = 0;
if(NewChat >= 1){
    var NewChatCount = document.getElementById("New_Cheating");
    NewChatCount.hidden = false;
    NewChatCount.text = NewChat;
}
function connect() {
    var socket = new SockJS('/ws');
    stompClient = Stomp.over(socket);
    stompClient.connect({}, function (frame) {
        console.log('Connected: ' + frame);
        stompClient.subscribe('/topic/public/' + roomId, function (messageOutput) {
            var message = JSON.parse(messageOutput.body);
            showReceivedMessage(message);
        });
        stompClient.subscribe('/topic/' + roomId + '/activeUsers', function(message) {
            var users = JSON.parse(message.body);
            document.getElementById("chat_status2").innerText = "채팅방 연결됨";
            updateActiveUsers(users);
        });
        RequestUserList(roomId);
    });
}

function sendMessage() {
    var message = {
        'sender': nickname,
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
    if (message.sender === nickname) {
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
    NewChat++;
    if (message.fileName) {
        var link = document.createElement('a');
        link.href = '/uploads/' + message.fileName;
        link.textContent = message.fileName;
        response.appendChild(link);
    }
}


function joinRoom() {
    // var roomIdInput = document.getElementById('roomId').value;
    // var password = document.getElementById('password').value;
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "/joinChatroom", true);
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.onload = function () {
        if (xhr.status === 200 && xhr.responseText === "success") {
            connect();
            var xhrMessages = new XMLHttpRequest();
            xhrMessages.open("GET", "/getPreviousMessages?roomId=" + roomId, true);
            xhrMessages.onload = function () {
                if (xhrMessages.status === 200) {
                    var responseData = JSON.parse(xhrMessages.responseText);
                    if (Array.isArray(responseData)) {
                        responseData.forEach(function (message) {
                            if (message.sender === nickname) {
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
        } else {
            alert("해당 하는 방에 입장이 실패했습니다 방의 아이디와 비밀번호를 확인해주세요.");
        }
    };
    xhr.send("roomId=" + roomId + "&password=" + password + "&nickname=" + nickname);
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

function updateActiveUsers(users) {
    var userList = document.getElementById('ActiveUserList');
    userList.innerHTML = ""
    userList.innerHTML = "<tr><th colspan='2'>채팅방 접속자</th></tr><tr><th>닉네임</th></tr>";
    users.forEach(function (user){
        var row = document.createElement("tr");
        var NameCell = document.createElement("td");
        NameCell.appendChild(document.createTextNode(user));
        row.appendChild(NameCell);
        userList.appendChild(row);
    });
}

function leaveChannel(RoomName, username) {
    stompClient.send("/app/chat.leave/" + RoomName, {}, username);
}

function disconnect() {
    if (stompClient !== null) {
        stompClient.disconnect();
        leaveChannel(roomId, nickname);
    }
    document.getElementById("chat_status2").innerText = "채팅방을 나가셨습니다. 메인화면으로 이동합니다.";
    console.log('접속 해제됨');
    alert("정상적으로 접속 해제되었습니다. 메인 페이지로 이동합니다");
}
function RequestUserList(RoomName){
    stompClient.send("/ws/chat.user/" + roomId, {}, {} );
}
function NewChatCheck(){
    if(NewChat !== 0){
        var NewChatCount = document.getElementById("New_Cheating");
        NewChatCount.innerText = 0;
        NewChatCount.hidden = true;
    }
}