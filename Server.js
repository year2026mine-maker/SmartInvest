const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(express.json());

// Mongoose Schemas & Models
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  phone: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  balance: { type: Number, default: 0 },
  totalInvested: { type: Number, default: 0 }
});

const investmentSchema = new mongoose.Schema({
  userId: String,
  productName: String,
  amount: Number,
  dailyProfit: Number,
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
const Investment = mongoose.model('Investment', investmentSchema);

// Routes
app.get('/', (req, res) => {
  res.send('SmartInvest Backend Server is Running!');
});

app.post('/api/register', async (req, res) => {
  try {
    const { username, phone, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, phone, password: hashedPassword });
    await user.save();
    res.json({ status: 'ok', message: 'রেজিস্ট্রেশন সফল হয়েছে!' });
  } catch (err) {
    res.status(400).json({ error: 'ইউজারনেম বা ফোন নম্বর আগে ব্যবহৃত হয়েছে!' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { phone, password } = req.body;
    const user = await User.findOne({ phone });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ error: 'ভুল ফোন নাম্বার বা পাসওয়ার্ড!' });
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secret123');
    res.json({ token, user: { id: user._id, username: user.username, balance: user.balance } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/invest', async (req, res) => {
  try {
    const { userId, productName, amount, dailyProfit } = req.body;
    const user = await User.findById(userId);
    if (!user || user.balance < amount) {
      return res.status(400).json({ error: 'পর্যাপ্ত ব্যালেন্স নেই!' });
    }
    user.balance -= amount;
    user.totalInvested += amount;
    await user.save();

    const inv = new Investment({ userId, productName, amount, dailyProfit });
    await inv.save();
    res.json({ status: 'ok', balance: user.balance });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
  .then(() => app.listen(PORT, () => console.log(`Server running on port ${PORT}`)))
  .catch(err => console.log('DB Connection Error:', err));
