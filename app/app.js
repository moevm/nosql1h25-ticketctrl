const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
const session = require('express-session');

app.use(session({
    secret: 'zaicam_secret', // замени на более надежный ключ
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // true только если HTTPS
}));


app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));


app.get('/', (req, res) => {
    res.redirect('/user/auth');
});


app.use(express.static(path.join(__dirname, 'public')));


const authRoutes = require('./routes/auth_user_routes');
const registrationRoutes = require('./routes/registration_user_routes');
const accountRoutes = require('./routes/account_user_routes');
const tripsRoutes = require('./routes/account_trips_routes');
const finesRoutes = require('./routes/unpaid_routes');

app.use('/user', authRoutes);
app.use('/user', registrationRoutes);
app.use('/user', accountRoutes);
app.use('/user', tripsRoutes);
app.use('/user', finesRoutes)

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});