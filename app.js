require('dotenv').config();
const express = require('express');
const errorHandler = require('./middleware/errorHandler');
const AuthRoutes = require('./routes/authRoutes');

const app = express();
const port = 3000;
app.set('view engine', 'ejs');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(errorHandler);

app.use('/', AuthRoutes);

app.get('/', (req, res) => {
    res.send('Hello World');
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});