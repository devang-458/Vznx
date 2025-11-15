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


const app = express();

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

app.use("/upload", express.static(path.join(__dirname, "uploads")));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong", error: err.message });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
