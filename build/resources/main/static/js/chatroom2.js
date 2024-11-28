var stompClient = null;
var roomId = null;
var NewChat = 0;
if(NewChat >= 1){
    var NewChatCount = document.getElementById("New_Cheating");
    NewChatCount.hidden = false;
    NewChatCount.text = NewChat;
}
function connect(options) {
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
            if (users > 2) {
                document.getElementById("chat_status2").innerText = "채팅방 연결됨";
            }
            updateActiveUsers(users);
        });
        stompClient.send("/app/chat.user/" + roomId);
    });
    document.getElementById("chat_name").innerText = roomId + "채팅방";
}

function sendMessage() {
    if(stompClient.connected === false){
        alert("현재 채팅방 접속이 해제된 상태입니다. 채팅방 재접속을 해주세요");
        return;
    }
    var message = {
        'sender': nickname,
        'content': document.getElementById('content').value,
        'chatRoom': { 'id': roomId }
    };
    if(message.content.length == null){
        alert("전송할 메세지가 없습니다. 메세지를 입력후 전송 버튼을 눌러주세요");
        return;
    }
    console.log(message.content);
    stompClient.send("/app/chat.sendMessage/" + roomId, {}, JSON.stringify(message));
    showSendingMessage(message);
}


async function showSendingMessage(message) {
    let sending = document.getElementById("chat-message");
    if(message.content.includes("http://") || message.content.includes("https://")){
        let res;
        try{
            res = await fetchLinkPreview(message.content, {mode:'no-cors'});
        }catch (error){
            alert("링크 유효성 확인이 실패했습니다(외부 서버 지원 안함)");
            const div = document.createElement('div');
            div.className = 'chat-message-right pb-4';
            div.innerHTML = `
                <div>
                    <div class="text-muted small text-nowrap mt-2">${message.timestamp || new Date().toLocaleString()}</div>
                </div>
                <div class="flex-shrink-1 bg-light rounded py-2 px-3 mr-3">
                    <div class="font-weight-bold mb-1" id="nickname">${message.sender}</div>
                    <a href="${message.content}">${message.content}</a>
                </div>
            `;
            sending.appendChild(div);
            return;
        }
        if(!res || res.valid === false){
            alert("해당 링크에 대한 정보를 가져오는데 실패하였습니다.");
            const div = document.createElement('div');
            div.className = 'chat-message-right pb-4';
            div.innerHTML = `
                <div>
                    <div class="text-muted small text-nowrap mt-2">${message.timestamp || new Date().toLocaleString()}</div>
                </div>
                <div class="flex-shrink-1 bg-light rounded py-2 px-3 mr-3">
                    <div class="font-weight-bold mb-1" id="nickname">${message.sender}</div>
                    <a href="${message.content}">${message.content}</a>
                </div>
            `;
            sending.appendChild(div);
            return;
        }
        const div = document.createElement('div');
        div.className = 'chat-message-right pb-4';
        div.innerHTML = `
        <div class="flex-shrink-1 bg-light rounded py-2 px-3 mr-3">
            <div>
                <img src="${res.thumbnail}" style="height: 150px; weight:200px;" alt="이미지 로딩 실패">
                <hr>
                <p id="link-content">${res.title}</p>
                <div class="text-muted small text-nowrap mt-2">${message.timestamp || new Date().toLocaleString()}</div>
            </div>
        </div>`
        sending.appendChild(div);
        return;
    }
    const div = document.createElement('div');
    div.className = 'chat-message-right pb-4';
    div.innerHTML = `
                <div>
                    <div class="text-muted small text-nowrap mt-2">${message.timestamp || new Date().toLocaleString()}</div>
                </div>
                <div class="flex-shrink-1 bg-light rounded py-2 px-3 mr-3">
                    <div class="font-weight-bold mb-1" id="nickname">${message.sender}</div>
                    ${message.content}
                </div>
            `;
    sending.appendChild(div);
    if (message.fileName) {
        const link = document.createElement('a');
        link.href = '/uploads/' + message.fileName;
        link.textContent = message.fileName;
        sending.appendChild(link);
    }
}


function showReceivedMessage(message) {
    const response = document.getElementById("chat-message");
    if (message.sender === nickname) {
        return;
    }
    if(message.content.includes("http://") || message.content.includes("https://")){
        const div = document.createElement('div');
        div.className = 'chat-message-left pb-4';
        div.innerHTML = `
        <div class="flex-shrink-1 bg-light rounded py-2 px-3 mr-3">
            <div>
                <img src="" style="height: 150px; weight:200px;" alt="이미지 로딩 실패">
                <hr>
                <p id="link-content"></p>
                <div class="text-muted small text-nowrap mt-2">${message.timestamp}</div>
            </div>
        </div>`
        response.appendChild(div);
        NewChat++;
        return;
    }
    const div = document.createElement('div');
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
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/joinChatroom", true);
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.onload = function () {
        if (xhr.status === 200 && xhr.responseText === "success") {
            connect();
            const xhrMessages = new XMLHttpRequest();
            xhrMessages.open("GET", "/getPreviousMessages/" + roomId, true);
            xhrMessages.onload = function () {
                if (xhrMessages.status === 200) {
                    const responseData = JSON.parse(xhrMessages.responseText);
                    if (Array.isArray(responseData)) {
                        responseData.sort((a,b) => new Date(a.timestamp) - new Date(b.timestamp));
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

function disconnect() {
    if (stompClient !== null) {
        stompClient.send("/topic/chat.leave/" + roomId + '/' + nickname);
        stompClient.disconnect();
    }
    if(stompClient == null){
        alert("이미 접속이 해제됬습니다. 채팅방 재접속을 해주시거나 메인 페이지로 이동해주세요");
        return;
    }
    document.getElementById("chat_status2").innerText = "채팅방을 나가셨습니다. 메인화면으로 이동합니다.";
    document.getElementById("send_message").disable = true;
    document.getElementById("send_message").classList.add("disabled");
    console.log('접속 해제됨');
    alert("정상적으로 접속 해제되었습니다. 메인 페이지로 이동합니다");
}
function NewChatCheck(){
    if(NewChat !== 0){
        var NewChatCount = document.getElementById("New_Cheating");
        NewChatCount.innerText = 0;
        NewChatCount.hidden = true;
    }
}

async function fetchLinkPreview(url){
    try{
        const response = await fetch(url, { method: 'HEAD' });
        if (!response.ok) {
            return { valid: false, message: '링크가 유효하지 않음' };
        }
        const htmlResponse = await fetch(url);
        const html = await htmlResponse.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const ogTitle = doc.querySelector('meta[property="og:title"]')?.content || '타이틀 없음';
        const ogImage = doc.querySelector('meta[property="og:image"]')?.content || `https://cdn.pixabay.com/photo/2024/11/02/17/29/city-9169729_1280.jpg`;
        return { valid: true, title: ogTitle, thumbnail: ogImage };
    } catch (error) {
        return { valid: false, message: error.message };
    }
}