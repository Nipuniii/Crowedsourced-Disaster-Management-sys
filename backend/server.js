const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

const app = express();
app.use(cors( {
  origin: 'http://localhost:5173',  // Your frontend URL
  allowedHeaders: ['Content-Type', 'Authorization'],
}
));
app.use(express.json());
app.use('/uploads', express.static('uploads'));


mongoose.connect(process.env.MONGO_URI, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
}).then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/events', require('./routes/eventRoutes'));
app.use('/api/events', require('./routes/eventRoutes'));


app.listen(5001, () => console.log('Server running on port 5001'));