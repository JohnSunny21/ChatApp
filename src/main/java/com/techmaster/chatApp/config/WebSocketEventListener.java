package com.techmaster.chatApp.config;


import com.techmaster.chatApp.model.ChatMessage;
import com.techmaster.chatApp.model.MessageType;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

@Component
public class WebSocketEventListener {

    private static final Logger log = org.slf4j.LoggerFactory.getLogger(WebSocketEventListener.class);
    private final SimpMessageSendingOperations messagingOptions;

    public WebSocketEventListener(SimpMessageSendingOperations messagingOptions) {
        this.messagingOptions = messagingOptions;
    }

    @EventListener
    public void handleWebSocketDisconnectListener(SessionDisconnectEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        String username = (String) headerAccessor.getSessionAttributes().get("username");
        if (username != null) {
            log.info("Username disconnected: {}", username);
            var chatMessage = ChatMessage.builder()
                    .type(MessageType.LEAVE)
                    .sender(username)
                    .build();

            messagingOptions.convertAndSend("/topic/public", chatMessage);
        }
    }
}
