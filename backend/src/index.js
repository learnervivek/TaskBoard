const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

app.use(cors());
app.use(express.json());

// respond to Chrome DevTools well-known probe to avoid 404 noise
app.get('/.well-known/appspecific/com.chrome.devtools.json', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.json({ name: 'taskboard', version: '1.0' })
})

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/taskboard';
mongoose.connect(MONGO_URI).then(() => console.log('Connected to MongoDB')).catch(err => console.error(err));

// Attach routes (routes receives io so it can emit)
const tasksRouter = require('./routes/tasks')(io);
app.use('/api/tasks', tasksRouter);
// Auth routes
const authRouter = require('./routes/auth');
app.use('/api/auth', authRouter);
// Boards + Lists (pass `io` so route controllers can emit)
const boardsRouter = require('./routes/boards')(io);
const listsRouter = require('./routes/lists')(io);
app.use('/api/boards', boardsRouter);
app.use('/api/boards/:boardId/lists', listsRouter);

io.on('connection', socket => {
  console.log('Socket connected:', socket.id)

  // Join a board room: frontend should emit `joinBoard` with the boardId when a user opens a board
  socket.on('joinBoard', (boardId) => {
    if (!boardId) return
    socket.join(String(boardId))
    console.log(`Socket ${socket.id} joined board ${boardId}`)
  })

  socket.on('leaveBoard', (boardId) => {
    if (!boardId) return
    socket.leave(String(boardId))
    console.log(`Socket ${socket.id} left board ${boardId}`)
  })

  socket.on('disconnect', () => console.log('Socket disconnected:', socket.id))
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`Server listening on ${PORT}`));
