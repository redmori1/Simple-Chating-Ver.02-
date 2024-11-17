package com.example.demo;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;


@Getter
@Setter
public class ChatRoomEnterForm {
    @NotEmpty(message = "채팅방 이름은 필수 항목입니다.")
    @Size(max=100)
    private String Chatname;

    @NotEmpty(message = "채팅방 비밀번호는 필수항목입니다.")
    private String ChatPassword;

    @NotEmpty(message = "사용할 닉네임을 입력해주세요.")
    @Size(max=50)
    private String Nickname;
}
