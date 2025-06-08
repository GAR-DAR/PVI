import { io } from 'socket.io-client';

const SOCKET_SERVER_URL = 'http://localhost:3000';



let socket;

/*try {
    socket = io(SOCKET_SERVER_URL, {
        withCredentials: true,
        extraHeaders: {
            "Origin": window.location.origin
        }
    });
    
    socket.on('connect_error', (err) => {
        console.error('Socket.io connection error:', err.message);
        messagesHistory.innerHTML = `
            <div class="connection-error">
                <p>Could not connect to chat server: ${err.message}</p>
                <p>Please make sure the chat server is running and properly configured.</p>
            </div>
        `;
    });
} catch (err) {
    console.error('Failed to initialize socket:', err);
    if (messagesHistory) {
        messagesHistory.innerHTML = `
            <div class="connection-error">
                <p>Chat initialization failed: ${err.message}</p>
            </div>
        `;
    }
}*/

if (window.socketManager && window.socketManager.socket) {
    console.log('Using existing socket connection from socketManager');
    socket = window.socketManager.socket;
} else {
    try {
        console.log('Creating new socket connection for chat page');
        socket = io(SOCKET_SERVER_URL, {
            withCredentials: true,
            extraHeaders: {
                "Origin": window.location.origin
            }
        });
        
        // Store in global manager if it exists
        if (window.socketManager) {
            window.socketManager.socket = socket;
            window.socketManager.initialized = true;
        }
        
        socket.on('connect_error', (err) => {
            console.error('Socket.io connection error:', err.message);
            messagesHistory.innerHTML = `
                <div class="connection-error">
                    <p>Could not connect to chat server: ${err.message}</p>
                    <p>Please make sure the chat server is running and properly configured.</p>
                </div>
            `;
        });
        
        // The rest of your socket.on handlers...
    } catch (err) {
        console.error('Failed to initialize socket:', err);
        if (messagesHistory) {
            messagesHistory.innerHTML = `
                <div class="connection-error">
                    <p>Chat initialization failed: ${err.message}</p>
                </div>
            `;
        }
    }
}

let currentChatId = null;
window.currentChatId = currentChatId;

let allUsers = new Map(); 
let activeChats = [];  
let selectedParticipants = new Set(); 


let receivedAllUsersData = false; 
let pendingChatsData = [];        

let unreadMessages = [];
let pendingUnreadMessages = [];

let currentAttachment = null;
const fileInput = document.getElementById('file-input');
const attachmentBtn = document.getElementById('attachment-btn');

const chatsList = document.getElementById('chats-list');
const messagesHistory = document.getElementById('messages-history');
const messageInput = document.getElementById('message-input');
const sendMessageBtn = document.getElementById('send-message-btn');
const currentChatName = document.getElementById('current-chat-name');
const createNewChatBtn = document.getElementById('create-new-chat-btn');
const createChatModal = document.getElementById('create-chat-modal');
const availableStudentsDiv = document.getElementById('available-students'); 
const newChatNameInput = document.getElementById('new-chat-name-input');
const confirmCreateChatBtn = document.getElementById('confirm-create-chat-btn');
const cancelCreateChatBtn = document.getElementById('cancel-create-chat-btn');
const addParticipantBtn = document.getElementById('add-participant-btn');
const addParticipantModal = document.getElementById('add-participant-modal');
const availableParticipantsDiv = document.getElementById('available-participants-for-add');
const confirmAddParticipantsBtn = document.getElementById('confirm-add-participants-btn');
const cancelAddParticipantsBtn = document.getElementById('cancel-add-participants-btn');
const closeAddParticipantsBtn = document.getElementById('close-add-participants-btn');
const notificationsDropdown = document.querySelector('.notifications .dropdown'); 
const planeIcon = document.querySelector('.plane-icon');
const notificationCircle = document.getElementById('notification-circle');
const notificationsContainer = document.querySelector('.notifications');
document.getElementById('add-participant-btn').style.display = 'none';
document.getElementById('current-chat-name').textContent = 'Select a Chat';


const currentUser = {
    mysqlUserId: window.chatConfig.studentId,
    loginName: window.chatConfig.loginName,
    name: window.chatConfig.studentName,
    lastname: window.chatConfig.studentLastname,
    avatarPath: window.chatConfig.avatarPath // Add the avatar path
};



function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

function closeAddParticipantModal() {
    addParticipantModal.style.display = 'none';
    selectedParticipants.clear();
}

function openCreateChatModal() {
    createChatModal.style.display = 'flex';
    selectedParticipants.clear();
    newChatNameInput.value = '';
    renderAvailableStudents(); 
}

function closeCreateChatModal() {
    createChatModal.style.display = 'none';
}

function openAddParticipantModal() {
    if (!currentChatId) {
        alert('Please select a chat first.');
        return;
    }
    addParticipantModal.style.display = 'flex';
    selectedParticipants.clear();
    renderAvailableParticipantsForAdd(); 
}

function confirmAddParticipants() {
    const participantsToAdd = Array.from(selectedParticipants);

    if (participantsToAdd.length === 0) {
        alert('Please select at least one participant to add.');
        return;
    }

    if (!currentChatId) {
        alert('No chat selected to add participants to.');
        return;
    }

    socket.emit('addParticipantsToChat', {
        chatId: currentChatId,
        newParticipantIds: participantsToAdd
    });

    closeAddParticipantModal();
}


function processInitialData() {
    if (receivedAllUsersData && pendingChatsData.length > 0) {
        console.log("[chat.js] Both allUsers and chatsList received. Processing initial chat data.");
        renderChatsList(pendingChatsData);
        initializeChatOnPageLoad();
        pendingChatsData = [];
    } else {
        console.log("[chat.js] Waiting for all initial chat data. receivedAllUsersData:", receivedAllUsersData, "pendingChatsData length:", pendingChatsData.length);
    }

    if (receivedAllUsersData && pendingUnreadMessages.length > 0) {
        console.log("[chat.js] All users and pending unread messages received. Processing unread messages.");
        processUnreadMessages(pendingUnreadMessages);
        pendingUnreadMessages = []; 
    }
}




function initializeChatOnPageLoad() {
    const initialChatId = getQueryParam('chatId');
    if (initialChatId) {
        console.log(`[Chat.js] Attempting to open chat from URL: ${initialChatId}`);
        const chatToOpen = activeChats.find(chat => chat._id === initialChatId);
        if (chatToOpen) {
            let chatWindowDisplayName = chatToOpen.name;
            if (chatToOpen.type === 'private' && chatToOpen.otherParticipantMySqlId) {
                const otherUser = allUsers.get(chatToOpen.otherParticipantMySqlId);
                if (otherUser) {
                    chatWindowDisplayName = `${otherUser.name} ${otherUser.lastname}`;
                }
            }
            joinChat(initialChatId, chatWindowDisplayName);
        } else {
            console.warn(`[Chat.js] Chat with ID ${initialChatId} not found in active chats.`);
        }
    }
}



socket.on('connect', () => {
    console.log('Connected to chat server!', socket.id);
    
    // Make sure all user data is properly defined and sent
    const userData = {
        mysqlUserId: currentUser.mysqlUserId,
        loginName: currentUser.loginName,
        name: currentUser.name,
        lastname: currentUser.lastname,
        avatarPath: currentUser.avatarPath // Add avatar path
    };
    
    // Log the user data being sent
    console.log('Sending user data to server:', userData);
    
    // Check if any values are undefined or null
    if (!userData.mysqlUserId || !userData.loginName) {
        console.error('Missing critical user data:', userData);
        alert('Unable to connect to chat: Missing user data');
        return;
    }
    
    socket.emit('userConnected', userData);
    socket.emit('requestAllUsers');
    socket.emit('requestChatsList', currentUser.mysqlUserId);
    socket.emit('getUnreadMessages', currentUser.mysqlUserId);
});

socket.on('disconnect', () => {
    console.log('Disconnected from chat server.');
});

socket.on('chatError', (message) => {
    console.error('Chat Error:', message);
    alert('Chat Error: ' + message);
});


socket.on('userJoinedChat', (data) => {
    if (data.chatId === currentChatId) {
        const user = allUsers.get(data.userId);
        const name = user ? `${user.name} ${user.lastname}` : 'Someone';
        displaySystemMessage(`${name} joined the chat`);
    }
});

socket.on('userLeftChat', (data) => {
    if (data.chatId === currentChatId) {
        const user = allUsers.get(data.userId);
        const name = user ? `${user.name} ${user.lastname}` : 'Someone';
        displaySystemMessage(`${name} left the chat`);
    }
});

socket.on('allUsersList', (users) => {
    console.log('[chat.js] Received allUsersList with', users.length, 'users');
    
    if (!users || users.length === 0) {
        console.error('[chat.js] Received empty users list from server');
    }
    
    allUsers.clear();
    users.forEach(user => {
        // Ensure mysqlUserId is treated as a string for consistent lookup
        if (user && user.mysqlUserId) {
            allUsers.set(String(user.mysqlUserId), user);
        } else {
            console.warn('[chat.js] Skipping invalid user data:', user);
        }
    });
    
    console.log('[chat.js] Updated allUsers map with', allUsers.size, 'users');
    receivedAllUsersData = true;
    renderAvailableStudents();
    processInitialData();
});


socket.on('unreadMessages', (messages) => {
    console.log('[Client Chat.js] Received unreadMessages:', messages);

    if (!receivedAllUsersData) {
        pendingUnreadMessages = messages; 
        console.log("Unread messages received before all users in chat.js, storing them.");
        return;
    }

    processUnreadMessages(messages);
});


socket.on('chatsList', (chats) => {
    console.log('[chat.js] Received chats list:', chats);
    pendingChatsData = chats; 
    processInitialData(); 
});


socket.on('participantsAdded', (data) => {
    console.log('Participants added to chat:', data);
    socket.emit('requestChatsList', currentUser.mysqlUserId); 

    if (data.chatId === currentChatId) {
        setTimeout(() => {
            const updatedChat = activeChats.find(chat => chat._id === currentChatId);
            if (updatedChat) {
                let chatWindowDisplayName = updatedChat.name;
                if (updatedChat.type === 'private' && updatedChat.otherParticipantMySqlId) {
                    const otherUser = allUsers.get(updatedChat.otherParticipantMySqlId);
                    if (otherUser) {
                        chatWindowDisplayName = `${otherUser.name} ${otherUser.lastname}`;
                    }
                }
                joinChat(updatedChat._id, chatWindowDisplayName);
            }
        }, 100);
    }
    alert(`Participants added to chat ${data.chatId}!`);
});

socket.on('chatCreated', (newChat) => {
    console.log('New chat created:', newChat);
    socket.emit('requestChatsList', currentUser.mysqlUserId); 
    closeCreateChatModal();
    
    let displayName = newChat.name;
    if (newChat.type === 'private' && newChat.participants.length === 2) {
        const otherParticipantId = newChat.participants.find(p => p !== currentUser.mysqlUserId);
        const otherUser = allUsers.get(otherParticipantId); 
        if (otherUser) {
            displayName = `${otherUser.name} ${otherUser.lastname}`;
        } else {
            displayName = `Private Chat with ID: ${otherParticipantId}`; 
        }
    }
    joinChat(newChat._id, displayName);
});


socket.on('chatHistory', (data) => {
    if (data.chatId === currentChatId) {
        messagesHistory.innerHTML = '';
        data.messages.forEach(msg => displayMessage(msg));
        messagesHistory.scrollTop = messagesHistory.scrollHeight;
    }
});


socket.on('newMessage', (message) => {
    if (message.chatId === currentChatId) {
        displayMessage(message);
        messagesHistory.scrollTop = messagesHistory.scrollHeight;
        socket.emit('markMessagesAsRead', {
            chatId: message.chatId,
            userId: currentUser.mysqlUserId,
            messageIds: [message._id] 
        });
        socket.emit('getUnreadMessages', currentUser.mysqlUserId);
    } else {
        console.log('New message in another chat:', message);
        triggerNotificationAnimation(); 
        socket.emit('getUnreadMessages', currentUser.mysqlUserId); 
    }
});

socket.on('refreshMyChatsList', () => {
    console.log('[Client] Received request to refresh chats list from server.');
    socket.emit('requestChatsList', currentUser.mysqlUserId);
});

socket.on('newNotification', (notification) => {
    if (notification.chatId !== currentChatId) {
        console.log('Notification received:', notification);
        triggerNotificationAnimation(); 
        socket.emit('getUnreadMessages', currentUser.mysqlUserId); 
    }
});

// In chat.js, make these functions globally accessible
// Near the triggerNotificationAnimation function, modify it like this:

function triggerNotificationAnimation() {
    if (planeIcon) planeIcon.classList.add('animate');
    if (notificationCircle) notificationCircle.style.opacity = 1;
    if (notificationsContainer) notificationsContainer.classList.add('no-hover');
    
    // Add this line to animate the messages-button in layout.blade.php
    const messagesButton = document.getElementById('messages-button');
    if (messagesButton) {
        messagesButton.classList.add('notify-animation');
        setTimeout(() => {
            messagesButton.classList.remove('notify-animation');
        }, 1000);
    }

    setTimeout(() => {
        if (planeIcon) planeIcon.classList.remove('animate');
    }, 500);

    setTimeout(() => {
        if (notificationsContainer) notificationsContainer.classList.remove('no-hover');
    }, 750);
}

// Make the function globally accessible
window.triggerNotificationAnimation = triggerNotificationAnimation;

// Also expose the markAllUnreadAsRead function
window.markAllUnreadAsRead = markAllUnreadAsRead;

window.allUsers = allUsers;

socket.on('userStatusUpdate', (data) => {
    console.log('User status update:', data);
    if (allUsers.has(data.mysqlUserId)) {
        const user = allUsers.get(data.mysqlUserId);
        user.status = data.status; 
        allUsers.set(data.mysqlUserId, user); 
    }
    renderAvailableStudents(); 
    renderChatsList(activeChats); 
    if (currentChatId) {
        const currentChat = activeChats.find(chat => chat._id === currentChatId);
        if (currentChat) {
            joinChat(currentChatId, currentChatName.textContent);
        }
    }
});


function renderChatsList(chatsToRender) {
    chatsList.innerHTML = '';
    activeChats = chatsToRender; 

    chatsToRender.forEach(chat => {
        const chatItem = document.createElement('div');
        chatItem.classList.add('chat-item');
        chatItem.dataset.chatId = chat._id;

        let displayName = chat.name || 'Unnamed Chat'; 
        let avatarUrl = null;
        let isOnline = false;

        if (chat.type === 'private' && chat.otherParticipantMySqlId) {
            const otherUser = allUsers.get(chat.otherParticipantMySqlId);

            if (otherUser) {
                isOnline = otherUser.status === 'online';
                displayName = `${otherUser.name} ${otherUser.lastname}`;
                avatarUrl = otherUser.avatarPath;
            } else {
                console.warn(`User details not found in allUsers for ID: ${chat.otherParticipantMySqlId}.`);
                displayName = chat.name || 'Unknown User';
            }
        }

        // Create HTML structure with avatar
        let avatarHtml = '';
        if (avatarUrl) {
            avatarHtml = `
                <div class="chat-avatar-container">
                    <img src="${avatarUrl}" alt="${displayName}" class="chat-avatar">
                    <span class="status-indicator ${isOnline ? 'online' : 'offline'}"></span>
                </div>`;
        } else {
            // Fallback to initial when no avatar is available
            const initial = displayName.charAt(0).toUpperCase();
            avatarHtml = `
                <div class="chat-avatar-container">
                    <div class="chat-avatar-initial">${initial}</div>
                    <span class="status-indicator ${isOnline ? 'online' : 'offline'}"></span>
                </div>`;
        }

        chatItem.innerHTML = `
            ${avatarHtml}
            <div class="chat-details">
                <div class="chat-name">${displayName}</div>
                <div class="chat-preview">${chat.lastMessageSnippet || 'No messages yet'}</div>
            </div>
        `;
        
        chatItem.addEventListener('click', () => joinChat(chat._id, displayName));
        chatsList.appendChild(chatItem);
    });
    
    if (currentChatId) {
        const newChatItem = document.querySelector(`.chat-item[data-chat-id="${currentChatId}"]`);
        if (newChatItem) newChatItem.classList.add('active-chat');
    }
}


function displayMessage(message) {
    const messageElement = document.createElement('div');
    const isSent = message.senderId === currentUser.mysqlUserId;
    messageElement.classList.add('message-item', isSent ? 'sent' : 'received');

    // Get sender info
    let senderDisplayName = isSent ? `${currentUser.name} ${currentUser.lastname}` : 'Unknown User';
    let senderAvatarPath = isSent ? currentUser.avatarPath : null;
    let senderInitial = isSent ? currentUser.name.charAt(0).toUpperCase() : '?';

    if (!isSent) {
        const senderUser = allUsers.get(message.senderId); 
        if (senderUser) {
            senderDisplayName = `${senderUser.name} ${senderUser.lastname}`;
            senderAvatarPath = senderUser.avatarPath;
            senderInitial = senderUser.name.charAt(0).toUpperCase();
        }
    }

    // Format timestamp
    const timestamp = new Date(message.timestamp);
    const timeString = timestamp.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
    });
    const dateString = isToday(timestamp) 
        ? 'Today' 
        : timestamp.toLocaleDateString([], { month: 'short', day: 'numeric' });

    // Check for attachments
    const hasAttachment = message.attachment || false;
    const attachmentHtml = hasAttachment ? `
        <div class="message-attachment">
            <div class="attachment-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                    <path d="M21.586 10.461l-10.05 10.075c-1.95 1.949-5.122 1.949-7.071 0s-1.95-5.122 0-7.072l10.628-10.585a3.976 3.976 0 0 1 5.657 0 4.01 4.01 0 0 1 0 5.657l-8.484 8.505a1.99 1.99 0 0 1-2.828 0 1.99 1.99 0 0 1 0-2.829l7.778-7.778a1 1 0 0 0-1.414-1.414l-7.778 7.778a3.99 3.99 0 0 0 0 5.657 3.99 3.99 0 0 0 5.657 0l8.484-8.505a6.01 6.01 0 0 0 0-8.485 5.976 5.976 0 0 0-8.485 0L3.515 17.015a8.025 8.025 0 0 0 11.314 11.314L24.929 18.2a1 1 0 0 0-1.414-1.414l-10.05 10.075a6.026 6.026 0 0 1-8.486 0 6.026 6.026 0 0 1 0-8.486l10.05-10.075a4.025 4.025 0 0 1 5.657 0 4.025 4.025 0 0 1 0 5.657L7.343 17.343a2.025 2.025 0 0 1-2.829 0 2.025 2.025 0 0 1 0-2.829l1.768-1.768a1 1 0 0 0-1.414-1.414l-1.768 1.768a4.025 4.025 0 0 0 0 5.657 4.025 4.025 0 0 0 5.657 0l9.9-9.9a6.025 6.025 0 0 0 0-8.486a6.025 6.025 0 0 0-8.486 0l-9.9 9.9a8.025 8.025 0 0 0 0 11.314 8.025 8.025 0 0 0 11.314 0l9.9-9.9a1 1 0 0 0-1.414-1.414l-9.9 9.9a6.025 6.025 0 0 1-8.486 0 6.025 6.025 0 0 1 0-8.486l9.9-9.9a4.025 4.025 0 0 1 5.657 0a4.025 4.025 0 0 1 0 5.657l-9.9 9.9a2.025 2.025 0 0 1-2.829 0a2.025 2.025 0 0 1 0-2.829l8.486-8.485a1 1 0 0 0-1.414-1.414l-8.486 8.485a4.025 4.025 0 0 0 0 5.657a4.025 4.025 0 0 0 5.657 0l9.9-9.9a6.025 6.025 0 0 0 0-8.486z"/>
                </svg>
            </div>
            <div class="attachment-name">${message.attachment.name || 'File'}</div>
            <div class="attachment-download">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                    <path d="M12 16l-5-5h3V4h4v7h3l-5 5zm9 4v-2a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1z"/>
                </svg>
            </div>
        </div>
    ` : '';

    // Create avatar HTML
    let avatarHtml = '';
    if (senderAvatarPath) {
        avatarHtml = `<img src="${senderAvatarPath}" alt="${senderDisplayName}" class="message-avatar">`;
    } else {
        avatarHtml = `<div class="message-avatar">${senderInitial}</div>`;
    }

    // Create message HTML
    messageElement.innerHTML = `
        <div class="message-header">
            ${avatarHtml}
            <div class="message-sender">${senderDisplayName}</div>
        </div>
        
        <div class="message-bubble">
            <div class="message-content">${message.message}</div>
            ${attachmentHtml}
        </div>
        
        <div class="message-footer">
            <div class="message-timestamp" title="${dateString}, ${timeString}">${timeString}</div>
            ${isSent ? `
                <div class="message-status ${message.read ? 'read' : ''}">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                        <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/>
                    </svg>
                </div>
            ` : ''}
        </div>
        
        <div class="message-actions">
            ${isSent ? `
                <button class="message-action-btn" title="Edit">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                        <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                    </svg>
                </button>
            ` : ''}
            <button class="message-action-btn" title="Reply">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path d="M10 9V5l-7 7 7 7v-4.1c5 0 8.5 1.6 11 5.1-1-5-4-10-11-11z"/>
                </svg>
            </button>
        </div>
    `;

    messagesHistory.appendChild(messageElement);
}

// Helper function to check if a date is today
function isToday(date) {
    const today = new Date();
    return date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear();
}

function displaySystemMessage(text) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message-item', 'system');
    
    messageElement.innerHTML = `
        <div class="message-bubble">
            ${text}
        </div>
    `;
    
    messagesHistory.appendChild(messageElement);
    messagesHistory.scrollTop = messagesHistory.scrollHeight;
}

function joinChat(chatId, chatName) {
    if (currentChatId) {
        const prevChatItem = document.querySelector(`.chat-item[data-chat-id="${currentChatId}"]`);
        if (prevChatItem) prevChatItem.classList.remove('active-chat');
    }

    currentChatId = chatId;
    window.currentChatId = currentChatId;
    currentChatName.textContent = chatName;

    socket.emit('joinChat', chatId);
     socket.emit('markMessagesAsRead', {
        chatId: chatId,
        userId: currentUser.mysqlUserId
    });

    socket.emit('getUnreadMessages', currentUser.mysqlUserId);

    document.getElementById('add-participant-btn').style.display = 'inline-block';

    const participantsContainer = document.getElementById('chat-participants');
    participantsContainer.innerHTML = ''; 

    const createNameSpan = (name, color, isYou = false) => {
        const span = document.createElement('span');
        span.textContent = isYou ? `${name} (You)` : name;
        span.style.color = color;
        span.style.marginRight = '10px';
        return span;
    };

    participantsContainer.appendChild(createNameSpan(
        `${currentUser.name} ${currentUser.lastname}`,
        'green',
        true
    ));

    const currentChat = activeChats.find(chat => chat._id === currentChatId);
    if (currentChat) {
        currentChat.participants
            .filter(pid => pid !== currentUser.mysqlUserId)
            .forEach(pid => {
                const user = allUsers.get(pid); 
                const name = user ? `${user.name} ${user.lastname}` : 'Unknown';
                const color = user?.status === 'online' ? 'green' : 'gray';
                participantsContainer.appendChild(createNameSpan(name, color));
            });
    }

    

    const newChatItem = document.querySelector(`.chat-item[data-chat-id="${currentChatId}"]`);
    if (newChatItem) newChatItem.classList.add('active-chat');
    document.getElementById('current-chat-name').textContent = chatName;
}

function renderAvailableStudents() {
    console.log('[chat.js] Rendering available students. Map size:', allUsers.size);
    availableStudentsDiv.innerHTML = '<h4>Select Participants:</h4>';
    
    // Ensure currentUser is defined before filtering
    if (!currentUser || !currentUser.mysqlUserId) {
        availableStudentsDiv.innerHTML += '<p class="connection-error">Error: Current user data is incomplete.</p>';
        console.error('[chat.js] Current user data is incomplete:', currentUser);
        return;
    }
    
    const currentUserIdStr = String(currentUser.mysqlUserId);
    const studentsToDisplay = Array.from(allUsers.values()).filter(s => 
        s.mysqlUserId && String(s.mysqlUserId) !== currentUserIdStr
    );
    
    console.log('[chat.js] Filtered', studentsToDisplay.length, 'students to display (excluding current user)');

    if (studentsToDisplay.length === 0) {
        availableStudentsDiv.innerHTML += '<p class="connection-error">No other students available.</p>';
        return;
    }

    studentsToDisplay.forEach(student => {
        // Create container
        const container = document.createElement('div');
        container.className = 'student-checkbox-container';
        
        // Create checkbox input
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `student-${student.mysqlUserId}`;
        checkbox.value = student.mysqlUserId;
        checkbox.className = 'student-checkbox';
        checkbox.checked = selectedParticipants.has(student.mysqlUserId);

        checkbox.addEventListener('change', (e) => {
            if (e.target.checked) {
                selectedParticipants.add(student.mysqlUserId);
            } else {
                selectedParticipants.delete(student.mysqlUserId);
            }
        });

        // Create label with styled status
        const label = document.createElement('label');
        label.htmlFor = `student-${student.mysqlUserId}`;
        
        // Create avatar element
        let avatarElement = '';
        if (student.avatarPath) {
            avatarElement = `<img src="${student.avatarPath}" alt="${student.name}" class="student-avatar">`;
        } else {
            avatarElement = `<span class="student-initial">${(student.name || 'U').charAt(0).toUpperCase()}</span>`;
        }
        
        // Create student name
        const nameSpan = document.createElement('span');
        nameSpan.className = 'student-name';
        nameSpan.textContent = `${student.name || 'Unknown'} ${student.lastname || 'User'} (${student.loginName || 'No login'})`;
        
        // Create status indicator
        const statusSpan = document.createElement('span');
        statusSpan.className = 'user-status';
        
        // Online status indicator
        const statusIndicator = document.createElement('span');
        statusIndicator.className = `status-indicator ${student.status === 'online' ? 'online' : 'offline'}`;
        
        if (student.status === 'online') {
            statusSpan.textContent = ' (online)';
            statusSpan.style.color = 'var(--green-clr)';
            nameSpan.style.fontWeight = 'bold';
        } else {
            statusSpan.textContent = ' (offline)';
            statusSpan.style.color = 'var(--light-text-clr)';
        }
        
        // Create custom checkbox visual
        const customCheckbox = document.createElement('span');
        customCheckbox.className = 'custom-checkbox';
        
        // Create avatar container with status indicator
        const avatarContainer = document.createElement('div');
        avatarContainer.className = 'avatar-container';
        avatarContainer.innerHTML = avatarElement;
        avatarContainer.appendChild(statusIndicator);
        
        // Assemble the components
        label.appendChild(customCheckbox);
        label.appendChild(avatarContainer);
        label.appendChild(nameSpan);
        label.appendChild(statusSpan);
        
        container.appendChild(checkbox);
        container.appendChild(label);
        availableStudentsDiv.appendChild(container);
    });
}

function renderAvailableParticipantsForAdd() {
    availableParticipantsDiv.innerHTML = '<h4>Select Participants to Add:</h4>';

    const currentChat = activeChats.find(chat => chat._id === currentChatId);

    if (!currentChat) {
        availableParticipantsDiv.innerHTML += '<p class="connection-error">Error: Could not find current chat participants.</p>';
        return;
    }

    const existingParticipantIds = new Set(currentChat.participants.map(String));
    const nonParticipants = Array.from(allUsers.values()).filter(s => 
        !existingParticipantIds.has(String(s.mysqlUserId))
    );

    if (nonParticipants.length === 0) {
        availableParticipantsDiv.innerHTML += '<p class="connection-error">No new students available to add to this chat.</p>';
        return;
    }

    nonParticipants.forEach(student => {
        // Create container
        const container = document.createElement('div');
        container.className = 'student-checkbox-container';
        
        // Create checkbox input
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `add-student-${student.mysqlUserId}`;
        checkbox.value = student.mysqlUserId;
        checkbox.className = 'student-checkbox';
        checkbox.checked = selectedParticipants.has(student.mysqlUserId);

        checkbox.addEventListener('change', (e) => {
            if (e.target.checked) {
                selectedParticipants.add(student.mysqlUserId);
            } else {
                selectedParticipants.delete(student.mysqlUserId);
            }
        });

        // Create label with styled status
        const label = document.createElement('label');
        label.htmlFor = `add-student-${student.mysqlUserId}`;
        
        // Create avatar-like initial
        const initial = document.createElement('span');
        initial.className = 'student-initial';
        initial.textContent = (student.name || 'U').charAt(0).toUpperCase();
        
        // Create student name
        const nameSpan = document.createElement('span');
        nameSpan.className = 'student-name';
        nameSpan.textContent = `${student.name || 'Unknown'} ${student.lastname || 'User'} (${student.loginName || 'No login'})`;
        
        // Create status indicator
        const statusSpan = document.createElement('span');
        statusSpan.className = 'user-status';
        
        if (student.status === 'online') {
            statusSpan.textContent = ' (online)';
            statusSpan.style.color = 'var(--green-clr)';
            nameSpan.style.fontWeight = 'bold';
            initial.style.backgroundColor = 'var(--accent2-clr)';
        } else {
            statusSpan.textContent = ' (offline)';
            statusSpan.style.color = 'var(--light-text-clr)';
            initial.style.backgroundColor = 'var(--el-base-clr)';
        }
        
        // Create custom checkbox visual
        const customCheckbox = document.createElement('span');
        customCheckbox.className = 'custom-checkbox';
        
        // Assemble the components
        label.appendChild(customCheckbox);
        label.appendChild(initial);
        label.appendChild(nameSpan);
        label.appendChild(statusSpan);
        
        container.appendChild(checkbox);
        container.appendChild(label);
        availableParticipantsDiv.appendChild(container);
    });
}

sendMessageBtn.addEventListener('click', () => {
    const message = messageInput.value.trim();
    if (message && currentChatId) {
        socket.emit('sendMessage', { chatId: currentChatId, message: message });
        messageInput.value = '';
    }
});

messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessageBtn.click();
    }
});

createNewChatBtn.addEventListener('click', () => {
    openCreateChatModal();
});

confirmCreateChatBtn.addEventListener('click', () => {
    const chatName = newChatNameInput.value.trim();
    const participantsArray = Array.from(selectedParticipants);
    participantsArray.push(currentUser.mysqlUserId); 

    if (participantsArray.length === 0 || (participantsArray.length === 1 && participantsArray[0] === currentUser.mysqlUserId)) {
        alert('Please select at least one other participant.');
        return;
    }

    const chatType = participantsArray.length === 2 ? 'private' : 'group'; 

    socket.emit('createChat', {
        participants: participantsArray,
        type: chatType,
        name: chatName
    });
});

cancelCreateChatBtn.addEventListener('click', () => {
    closeCreateChatModal();
});

addParticipantBtn.addEventListener('click', () => {
    openAddParticipantModal();
});

confirmAddParticipantsBtn.addEventListener('click', () => {
    confirmAddParticipants();
});

cancelAddParticipantsBtn.addEventListener('click', () => {
    closeAddParticipantModal();
});

closeAddParticipantsBtn.addEventListener('click', () => {
    closeAddParticipantModal();
});

document.addEventListener('DOMContentLoaded', () => {

    if (window.socketManager && !window.socketManager.initialized) {
        window.socketManager.init();
    }
    
    // Use the shared socket
    if (window.socketManager && window.socketManager.socket) {
        socket = window.socketManager.socket;
        
        // Connect the current user if needed
        if (window.chatConfig && socket.connected) {
            socket.emit('userConnected', {
                mysqlUserId: window.chatConfig.studentId,
                loginName: window.chatConfig.loginName,
                name: window.chatConfig.studentName,
                lastname: window.chatConfig.studentLastname,
                avatarPath: window.chatConfig.avatarPath
            });
        }
        
        const notificationsPageIcon = document.querySelector('.notificationsIcon'); 
        if (notificationsPageIcon) {
            notificationsPageIcon.addEventListener('click', () => {
                if (notificationCircle) notificationCircle.style.opacity = 0;
                window.location.href = '/messages'; // This might be causing issues if it should be '/chats'
            });
        }
    }




   
});


function processUnreadMessages(messages) {
    unreadMessages = messages.filter(msg => msg.chatId !== currentChatId).map(msg => {
        const chat = activeChats.find(c => c._id === msg.chatId);
        let chatDisplayName = 'Unknown Chat'; 

        if (chat) {
            if (chat.type === 'private' && chat.otherParticipantMySqlId) {
                const otherUser = allUsers.get(chat.otherParticipantMySqlId);
                if (otherUser) {
                    chatDisplayName = `${otherUser.name} ${otherUser.lastname}`;
                } else {
                    chatDisplayName = chat.name || 'Private Chat';
                }
            } else {
                chatDisplayName = chat.name || 'Group Chat';
            }
        }

        return {
            chatId: msg.chatId,
            user: getDisplayName(msg.senderId), 
            text: msg.message,
            _id: msg._id,
            chatDisplayName: chatDisplayName 
        };
    });
    updateUnreadDropdown();

    if (notificationCircle) {
        notificationCircle.style.opacity = unreadMessages.length > 0 ? 1 : 0;
    }
}

window.updateUnreadMessages = function() {
    if (socket && currentUser) {
        socket.emit('getUnreadMessages', currentUser.mysqlUserId);
    }
};


function getDisplayName(userId) {
    if (userId === currentUser.mysqlUserId) return 'You';

    const user = allUsers.get(userId); 

    if (user) {
        if (user.name && user.lastname) {
            return `${user.name} ${user.lastname}`;
        }
        if (user.loginName) {
            return user.loginName;
        }
    }
    return `User ${userId}`; 
}

function renderMessageComponent(msg) {
    return `
        <div class="message-dropdown-item" data-chat-id="${msg.chatId}" data-message-id="${msg._id}">
            <div class="message-content">
                
                <span class="user-name" style="font-weight: bold;">${msg.user}</span>
                <p class="message-text">${msg.text}</p>
            </div>
        </div>
    `;
}


//<span class="chat-name">${msg.chatDisplayName}</span>
function updateUnreadDropdown() {
    if (!notificationsDropdown) {
        console.error('Notifications dropdown element not found!');
        return;
    }

    if (unreadMessages.length === 0) {
        notificationsDropdown.innerHTML = '<div class="no-messages">No unread messages</div>';
    } else {
        const messagesHtml = unreadMessages.map(renderMessageComponent).join('');
        notificationsDropdown.innerHTML = `
            ${messagesHtml}
            <div class="dropdown-footer">
                <button id="markAllReadBtn" class="mark-all-read-button">Mark All as Read</button>
            </div>
        `;
        const markAllReadBtn = document.getElementById('markAllReadBtn');
        if (markAllReadBtn) {
            markAllReadBtn.addEventListener('click', markAllUnreadAsRead);
        }

        notificationsDropdown.querySelectorAll('.message-dropdown-item').forEach(messageDiv => {
    messageDiv.addEventListener('click', (event) => {
        const clickedChatId = messageDiv.dataset.chatId;
        const clickedMessageId = messageDiv.dataset.messageId;

        const clickedUnreadMsg = unreadMessages.find(um => um._id === clickedMessageId);
        let chatDisplayName = clickedUnreadMsg ? clickedUnreadMsg.chatDisplayName : 'Chat';

        if (clickedChatId) {
            socket.emit('markMessagesAsRead', {
                chatId: clickedChatId,
                userId: currentUser.mysqlUserId,
                messageIds: [clickedMessageId]
            });

            joinChat(clickedChatId, chatDisplayName);


            if (notificationsDropdown) {
                notificationsDropdown.classList.remove('is-open');
            }
        }


    });




    ////////////////////

    const messagesContainer = document.querySelector('.dropdown-messages-container');
    if (messagesContainer) {
        if (unreadMessages.length === 0) {
            messagesContainer.innerHTML = '<div class="no-messages">No unread messages</div>';
        } else {
            messagesContainer.innerHTML = '';
            
            unreadMessages.forEach(msg => {
                const messageElement = document.createElement('div');
                messageElement.className = 'message-item';
                messageElement.dataset.chatId = msg.chatId;
                messageElement.dataset.messageId = msg._id;
                
                messageElement.innerHTML = `
                    <div class="message-content">
                        <div class="message-header">
                            <span class="sender-name">${msg.user}</span>
                            <span class="message-time">${new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}</span>
                        </div>
                        <p class="message-text">${msg.text}</p>
                    </div>
                `;
                
                messageElement.addEventListener('click', () => {
                    window.location.href = `/chats?chatId=${msg.chatId}`;
                });
                
                messagesContainer.appendChild(messageElement);
            });
        }
        
        // Update notification circle
        const notificationCircle = document.getElementById('notification-circle');
        if (notificationCircle) {
            notificationCircle.style.opacity = unreadMessages.length > 0 ? 1 : 0;
        }
    }


});
    }
}




if (notificationsContainer && notificationsDropdown) {
    notificationsContainer.addEventListener('click', (event) => {
        notificationsDropdown.classList.toggle('is-open');

        event.stopPropagation();
    });

    document.addEventListener('click', (event) => {
        if (!notificationsContainer.contains(event.target)) {

            if (notificationsDropdown.classList.contains('is-open')) {
                notificationsDropdown.classList.remove('is-open');
            }
        }
    });
}

function markAllUnreadAsRead() {
    const allUnreadMessageIds = unreadMessages.map(msg => msg._id);

    if (allUnreadMessageIds.length > 0) {
        socket.emit('markMessagesAsRead', {
            chatId: null,
            userId: currentUser.mysqlUserId,
            messageIds: allUnreadMessageIds
        });
    }

    unreadMessages = [];
    updateUnreadDropdown();
    if (notificationCircle) {
        notificationCircle.style.opacity = 0;
    }
    if (notificationsDropdown) {
        notificationsDropdown.classList.remove('is-open');
    }
}

























// Replace your existing sendMessageBtn event listener with this updated version
sendMessageBtn.addEventListener('click', () => {
    const message = messageInput.value.trim();
    
    if (!currentChatId) {
        alert('Please select a chat first.');
        return;
    }
    
    if ((message || currentAttachment) && currentChatId) {
        if (currentAttachment) {
            // Handle file upload
            const reader = new FileReader();
            reader.onload = function(e) {
                const fileData = {
                    name: currentAttachment.name,
                    type: currentAttachment.type,
                    size: currentAttachment.size,
                    data: e.target.result
                };
                
                // Send message with attachment
                socket.emit('sendMessage', { 
                    chatId: currentChatId, 
                    message: message || `Sent a file: ${currentAttachment.name}`,
                    attachment: fileData
                });
                
                // Clear attachment after sending
                currentAttachment = null;
                attachmentBtn.classList.remove('has-attachment');
                fileInput.value = '';
            };
            
            reader.readAsDataURL(currentAttachment);
        } else {
            // Send regular text message
            socket.emit('sendMessage', { 
                chatId: currentChatId, 
                message: message 
            });
        }
        
        messageInput.value = '';
    }
});

// Add file attachment handling
if (attachmentBtn && fileInput) {
    attachmentBtn.addEventListener('click', () => {
        fileInput.click();
    });

    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            const file = e.target.files[0];
            
            // Check file size (5MB limit)
            if (file.size > 5 * 1024 * 1024) {
                alert('File size exceeds 5MB limit');
                fileInput.value = '';
                currentAttachment = null;
                return;
            }

            // Store the selected file
            currentAttachment = file;
            
            // Show selected file in message input
            messageInput.value = `[File: ${file.name}]`;
            messageInput.focus();
            
            // Add a visual indicator that a file is attached
            attachmentBtn.classList.add('has-attachment');
        }
    });
}

// Add a way to clear the attachment
messageInput.addEventListener('input', () => {
    // If user clears the input that contained a file reference, clear the attachment
    if (messageInput.value === '' && currentAttachment) {
        currentAttachment = null;
        attachmentBtn.classList.remove('has-attachment');
    }
});