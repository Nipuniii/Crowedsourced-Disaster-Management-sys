const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

mongoose.connect(process.env.MONGO_URI, {
}).then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

const createAdmin = async () => {
  const email = "admin@example.com";
  const existingAdmin = await User.findOne({ email });

  if (existingAdmin) {
    console.log("Admin already exists");
    mongoose.connection.close();
    return;
  }

  const hashedPassword = await bcrypt.hash("admin123", 10);
  const admin = new User({ name: "Admin User", email, password: hashedPassword, role: "admin" });

  await admin.save();
  console.log("Admin created successfully!");
  mongoose.connection.close();
};

createAdmin();
