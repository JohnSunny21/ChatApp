package com.techmaster.chatApp.model;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ChatMessage {

    private String sender;
    private String content;
    private MessageType type;


}

