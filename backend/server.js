const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();

const app = express();

connectDB();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/emails', require('./routes/emails'));
app.use('/api/prompts', require('./routes/prompts'));
app.use('/api/drafts', require('./routes/drafts'));

app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'Email Productivity Agent API is running',
        timestamp: new Date().toISOString()
    });
});

app.use((err, req, res, next) => {
    console.error('Error:', err.message);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal Server Error'
    });
});

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`📧 Email Agent API: http://localhost:${PORT}/api/health`);
});

module.exports = app;