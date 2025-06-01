const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const { MongoClient } = require('mongodb');
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const ftp = require('basic-ftp'); // FTP Client

const app = express();
app.use(express.static(__dirname));
const server = http.createServer(app);
const io = socketIo(server);

const PORT = process.env.PORT || 3000;

// MongoDB Configuration
const MONGO_URI = 'mongodb://localhost:27017/chat_app_rooms';
const DB_NAME_MONGO = 'chat_app_rooms';
const COLLECTION_NAME_MONGO = 'messages';
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

// FTP Configuration (from your details)
const FTP_CONFIG = {
  host: 'ftp.byethost9.com',
  user: 'b9_38843962',
  password: 'keepUp', // WARNING: Hardcoding passwords is insecure!
  secure: false // Use true if using FTPS
};
const FTP_UPLOAD_PATH = '/htdocs/students/messages/'; // Your specified path
const FTP_PUBLIC_BASE_URL = 'http://keepup.byethost9.com/students/messages/'; // Assuming this is the public base URL

const users = {};

const UPLOADS_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  console.log(`Created uploads directory at ${UPLOADS_DIR}`);
}
app.use('/uploads', express.static(UPLOADS_DIR));

MongoClient.connect(MONGO_URI)
  .then(client => {
    console.log('Connected to MongoDB');
    mongoDb = client.db(DB_NAME_MONGO);
  })
  .catch(error => console.error('MongoDB connection error:', error));

try {
  mysqlPool = mysql.createPool(MYSQL_CONFIG);
  console.log('MySQL Connection Pool Created.');
} catch (error) {
  console.error('MySQL connection pool error:', error);
}

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('login with email', async (email) => {
    // ... (login logic remains the same)
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
          id: student.id, email: email.trim(), username: username,
          avatarUrl: avatarUrl, currentRoom: null
        };
        socket.emit('auth success', { username: users[socket.id].username, avatarUrl: users[socket.id].avatarUrl });
        console.log(`User ${student.id} (${email.trim()}) authenticated as ${username}. Socket: ${socket.id}`);
      } else {
        socket.emit('auth error', 'Invalid email or user not found.');
      }
    } catch (error) {
      console.error('MySQL authentication error:', error);
      socket.emit('auth error', 'An error occurred during authentication.');
    }
  });

  socket.on('join room', ({ roomName }) => {
    // ... (join room logic remains the same)
    const user = users[socket.id];
    if (user && user.username) {
      if (user.currentRoom && user.currentRoom !== roomName) {
        socket.leave(user.currentRoom);
        io.to(user.currentRoom).emit('user left', { username: user.username, room: user.currentRoom });
      }
      user.currentRoom = roomName;
      socket.join(roomName);
      socket.emit('room joined', roomName);
      io.to(roomName).emit('user joined', { username: user.username, avatarUrl: user.avatarUrl, room: roomName });
      console.log(`${user.username} (${socket.id}) joined room: ${roomName}`);
      if (mongoDb) {
        mongoDb.collection(COLLECTION_NAME_MONGO).find({ room: roomName }).sort({ timestamp: 1 }).limit(50).toArray()
          .then(messages => {
            socket.emit('previous messages', messages.map(m => ({
              type: m.type || 'text',
              text: m.text,
              fileInfo: m.fileInfo,
              userId: m.userId,
              username: m.username,
              avatarUrl: m.avatarUrl,
              room: m.room,
              timestamp: m.timestamp
            })));
          })
          .catch(err => console.error('Error fetching room messages from MongoDB:', err));
      }
    } else {
      socket.emit('error message', 'Please login before joining a room.');
    }
  });

  socket.on('chat message', ({ text }) => {
    // ... (text message logic remains the same)
    const user = users[socket.id];
    if (user && user.username && user.currentRoom) {
      const messageData = {
        type: 'text',
        text,
        userId: user.id, username: user.username, room: user.currentRoom,
        avatarUrl: user.avatarUrl, timestamp: new Date()
      };
      if (mongoDb) {
        mongoDb.collection(COLLECTION_NAME_MONGO).insertOne(messageData)
          .then(() => { io.to(user.currentRoom).emit('new message', messageData); })
          .catch(err => { console.error('Error saving text message to MongoDB:', err); socket.emit('error message', 'Could not save message.'); });
      } else {
        console.error('MongoDB not connected. Message not saved.');
        io.to(user.currentRoom).emit('new message', { ...messageData, notSaved: true });
      }
    } else {
      socket.emit('error message', 'Cannot send message. Ensure you are logged in and in a room.');
    }
  });

  socket.on('send file', async ({ fileBuffer, fileName, fileType }) => {
    const user = users[socket.id];
    if (!user || !user.username || !user.currentRoom) {
      socket.emit('error message', 'Authentication or room error. Cannot send file.');
      return;
    }

    const uniqueFileName = `${Date.now()}-${socket.id}-${fileName.replace(/\s+/g, '_')}`;
    let fileUrl = '';
    let storageType = 'local'; // 'local' or 'ftp'

    // --- Try FTP for images ---
    if (fileType.startsWith('image/')) {
      const ftpClient = new ftp.Client();
      // ftpClient.ftp.verbose = true; // Enable for debugging FTP communication
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
      const messageData = {
        type: fileType.startsWith('image/') ? 'image' : (fileType.startsWith('video/') ? 'video' : 'file'),
        text: '', // No text for file messages, or could be original filename
        fileInfo: {
          name: fileName,
          url: fileUrl,
          type: fileType,
          size: fileBuffer.byteLength,
          storage: storageType
        },
        userId: user.id,
        username: user.username,
        room: user.currentRoom,
        avatarUrl: user.avatarUrl,
        timestamp: new Date()
      };

      try {
        await mongoDb.collection(COLLECTION_NAME_MONGO).insertOne(messageData);
        io.to(user.currentRoom).emit('new message', messageData);
      } catch (dbError) {
        console.error('Error saving file message to MongoDB:', dbError);
        socket.emit('error message', 'Could not save file message.');
      }
    } else if (!mongoDb) {
        console.error('MongoDB not connected. File message not saved.');
        // Optionally, still emit to room but indicate not saved
        // io.to(user.currentRoom).emit('new message', { ...messageData, notSaved: true });
    }
  });

  socket.on('disconnect', () => {
    // ... (disconnect logic remains the same)
    const user = users[socket.id];
    if (user) {
      if (user.currentRoom) {
        io.to(user.currentRoom).emit('user left', { username: user.username, room: user.currentRoom });
      }
      console.log(`User ${user.username || user.email} (${socket.id}) disconnected`);
      delete users[socket.id];
    } else {
      console.log(`User ${socket.id} disconnected (was not fully authenticated or already cleaned up)`);
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});