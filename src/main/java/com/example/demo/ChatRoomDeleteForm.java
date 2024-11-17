package com.example.demo;

import jakarta.validation.constraints.NotEmpty;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ChatRoomDeleteForm {
    @NotEmpty(message = "채팅방 이름은 필수 사항입니다.")
    private String Chatname;

    @NotEmpty(message = "닉네임 입력은 필수 사항입니다.")
    private String Nickname;

    @NotEmpty(message = "채팅방 패스워드는 필수 사항입니다.")
    private String ChatPassword;

    @NotEmpty(message = "아이피를 입력해주세요(당시 생성한 IP 앞 6자리)")
    private String IP;
}
