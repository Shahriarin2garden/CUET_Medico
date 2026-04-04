require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { MongoClient, ServerApiVersion } = require('mongodb');

const uri = `mongodb+srv://${process.env.DB_USER_S}:${process.env.DB_PASSWORD_S}@cluster0.vsegh.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: { version: ServerApiVersion.v1, strict: true, deprecationErrors: true }
});

const doctors = [
  {
    name: "Dr. Rafiq Ahmed",
    email: "rafiq@cuet.ac.bd",
    designation: "Chief Medical Officer",
    specialization: "General Medicine",
    department: "Medical Center",
    phone: "+880-1711-000001",
    available: true,
    rating: 4.8,
    role: "doctor",
    image: "https://randomuser.me/api/portraits/men/32.jpg",
    createdAt: new Date(),
  },
  {
    name: "Dr. Fatema Noor",
    email: "fatema@cuet.ac.bd",
    designation: "Senior Psychiatrist",
    specialization: "Psychiatry",
    department: "Mental Health Wing",
    phone: "+880-1711-000002",
    available: true,
    rating: 4.9,
    role: "doctor",
    image: "https://randomuser.me/api/portraits/women/44.jpg",
    createdAt: new Date(),
  },
  {
    name: "Dr. Kamal Hossain",
    email: "kamal@cuet.ac.bd",
    designation: "Medical Officer",
    specialization: "Internal Medicine",
    department: "Medical Center",
    phone: "+880-1711-000003",
    available: true,
    rating: 4.6,
    role: "doctor",
    image: "https://randomuser.me/api/portraits/men/45.jpg",
    createdAt: new Date(),
  },
  {
    name: "Dr. Nusrat Jahan",
    email: "nusrat@cuet.ac.bd",
    designation: "Counselor",
    specialization: "Counseling Psychology",
    department: "Student Welfare",
    phone: "+880-1711-000004",
    available: false,
    rating: 4.7,
    role: "doctor",
    image: "https://randomuser.me/api/portraits/women/68.jpg",
    createdAt: new Date(),
  },
];

const students = [
  {
    name: "Shaan Ahmed",
    studentName: "Shaan Ahmed",
    email: "shaan123@gmail.com",
    department: "CSE",
    batch: "2020",
    hallName: "Shaheed Abdur Rab Hall",
    roomName: "305-A",
    phone: "+880-1812-000001",
    role: "student",
    createdAt: new Date(),
  },
  {
    name: "Tanvir Rahman",
    studentName: "Tanvir Rahman",
    email: "tanvir@student.cuet.ac.bd",
    department: "EEE",
    batch: "2021",
    hallName: "Bangabandhu Hall",
    roomName: "210-B",
    phone: "+880-1812-000002",
    role: "student",
    createdAt: new Date(),
  },
  {
    name: "Ayesha Siddika",
    studentName: "Ayesha Siddika",
    email: "ayesha@student.cuet.ac.bd",
    department: "ME",
    batch: "2021",
    hallName: "Begum Khaleda Zia Hall",
    roomName: "112-A",
    phone: "+880-1812-000003",
    role: "student",
    createdAt: new Date(),
  },
  {
    name: "Rahim Uddin",
    studentName: "Rahim Uddin",
    email: "rahim@student.cuet.ac.bd",
    department: "CE",
    batch: "2020",
    hallName: "Shaheed Abdur Rab Hall",
    roomName: "408-C",
    phone: "+880-1812-000004",
    role: "student",
    createdAt: new Date(),
  },
  {
    name: "Nadia Islam",
    studentName: "Nadia Islam",
    email: "nadia@student.cuet.ac.bd",
    department: "CSE",
    batch: "2022",
    hallName: "Begum Khaleda Zia Hall",
    roomName: "215-B",
    phone: "+880-1812-000005",
    role: "student",
    createdAt: new Date(),
  },
];

const today = new Date();
const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
const nextWeek = new Date(today); nextWeek.setDate(today.getDate() + 7);

const appointments = [
  {
    studentName: "Shaan Ahmed",
    studentEmail: "shaan123@gmail.com",
    doctorName: "Dr. Rafiq Ahmed",
    doctorDesignation: "Chief Medical Officer",
    appointmentDay: tomorrow.toISOString(),
    selectedTime: "10:00 AM",
    reason: "Routine health checkup",
    status: "confirmed",
    createdAt: new Date(),
  },
  {
    studentName: "Tanvir Rahman",
    studentEmail: "tanvir@student.cuet.ac.bd",
    doctorName: "Dr. Fatema Noor",
    doctorDesignation: "Senior Psychiatrist",
    appointmentDay: tomorrow.toISOString(),
    selectedTime: "11:30 AM",
    reason: "Stress and anxiety consultation",
    status: "confirmed",
    createdAt: new Date(),
  },
  {
    studentName: "Ayesha Siddika",
    studentEmail: "ayesha@student.cuet.ac.bd",
    doctorName: "Dr. Kamal Hossain",
    doctorDesignation: "Medical Officer",
    appointmentDay: nextWeek.toISOString(),
    selectedTime: "2:00 PM",
    reason: "Follow-up for fever treatment",
    status: "pending",
    createdAt: new Date(),
  },
  {
    studentName: "Rahim Uddin",
    studentEmail: "rahim@student.cuet.ac.bd",
    doctorName: "Dr. Nusrat Jahan",
    doctorDesignation: "Counselor",
    appointmentDay: nextWeek.toISOString(),
    selectedTime: "3:30 PM",
    reason: "Academic stress counseling",
    status: "pending",
    createdAt: new Date(),
  },
  {
    studentName: "Nadia Islam",
    studentEmail: "nadia@student.cuet.ac.bd",
    doctorName: "Dr. Fatema Noor",
    doctorDesignation: "Senior Psychiatrist",
    appointmentDay: tomorrow.toISOString(),
    selectedTime: "4:00 PM",
    reason: "Sleep disorder consultation",
    status: "confirmed",
    createdAt: new Date(),
  },
];

const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
const twoDaysAgo = new Date(today); twoDaysAgo.setDate(today.getDate() - 2);

const chatSessions = [
  {
    doctorName: "Dr. Fatema Noor",
    doctorEmail: "fatema@cuet.ac.bd",
    patientName: "Shaan Ahmed",
    patientEmail: "shaan123@gmail.com",
    messages: [
      { sender: "doctor", senderName: "Dr. Fatema Noor", text: "Hello Shaan, how are you feeling today?", isVoiceNote: false, timestamp: new Date(twoDaysAgo.getTime() + 1000 * 60 * 0) },
      { sender: "patient", senderName: "Shaan Ahmed", text: "Hi doctor, I've been feeling very anxious lately. I can't focus on my studies and I feel overwhelmed with assignments.", isVoiceNote: false, timestamp: new Date(twoDaysAgo.getTime() + 1000 * 60 * 1) },
      { sender: "doctor", senderName: "Dr. Fatema Noor", text: "I understand. How long have you been experiencing this?", isVoiceNote: false, timestamp: new Date(twoDaysAgo.getTime() + 1000 * 60 * 2) },
      { sender: "patient", senderName: "Shaan Ahmed", text: "About two weeks now. I also have trouble sleeping and sometimes feel sad for no reason. My appetite has decreased too.", isVoiceNote: true, timestamp: new Date(twoDaysAgo.getTime() + 1000 * 60 * 3) },
      { sender: "doctor", senderName: "Dr. Fatema Noor", text: "Thank you for sharing. These symptoms suggest you might be going through a stressful period. Let's discuss some coping strategies.", isVoiceNote: false, timestamp: new Date(twoDaysAgo.getTime() + 1000 * 60 * 5) },
      { sender: "patient", senderName: "Shaan Ahmed", text: "That would be helpful. I've also been avoiding social gatherings which is unlike me.", isVoiceNote: false, timestamp: new Date(twoDaysAgo.getTime() + 1000 * 60 * 6) },
    ],
    status: "ended",
    createdAt: twoDaysAgo,
    endedAt: new Date(twoDaysAgo.getTime() + 1000 * 60 * 30),
    mlAnalysis: {
      prediction: "Anxiety",
      confidence: 0.78,
      explanation: [["anxious", 0.35], ["overwhelmed", 0.28], ["trouble sleeping", 0.22], ["sad", 0.18], ["avoiding", 0.15]]
    },
  },
  {
    doctorName: "Dr. Rafiq Ahmed",
    doctorEmail: "rafiq@cuet.ac.bd",
    patientName: "Tanvir Rahman",
    patientEmail: "tanvir@student.cuet.ac.bd",
    messages: [
      { sender: "doctor", senderName: "Dr. Rafiq Ahmed", text: "Good morning Tanvir. What brings you here today?", isVoiceNote: false, timestamp: new Date(yesterday.getTime() + 1000 * 60 * 0) },
      { sender: "patient", senderName: "Tanvir Rahman", text: "Good morning doctor. I've been having headaches and feeling tired all the time.", isVoiceNote: false, timestamp: new Date(yesterday.getTime() + 1000 * 60 * 1) },
      { sender: "doctor", senderName: "Dr. Rafiq Ahmed", text: "How often do you get these headaches?", isVoiceNote: false, timestamp: new Date(yesterday.getTime() + 1000 * 60 * 2) },
      { sender: "patient", senderName: "Tanvir Rahman", text: "Almost every day for the past week. I think it might be stress from exams.", isVoiceNote: true, timestamp: new Date(yesterday.getTime() + 1000 * 60 * 3) },
    ],
    status: "ended",
    createdAt: yesterday,
    endedAt: new Date(yesterday.getTime() + 1000 * 60 * 20),
    mlAnalysis: null,
  },
  {
    doctorName: "Dr. Nusrat Jahan",
    doctorEmail: "nusrat@cuet.ac.bd",
    patientName: "Nadia Islam",
    patientEmail: "nadia@student.cuet.ac.bd",
    messages: [
      { sender: "doctor", senderName: "Dr. Nusrat Jahan", text: "Hi Nadia, welcome. Please tell me what's on your mind.", isVoiceNote: false, timestamp: new Date(today.getTime() - 1000 * 60 * 30) },
      { sender: "patient", senderName: "Nadia Islam", text: "Hi doctor. I've been feeling really depressed lately. I don't enjoy things I used to love.", isVoiceNote: false, timestamp: new Date(today.getTime() - 1000 * 60 * 28) },
      { sender: "doctor", senderName: "Dr. Nusrat Jahan", text: "I'm glad you came to talk about this. Can you tell me more?", isVoiceNote: false, timestamp: new Date(today.getTime() - 1000 * 60 * 26) },
    ],
    status: "active",
    createdAt: new Date(today.getTime() - 1000 * 60 * 30),
    endedAt: null,
    mlAnalysis: null,
  },
  {
    doctorName: "Dr. Fatema Noor",
    doctorEmail: "fatema@cuet.ac.bd",
    patientName: "Ayesha Siddika",
    patientEmail: "ayesha@student.cuet.ac.bd",
    messages: [
      { sender: "doctor", senderName: "Dr. Fatema Noor", text: "Hello Ayesha, how can I help you today?", isVoiceNote: false, timestamp: new Date(today.getTime() - 1000 * 60 * 15) },
      { sender: "patient", senderName: "Ayesha Siddika", text: "Doctor, I've been having panic attacks during exams. My heart races and I feel like I can't breathe.", isVoiceNote: true, timestamp: new Date(today.getTime() - 1000 * 60 * 13) },
    ],
    status: "active",
    createdAt: new Date(today.getTime() - 1000 * 60 * 15),
    endedAt: null,
    mlAnalysis: null,
  },
];

async function seed() {
  try {
    await client.connect();
    console.log("Connected to MongoDB");

    const db = client.db("CUETMedico");

    // Clear existing data
    await db.collection("doctors").deleteMany({});
    await db.collection("students").deleteMany({});
    await db.collection("appointmentform").deleteMany({});
    await db.collection("chatSessions").deleteMany({});

    // Insert seed data
    const docResult = await db.collection("doctors").insertMany(doctors);
    console.log(`Inserted ${docResult.insertedCount} doctors`);

    const studResult = await db.collection("students").insertMany(students);
    console.log(`Inserted ${studResult.insertedCount} students`);

    const aptResult = await db.collection("appointmentform").insertMany(appointments);
    console.log(`Inserted ${aptResult.insertedCount} appointments`);

    const sessResult = await db.collection("chatSessions").insertMany(chatSessions);
    console.log(`Inserted ${sessResult.insertedCount} chat sessions`);

    console.log("\nSeed complete! Sample data added to database.");
  } catch (error) {
    console.error("Seed failed:", error);
  } finally {
    await client.close();
  }
}

seed();
