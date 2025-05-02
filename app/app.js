const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();


app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));


app.get('/', (req, res) => {
    res.redirect('/user/auth');
});


app.use(express.static(path.join(__dirname, 'public')));


const authRoutes = require('./routes/auth_user_routes');
const registrationRoutes = require('./routes/registration_user_routes');
const accountRoutes = require('./routes/account_user_routes');

app.use('/user', authRoutes);
app.use('/user', registrationRoutes);
app.use('/user', accountRoutes);


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});