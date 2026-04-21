const mongoose = require('mongoose');
const User = require('./models/User');

const run = async () => {
  try {
    await mongoose.connect('mongodb+srv://01fe24bci094:Divya%40843115@cluster0.k5p0j61.mongodb.net/rakshasetu?retryWrites=true&w=majority&appName=Cluster0');
    const users = await User.find({}, 'name email phone role');
    console.log(JSON.stringify(users, null, 2));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};
run();
