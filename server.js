const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('SmartInvest API is Running');
});

app.post('/api/auth/register', (req, res) => {
    const { name, email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: 'সব ফিল্ড পুরন করুন' });
    }
    res.status(200).json({ message: 'রেজিস্ট্রেশন সফল!', token: 'sample-jwt-token' });
});

app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: 'সব ফিল্ড পুরন করুন' });
    }
    res.status(200).json({ message: 'লগইন সফল!', token: 'sample-jwt-token' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
