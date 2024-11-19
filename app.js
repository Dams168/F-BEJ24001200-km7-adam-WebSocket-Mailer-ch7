require('dotenv').config();
require('./config/instrument.js')
const Sentry = require("@sentry/node");
const express = require('express');
const errorHandler = require('./middleware/errorHandler');
const AuthRoutes = require('./routes/authRoutes');

const app = express();
const port = 3000;
app.set('view engine', 'ejs');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use('/', AuthRoutes);

app.get('/', (req, res) => {
    res.send('Hello World');
});

app.use(errorHandler);

// app.get("/debug-sentry", function mainHandler(req, res) {
//     throw new Error("My first Sentry error!");
// });


app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});