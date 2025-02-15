'use strict';

var usernamePage = document.querySelector('#username-page');
var chatPage = document.querySelector('#chat-page');
var usernameForm = document.querySelector('#usernameForm');
var messageForm = document.querySelector('#messageForm');
var messageInput = document.querySelector('#message');
var messageArea = document.querySelector('#messageArea');
var connectingElement = document.querySelector('.connecting');

var stompClient = null;
var username = null;

var colors = [
'#2196F3','#32c787','#00BCD4','#ff5652','#ffc107','#ff85af','#FF9800','#39bbb0'];


function connect(event){
    username = document.querySelector('#name').value.trim();
    if(username){
        usernamePage.classList.add('hidden');
        chatPage.classList.remove('hidden');

        var socket = new SockJS('/ws');
        stompClient = Stomp.over(socket);

        stompClient.connect({},onConnected,onError);
    }
    event.preventDefault();
}

function onConnected(){
    // Subscribe to the Public Topic
    stompClient.subscribe('/topic/public',onMessageReceived);

    // Tell your username to the server
    stompClient.send('/app/chat.addUser',{},
    JSON.stringify({sender: username,type:'JOIN'})
    )
    connectingElement.classList.add('hidden');
}

function onError(error){
    connectingElement.textContent = 'Could not connect to WebSocket server. Please refresh this page to try again';
    connectingElement.style.color = 'red';
}

function sendMessage(event){
    var messageContent = messageInput.value.trim();
    if(messageContent && stompClient) {
    var chatMessage = {
    sender: username,
    content: messageContent,
    type: 'CHAT'
    };
    stompClient.send('/app/chat.sendMessage',{},JSON.stringify(chatMessage));
    messageInput.value='';
    }
    event.preventDefault();
}

function onMessageReceived(payload){

    //if `payload.body` is not valid JSON, this line will throw an error and halt execution.
     //Add a try-catch block to handle any potential parsing errors gracefully.

    try {
             var message = JSON.parse(payload.body);
     } catch (error) {
         console.error('Failed to parse message:', error);
         return;
     }
    //var message = JSON.parse(payload.body);
    var messageElement = document.createElement('li');

    if(message.type === 'JOIN'){
        messageElement.classList.add('event-message');
        message.content = message.sender + ' has Joined the Chat';
    }
    else if (message.type === 'LEAVE'){
    messageElement.classList.add('event-message');
    message.content = message.sender + " has left";
    }
    else {
    messageElement.classList.add('chat-message');

        var avatarElement = document.createElement('i');
        var avatarText = document.createTextNode(message.sender[0]);
        avatarElement.appendChild(avatarText);
        avatarElement.style['background-color'] = getAvatarColor(message.sender);

        messageElement.appendChild(avatarElement);

        var usernameElement = document.createElement('span');
        var usernameText = document.createTextNode(message.sender);
        usernameElement.appendChild(usernameText);
        messageElement.appendChild(usernameElement);
    }

    var textElement = document.createElement('p');
    var messageText = document.createTextNode(message.content);
    textElement.appendChild(messageText);

    messageElement.appendChild(textElement);

    messageArea.appendChild(messageElement);
    messageArea.scrollTop = messageArea.scrollHeight;
}

function getAvatarColor(messageSender){
    var hash = 0;
    for (var i = 0 ; i < messageSender.length; i++ ) {
        hash = 31 * hash + messageSender.charCodeAt(i);
    }
    var index = Math.abs(hash % colors.length);
    return colors[index];
}



//### **Event Listeners May Fail in Certain Scenarios**
//- The `usernameForm` and `messageForm` elements could potentially
//be `null`, e.g., if the DOM structure changes or the elements are removed.
//Add null checks to avoid runtime errors.

if (usernameForm) {
       usernameForm.addEventListener('submit', connect, true);
   }
if (messageForm) {
   messageForm.addEventListener('submit', sendMessage, true);
}