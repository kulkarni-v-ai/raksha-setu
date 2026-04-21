const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();
const connectDB = require('./config/db');

// Connect to MongoDB
connectDB();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json());

// Pass io to SOS controller for broadcasting
require('./controllers/sosController').setIo(io);

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/pharmacy', require('./routes/pharmacyRoutes'));
app.use('/api/medicines', require('./routes/medicineSearchRoutes'));
app.use('/api/sos', require('./routes/sosRoutes'));
app.use('/api/hospitals', require('./routes/hospitalRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/responders', require('./routes/responderRoutes'));

// Socket.io connection logic
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Basic Route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', database: 'MongoDB', message: 'Raksha Setu API is running with MongoDB Atlas.' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, error: 'Internal Server Error' });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
});
