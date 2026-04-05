const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const bodyParser = require("body-parser");
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const { generateRecommendation } = require('./utils/recommendationEngine');


const app = express();
const port = process.env.PORT || 5000;
const allowedOrigin = process.env.CLIENT_ORIGIN || 'http://localhost:5173';

// Create HTTP server and attach Socket.io
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: allowedOrigin,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

const corOptions = {
    origin: allowedOrigin,
    methods: "GET, POST, PUT, DELETE, PATCH, HEAD",
    credentials: true
};

app.disable('x-powered-by');
app.use(express.json());
app.use(bodyParser.json());
app.use(cors(corOptions));
app.use(cookieParser());

const uri = `mongodb+srv://${process.env.DB_USER_S}:${process.env.DB_PASSWORD_S}@cluster0.vsegh.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function connectDB() {
  try {
    await client.connect();
    console.log("Connected to MongoDB!");

    const database = client.db("CUETMedico");
    const appointmentCollection = database.collection("appointmentform");
    const doctorsCollection = database.collection("doctors");
    const studentCollection = database.collection("students");
    const chatSessionCollection = database.collection("chatSessions");
    const screeningCollection = database.collection("screenings");

    // ── Screening Endpoints ──

    // Save a screening result
    app.post('/api/screenings', async (req, res) => {
      try {
        const body = req.body;
        body.createdAt = new Date();
        const result = await screeningCollection.insertOne(body);
        res.status(200).json({ id: result.insertedId, message: "Screening saved" });
      } catch (error) {
        res.status(500).json({ error: "Failed to save screening" });
      }
    });

    // Get all screenings for a student
    app.get('/api/screenings', async (req, res) => {
      try {
        const { email } = req.query;
        if (!email) return res.status(400).json({ error: "Email required" });
        const screenings = await screeningCollection.find({ studentEmail: email })
          .sort({ createdAt: -1 }).toArray();
        res.json(screenings);
      } catch (error) {
        res.status(500).json({ error: "Failed to fetch screenings" });
      }
    });

    // Get a single screening by ID
    app.get('/api/screenings/:id', async (req, res) => {
      try {
        const screening = await screeningCollection.findOne({ _id: new ObjectId(req.params.id) });
        if (!screening) return res.status(404).json({ error: "Screening not found" });
        res.json(screening);
      } catch (error) {
        res.status(500).json({ error: "Failed to fetch screening" });
      }
    });

    // Generate recommendation using direct payload or existing screening record
    app.post('/api/recommendation/screening', async (req, res) => {
      try {
        const { screeningId, persist, ...payload } = req.body || {};

        let screeningData = payload;
        let resolvedScreeningId = null;

        if (screeningId) {
          if (!ObjectId.isValid(screeningId)) {
            return res.status(400).json({ error: "Invalid screeningId" });
          }

          const existing = await screeningCollection.findOne({ _id: new ObjectId(screeningId) });
          if (!existing) {
            return res.status(404).json({ error: "Screening not found" });
          }

          // Merge DB record with optional request overrides.
          screeningData = { ...existing, ...payload };
          resolvedScreeningId = screeningId;
        }

        const recommendation = generateRecommendation(screeningData);

        let persisted = false;
        if (resolvedScreeningId && persist !== false) {
          await screeningCollection.updateOne(
            { _id: new ObjectId(resolvedScreeningId) },
            {
              $set: {
                recommendation,
                recommendationUpdatedAt: new Date(),
              },
            }
          );
          persisted = true;
        }

        res.json({
          recommendation,
          screeningId: resolvedScreeningId,
          persisted,
        });
      } catch (error) {
        console.error("Recommendation error:", error);
        res.status(500).json({ error: "Failed to generate recommendation" });
      }
    });

    // Post a new appointment
    app.post('/api/appointmentform', async (req, res) => {
        const body = req.body;
        body.createdAt = new Date();
        const result = await appointmentCollection.insertOne(body);
        if (result.insertedId) {
            res.status(200).json({ message: "Appointment successfully booked", appointment: body });
        } else {
            res.status(500).json({ message: "Error booking appointment" });
        }
    });

    // Get all appointments
    app.get('/api/appointmentform', async (req, res) => {
      const appointments = await appointmentCollection.find({}).toArray();
      res.send(appointments);
    });

    // Post a new doctor
    app.post('/api/doctors', async (req, res) => {
        const body = req.body;
        body.createdAt = new Date();
        const result = await doctorsCollection.insertOne(body);
        if (result.insertedId) {
            res.status(200).json({ message: "Doctor successfully added", doctor: body });
        } else {
            res.status(500).json({ message: "Error adding doctor" });
        }
    });

    // Post a new student
    app.post('/api/students', async (req, res) => {
        const body = req.body;
        body.createdAt = new Date();
        const result = await studentCollection.insertOne(body);
        if (result.insertedId) {
            res.status(200).json({ message: "Student successfully added", student: body });
        } else {
            res.status(500).json({ message: "Error adding student" });
        }
    });

    //get all doctors
    app.get("/all-doctors",async(req,res) => {
      const doctors = await doctorsCollection.find({}).toArray()
      res.send(doctors);
    })

    // get all students
    app.get("/all-students", async (req, res) => {
      const students = await studentCollection.find({}).toArray();
      res.send(students);
    });

    //get single doctor using id
    app.get("/all-doctors/:id",async(req, res) => {
      const id = req.params.id;
      const doctorId = await doctorsCollection.findOne({
        _id: new ObjectId(id)
      })
      res.send(doctorId)
    })

    //delete a doctor
    app.delete("/all-doctors/:id", async(req,res)=> {
      const id = req.params.id;
      const  filter = {_id: new ObjectId(id)}
      const result = await doctorsCollection.deleteOne(filter);
      res.send(result)
    })

    // ── Chat Session REST Endpoints ──

    // Create a new chat session
    app.post('/api/chat/create', async (req, res) => {
      try {
        const { appointmentId, doctorName, doctorEmail, patientName, patientEmail } = req.body;
        const session = {
          appointmentId: appointmentId || null,
          doctorName,
          doctorEmail,
          patientName,
          patientEmail,
          messages: [],
          status: "active",
          createdAt: new Date(),
          endedAt: null,
          mlAnalysis: null,
        };
        const result = await chatSessionCollection.insertOne(session);
        res.status(200).json({ sessionId: result.insertedId, ...session });
      } catch (error) {
        res.status(500).json({ error: "Failed to create chat session" });
      }
    });

    // Get a chat session by ID
    app.get('/api/chat/session/:id', async (req, res) => {
      try {
        const session = await chatSessionCollection.findOne({ _id: new ObjectId(req.params.id) });
        if (!session) return res.status(404).json({ error: "Session not found" });
        res.json(session);
      } catch (error) {
        res.status(500).json({ error: "Failed to fetch session" });
      }
    });

    // Get all sessions for a user (by email)
    app.get('/api/chat/sessions', async (req, res) => {
      try {
        const { email } = req.query;
        if (!email) return res.status(400).json({ error: "Email required" });
        const sessions = await chatSessionCollection.find({
          $or: [{ doctorEmail: email }, { patientEmail: email }]
        }).sort({ createdAt: -1 }).toArray();
        res.json(sessions);
      } catch (error) {
        res.status(500).json({ error: "Failed to fetch sessions" });
      }
    });

    // Analyze patient transcript via LIME
    app.post('/api/chat/analyze/:id', async (req, res) => {
      try {
        const session = await chatSessionCollection.findOne({ _id: new ObjectId(req.params.id) });
        if (!session) return res.status(404).json({ error: "Session not found" });

        // Collect all patient messages
        const patientMessages = session.messages
          .filter(m => m.sender === "patient")
          .map(m => m.text)
          .join(". ");

        if (patientMessages.length < 10) {
          return res.status(400).json({ error: "Not enough patient messages to analyze" });
        }

        // Call ML explain endpoint
        const mlResponse = await fetch('http://localhost:5001/explain', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: patientMessages, num_features: 15 }),
        });
        const mlData = await mlResponse.json();

        if (!mlResponse.ok) {
          return res.status(mlResponse.status).json(mlData);
        }

        // Store analysis in session
        await chatSessionCollection.updateOne(
          { _id: new ObjectId(req.params.id) },
          { $set: { mlAnalysis: mlData } }
        );

        res.json(mlData);
      } catch (error) {
        res.status(503).json({ error: "ML service unavailable. Ensure Flask server is running." });
      }
    });

    // End a chat session
    app.post('/api/chat/end/:id', async (req, res) => {
      try {
        await chatSessionCollection.updateOne(
          { _id: new ObjectId(req.params.id) },
          { $set: { status: "ended", endedAt: new Date() } }
        );
        res.json({ message: "Session ended" });
      } catch (error) {
        res.status(500).json({ error: "Failed to end session" });
      }
    });

    // ── Socket.io Real-time Chat ──
    io.on('connection', (socket) => {
      console.log('User connected:', socket.id);

      socket.on('join-session', (sessionId) => {
        socket.join(sessionId);
        console.log(`Socket ${socket.id} joined session ${sessionId}`);
      });

      socket.on('send-message', async (data) => {
        const { sessionId, sender, senderName, text, isVoiceNote } = data;
        const message = {
          sender,
          senderName,
          text,
          isVoiceNote: isVoiceNote || false,
          timestamp: new Date(),
        };

        // Save to MongoDB
        try {
          await chatSessionCollection.updateOne(
            { _id: new ObjectId(sessionId) },
            { $push: { messages: message } }
          );
        } catch (err) {
          console.error('Failed to save message:', err);
        }

        // Send to sender as confirmation
        socket.emit('new-message', message);
        // Broadcast to others in the room
        socket.to(sessionId).emit('new-message', message);
      });

      socket.on('end-session', async (sessionId) => {
        try {
          await chatSessionCollection.updateOne(
            { _id: new ObjectId(sessionId) },
            { $set: { status: "ended", endedAt: new Date() } }
          );
        } catch (err) {
          console.error('Failed to end session:', err);
        }
        io.to(sessionId).emit('session-ended');
      });

      socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
      });
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");

  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
}

connectDB();

// ── ML Service Proxy Routes (Flask on port 5001) ──
// These are outside connectDB() so they work even if MongoDB is down
app.post('/api/ml/predict', async (req, res) => {
    try {
        const response = await fetch('http://localhost:5001/predict', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(req.body),
        });
        const data = await response.json();
        res.status(response.status).json(data);
    } catch (error) {
        res.status(503).json({ error: 'ML service unavailable. Ensure Flask server is running on port 5001.' });
    }
});

app.post('/api/ml/explain', async (req, res) => {
    try {
        const response = await fetch('http://localhost:5001/explain', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(req.body),
        });
        const data = await response.json();
        res.status(response.status).json(data);
    } catch (error) {
        res.status(503).json({ error: 'ML service unavailable. Ensure Flask server is running on port 5001.' });
    }
});

app.get('/', (req, res) => {
    res.send('Hello World!');
});

// Use server.listen instead of app.listen for Socket.io
server.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
