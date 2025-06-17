require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { Translate } = require('@google-cloud/translate').v2;
const messageRoutes = require('./routes/message');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/chatbot')
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

// Google Translate Client
const translate = new Translate({ key: process.env.GOOGLE_TRANSLATE_API_KEY });

// Routes
app.use('/api/messages', messageRoutes);

// Basic Route
app.get('/', (req, res) => res.send('Backend is running'));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));