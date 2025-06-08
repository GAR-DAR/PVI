const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const { MongoClient, ObjectId } = require('mongodb');
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const ftp = require('basic-ftp');

const app = express();
app.use(express.static(__dirname));
const server = http.createServer(app);
const io = socketIo(server);

const PORT = process.env.PORT || 3000;

// MongoDB Configuration
const MONGO_URI = 'mongodb://localhost:27017/chat_app_rooms';
const DB_NAME_MONGO = 'keepup_3';
const MESSAGES_COLLECTION = 'messages';
const CHATS_COLLECTION = 'chats';
let mongoDb;

// MySQL Configuration
const MYSQL_CONFIG = {
  host: '127.0.0.1',
  user: 'root',
  password: 'root',
  database: 'keepup_schema',
  port: 3306
};
let mysqlPool;

const FTP_CONFIG = {
  host: 'ftp.byethost9.com',
  user: 'b9_38843962',
  password: 'keepUp', 
  secure: false 
};
const FTP_UPLOAD_PATH = '/htdocs/students/messages/'; 
const FTP_PUBLIC_BASE_URL = 'http://keepup.byethost9.com/students/messages/'; 

// Map to track active users
const users = {};
// Map to track user subscriptions to chats
const userChatSubscriptions = {};

const UPLOADS_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  console.log(`Created uploads directory at ${UPLOADS_DIR}`);
}
app.use('/uploads', express.static(UPLOADS_DIR));

// Connect to MongoDB
MongoClient.connect(MONGO_URI)
  .then(client => {
    console.log('Connected to MongoDB');
    mongoDb = client.db(DB_NAME_MONGO);
    
    // Create indexes for chat collection
    mongoDb.collection(CHATS_COLLECTION).createIndex({ "users.userId": 1 });
    mongoDb.collection(CHATS_COLLECTION).createIndex({ "updatedAt": -1 });
    
    // Create indexes for messages collection
    mongoDb.collection(MESSAGES_COLLECTION).createIndex({ "chatId": 1 });
    mongoDb.collection(MESSAGES_COLLECTION).createIndex({ "timestamp": 1 });
    mongoDb.collection(MESSAGES_COLLECTION).createIndex({ "userId": 1 });
    mongoDb.collection(MESSAGES_COLLECTION).createIndex({ "readBy.userId": 1 });
    
    console.log('MongoDB indexes created for collections');
  })
  .catch(error => console.error('MongoDB connection error:', error));

try {
  mysqlPool = mysql.createPool(MYSQL_CONFIG);
  console.log('MySQL Connection Pool Created.');
} catch (error) {
  console.error('MySQL connection pool error:', error);
}

// Helper function to get user chats with unread counts
async function getUserChatsWithUnreadCounts(userId) {
  if (!mongoDb) return [];
  
  try {
    // Find all chats where this user is a member
    const chats = await mongoDb.collection(CHATS_COLLECTION)
      .find({ "users.userId": userId })
      .sort({ "updatedAt": -1 })
      .toArray();
      
    // Calculate unread counts for each chat
    for (const chat of chats) {
      // Get total messages in this chat
      const totalMessages = await mongoDb.collection(MESSAGES_COLLECTION)
        .countDocuments({ chatId: chat._id });
        
      // Get messages read by this user
      const readMessages = await mongoDb.collection(MESSAGES_COLLECTION)
        .countDocuments({ 
          chatId: chat._id, 
          "readBy.userId": userId 
        });
        
      // Calculate unread messages
      chat.unreadCount = Math.max(0, totalMessages - readMessages);
    }
    
    return chats;
  } catch (error) {
    console.error('Error fetching user chats with unread counts:', error);
    return [];
  }
}

// Helper function to create or get a chat
async function getOrCreateChat(roomName, creator) {
  if (!mongoDb) return null;
  
  try {
    // Check if chat already exists
    let chat = await mongoDb.collection(CHATS_COLLECTION).findOne({ name: roomName });
    
    if (!chat) {
      // Create new chat
      const newChat = {
        name: roomName,
        createdAt: new Date(),
        updatedAt: new Date(),
        users: [{
          userId: creator.id,
          email: creator.email,
          username: creator.username,
          avatarUrl: creator.avatarUrl,
          joinedAt: new Date(),
          isActive: true
        }],
        lastMessage: {
          text: `Chat created by ${creator.username}`,
          sender: creator.username,
          timestamp: new Date()
        },
        unreadCounts: {
          [creator.id]: 0 // Initialize unread count for creator
        }
      };
      
      const result = await mongoDb.collection(CHATS_COLLECTION).insertOne(newChat);
      chat = newChat;
      chat._id = result.insertedId;
      
      // Create a system message for new chat
      const systemMessage = {
        chatId: chat._id,
        type: 'system',
        text: `Chat "${roomName}" created by ${creator.username}`,
        userId: creator.id,
        username: 'System',
        avatarUrl: '',
        timestamp: new Date(),
        readBy: [{ userId: creator.id, readAt: new Date() }]
      };
      
      await mongoDb.collection(MESSAGES_COLLECTION).insertOne(systemMessage);
    }
    
    return chat;
  } catch (error) {
    console.error('Error creating/getting chat:', error);
    return null;
  }
}

// Helper function to add user to chat
async function addUserToChat(chatId, user) {
  if (!mongoDb) return false;
  
  try {
    // Check if user is already in the chat
    const chat = await mongoDb.collection(CHATS_COLLECTION).findOne({
      _id: new ObjectId(chatId),
      "users.userId": user.id
    });
    
    if (!chat) {
      // Add user to chat
      await mongoDb.collection(CHATS_COLLECTION).updateOne(
        { _id: new ObjectId(chatId) },
        { 
          $push: { 
            users: {
              userId: user.id,
              email: user.email,
              username: user.username,
              avatarUrl: user.avatarUrl,
              joinedAt: new Date(),
              isActive: true
            } 
          },
          $set: {
            [`unreadCounts.${user.id}`]: 0 // Initialize unread count for new user
          }
        }
      );
      
      // Create a system message for user joining
      const systemMessage = {
        chatId: new ObjectId(chatId),
        type: 'system',
        text: `${user.username} joined the chat`,
        userId: user.id,
        username: 'System',
        avatarUrl: '',
        timestamp: new Date(),
        readBy: [{ userId: user.id, readAt: new Date() }]
      };
      
      await mongoDb.collection(MESSAGES_COLLECTION).insertOne(systemMessage);
    } else {
      // Update user's active status if they're already in the chat
      await mongoDb.collection(CHATS_COLLECTION).updateOne(
        { 
          _id: new ObjectId(chatId),
          "users.userId": user.id
        },
        { 
          $set: { 
            "users.$.isActive": true
          }
        }
      );
    }
    
    return true;
  } catch (error) {
    console.error('Error adding user to chat:', error);
    return false;
  }
}

// Helper function to set user inactive in a chat
async function setUserInactiveInChat(chatId, userId) {
  if (!mongoDb) return false;
  
  try {
    await mongoDb.collection(CHATS_COLLECTION).updateOne(
      { 
        _id: new ObjectId(chatId),
        "users.userId": userId
      },
      { 
        $set: { 
          "users.$.isActive": false
        }
      }
    );
    
    return true;
  } catch (error) {
    console.error('Error setting user inactive in chat:', error);
    return false;
  }
}

// Helper function to update last message in chat and increment unread counts
async function updateChatLastMessage(chatId, messageData) {
  if (!mongoDb) return;
  
  try {
    const chat = await mongoDb.collection(CHATS_COLLECTION).findOne({ _id: new ObjectId(chatId) });
    
    if (!chat) return;
    
    // Create update for last message
    const lastMessageUpdate = {
      updatedAt: new Date(),
      lastMessage: {
        messageId: messageData._id,
        text: messageData.type === 'text' ? 
          messageData.text : 
          `Sent a ${messageData.type}`,
        sender: messageData.username,
        timestamp: messageData.timestamp
      }
    };
    
    // Increment unread count for all users except sender
    const unreadCountUpdates = {};
    
    for (const user of chat.users) {
      if (user.userId !== messageData.userId) {
        unreadCountUpdates[`unreadCounts.${user.userId}`] = 1;
      }
    }
    
    // Update the chat document
    await mongoDb.collection(CHATS_COLLECTION).updateOne(
      { _id: new ObjectId(chatId) },
      { 
        $set: lastMessageUpdate,
        $inc: unreadCountUpdates
      }
    );
  } catch (error) {
    console.error('Error updating chat last message:', error);
  }
}

// Helper function to mark messages as read by a user
async function markMessagesAsRead(chatId, userId) {
  if (!mongoDb) return;
  
  try {
    // Find all unread messages in this chat for this user
    const unreadMessages = await mongoDb.collection(MESSAGES_COLLECTION)
      .find({ 
        chatId: new ObjectId(chatId),
        "readBy.userId": { $ne: userId }
      })
      .toArray();
      
    // Mark each message as read
    for (const message of unreadMessages) {
      await mongoDb.collection(MESSAGES_COLLECTION).updateOne(
        { _id: message._id },
        { 
          $push: { 
            readBy: {
              userId: userId,
              readAt: new Date()
            } 
          }
        }
      );
    }
    
    // Reset unread count for this user in this chat
    await mongoDb.collection(CHATS_COLLECTION).updateOne(
      { _id: new ObjectId(chatId) },
      { 
        $set: { 
          [`unreadCounts.${userId}`]: 0
        }
      }
    );
    
    return unreadMessages.length;
  } catch (error) {
    console.error('Error marking messages as read:', error);
    return 0;
  }
}

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// REST API endpoint to get user chats
app.get('/api/chats/:userId', async (req, res) => {
  const userId = parseInt(req.params.userId);
  if (isNaN(userId)) {
    return res.status(400).json({ error: 'Invalid user ID' });
  }
  
  try {
    const chats = await getUserChatsWithUnreadCounts(userId);
    res.json(chats);
  } catch (error) {
    console.error('Error in /api/chats endpoint:', error);
    res.status(500).json({ error: 'Failed to fetch chats' });
  }
});


// API endpoint to create a new chat with selected users
app.post('/api/chats', express.json(), async (req, res) => {
    const { name, creatorId, selectedUsers } = req.body;
    
    if (!name || !creatorId || !selectedUsers || !selectedUsers.length) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }
    
    if (!mongoDb) {
      return res.status(500).json({ error: 'Database connection error (MongoDB)' });
    }
    
    try {
      // Get creator info from MySQL
      const [creatorRows] = await mysqlPool.execute(
        'SELECT id, first_name, last_name, email, avatar_path FROM students WHERE id = ? LIMIT 1',
        [creatorId]
      );
      
      if (!creatorRows.length) {
        return res.status(404).json({ error: 'Creator not found' });
      }
      
      const creator = creatorRows[0];
      const creatorName = `${creator.first_name} ${creator.last_name}`;
      const creatorAvatarUrl = creator.avatar_path || 
        `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(creatorName)}`;
      
      // Check if a chat with the same name already exists
      const existingChat = await mongoDb.collection(CHATS_COLLECTION)
        .findOne({ name: name });
      
      if (existingChat) {
        return res.status(409).json({ error: 'A chat with this name already exists' });
      }
      
      // Prepare user objects for all selected users
      const userObjects = [];
      const unreadCounts = {};
      
      // Add creator to users array
      userObjects.push({
        userId: creator.id,
        email: creator.email,
        username: creatorName,
        avatarUrl: creatorAvatarUrl,
        joinedAt: new Date(),
        isActive: true
      });
      
      // Initialize creator's unread count
      unreadCounts[creator.id] = 0;
      
      // Get info for all selected users and add them to users array
      for (const userId of selectedUsers) {
        // Skip if user is the creator (already added)
        if (userId === creator.id) continue;
        
        const [userRows] = await mysqlPool.execute(
          'SELECT id, first_name, last_name, email, avatar_path FROM students WHERE id = ? LIMIT 1',
          [userId]
        );
        
        if (userRows.length) {
          const user = userRows[0];
          const userName = `${user.first_name} ${user.last_name}`;
          const userAvatarUrl = user.avatar_path || 
            `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(userName)}`;
          
          userObjects.push({
            userId: user.id,
            email: user.email,
            username: userName,
            avatarUrl: userAvatarUrl,
            joinedAt: new Date(),
            isActive: false // Initially not active until they join
          });
          
          // Initialize user's unread count
          unreadCounts[user.id] = 0;
        }
      }
      
      // Create the new chat
      const newChat = {
        name: name,
        createdAt: new Date(),
        updatedAt: new Date(),
        users: userObjects,
        lastMessage: {
          text: `Chat created by ${creatorName}`,
          sender: creatorName,
          timestamp: new Date()
        },
        unreadCounts: unreadCounts
      };

      
      
      const result = await mongoDb.collection(CHATS_COLLECTION).insertOne(newChat);
      const chatId = result.insertedId;
      
      // Create a system message for new chat
      const systemMessage = {
        chatId: chatId,
        type: 'system',
        text: `Chat "${name}" created by ${creatorName}`,
        userId: creator.id,
        username: 'System',
        avatarUrl: '',
        timestamp: new Date(),
        readBy: [{ userId: creator.id, readAt: new Date() }]
      };
      
      await mongoDb.collection(MESSAGES_COLLECTION).insertOne(systemMessage);
      
      // Notify all online users who are part of this chat
      for (const socketId in users) {
        const socketUser = users[socketId];
        if (socketUser && userObjects.some(u => u.userId === socketUser.id)) {
          // Subscribe user to the new chat
          if (io.sockets.sockets.get(socketId)) {
            io.sockets.sockets.get(socketId).join(chatId.toString());
            
            // Add to user's chat subscriptions
            if (userChatSubscriptions[socketId]) {
              userChatSubscriptions[socketId].add(chatId.toString());
            }
            
            // Send updated chat list to user
            const userChats = await getUserChatsWithUnreadCounts(socketUser.id);
            //io.to(socketId).emit('user chats', userChats);

            io.to(socketId).emit('new chat created', {
                _id: chatId,
                name: name,
                users: userObjects,
                unreadCount: 0,
                lastMessage: {
                  text: `Chat created by ${creatorName}`,
                  sender: creatorName,
                  timestamp: new Date()
                }
              });

            
          }
        }
      }
      
      // Return the created chat
      res.status(201).json({ 
        _id: chatId,
        name: name,
        users: userObjects
      });
      
    } catch (error) {
      console.error('Error creating new chat:', error);
      res.status(500).json({ error: 'Failed to create chat' });
    }
  });

app.get('/api/users', async (req, res) => {
    if (!mysqlPool) {
      return res.status(500).json({ error: 'Database connection error (MySQL)' });
    }
    
    try {
      const searchTerm = req.query.search || '';
      const currentUserId = parseInt(req.query.currentUserId) || 0;
      
      let query = `
        SELECT id, first_name, last_name, email, avatar_path 
        FROM students 
        WHERE id != ?
      `;
      let params = [currentUserId];
      
      // Add search functionality if search term is provided
      if (searchTerm) {
        query += ` AND (first_name LIKE ? OR last_name LIKE ? OR email LIKE ?)`;
        params.push(`%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`);
      }
      
      query += ' ORDER BY first_name, last_name LIMIT 50';
      
      const [rows] = await mysqlPool.execute(query, params);
      
      // Format user data
      const users = rows.map(user => ({
        id: user.id,
        name: `${user.first_name} ${user.last_name}`,
        email: user.email,
        avatarUrl: user.avatar_path || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.first_name + ' ' + user.last_name)}`
      }));
      
      res.json(users);
    } catch (error) {
      console.error('Error fetching users from MySQL:', error);
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  });

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Initialize user's chat subscriptions
  userChatSubscriptions[socket.id] = new Set();

  socket.on('login with email', async (email) => {
    if (!email || email.trim() === "") {
      socket.emit('auth error', 'Email cannot be empty.');
      return;
    }
    if (!mysqlPool) {
        socket.emit('auth error', 'Database connection error (MySQL).');
        return;
    }
    try {
      const [rows] = await mysqlPool.execute(
        'SELECT id, first_name, last_name, avatar_path FROM students WHERE email = ? LIMIT 1',
        [email.trim()]
      );
      if (rows.length > 0) {
        const student = rows[0];
        const username = `${student.first_name} ${student.last_name}`;
        const avatarUrl = student.avatar_path || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(username)}`;
        users[socket.id] = {
          id: student.id, 
          email: email.trim(), 
          username: username,
          avatarUrl: avatarUrl, 
          currentRoom: null
        };
        socket.emit('auth success', { 
          id: student.id,
          username: users[socket.id].username, 
          avatarUrl: users[socket.id].avatarUrl 
        });
        console.log(`User ${student.id} (${email.trim()}) authenticated as ${username}. Socket: ${socket.id}`);
        
        // Fetch user's chats after successful login
        const userChats = await getUserChatsWithUnreadCounts(student.id);
        socket.emit('user chats', userChats);
        
        // Subscribe to all user's chats
        for (const chat of userChats) {
          socket.join(chat._id.toString());
          userChatSubscriptions[socket.id].add(chat._id.toString());
          console.log(`User ${username} (${socket.id}) auto-subscribed to chat: ${chat.name}`);
        }
      } else {
        socket.emit('auth error', 'Invalid email or user not found.');
      }
    } catch (error) {
      console.error('MySQL authentication error:', error);
      socket.emit('auth error', 'An error occurred during authentication.');
    }
  });

  socket.on('join room', async ({ roomName }) => {
    const user = users[socket.id];
    if (user && user.username) {
      // Get or create chat for this room
      const chat = await getOrCreateChat(roomName, user);
      
      if (!chat) {
        socket.emit('error message', 'Could not join or create chat room.');
        return;
      }
      
      const chatId = chat._id.toString();
      
      // Add user to chat if not already a member
      await addUserToChat(chatId, user);
      
      // Subscribe to the chat room if not already subscribed
      if (!userChatSubscriptions[socket.id].has(chatId)) {
        socket.join(chatId);
        userChatSubscriptions[socket.id].add(chatId);
        console.log(`User ${user.username} (${socket.id}) subscribed to chat: ${roomName}`);
      }
      
      // Set as current active room
      const previousRoom = user.currentRoom;
      user.currentRoom = chatId;
      
      // Mark messages as read in this chat
      const markedCount = await markMessagesAsRead(chatId, user.id);
      if (markedCount > 0) {
        console.log(`Marked ${markedCount} messages as read for user ${user.id} in chat ${roomName}`);
      }
      
      socket.emit('room joined', { 
        roomId: chatId,
        roomName: roomName
      });
      
      // Notify other users in the room that this user is now active
      socket.to(chatId).emit('user active', { 
        userId: user.id,
        username: user.username, 
        avatarUrl: user.avatarUrl, 
        room: roomName
      });
      
      console.log(`${user.username} (${socket.id}) set active room to: ${roomName}`);
      
      // Fetch previous messages for this room
      if (mongoDb) {
        mongoDb.collection(MESSAGES_COLLECTION)
          .find({ chatId: new ObjectId(chatId) })
          .sort({ timestamp: 1 })
          .limit(50)
          .toArray()
          .then(messages => {
            socket.emit('previous messages', messages.map(m => ({
              id: m._id,
              type: m.type || 'text',
              text: m.text,
              fileInfo: m.fileInfo,
              userId: m.userId,
              username: m.username,
              avatarUrl: m.avatarUrl,
              timestamp: m.timestamp,
              readBy: m.readBy || []
            })));
          })
          .catch(err => console.error('Error fetching room messages from MongoDB:', err));
      }
      
      // Fetch updated list of chats for this user (to update unread counts)
      const userChats = await getUserChatsWithUnreadCounts(user.id);
      socket.emit('user chats', userChats);
    } else {
      socket.emit('error message', 'Please login before joining a room.');
    }
  });

  socket.on('new chat created', function(chatData) {
    // Add the new chat to the list if not already there
    const existingChat = userChats.find(c => c._id === chatData._id);
    
    if (!existingChat) {
      // Add to the beginning of the list
      userChats.unshift(chatData);
      renderChatList(userChats);
    }
  });

  socket.on('chat message', async ({ text, roomId }) => {
    const user = users[socket.id];
    if (!user || !user.username) {
      socket.emit('error message', 'Please login before sending a message.');
      return;
    }
    
    // Use provided roomId or current room
    const chatId = roomId || user.currentRoom;
    
    if (!chatId) {
      socket.emit('error message', 'Please join a room before sending a message.');
      return;
    }
    
    // Create message document
    const messageData = {
      chatId: new ObjectId(chatId),
      type: 'text',
      text,
      userId: user.id, 
      username: user.username, 
      avatarUrl: user.avatarUrl, 
      timestamp: new Date(),
      readBy: [{ userId: user.id, readAt: new Date() }] // Sender has read their own message
    };
    
    if (mongoDb) {
      try {
        // Insert message
        const result = await mongoDb.collection(MESSAGES_COLLECTION).insertOne(messageData);
        messageData._id = result.insertedId;
        
        // Update chat's last message and unread counts
        await updateChatLastMessage(chatId, messageData);
        
        // Send message to all users in the chat
        io.to(chatId).emit('new message', {
          id: messageData._id,
          chatId: chatId,
          type: messageData.type,
          text: messageData.text,
          userId: messageData.userId,
          username: messageData.username,
          avatarUrl: messageData.avatarUrl,
          timestamp: messageData.timestamp,
          readBy: messageData.readBy
        });
        
        // Update unread counts for all users in the chat
        const chat = await mongoDb.collection(CHATS_COLLECTION).findOne({ _id: new ObjectId(chatId) });
        
        if (chat) {
          // For each user in the chat, emit updated chat list if they're online
          for (const userSocket in users) {
            const socketUser = users[userSocket];
            if (socketUser && chat.users.some(u => u.userId === socketUser.id)) {
              const userChats = await getUserChatsWithUnreadCounts(socketUser.id);
              io.to(userSocket).emit('user chats', userChats);
            }
          }
        }
      } catch (err) {
        console.error('Error saving text message to MongoDB:', err);
        socket.emit('error message', 'Could not save message.');
      }
    } else {
      console.error('MongoDB not connected. Message not saved.');
      socket.emit('error message', 'Database connection error. Message not saved.');
    }
  });

  socket.on('send file', async ({ fileBuffer, fileName, fileType, roomId }) => {
    const user = users[socket.id];
    if (!user || !user.username) {
      socket.emit('error message', 'Authentication error. Cannot send file.');
      return;
    }
    
    // Use provided roomId or current room
    const chatId = roomId || user.currentRoom;
    
    if (!chatId) {
      socket.emit('error message', 'Please join a room before sending a file.');
      return;
    }

    const uniqueFileName = `${Date.now()}-${socket.id}-${fileName.replace(/\s+/g, '_')}`;
    let fileUrl = '';
    let storageType = 'local'; // 'local' or 'ftp'

    // --- Try FTP for images ---
    if (fileType.startsWith('image/')) {
      const ftpClient = new ftp.Client();
      try {
        console.log(`Attempting FTP upload for: ${uniqueFileName}`);
        await ftpClient.access(FTP_CONFIG);
        await ftpClient.ensureDir(FTP_UPLOAD_PATH); // Ensure directory exists
        await ftpClient.uploadFrom(Buffer.from(fileBuffer), `${FTP_UPLOAD_PATH}${uniqueFileName}`);
        fileUrl = `${FTP_PUBLIC_BASE_URL}${uniqueFileName}`;
        storageType = 'ftp';
        console.log(`Successfully uploaded ${uniqueFileName} to FTP. URL: ${fileUrl}`);
      } catch (ftpError) {
        console.error(`FTP upload failed for ${uniqueFileName}:`, ftpError);
        // Fallback to local storage if FTP fails
        try {
          const localFilePath = path.join(UPLOADS_DIR, uniqueFileName);
          fs.writeFileSync(localFilePath, Buffer.from(fileBuffer));
          fileUrl = `/uploads/${uniqueFileName}`; // Relative URL for local files
          storageType = 'local-fallback';
          console.log(`FTP failed, saved ${uniqueFileName} locally. URL: ${fileUrl}`);
        } catch (localSaveError) {
          console.error(`Local fallback save failed for ${uniqueFileName}:`, localSaveError);
          socket.emit('error message', 'File upload failed (FTP and local).');
          ftpClient.close();
          return;
        }
      } finally {
        if (!ftpClient.closed) {
          ftpClient.close();
        }
      }
    } else { // For non-images (e.g., videos) or if image FTP was skipped
      try {
        const localFilePath = path.join(UPLOADS_DIR, uniqueFileName);
        fs.writeFileSync(localFilePath, Buffer.from(fileBuffer));
        fileUrl = `/uploads/${uniqueFileName}`;
        storageType = 'local';
        console.log(`Saved ${uniqueFileName} locally (non-image or FTP skipped). URL: ${fileUrl}`);
      } catch (error) {
        console.error(`Local save failed for ${uniqueFileName}:`, error);
        socket.emit('error message', 'File upload failed.');
        return;
      }
    }

    // --- Save message to MongoDB ---
    if (fileUrl && mongoDb) {
      // Create message document
      const messageData = {
        chatId: new ObjectId(chatId),
        type: fileType.startsWith('image/') ? 'image' : (fileType.startsWith('video/') ? 'video' : 'file'),
        text: '', // No text for file messages
        fileInfo: {
          name: fileName,
          url: fileUrl,
          type: fileType,
          size: fileBuffer.byteLength,
          storage: storageType
        },
        userId: user.id,
        username: user.username,
        avatarUrl: user.avatarUrl,
        timestamp: new Date(),
        readBy: [{ userId: user.id, readAt: new Date() }] // Sender has read their own message
      };

      try {
        // Insert message
        const result = await mongoDb.collection(MESSAGES_COLLECTION).insertOne(messageData);
        messageData._id = result.insertedId;
        
        // Update chat's last message and unread counts
        await updateChatLastMessage(chatId, messageData);
        
        // Send message to all users in the chat
        io.to(chatId).emit('new message', {
          id: messageData._id,
          chatId: chatId,
          type: messageData.type,
          text: messageData.text,
          fileInfo: messageData.fileInfo,
          userId: messageData.userId,
          username: messageData.username,
          avatarUrl: messageData.avatarUrl,
          timestamp: messageData.timestamp,
          readBy: messageData.readBy
        });
        
        // Update unread counts for all users in the chat
        const chat = await mongoDb.collection(CHATS_COLLECTION).findOne({ _id: new ObjectId(chatId) });
        
        if (chat) {
          // For each user in the chat, emit updated chat list if they're online
          for (const userSocket in users) {
            const socketUser = users[userSocket];
            if (socketUser && chat.users.some(u => u.userId === socketUser.id)) {
              const userChats = await getUserChatsWithUnreadCounts(socketUser.id);
              io.to(userSocket).emit('user chats', userChats);
            }
          }
        }
      } catch (dbError) {
        console.error('Error saving file message to MongoDB:', dbError);
        socket.emit('error message', 'Could not save file message.');
      }
    } else if (!mongoDb) {
        console.error('MongoDB not connected. File message not saved.');
        socket.emit('error message', 'Database connection error. File message not saved.');
    }
  });

  // Mark messages as read when user views a chat
  socket.on('mark messages read', async ({ chatId }) => {
    const user = users[socket.id];
    if (!user || !user.username) {
      socket.emit('error message', 'Authentication error.');
      return;
    }
    
    try {
      const markedCount = await markMessagesAsRead(chatId, user.id);
      
      if (markedCount > 0) {
        console.log(`Marked ${markedCount} messages as read for user ${user.id} in chat ${chatId}`);
        
        // Update user's chat list with new unread counts
        const userChats = await getUserChatsWithUnreadCounts(user.id);
        socket.emit('user chats', userChats);
      }
    } catch (error) {
      console.error('Error marking messages as read:', error);
      socket.emit('error message', 'Could not update read status.');
    }
  });

  socket.on('disconnect', async () => {
    const user = users[socket.id];
    if (user) {
      console.log(`User ${user.username || user.email} (${socket.id}) disconnected`);
      
      // Mark user as inactive in all subscribed chats
      for (const chatId of userChatSubscriptions[socket.id]) {
        try {
          await setUserInactiveInChat(chatId, user.id);
          
          // Notify other users in the chat that this user is now inactive
          socket.to(chatId).emit('user inactive', { 
            userId: user.id,
            username: user.username,
            room: chatId
          });
        } catch (error) {
          console.error(`Error setting user inactive in chat ${chatId}:`, error);
        }
      }
      
      delete users[socket.id];
    } else {
      console.log(`User ${socket.id} disconnected (was not fully authenticated or already cleaned up)`);
    }
    
    // Clean up chat subscriptions
    delete userChatSubscriptions[socket.id];
  });
});

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});