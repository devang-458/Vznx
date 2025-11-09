require("dotenv").config();

const  express = require("express");
const  cors = require("cors");
const  path = require("path");
const  connectDB = require('./config/db.js');
const  authRoutes = require('./routes/authRoutes.js');
const  userRoutes = require('./routes/userRoutes.js');
const  taskRoutes = require('./routes/taskRoutes.js');
const  reportRoutes = require('./routes/reportRoutes.js');


const app = express();

app.use(cors({
    origin: process.env.CLIENT_URL || '*',
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ['Content-Type' ,'Authorization']
}))

// Middleware
app.use(express.json());

(async () => {
  await connectDB();
})();


// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/reports', reportRoutes);

app.use("/upload", express.static(path.join(__dirname, "uploads")));
// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running ${PORT}`)
})
