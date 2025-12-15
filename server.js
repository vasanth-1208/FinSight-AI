const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

// MongoDB connection - Use environment variable or default
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://vasanth51575_db_user:WK1G0tImSfJom6zj@ey-tech.jw1mgsm.mongodb.net/?appName=ey-tech';
const DB_NAME = process.env.DB_NAME || 'alphacoders_bank';

let db = null;
let client = null;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Connect to MongoDB
async function connectMongoDB() {
    try {
        client = new MongoClient(MONGODB_URI);
        await client.connect();
        db = client.db(DB_NAME);
        console.log('✅ Connected to MongoDB');
        return true;
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        return false;
    }
}

// API Routes

// Save customer profile
app.post('/api/customer-profile', async (req, res) => {
    try {
        const profile = {
            ...req.body,
            createdAt: new Date(),
            updatedAt: new Date()
        };
        
        const result = await db.collection('customer_profiles').insertOne(profile);
        res.json({ success: true, id: result.insertedId });
    } catch (error) {
        console.error('Error saving profile:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get customer profile
app.get('/api/customer-profile/:mobile', async (req, res) => {
    try {
        const profile = await db.collection('customer_profiles').findOne({ mobile: req.params.mobile });
        res.json({ success: true, data: profile });
    } catch (error) {
        console.error('Error getting profile:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Save loan application
app.post('/api/loan-application', async (req, res) => {
    try {
        const application = {
            ...req.body,
            timestamp: new Date(),
            createdAt: new Date(),
            updatedAt: new Date()
        };
        
        const result = await db.collection('loan_applications').insertOne(application);
        res.json({ success: true, id: result.insertedId });
    } catch (error) {
        console.error('Error saving application:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get loan applications
app.get('/api/loan-applications/:mobile', async (req, res) => {
    try {
        const applications = await db.collection('loan_applications')
            .find({ mobile: req.params.mobile })
            .sort({ timestamp: -1 })
            .toArray();
        res.json({ success: true, data: applications });
    } catch (error) {
        console.error('Error getting applications:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Update loan application
app.put('/api/loan-application/:id', async (req, res) => {
    try {
        const result = await db.collection('loan_applications').updateOne(
            { _id: req.params.id },
            { $set: { ...req.body, updatedAt: new Date() } }
        );
        res.json({ success: true, modified: result.modifiedCount });
    } catch (error) {
        console.error('Error updating application:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Save chatbot conversation
app.post('/api/chatbot/conversation', async (req, res) => {
    try {
        const conversation = {
            ...req.body,
            createdAt: new Date(),
            updatedAt: new Date()
        };
        
        const result = await db.collection('chatbot_conversations').insertOne(conversation);
        res.json({ success: true, id: result.insertedId });
    } catch (error) {
        console.error('Error saving conversation:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get chatbot conversations
app.get('/api/chatbot/conversations/:mobile', async (req, res) => {
    try {
        const conversations = await db.collection('chatbot_conversations')
            .find({ mobile: req.params.mobile })
            .sort({ createdAt: -1 })
            .toArray();
        res.json({ success: true, data: conversations });
    } catch (error) {
        console.error('Error getting conversations:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Save chatbot response
app.post('/api/chatbot/response', async (req, res) => {
    try {
        const response = {
            ...req.body,
            createdAt: new Date(),
            updatedAt: new Date()
        };
        
        const result = await db.collection('chatbot_responses').insertOne(response);
        res.json({ success: true, id: result.insertedId });
    } catch (error) {
        console.error('Error saving response:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Update loan application incrementally
app.post('/api/loan-application/update', async (req, res) => {
    try {
        const { mobile, field, value } = req.body;
        
        // Find existing application or create new
        const existing = await db.collection('loan_applications').findOne({ 
            mobile: mobile,
            status: 'pending'
        });
        
        if (existing) {
            // Update existing
            await db.collection('loan_applications').updateOne(
                { _id: existing._id },
                { $set: { [field]: value, updatedAt: new Date() } }
            );
            res.json({ success: true, updated: true });
        } else {
            // Create new partial application
            const partialApp = {
                mobile: mobile,
                [field]: value,
                status: 'collecting',
                createdAt: new Date(),
                updatedAt: new Date()
            };
            const result = await db.collection('loan_applications').insertOne(partialApp);
            res.json({ success: true, id: result.insertedId });
        }
    } catch (error) {
        console.error('Error updating application:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Save conversation state
app.post('/api/chatbot/state', async (req, res) => {
    try {
        const state = {
            ...req.body,
            updatedAt: new Date()
        };
        
        // Update or insert
        await db.collection('chatbot_states').updateOne(
            { mobile: req.body.mobile },
            { $set: state },
            { upsert: true }
        );
        
        res.json({ success: true });
    } catch (error) {
        console.error('Error saving state:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get conversation state
app.get('/api/chatbot/state/:mobile', async (req, res) => {
    try {
        const state = await db.collection('chatbot_states').findOne({ 
            mobile: req.params.mobile 
        });
        res.json({ success: true, data: state });
    } catch (error) {
        console.error('Error getting state:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Serve static files
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server
async function startServer() {
    const connected = await connectMongoDB();
    if (connected) {
        app.listen(PORT, () => {
            console.log(`🚀 Server running on http://localhost:${PORT}`);
            console.log(`📊 Dashboard: http://localhost:${PORT}/dashboard.html`);
        });
    } else {
        console.log('⚠️  Starting server without MongoDB (using fallback)');
        app.listen(PORT, () => {
            console.log(`🚀 Server running on http://localhost:${PORT}`);
        });
    }
}

startServer();

