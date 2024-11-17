package com.example.demo;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.Getter;
import lombok.Setter;

@Entity
@Setter
@Getter
public class AccessChatlog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long No; // 정렬 위한 번호 자동 생성
    private String Chatname; // 채팅방 이름
    private String Nickname; // 접속자 닉네임
    private String ipaddress; // 접속자 IP
    private String useragent; // 접속 하는 브라우저
    private String loginTimeStamp; // 접속 시간
}
