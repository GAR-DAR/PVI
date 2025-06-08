// Client-side JavaScript to handle chat functionality
document.addEventListener('DOMContentLoaded', function() {
    const socket = io();
    
    // DOM elements
    const authSetup = document.getElementById('auth-setup');
    const roomSetup = document.getElementById('room-setup');
    const chatAreaContent = document.getElementById('chat-area-content');
    const emailInput = document.getElementById('email-input');
    const loginBtn = document.getElementById('login-btn');
    const roomInput = document.getElementById('room-input');
    const joinRoomBtn = document.getElementById('join-room-btn');
    const messageForm = document.getElementById('form-chat');
    const messageInput = document.getElementById('input-message');
    const sendBtn = document.getElementById('send-btn');
    const messagesList = document.getElementById('messages');
    const fileInput = document.getElementById('file-input');
    const filePreview = document.getElementById('file-preview');
    const currentRoomName = document.getElementById('current-room-name');
    const chatsList = document.getElementById('users-list');
    const displayChatUsername = document.getElementById('display-chat-username');
    const authError = document.getElementById('auth-error');
    const roomError = document.getElementById('room-error');
    const chatError = document.getElementById('chat-error');
    const chatSearchInput = document.querySelector('.chat-search input');
    const currentUserInfo = document.querySelector('.current-user-info');


    const newChatBtn = document.getElementById('new-chat-btn');
  const popup = document.getElementById('new-chat-popup');
  const popupClose = document.getElementById('popup-close');
  const popupCancel = document.getElementById('popup-cancel');
  const popupCreate = document.getElementById('popup-create');
  const chatNameInput = document.getElementById('chat-name');
  const userSearchInput = document.getElementById('user-search-input');
  const userListContainer = document.getElementById('user-list-container');
  const selectAllCheckbox = document.getElementById('select-all-users');
  const selectedCountEl = document.getElementById('selected-count');
  const popupError = document.getElementById('popup-error');
  

  let users = [];
  let selectedUsers = new Set();
  let isLoading = false;
    
    // Current user information
    let currentUser = {
      id: null,
      username: '',
      avatarUrl: '',
      email: ''
    };
    
    // Current active chat
    let activeChat = {
      id: null,
      name: ''
    };
    
    // Map to store all chats user belongs to
    let userChats = [];
    
    // Logged in state
    let isLoggedIn = false;
    
    // Format time for chat messages
    function formatTime(date) {
      const now = new Date();
      const messageDate = new Date(date);
      
      // For messages from today, show only the time
      if (now.toDateString() === messageDate.toDateString()) {
        return messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }
      
      // For messages from yesterday, show "Yesterday"
      const yesterday = new Date(now);
      yesterday.setDate(now.getDate() - 1);
      if (yesterday.toDateString() === messageDate.toDateString()) {
        return 'Yesterday';
      }
      
      // For messages from this week, show day name
      const sixDaysAgo = new Date(now);
      sixDaysAgo.setDate(now.getDate() - 6);
      if (messageDate >= sixDaysAgo) {
        return messageDate.toLocaleDateString([], { weekday: 'short' });
      }
      
      // For older messages, show date
      return messageDate.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
    
    // Get initials from a name
    function getInitials(name) {
      return name.split(' ')
        .map(part => part.charAt(0))
        .join('')
        .toUpperCase();
    }
    
    // Render chat list with unread counts
    function renderChatList(chats) {
      chatsList.innerHTML = '';
      userChats = chats || [];
      
      if (!chats || chats.length === 0) {
        chatsList.innerHTML = '<li class="no-chats">No chats found</li>';
        return;
      }
      
      chats.forEach(chat => {
        const lastMessageTime = chat.lastMessage ? formatTime(chat.lastMessage.timestamp) : '';
        const chatInitials = getInitials(chat.name);
        const isActive = activeChat.id === chat._id.toString();
        const unreadCount = chat.unreadCount || 0;
        
        const li = document.createElement('li');
        if (isActive) {
          li.classList.add('active');
        }
        
        let chatPreview = 'No messages yet';
        if (chat.lastMessage) {
          chatPreview = `${chat.lastMessage.sender}: ${chat.lastMessage.text}`;
        }
        
        li.innerHTML = `
          <div class="chat-item">
            <div class="chat-avatar">${chatInitials}</div>
            <div class="chat-details">
              <div class="chat-name">${chat.name}</div>
              <div class="chat-preview">${chatPreview}</div>
            </div>
            <div class="chat-meta">
              <div class="chat-time">${lastMessageTime}</div>
              ${unreadCount > 0 ? `<div class="chat-badge">${unreadCount > 99 ? '99+' : unreadCount}</div>` : ''}
            </div>
          </div>
        `;
        
        // Add chat ID as data attribute
        li.dataset.chatId = chat._id;
        
        // Add click event to switch to this chat
        li.addEventListener('click', () => {
          switchToChat(chat._id, chat.name);
        });
        
        chatsList.appendChild(li);
      });
    }
    
    // Switch to a different chat
    function switchToChat(chatId, chatName) {
      if (activeChat.id === chatId) return; // Already in this chat
      
      // Set as active chat
      activeChat.id = chatId;
      activeChat.name = chatName;
      
      // Update UI
      currentRoomName.textContent = chatName;
      
      // Update active state in chat list
      const chatItems = chatsList.querySelectorAll('li');
      chatItems.forEach(item => {
        if (item.dataset.chatId === chatId) {
          item.classList.add('active');
        } else {
          item.classList.remove('active');
        }
      });
      
      // Clear messages list
      messagesList.innerHTML = '';
      
      // Join the room (this will also fetch messages)
      socket.emit('join room', { roomName: chatName });
      
      // Mark messages as read
      socket.emit('mark messages read', { chatId });
    }
    
    // Filter chats based on search input
    function filterChats() {
      const searchTerm = chatSearchInput.value.toLowerCase();
      const chatItems = chatsList.querySelectorAll('li');
      
      chatItems.forEach(item => {
        const chatName = item.querySelector('.chat-name')?.textContent.toLowerCase();
        if (chatName && chatName.includes(searchTerm)) {
          item.style.display = '';
        } else {
          item.style.display = 'none';
        }
      });
    }
    
    // Set up search functionality
    if (chatSearchInput) {
      chatSearchInput.addEventListener('input', filterChats);
    }
    
    // Login functionality
    loginBtn.addEventListener('click', function() {
      const email = emailInput.value.trim();
      if (email) {
        socket.emit('login with email', email);
      } else {
        authError.textContent = 'Please enter an email address';
      }
    });
    
    // Room joining functionality
    joinRoomBtn.addEventListener('click', function() {
      const room = roomInput.value.trim();
      if (room) {
        socket.emit('join room', { roomName: room });
      } else {
        roomError.textContent = 'Please enter a room name';
      }
    });
    
    // Message sending functionality
    messageForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      if (!activeChat.id) {
        chatError.textContent = 'Please join a chat room first';
        return;
      }
      
      if (fileInput.files.length > 0) {
        // Handle file upload
        const file = fileInput.files[0];
        const reader = new FileReader();
        
        reader.onload = function(event) {
          socket.emit('send file', {
            fileBuffer: new Uint8Array(event.target.result),
            fileName: file.name,
            fileType: file.type,
            roomId: activeChat.id
          });
          
          fileInput.value = '';
          filePreview.textContent = '';
        };
        
        reader.readAsArrayBuffer(file);
      } else if (messageInput.value.trim()) {
        // Handle text message
        socket.emit('chat message', { 
          text: messageInput.value,
          roomId: activeChat.id
        });
        messageInput.value = '';
      }
    });
    
    // File input change handler
    fileInput.addEventListener('change', function() {
      if (fileInput.files.length > 0) {
        const file = fileInput.files[0];
        filePreview.textContent = `Selected file: ${file.name} (${Math.round(file.size / 1024)} KB)`;
      } else {
        filePreview.textContent = '';
      }
    });
    
    // Socket event handlers
    socket.on('auth success', function(data) {
      currentUser.id = data.id;
      currentUser.username = data.username;
      currentUser.avatarUrl = data.avatarUrl;
      currentUser.email = emailInput.value;
      
      displayChatUsername.textContent = currentUser.username;
      
      // Update current user info in the sidebar
      if (currentUserInfo) {
        const initials = getInitials(currentUser.username);
        currentUserInfo.innerHTML = `
          <div class="current-user-avatar">${initials}</div>
          <div class="current-user-name">${currentUser.username}</div>
        `;
      }
      
      authSetup.style.display = 'none';
      roomSetup.style.display = 'block';
      isLoggedIn = true;
    });
    
    socket.on('user chats', function(chats) {
      renderChatList(chats);
    });
    
    socket.on('auth error', function(message) {
      authError.textContent = message;
    });
    
    socket.on('room joined', function(data) {
      roomSetup.style.display = 'none';
      chatAreaContent.style.display = 'block';
      
      // Update active chat
      activeChat.id = data.roomId;
      activeChat.name = data.roomName;
      
      currentRoomName.textContent = data.roomName;
      messagesList.innerHTML = '';
    });
    
    socket.on('previous messages', function(messages) {
      messagesList.innerHTML = '';
      messages.forEach(msg => {
        addMessageToUI(msg);
      });
      scrollToBottom();
    });
    
    socket.on('new message', function(msg) {
      // Add message to UI if we're in the chat it belongs to
      if (activeChat.id === msg.chatId) {
        addMessageToUI(msg);
        scrollToBottom();
        
        // Mark as read if it's a new message in the active chat
        socket.emit('mark messages read', { chatId: msg.chatId });
      }
      
      // Play notification sound for new messages in non-active chats
      if (activeChat.id !== msg.chatId && msg.userId !== currentUser.id) {
        playNotificationSound();
      }
    });
    
    // Play notification sound for new messages
    function playNotificationSound() {
      // Create audio element for notification sound
      const audio = new Audio('/notification.mp3'); // Add your notification sound file
      audio.volume = 0.5;
      audio.play().catch(error => {
        console.log('Could not play notification sound:', error);
      });
    }
    
    socket.on('user active', function(data) {
      const systemMessage = document.createElement('li');
      systemMessage.classList.add('system-message');
      systemMessage.textContent = `${data.username} is now active`;
      messagesList.appendChild(systemMessage);
      scrollToBottom();
    });
    
    socket.on('user inactive', function(data) {
      const systemMessage = document.createElement('li');
      systemMessage.classList.add('system-message');
      systemMessage.textContent = `${data.username} is now inactive`;
      messagesList.appendChild(systemMessage);
      scrollToBottom();
    });
    
    socket.on('error message', function(message) {
      chatError.textContent = message;
      setTimeout(() => {
        chatError.textContent = '';
      }, 5000);
    });
    
    // Add message to the UI
    function addMessageToUI(msg) {
      const li = document.createElement('li');
      const isOwnMessage = msg.userId === currentUser.id;
      
      if (isOwnMessage) {
        li.classList.add('own-message');
      }
      
      const messageHeader = document.createElement('div');
      messageHeader.classList.add('message-header');
      
      const sender = document.createElement('span');
      sender.classList.add('message-sender');
      sender.textContent = msg.username;
      
      const time = document.createElement('span');
      time.classList.add('message-time');
      time.textContent = new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      
      messageHeader.appendChild(sender);
      messageHeader.appendChild(time);
      
      const messageContent = document.createElement('div');
      messageContent.classList.add('message-content');
      
      if (msg.type === 'text') {
        messageContent.textContent = msg.text;
      } else if (msg.type === 'system') {
        li.classList.add('system-message');
        li.textContent = msg.text;
        messagesList.appendChild(li);
        return;
      } else if (msg.type === 'image' || msg.type === 'video') {
        const mediaDiv = document.createElement('div');
        mediaDiv.classList.add('message-media');
        
        if (msg.type === 'image') {
          const img = document.createElement('img');
          img.src = msg.fileInfo.url;
          img.alt = 'Image shared by ' + msg.username;
          mediaDiv.appendChild(img);
        } else {
          const video = document.createElement('video');
          video.src = msg.fileInfo.url;
          video.controls = true;
          mediaDiv.appendChild(video);
        }
        
        messageContent.appendChild(mediaDiv);
      } else if (msg.type === 'file') {
        const fileLink = document.createElement('a');
        fileLink.href = msg.fileInfo.url;
        fileLink.textContent = msg.fileInfo.name;
        fileLink.target = '_blank';
        messageContent.appendChild(fileLink);
      }
      
      // Add read status for own messages
      if (isOwnMessage && msg.readBy && msg.readBy.length > 1) { // More than just the sender
        const readStatus = document.createElement('div');
        readStatus.classList.add('message-read-status');
        
        // Count number of readers excluding sender
        const readerCount = msg.readBy.filter(reader => reader.userId !== currentUser.id).length;
        
        if (readerCount > 0) {
          readStatus.textContent = `Read by ${readerCount}`;
          messageContent.appendChild(readStatus);
        }
      }
      
      li.appendChild(messageHeader);
      li.appendChild(messageContent);
      messagesList.appendChild(li);
    }
    
    // Scroll to the bottom of the messages list
    function scrollToBottom() {
      messagesList.scrollTop = messagesList.scrollHeight;
    }
    
    // Initialize with current date/time for testing
    const currentDate = "2025-06-02 09:21:48";
    const currentLogin = "GAR-DAR";
    
    console.log(`Current Date and Time: ${currentDate}`);
    console.log(`Current User's Login: ${currentLogin}`);


    
  });


  // Add this to your chat-client.js file

// Chat Creation Popup Functions
function initChatCreationPopup() {
    // DOM elements
    const newChatBtn = document.getElementById('new-chat-btn');
    const popup = document.getElementById('new-chat-popup');
    const popupClose = document.getElementById('popup-close');
    const popupCancel = document.getElementById('popup-cancel');
    const popupCreate = document.getElementById('popup-create');
    const chatNameInput = document.getElementById('chat-name');
    const userSearchInput = document.getElementById('user-search-input');
    const userListContainer = document.getElementById('user-list-container');
    const selectAllCheckbox = document.getElementById('select-all-users');
    const selectedCountEl = document.getElementById('selected-count');
    const popupError = document.getElementById('popup-error');
    
    // State variables
    let users = [];
    let selectedUsers = new Set();
    let isLoading = false;
    
    // Show popup
    function showPopup() {
      popup.classList.add('active');
      // Reset state
      chatNameInput.value = '';
      userSearchInput.value = '';
      selectedUsers.clear();
      popupError.textContent = '';
      updateSelectedCount();
      fetchUsers();
    }
    
    // Hide popup
    function hidePopup() {
      popup.classList.remove('active');
    }
    
    // Fetch users from the server
    async function fetchUsers(searchTerm = '') {
      try {
        isLoading = true;
        updateUserList();
        
        // Fetch users from the API
        const response = await fetch(`/api/users?search=${encodeURIComponent(searchTerm)}&currentUserId=${currentUser.id}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch users');
        }
        
        users = await response.json();
        isLoading = false;
        updateUserList();
        
      } catch (error) {
        console.error('Error fetching users:', error);
        popupError.textContent = 'Error loading users. Please try again.';
        isLoading = false;
        updateUserList();
      }
    }
    
    // Update the user list in the UI
    function updateUserList() {
      if (isLoading) {
        userListContainer.innerHTML = `
          <div class="user-item loading">
            <span class="loading-spinner"></span>
            <span>Loading users...</span>
          </div>
        `;
        return;
      }
      
      if (users.length === 0) {
        userListContainer.innerHTML = `
          <div class="user-item">
            <span>No users found</span>
          </div>
        `;
        return;
      }
      
      userListContainer.innerHTML = '';
      
      users.forEach(user => {
        const isSelected = selectedUsers.has(user.id);
        const initials = getInitials(user.name);
        
        const userItem = document.createElement('div');
        userItem.className = 'user-item';
        userItem.innerHTML = `
          <input type="checkbox" class="user-checkbox" data-user-id="${user.id}" ${isSelected ? 'checked' : ''}>
          <div class="user-avatar">${initials}</div>
          <div class="user-details">
            <div class="user-name">${user.name}</div>
            <div class="user-email">${user.email}</div>
          </div>
        `;
        
        userListContainer.appendChild(userItem);
        
        // Add click event to checkbox
        const checkbox = userItem.querySelector('.user-checkbox');
        checkbox.addEventListener('change', function() {
          if (this.checked) {
            selectedUsers.add(user.id);
          } else {
            selectedUsers.delete(user.id);
          }
          updateSelectedCount();
          updateSelectAllCheckbox();
        });
        
        // Make entire row clickable
        userItem.addEventListener('click', function(e) {
          if (e.target !== checkbox) {
            checkbox.checked = !checkbox.checked;
            // Trigger change event
            const event = new Event('change');
            checkbox.dispatchEvent(event);
          }
        });
      });
      
      updateSelectAllCheckbox();
    }
    
    // Update the selected count display
    function updateSelectedCount() {
      selectedCountEl.textContent = `${selectedUsers.size} users selected`;
      
      // Enable/disable create button based on selection and chat name
      popupCreate.disabled = selectedUsers.size === 0 || !chatNameInput.value.trim();
    }
    
    // Update the "Select All" checkbox state
    function updateSelectAllCheckbox() {
      if (users.length === 0) {
        selectAllCheckbox.checked = false;
        selectAllCheckbox.disabled = true;
      } else {
        selectAllCheckbox.disabled = false;
        selectAllCheckbox.checked = selectedUsers.size === users.length;
      }
    }
    
    // Select/deselect all users
    function toggleSelectAll() {
      if (selectAllCheckbox.checked) {
        // Select all
        users.forEach(user => selectedUsers.add(user.id));
      } else {
        // Deselect all
        selectedUsers.clear();
      }
      
      updateUserList();
      updateSelectedCount();
    }
    
    // Create a new chat with selected users
    async function createChat() {
      const chatName = chatNameInput.value.trim();
      
      if (!chatName) {
        popupError.textContent = 'Please enter a chat name';
        return;
      }
      
      if (selectedUsers.size === 0) {
        popupError.textContent = 'Please select at least one user';
        return;
      }
      
      try {
        // Disable button and show loading state
        popupCreate.disabled = true;
        popupCreate.innerHTML = '<span class="loading-spinner"></span> Creating...';
        
        // Create the chat via API
        const response = await fetch('/api/chats', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: chatName,
            creatorId: currentUser.id,
            selectedUsers: Array.from(selectedUsers)
          })
        });
        
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to create chat');
        }
        
        const newChat = await response.json();
        
        // Close the popup
        hidePopup();
        
        // Switch to the new chat
        switchToChat(newChat._id, newChat.name);
        
      } catch (error) {
        console.error('Error creating chat:', error);
        popupError.textContent = error.message || 'Error creating chat. Please try again.';
      } finally {
        // Reset button state
        popupCreate.disabled = false;
        popupCreate.textContent = 'Create Chat';
      }
    }
    
    // Event listeners
    newChatBtn.addEventListener('click', showPopup);
    popupClose.addEventListener('click', hidePopup);
    popupCancel.addEventListener('click', hidePopup);
    popupCreate.addEventListener('click', createChat);
    selectAllCheckbox.addEventListener('change', toggleSelectAll);
    
    // Close popup when clicking outside
    popup.addEventListener('click', function(e) {
      if (e.target === popup) {
        hidePopup();
      }
    });
    
    // Enable/disable create button based on chat name
    chatNameInput.addEventListener('input', function() {
      popupCreate.disabled = this.value.trim() === '' || selectedUsers.size === 0;
    });
    
    // Handle user search
    let searchTimeout;
    userSearchInput.addEventListener('input', function() {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        fetchUsers(this.value.trim());
      }, 300);
    });
  }
  
  // Initialize the chat creation popup when DOM is loaded
  document.addEventListener('DOMContentLoaded', function() {
    // Initialize existing chat functionality
    // ...
    
    // Initialize chat creation popup
    initChatCreationPopup();
  });


// --- Sidebar functions (from your script) ---
function selectButtonInSidebar(buttonElement) { // Renamed to avoid conflict if 'selectButton' is global
    if (!sidebar) return;
    const listItems = sidebar.querySelectorAll('ul li');
    listItems.forEach(li => li.classList.remove('active'));
    const parentLi = buttonElement.closest('li');
    if (parentLi) {
        parentLi.classList.add('active');
    }
}

function toggleSidebarState() { 
    if (sidebar && toggleButton) {
        sidebar.classList.toggle('close');
        toggleButton.classList.toggle('rotate'); // Assuming 'rotate' class handles icon animation
        const isClosed = sidebar.classList.contains('close');
        toggleButton.setAttribute('aria-expanded', !isClosed);
    }
}

if (toggleButton) {
    toggleButton.addEventListener('click', toggleSidebarState);
}

function unreadedMessagesAnimation() {
    if (!messagesButton) return;
    const svg = messagesButton.querySelector('svg');
    if (!svg) return;

    // const originalSVGContent = svg.innerHTML; // Storing and restoring complex SVG can be tricky, class-based animation is better
    messagesButton.classList.add('double-clicked'); // CSS should handle the animation

    messagesButton.addEventListener('animationend', function () {
        messagesButton.classList.remove('double-clicked');
        // svg.innerHTML = originalSVGContent; // Might not be needed if CSS resets animation
    }, { once: true });
}

// --- Dropdown menu (from your script, adapted for robustness) ---
function setupDropdown(container, list) {
    if (!container || !list) return;

    const show = () => {
        list.classList.remove('close-dropdown'); // Ensure closing animation class is removed
        list.style.display = 'block'; // Use display block/none
        // list.classList.add('show-dropdown'); // Use if you have CSS animation for show
    };
    const hide = () => {
        // if (list.classList.contains('show-dropdown')) {
        //    list.classList.remove('show-dropdown');
        //    list.classList.add('close-dropdown');
        //    list.addEventListener('animationend', () => { // Prefer animationend over transitionend for complex anims
        //        list.classList.remove('close-dropdown');
        //        list.style.display = 'none';
        //    }, { once: true });
        // } else {
        list.style.display = 'none'; // Fallback if no animation
        // }
    };

    container.addEventListener('mouseenter', () => {
        show();
        // Hide other dropdown if it exists and is different
        if (container === avatarDropdownContainer && messagesDropdownList) hideDropdownList(messagesDropdownList);
        if (container === messagesDropdownContainer && avatarDropdownList) hideDropdownList(avatarDropdownList);
    });
    container.addEventListener('mouseleave', () => { // Hide on mouse leave from container
        hide();
    });
}

// Helper to hide a specific dropdown list
function hideDropdownList(dropdownListElement) {
    if (dropdownListElement) {
        dropdownListElement.style.display = 'none';
        // Add animation classes if you have them:
        // dropdownListElement.classList.remove('show-dropdown');
        // dropdownListElement.classList.add('close-dropdown');
        // ... handle animation end to set display none
    }
}

if (avatarDropdownContainer && avatarDropdownList) setupDropdown(avatarDropdownContainer, avatarDropdownList);
if (messagesDropdownContainer && messagesDropdownList) setupDropdown(messagesDropdownContainer, messagesDropdownList);

// Global click to hide dropdowns (from your script)
document.addEventListener('click', (event) => {
    const isAvatarClick = avatarDropdownContainer && avatarDropdownContainer.contains(event.target);
    const isMessagesClick = messagesDropdownContainer && messagesDropdownContainer.contains(event.target);

    if (!isAvatarClick && avatarDropdownList) hideDropdownList(avatarDropdownList);
    if (!isMessagesClick && messagesDropdownList) hideDropdownList(messagesDropdownList);
});


// --- Page navigation event listeners (from your script) ---
document.querySelectorAll('.sidebar-link').forEach(link => {
    link.addEventListener('click', function (event) {
        selectButtonInSidebar(this);
        const targetPage = this.id.replace('-nav', ''); // e.g. "dashboard", "students"
        if (targetPage === 'messages') { // Assuming you might add a messages link
            window.location.href = 'http://localhost:3000/'; // Navigate to chat
        } else if (targetPage) {
            // For a real SPA, you'd load content. For now, it navigates.
            // window.location.href = `/${targetPage}`;
            console.log(`Navigate to /${targetPage} (not implemented in standalone chat)`);
        }
    });
});
if (document.getElementById("title-up")) {
    document.getElementById("title-up").addEventListener('click', (event) => {
        window.location.href = '/'; // Or your main dashboard
        // If dashboard is a sidebar item, select it:
        // const dashboardNav = document.getElementById('dashboard-nav');
        // if(dashboardNav) selectButtonInSidebar(dashboardNav);
    });
}
if (messagesButton) { // Bell icon
    messagesButton.addEventListener('click', (event) => {
        window.location.href = 'http://localhost:3000/'; // Reload chat page or navigate to it
        // const messagesNav = document.getElementById('messages-nav'); // If you add a messages-nav to sidebar
        // if(messagesNav) selectButtonInSidebar(messagesNav);
        if (messagesDropdownList) hideDropdownList(messagesDropdownList);
    });
    messagesButton.addEventListener('dblclick', () => {
        unreadedMessagesAnimation();
    });
}
const profileButtonInDropdown = document.getElementById('header-profile-button'); // The button that opens avatar dropdown
const profileLinkInDropdown = document.getElementById('profile-link-header'); // The actual "Profile" link

if (profileLinkInDropdown) {
    profileLinkInDropdown.addEventListener('click', (event) => {
        event.preventDefault(); // Prevent default link behavior
        console.log("Navigate to profile page (not implemented in standalone chat)");
        // window.location.href = '/profile'; // Actual navigation
        if (avatarDropdownList) hideDropdownList(avatarDropdownList);
    });
}


/*
socket.on('error message', (message) => {
    if (authSetupDiv && authSetupDiv.style.display !== 'none' && authErrorP) authErrorP.textContent = message;
    else if (roomSetupDiv && roomSetupDiv.style.display !== 'none' && roomErrorP) roomErrorP.textContent = message;
    else if (chatErrorP) chatErrorP.textContent = message;
});

// Notification function (from your layout - can be called by chat logic)
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    // Ensure your notification.css styles .notification and .notification-[type]
    notification.className = `notification notification-${type}`;
    // Using a simplified structure, assuming your CSS handles it or you adapt it
    notification.innerHTML = `
        <div class="notification-content">
            <div class="notification-icon">
                ${type === 'success'
            ? '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="var(--accent2-clr, green)"><path d="M382-240 154-468l57-57 171 171 367-367 57 57-424 424Z"/></svg>'
            : '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="var(--accent1-clr, red)"><path d="M480-280q17 0 28.5-11.5T520-320q0-17-11.5-28.5T480-360q-17 0-28.5 11.5T440-320q0 17 11.5 28.5T480-280Zm-40-160h80v-240h-80v240Zm40 360q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z"/></svg>'}
            </div>
            <div class="notification-message">${message}</div>
        </div>
        <button class="notification-close">
            <svg xmlns="http://www.w3.org/2000/svg" height="18px" viewBox="0 -960 960 960" width="18px" fill="currentColor">
                <path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z"/>
            </svg>
        </button>
    `;
    document.body.appendChild(notification);
    const closeBtn = notification.querySelector('.notification-close');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            notification.classList.add('notification-hide'); // Requires CSS for this class
            setTimeout(() => notification.remove(), 300); // Match CSS animation
        });
    }
    setTimeout(() => {
        if (document.body.contains(notification)) {
            notification.classList.add('notification-hide');
            setTimeout(() => notification.remove(), 300);
        }
    }, 4000);
    setTimeout(() => {
        notification.classList.add('notification-show'); // Requires CSS for this class
    }, 10);
}

*/