const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
const http = require('http');
const socketIo = require('socket.io');
const cron = require('node-cron');

dotenv.config();
const app = express();
app.use(cors());
app.use(express.static('public')); // Serve static files from 'public' directory
app.use(bodyParser.json());

const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";

// ✅ MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log('✅ MongoDB connected'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// ✅ Schemas
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    email: { type: String, required: true, unique: true },
});
const User = mongoose.model('User', userSchema);

const reminderSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    medicineName: String,
    patientName: String,
    time: String, // "HH:mm" format
    dose: String,
    notes: String,
    taken: { type: Boolean, default: false },
    isNurse:{type:Boolean,default:false}
});
const Reminder = mongoose.model('Reminder', reminderSchema);

// ✅ Create HTTP server + Socket.io
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*", // frontend domain here in production
    }
});

// ✅ Store connected users
const userSockets = new Map();



io.on('connection', (socket) => {
    console.log('👤 New User connected:', socket.id);

    socket.on('registerUser', (userId) => {
        userSockets.set(userId, socket.id);
        console.log(`🧩 Mapped user ${userId} to socket ${socket.id}`);
    });
    

    socket.on('disconnect', () => {
        console.log('❌ User disconnected:', socket.id);
        for (const [userId, sockId] of userSockets.entries()) {
            if (sockId === socket.id) {
                userSockets.delete(userId);
                break;
            }
        }
    });
});

// ✅ Reminder Notification Sender
const sendReminder = (userId, reminderData) => {
    const socketId = userSockets.get(userId);
    if (socketId) {
        // io.to(socketId).emit('reminder', { message });
        io.to(socketId).emit('reminder', reminderData); // reminderData is now an object
    } else {
        console.log(`⚠️ User ${userId} not connected`);
    }
};

cron.schedule('0 0 * * *', async () => {
    console.log('🌙 Midnight task: Resetting reminders');

    try {
        const result = await Reminder.updateMany({}, { taken: false });
        console.log(`✅ Reset ${result.modifiedCount} reminders`);
    } catch (err) {
        console.error('❌ Error resetting reminders:', err);
    }
});
false
// ✅ Cron Job - every minute check for due reminders
cron.schedule('* * * * *', async () => {
    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5); // format "HH:mm"
    console.log(`⏰ Checking reminders for ${currentTime}`);

    try {
        const dueReminders = await Reminder.find({ time: currentTime, taken: false });

        for (const reminder of dueReminders) {
            const user = await User.findById(reminder.userId); // get patient details
      
            const reminderPayload = {
              medicineName: reminder.medicineName,
              dose: reminder.dose || 'N/A',
              time: currentTime,
              patientName: reminder?.patientName || 'Patient'
            };

      
            sendReminder(reminder.userId.toString(), reminderPayload);

        }

    } catch (err) {
        console.error('❌ Cron error:', err);
    }
});



// ✅ Auth Middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: 'Token required' });

    const token = authHeader.split(' ')[1];
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: 'Invalid token' });
        req.user = user;
        next();
    });
};

// ✅ Routes
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/firstPage.html');
});
app.post('/api/register', async (req, res) => {
    const { username, password, email } = req.body;
    if (!username || !password || !email) return res.status(400).json({ message: "All fields are required" });

    try {
        const existingUser = await User.findOne({ $or: [{ username }, { email }] });
        if (existingUser) return res.status(400).json({ message: "Username or email already exists" });

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, password: hashedPassword, email });
        await newUser.save();
        res.status(201).json({ message: "User registered successfully" });
    } catch (err) {
        res.status(500).json({ message: "Registration failed", error: err.message });
    }
});

app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: "Invalid username or password" });
        }

        const token = jwt.sign({ id: user._id, username: user.username }, JWT_SECRET, { expiresIn: '1h' });
        res.json({ message: "Login successful", token, userId: user._id });
    } catch (err) {
        res.status(500).json({ message: "Login failed", error: err.message });
    }
});

app.get('/api/me', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch user', error: err.message });
    }
});

app.post('/api/reminders', authenticateToken, async (req, res) => {
    try {
        const remindersData = req.body.reminders.reminders;
        const isNurse = req.body.isNurse === true; // Check if the request is from a nurse

        if (!Array.isArray(remindersData)) {
            return res.status(400).json({ message: 'Invalid reminders format' });
        }

        const savedReminders = await Reminder.insertMany(
            remindersData.map(r => ({
                ...r,
                userId: req.user.id,
                taken: false,
                isNurse: isNurse, // add isNurse based on request body flag
            }))
        );

        res.status(201).json({ message: 'Reminders saved', reminders: savedReminders });
    } catch (err) {
        res.status(500).json({ message: 'Failed to save reminders', error: err.message });
    }
});


// Assuming you already have authenticateToken middleware to extract req.user

app.get('/api/reminders/nurse', authenticateToken, async (req, res) => {
    try {
      const reminders = await Reminder.find({ userId: req.user.id,taken:false,isNurse:true });
      res.status(200).json({ reminders });
    } catch (err) {
      res.status(500).json({ message: 'Failed to fetch reminders', error: err.message });
    }
  });
  
app.get('/api/reminders', authenticateToken, async (req, res) => {
    try {
      const reminders = await Reminder.find({ userId: req.user.id,taken:false,isNurse:false });
      res.status(200).json({ reminders });
    } catch (err) {
      res.status(500).json({ message: 'Failed to fetch reminders', error: err.message });
    }
  });


  


  app.post('/api/reminders/mark-taken', authenticateToken, async (req, res) => {
      const { reminderId } = req.body;
      console.log(reminderId)
  
      try {
          const reminder = await Reminder.findOneAndUpdate(
              { userId: req.user.id, _id: new mongoose.Types.ObjectId(reminderId), taken: false },
              { taken: true },
              { new: true }
          );
  
          if (!reminder) {
              return res.status(404).json({ message: 'Reminder not found or already marked as taken' });
          }
  
          res.json({ message: 'Reminder marked as taken', reminder });
      } catch (err) {
          res.status(500).json({ message: 'Failed to mark as taken', error: err.message });
      }
  });

  
app.delete('/api/reminders/:id', authenticateToken, async (req, res) => {
    const reminderId = req.params.id;

    try {
        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(reminderId)) {
            return res.status(400).json({ message: 'Invalid reminder ID' });
        }

        const deletedReminder = await Reminder.findOneAndDelete({
            _id: new mongoose.Types.ObjectId(reminderId),
            userId: req.user.id
        });

        if (!deletedReminder) {
            return res.status(404).json({ message: 'Reminder not found or already deleted' });
        }

        res.json({ message: 'Reminder deleted successfully', deletedReminder });
    } catch (err) {
        res.status(500).json({ message: 'Failed to delete reminder', error: err.message });
    }
});


  
  

// ✅ Start Server
server.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
});
