package com.example.demo;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;

@RequiredArgsConstructor
@Service
public class ChatService {
    @Autowired
    private ChatRoomRepository chatRoomRepository;

    @Autowired
    private ChatMessageRepository chatMessageRepository;

    @Autowired
    private AcessChatlogRepository acessChatlogRepository;

    public Optional<ChatRoom> findByNameAndPassword(String name, String password) {
        return chatRoomRepository.findByNameAndPassword(name, password);
    }
    public ChatRoom findChatRoomByName(String name) {
        return chatRoomRepository.findChatRoomByName(name);
    }

    public void saveMessage(ChatMessage chatMessage) {
        chatMessageRepository.save(chatMessage);
    }

    public ChatRoom createChatRoom(String name, String password, String nickname, String ipaddress, String useragent) {
        ChatRoom chatRoom = new ChatRoom();
        chatRoom.setName(name);
        chatRoom.setPassword(password);
        chatRoom.setNickname(nickname);
        chatRoom.setIpaddress(ipaddress);
        chatRoom.setUseragent(useragent);
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
        String formatedDate = LocalDateTime.now().format(formatter);
        chatRoom.setCreateTime(formatedDate);
        return chatRoomRepository.save(chatRoom);
    }

    public AccessChatlog CreateAccessChatlog(String Chatname, String nickname, String ipaddress, String useragent) {
        AccessChatlog accessChatlog = new AccessChatlog();
        accessChatlog.setChatname(Chatname);
        accessChatlog.setNickname(nickname);
        accessChatlog.setIpaddress(ipaddress);
        accessChatlog.setUseragent(useragent);
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
        String formatedDate = LocalDateTime.now().format(formatter);
        accessChatlog.setLoginTimeStamp(formatedDate);
        return acessChatlogRepository.save(accessChatlog);
    }

    public List<ChatMessage> getAllMessagesByRoomName(String name) {
        return chatMessageRepository.findAllByChatRoom_name(name);
    }
}
