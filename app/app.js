const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
const session = require('express-session');
const driver = require('./neo4j');

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


const exportRouter = require('./routes/export-route');
const importRouter = require('./routes/import-route');


app.use('/api', importRouter);
app.use('/api', exportRouter);
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

async function createDefaultController() {
  const session = driver.session();

  try {
    // 1. Создаём контроллера (если нет)
    const controllerResult = await session.run(`
      MERGE (c:Controller { email: $email })
      ON CREATE SET
        c._id = randomUUID(),
        c.password = $password,
        c.first_name = $first_name,
        c.last_name = $last_name,
        c.fines = [],
        c.schedule = [],
        c.create_at = datetime(),
        c.last_update_at = datetime()
      RETURN c._id AS controllerId
    `, {
      email: 'controller003@example.com',
      password: '$2b$10$u3Qd47QQttF2rFPpzt3a6uNIHAdrovCmzirsszfxrzYUfQ/ERDBnG',
      first_name: 'Dmitry',
      last_name: 'Berezin'
    });

    const controllerId = controllerResult.records[0].get('controllerId');

    // 2. Создаём расписания с controllers_id
    const scheduleResult = await session.run(`
      UNWIND $schedules AS s
      CREATE (sch:Schedule {
        _id: randomUUID(),
        date: date(s.date),
        time: s.time,
        route: s.route,
        controllers_id: [$controllerId]
      })
      RETURN sch._id AS id
    `, {
      controllerId,
      schedules: [
        { route: 12, date: '2025-06-03', time: '08:00' },
        { route: 18, date: '2025-06-04', time: '14:30' },
        { route: 25, date: '2025-06-05', time: '18:45' }
      ]
    });

    const scheduleIds = scheduleResult.records.map(record => record.get('id'));

    // 3. Обновляем поле schedule у контроллера
    await session.run(`
      MATCH (c:Controller { email: $email })
      SET c.schedule = $schedule
    `, {
      email: 'controller003@example.com',
      schedule: scheduleIds
    });

    console.log('✅ Контроллер и расписание успешно созданы и связаны');
  } catch (err) {
    console.error('❌ Ошибка при создании контроллера или расписания:', err);
  } finally {
    await session.close();
  }
}




setTimeout(() => {
  createDefaultController();
}, 20000); // Подождать 5 секунд


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});