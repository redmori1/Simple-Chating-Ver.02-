package com.example.demo;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
public class ChatRoom {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int No; // 정렬 위한 번호 자동 생성
    private String name; // 채팅방 이름
    private String password; // 채팅방 비밀번호
    private String nickname; // 채팅방 방장
    private String ipaddress; // 채팅방 방장 IP 주소
    private String useragent; // 채팅방 방장 브라우저
    private String CreateTime; // 채팅방 개설 시간


//    @OneToMany(mappedBy = "chatRoom", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
//    private List<ChatMessage> messages;


}
