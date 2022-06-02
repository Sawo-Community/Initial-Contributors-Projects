const express = require('express');
const cors = require('cors');
const connectToDatabase = require('./db');

connectToDatabase();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api/auth', require('./routes/auth'));

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});