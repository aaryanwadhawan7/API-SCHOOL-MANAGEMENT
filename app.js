const express = require('express');
const bodyParser = require('body-parser');
const schoolsRouter = require('./routes/schools');
require('dotenv').config();

const app = express();

// Middleware
app.use(bodyParser.json());

// Routes
app.use('/', schoolsRouter);

app.get('/', (req, res) => {
  res.send({ message: 'School Management API is running' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
