const mongoose = require('mongoose');

const dbURI = 'Enter your MongoDB Connection string here';

const connectToDatabase = () => {
  mongoose.connect(dbURI, () => {
    console.log('connected to database');
  });
}

module.exports = connectToDatabase;