package com.example.demo;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

import java.util.*;

@Component
public class ChatRoomEventListener {
    private SimpMessagingTemplate messagingTemplate;

    public ChatRoomEventListener(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    private final Map<String, Set<String>> channelUsers = new HashMap<>();

    public synchronized void addUserToChannel(String RoomName, String username) {
        channelUsers.computeIfAbsent(RoomName, key -> new HashSet<>()).add(username);
    }

    public synchronized void removeUserFromChannel(String RoomName, String username) {
        Set<String> users = channelUsers.get(RoomName);
        if (users != null) {
            users.remove(username);
            if (users.isEmpty()) {
                channelUsers.remove(RoomName); // 채널에 사용자가 없으면 제거
            }
        }
    }

    public synchronized List<String> getUsersInChannel(String RoomName) {
        Set<String> users = channelUsers.get(RoomName);
        return users == null ? Collections.emptyList() : new ArrayList<>(users);
    }

    public void handleUserDisconnect(String RoomName, String username) {
        removeUserFromChannel(RoomName, username);
        List<String> usersInChannel = getUsersInChannel(RoomName);
        broadcastUserList(RoomName, usersInChannel);
    }

    public void broadcastUserList(String RoomName, List<String> usersInChannel) {
        messagingTemplate.convertAndSend("/topic/" + RoomName + "/activeUsers", usersInChannel);
    }
}
