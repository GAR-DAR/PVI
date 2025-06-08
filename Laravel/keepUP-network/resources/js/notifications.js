function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <div class="notification-icon">
                ${type === 'success'
                    ? '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="var(--accent2-clr)"><path d="M382-240 154-468l57-57 171 171 367-367 57 57-424 424Z"/></svg>'
                    : '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="var(--accent1-clr)"><path d="M480-280q17 0 28.5-11.5T520-320q0-17-11.5-28.5T480-360q-17 0-28.5 11.5T440-320q0 17 11.5 28.5T480-280Zm-40-160h80v-240h-80v240Zm40 360q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z"/></svg>'}
            </div>
            <div class="notification-message">${message}</div>
        </div>
        <button class="notification-close">
            <svg xmlns="http://www.w3.org/2000/svg" height="18px" viewBox="0 -960 960 960" width="18px" fill="currentColor">
                <path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z"/>
            </svg>
        </button>
    `;

    // Add it to the DOM
    document.body.appendChild(notification);

    // event listener to close button
    notification.querySelector('.notification-close').addEventListener('click', () => {
        notification.classList.add('notification-hide');
        setTimeout(() => notification.remove(), 300);
    });

    setTimeout(() => {
        if (document.body.contains(notification)) {
            notification.classList.add('notification-hide');
            setTimeout(() => notification.remove(), 300);
        }
    }, 4000);

    // Animation
    setTimeout(() => {
        notification.classList.add('notification-show');
    }, 10);
}





const SOCKET_SERVER_URL = 'http://localhost:3000';

// Create a global socket manager to avoid multiple connections
window.socketManager = window.socketManager || {
    socket: null,
    initialized: false,
    unreadMessages: [],
    allUsers: new Map(),
    
    initialize() {
        if (this.initialized) return;
        
        try {
            console.log('Initializing global socket connection');
            this.socket = io(SOCKET_SERVER_URL, {
                withCredentials: true,
                extraHeaders: {
                    "Origin": window.location.origin
                }
            });
            
            this.setupSocketListeners();
            this.initialized = true;
        } catch (err) {
            console.error('Failed to initialize global socket:', err);
        }
    },
    
    setupSocketListeners() {
        const socket = this.socket;
        
        socket.on('connect', () => {
            console.log('Connected to notification system:', socket.id);
            
            // Send user data to server
            if (window.chatConfig) {
                const userData = {
                    mysqlUserId: window.chatConfig.studentId,
                    loginName: window.chatConfig.loginName,
                    name: window.chatConfig.studentName,
                    lastname: window.chatConfig.studentLastname,
                    avatarPath: window.chatConfig.avatarPath
                };
                
                socket.emit('userConnected', userData);
                socket.emit('requestAllUsers');
                socket.emit('getUnreadMessages', userData.mysqlUserId);
            }
        });
        
        socket.on('connect_error', (err) => {
            console.error('Socket.io connection error:', err.message);
        });
        
        socket.on('allUsersList', (users) => {
            this.allUsers.clear();
            users.forEach(user => {
                if (user && user.mysqlUserId) {
                    this.allUsers.set(user.mysqlUserId, user);
                }
            });
        });
        
        socket.on('unreadMessages', (messages) => {
            this.unreadMessages = messages;
            this.updateNotificationsUI();
        });
        
        socket.on('newMessage', (message) => {
            // If not in current chat, show notification
            if (!window.currentChatId || message.chatId !== window.currentChatId) {
                this.triggerNotificationAnimation();
                socket.emit('getUnreadMessages', window.chatConfig?.studentId);
            }
        });
        
        socket.on('newNotification', () => {
            this.triggerNotificationAnimation();
            socket.emit('getUnreadMessages', window.chatConfig?.studentId);
        });
    },
    
    updateNotificationsUI() {
        const notificationCircle = document.getElementById('notification-circle');
        const messagesContainer = document.querySelector('.dropdown-messages-container');
        const noMessagesDiv = document.querySelector('.no-messages');
        
        if (this.unreadMessages.length === 0) {
            if (notificationCircle) notificationCircle.style.display = 'none';
            if (noMessagesDiv) noMessagesDiv.style.display = 'block';
            if (messagesContainer) {
                // Clear all messages except the "no messages" div
                Array.from(messagesContainer.children).forEach(child => {
                    if (!child.classList.contains('no-messages')) {
                        child.remove();
                    }
                });
            }
            return;
        }
        
        // We have unread messages
        if (notificationCircle) {
            notificationCircle.style.display = 'block';
            notificationCircle.textContent = this.unreadMessages.length > 9 ? '9+' : this.unreadMessages.length;
        }
        
        if (noMessagesDiv) noMessagesDiv.style.display = 'none';
        
        if (messagesContainer) {
            // Clear existing messages
            Array.from(messagesContainer.children).forEach(child => {
                if (!child.classList.contains('no-messages')) {
                    child.remove();
                }
            });
            
            // Add new messages
            this.unreadMessages.forEach(msg => {
                const messageItem = document.createElement('div');
                messageItem.className = 'message-dropdown-item';
                messageItem.dataset.chatId = msg.chatId;
                messageItem.dataset.messageId = msg._id;
                
                // Get sender info
                let senderName = 'Unknown User';
                const sender = this.allUsers.get(msg.senderId);
                if (sender) {
                    senderName = `${sender.name} ${sender.lastname}`;
                }
                
                messageItem.innerHTML = `
                    <div class="message-content">
                        <span class="user-name" style="font-weight: bold;">${senderName}</span>
                        <p class="message-text">${msg.message}</p>
                    </div>
                `;
                
                messageItem.addEventListener('click', () => {
                    window.location.href = `/chats?chatId=${msg.chatId}`;
                });
                
                messagesContainer.appendChild(messageItem);
            });
        }
    },
    
    triggerNotificationAnimation() {
        const messagesButton = document.getElementById('messages-button');
        const notificationCircle = document.getElementById('notification-circle');
        
        if (messagesButton) {
            messagesButton.classList.add('notify-animation');
            setTimeout(() => {
                messagesButton.classList.remove('notify-animation');
            }, 1000);
        }
        
        if (notificationCircle) {
            notificationCircle.style.display = 'block';
            notificationCircle.classList.add('pulse-animation');
            setTimeout(() => {
                notificationCircle.classList.remove('pulse-animation');
            }, 1000);
        }
    },
    
    markAllUnreadAsRead() {
        if (this.socket && window.chatConfig && this.unreadMessages.length > 0) {
            const allUnreadMessageIds = this.unreadMessages.map(msg => msg._id);
            const chatIds = [...new Set(this.unreadMessages.map(msg => msg.chatId))];
            
            chatIds.forEach(chatId => {
                this.socket.emit('markMessagesAsRead', {
                    chatId: chatId,
                    userId: window.chatConfig.studentId,
                    messageIds: allUnreadMessageIds
                });
            });
            
            this.unreadMessages = [];
            this.updateNotificationsUI();
        }
    }
};

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
    // Make sure chatConfig is available
    if (window.chatConfig && window.chatConfig.studentId) {
        window.socketManager.initialize();
        
        // Setup mark all as read button
        const markAllReadBtn = document.getElementById('markAllReadBtn');
        if (markAllReadBtn) {
            markAllReadBtn.addEventListener('click', () => {
                window.socketManager.markAllUnreadAsRead();
            });
        }
        
        // Setup dropdown behavior
        const messagesButton = document.getElementById('messages-button');
        const messagesList = document.getElementById('messages-list');
        
        if (messagesButton && messagesList) {
            messagesButton.addEventListener('click', (e) => {
                e.stopPropagation();
                messagesList.classList.toggle('show-dropdown');
                if (messagesList.classList.contains('show-dropdown')) {
                    window.socketManager.updateNotificationsUI();
                }
            });
            
            document.addEventListener('click', (e) => {
                if (!messagesList.contains(e.target) && !messagesButton.contains(e.target)) {
                    messagesList.classList.remove('show-dropdown');
                }
            });
        }
    } else {
        console.warn('chatConfig not available, notifications system not initialized');
    }
});