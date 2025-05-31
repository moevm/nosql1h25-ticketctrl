const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
const session = require('express-session');

app.use(session({
    secret: 'zaicam_secret',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
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
const balanceRoutes = require('./routes/account_balance_routes')



const authControllerRoutes = require('./routes/auth_controller_routes');
const controllerAccount = require('./routes/account_controller_routes');
const controllerPaidFines = require('./routes/acc-controller_paid-fines_routes')
const controllerUnpaidFines = require('./routes/acc-controller_unpaid-fines_routes')
const controllerSchedule = require('./routes/acc-controller_schedule_routes')
const controllerDiagram = require('./routes/diagram_routes');


app.use('/user', authRoutes);
app.use('/user', registrationRoutes);
app.use('/user', accountRoutes);
app.use('/user', tripsRoutes);
app.use('/user', finesRoutes);
app.use('/user', balanceRoutes);
app.use('/controller', authControllerRoutes);
app.use('/controller', controllerAccount);
app.use('/controller', controllerPaidFines);
app.use('/controller', controllerUnpaidFines);
app.use('/controller', controllerSchedule);
app.use('/controller', controllerDiagram);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});