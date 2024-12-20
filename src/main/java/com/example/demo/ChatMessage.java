package com.example.demo;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
public class ChatMessage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id; // 정렬을 위한 번호 자동생성
    private String ChatRoom_name; //채팅방 이름
    private String sender; // 보낸 사람
    private String content; //보낸 내용
    private String timestamp; //보낸 시간
    private String fileName; //파일 명

   @ManyToOne
   @JoinColumn(name = "name")
   @JsonIgnore
   private ChatRoom chatRoom; // ChatRoom DB 참조
}
