package com.example.demo;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class HomeController{
    @GetMapping("/")
    public String Home(Model model){
        model.addAttribute("mode", "Creating");
        model.addAttribute("chatRoomEnterForm", new ChatRoomEnterForm());
        return "index";
    }
    @GetMapping("/Enter")
    public String EnterChatRoom(Model model){
        model.addAttribute("mode", "Entering");
        model.addAttribute("chatRoomEnterForm", new ChatRoomEnterForm());
        return "index";
    }
    @GetMapping("/Delete")
    public String DeleteChatRoom(Model model){
        model.addAttribute("mode", "Deleting");
        model.addAttribute("chatRoomDeleteForm", new ChatRoomDeleteForm());
        return "index";
    }
}
