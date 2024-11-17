package com.example.demo;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Controller
public class ChatController {

    @Autowired
    private ChatService chatService;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private ChatMessageRepository messageRepository;

    private ChatRoomEventListener chatRoomEventListener;
    @Autowired
    private ChatRoomRepository chatRoomRepository;

    public ChatController(SimpMessagingTemplate messagingTemplate, ChatMessageRepository messageRepository, ChatRoomEventListener chatRoomEventListener) {
        this.messagingTemplate = messagingTemplate;
        this.messageRepository = messageRepository;
        this.chatRoomEventListener = chatRoomEventListener;
    }

    @MessageMapping("/chat.sendMessage/{roomName}")
    public void sendMessage(@DestinationVariable("roomName") String name, @Payload ChatMessage chatMessage) {
        ChatRoom chatRoom = chatService.findChatRoomByName(name);
        chatMessage.setChatRoom(chatRoom);
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
        String formatedDate = LocalDateTime.now().format(formatter);
        chatMessage.setTimestamp(formatedDate);
        chatService.saveMessage(chatMessage);
        messagingTemplate.convertAndSend("/topic/public/" + name, chatMessage); // 메시지를 클라이언트로 전달
    }

    @PostMapping("/chat.addUser")
    public void addUser(ChatMessage chatMessage) {
        chatMessage.setContent("User joined");
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
        String formatedDate = LocalDateTime.now().format(formatter);
        chatMessage.setTimestamp(formatedDate);
        chatService.saveMessage(chatMessage);
        messagingTemplate.convertAndSend("/topic/public/" + chatMessage.getChatRoom_name(), chatMessage); // 메시지를 클라이언트로 전달
    }

    @PostMapping("/uploadFile")
    @ResponseBody
    public String handleFileUpload(@RequestParam("file") MultipartFile file) {
        String fileName = file.getOriginalFilename();
        try {
            Files.write(Paths.get("uploads/" + fileName), file.getBytes());
        } catch (IOException e) {
            e.printStackTrace();
            return "Failed to upload file: " + fileName;
        }
        return "File uploaded successfully: " + fileName;
    }

    @PostMapping("/joinRoom")
    public String joinRoom(@Valid ChatRoomEnterForm chatRoomEnterForm, Model model, BindingResult bindingResult) {
        if(bindingResult.hasErrors()){
            return "redirect:/Enter";
        }
        Optional<ChatRoom> chatRoom = chatService.findByNameAndPassword(chatRoomEnterForm.getChatname(), chatRoomEnterForm.getChatPassword());
        boolean userExists = false;
        if (chatRoom.isPresent()) {
            List<String> UserList = chatRoomEventListener.getUsersInChannel(chatRoomEnterForm.getChatname());
            for(String user : UserList){
                if(user.equals(chatRoomEnterForm.getNickname())){
                    userExists = true;
                    break;
                }
            }
            if(userExists) {
                bindingResult.reject("ChatRoomAccessExists","이미 채팅방에 접속해 있거나 다른 채팅방에 접속해있습니다.");
                return "redirect:/Enter";
            } else {
                model.addAttribute("Chatname", chatRoomEnterForm.getChatname());
                model.addAttribute("ChatPassword", chatRoomEnterForm.getChatPassword());
                model.addAttribute("Nickname", chatRoomEnterForm.getNickname());
                return "chating";
            }
        } else {
            bindingResult.reject("ChatRoomNotFound", "접속할려는 채팅방이 존재하지 않습니다.");
            return "redirect:/Enter";
        }
    }
    @PostMapping("/joinChatroom")
    @ResponseBody
    public String joinRoom(@RequestParam("roomId") String roomName, @RequestParam("password") String password, @RequestParam("nickname") String Nickname, HttpServletRequest request) {
        Optional<ChatRoom> chatRoom = chatService.findByNameAndPassword(roomName, password);
        if (chatRoom.isPresent()) {
            String ipAddress = getClientIP(request);
            String userAgent = request.getHeader("User-Agent");
            chatService.CreateAccessChatlog(roomName, Nickname, ipAddress, userAgent);
            chatRoomEventListener.addUserToChannel(roomName, Nickname);
            List<String> usersInChannel = chatRoomEventListener.getUsersInChannel(roomName);
            chatRoomEventListener.broadcastUserList(roomName, usersInChannel);
            return "success";
        } else {
            return "failure";
        }
    }

    @PostMapping("/createRoom")
    public String createRoom(@Valid @ModelAttribute("chatRoomEnterForm") ChatRoomEnterForm ChatRoomForm, BindingResult bindingResult, Model model, HttpServletRequest request) {
        if(bindingResult.hasErrors()) {
            return "index";
        }
        String ipAddress = getClientIP(request);
        String userAgent = request.getHeader("User-Agent");
        chatService.createChatRoom(ChatRoomForm.getChatname(), ChatRoomForm.getChatPassword(), ChatRoomForm.getNickname(), ipAddress, userAgent);
        model.addAttribute("createSucess", "채팅방이 성공적으로 생성되었습니다. 채팅방 이름 : " + ChatRoomForm.getChatname() + ", PW : " + ChatRoomForm.getChatPassword() + "입니다.");
        model.addAttribute("mode","Creating");
        return "index";
    }

    @PostMapping("/DeleteChatRoom")
    @Transactional
    public String DeleteChatRoom(@ModelAttribute("ChatRoomDeleteForm") ChatRoomDeleteForm chatRoomDeleteForm, BindingResult bindingResult, Model model) {
        Optional<ChatRoom> chatRoom = chatRoomRepository.findByNameAndPassword(chatRoomDeleteForm.getChatname(), chatRoomDeleteForm.getChatPassword());
        if (chatRoom.isPresent()) {
            if(chatRoom.get().getNickname() == chatRoomDeleteForm.getNickname() && chatRoom.get().getIpaddress().substring(0,6) == chatRoomDeleteForm.getIP()){
                chatRoomRepository.deleteById(chatRoomDeleteForm.getChatname());
                model.addAttribute("DeleteSuccess", "채팅방이 성공적으로 삭제되었습니다");
                model.addAttribute("mode","Creating");
                return "index";
            }else if(chatRoom.get().getNickname() == chatRoomDeleteForm.getNickname()){
                bindingResult.reject("DeleteNotSuccess", "당시 생성한 방장의 IP 앞 6자리가 일치하지 않습니다");
                return "index";
            }else if(chatRoom.get().getIpaddress().substring(0,6) == chatRoomDeleteForm.getIP()){
                bindingResult.reject("DeleteNotSuccess", "방장의 닉네임이 일치하지 않습니다");
                return "index";
            }
        }
        bindingResult.reject("DeleteNotSuccess", "삭제할 채팅방 정보를 찾지 못했습니다. 정보를 확인 후 다시 입력해주세요");
        return "index";
    }

    @GetMapping("/getPreviousMessages")
    public ResponseEntity<List<ChatMessage>> getPreviousMessages(String name) {
        List<ChatMessage> messages = chatService.getAllMessagesByRoomName(name);
        return ResponseEntity.ok(messages);
    }

    private String getClientIP(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For"); // 프록시를 통해 전송된 IP 확인
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("Proxy-Client-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("WL-Proxy-Client-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr(); // 기본 IP
        }
        return ip;
    }

    @MessageMapping("/chat.leave/{RoomName}")
    public void leave(@DestinationVariable String RoomName,
                      @Payload String username) {
        chatRoomEventListener.handleUserDisconnect(RoomName, username);
    }

    @MessageMapping("/chat.user/{RoomName}")
    public void GetChatRoomUserList(@DestinationVariable String RoomName){
        List<String> UserList = chatRoomEventListener.getUsersInChannel(RoomName);
        messagingTemplate.convertAndSend("/topic/" + RoomName + "/activeUsers", UserList);
    }
}

