function submitcheck(){
    if(document.getElementById("main-box")){
        const chatid = document.getElementById("Chatname").value;
        const chatpw = document.getElementById("ChatPassword").value;
        if(chatid === '' && chatpw === ''){
            alert('생성할 채팅방 이름과 비밀번호를 입력해주세요.');
            return false;
        }
        if(chatid === ''){
            alert("생성할 채팅방 이름을 입력해주세요");
            return false;
        }else if(chatpw === ''){
            alert("생성할 채팅방 비밀번호를 입력해주세요.");
            return false;
        }
    }
    if(document.getElementById("main-box2")){
        const chatid = document.getElementById("Chatname").value;
        const chatpw = document.getElementById("ChatPassword").value;
        const nickname = document.getElementById("Nickname").value;
        if(chatid == '' && chatpw == '' && nickname == ''){
            alert('접속할 채팅방 이름과 비밀번호, 사용할 닉네임을 입력해주세요.');
            return false;
        }
        if(chatid == ''){
            alert("접속할 채팅방 이름을 입력해주세요");
            return false;
        }else if(chatpw == ''){
            alert("접속할 채팅방 비밀번호를 입력해주세요.");
            return false;
        }else if(nickname == ''){
            alert("채팅방에서 사용하실 닉네임을 입력해주세요.");
            return false;
        }
    }
    return true;
    if(document.getElementById("main-box3")){
        const chatid = document.getElementById("Chatname").value;
        const chatpw = document.getElementById("ChatPassword").value;
        const nickname = document.getElementById("Nickname").value;
        const ipaddress = document.getElementById("ipaddress").value;
        if(chatid == '' && chatpw == '' && nickname == '' && ipaddress == ''){
            alert('삭제할 채팅방 이름과 비밀번호, 닉네임, IP(앞6자리) 입력해주세요.');
            return false;
        }
        if(chatid == ''){
            alert("삭제할 채팅방 이름을 입력해주세요");
            return false;
        }else if(chatpw == ''){
            alert("삭제할 채팅방 비밀번호를 입력해주세요.");
            return false;
        }else if(nickname == ''){
            alert("삭제할 채팅방 방장의 닉네임을 입력해주세요.");
            return false;
        }else if(ipaddress == '' && ipaddress.length == 7 && !ipaddress.includes(".")){
            alert("삭제할 당시 방장의 IP 6자리를 입력해주세요.")
            return false;
        }
    }
    return true;
}