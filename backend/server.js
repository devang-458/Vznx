require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDB = require('./config/db.js');
const authRoutes = require('./routes/authRoutes.js');
const userRoutes = require('./routes/userRoutes.js');
const taskRoutes = require('./routes/taskRoutes.js');
const reportRoutes = require('./routes/reportRoutes.js');
const analyticsRoutes = require('./routes/analyticsRoutes.js');
const activityRoutes = require('./routes/activityRoutes.js');
const bulkOperationsRoutes = require('./routes/bulkOperationsRoutes.js');
const searchRoutes = require('./routes/searchRoutes.js');
const settingsRoutes = require('./routes/settingsRoutes.js');
const commentRoutes = require('./routes/commentRoutes.js');
const aiRoutes = require('./routes/aiRoutes.js');
const messageRoutes = require('./routes/messageRoutes.js');
const projectRoutes = require('./routes/projectRoutes.js');
const issueRoutes = require('./routes/issueRoutes.js');
const insightRoutes = require('./routes/insightRoutes.js');
const { initSocket } = require('./socket.js');
const http = require('http');
const errorHandler = require('./middleware/errorHandler.js'); // Import the new error handler


const app = express();
const server = http.createServer(app);

initSocket(server);

app.use(cors({
  origin: [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:3000",
    process.env.CLIENT_URL
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

(async () => {
  await connectDB();
})();


// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/bulk-operations', bulkOperationsRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api', commentRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api', issueRoutes);
app.use('/api/insights', insightRoutes);

app.use("/upload", express.static(path.join(__dirname, "uploads")));

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.get('/hi', (req, res) => {
  res.status(200).json({
    message: "Hi user, I'm not dead."
  });
});


// Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
