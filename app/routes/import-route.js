const express = require('express');
const driver = require('../neo4j');

const router = express.Router();

router.post('/import-statistics', async (req, res) => {
  const session = driver.session();
  const { fines = [], trips = [], users = [], passengers = [], controllers = [] } = req.body;

  try {
    for (const fine of fines) {
      await session.run(`
        MERGE (f:Fine { _id: $id })
        SET f += $props
      `, { id: fine._id || fine.id, props: fine });
    }

    for (const trip of trips) {
      await session.run(`
        MERGE (t:Trip { date: $date, time: $time, route: $route })
        SET t += $props
      `, { ...trip, props: trip });
    }

    for (const user of users) {
      await session.run(`
        MERGE (u:User { email: $email })
        SET u += $props
      `, { email: user.email, props: user });
    }

    for (const passenger of passengers) {
      await session.run(`
        MERGE (p:Passenger { _id: $id })
        SET p += $props
      `, { id: passenger._id || passenger.id, props: passenger });
    }

    for (const controller of controllers) {
      await session.run(`
        MERGE (c:Controller { email: $email })
        SET c += $props
      `, { email: controller.email, props: controller });
    }

    res.json({ message: 'Импорт завершён успешно' });
  } catch (err) {
    console.error('Ошибка импорта:', err);
    res.status(500).json({ error: 'Ошибка при импорте данных' });
  } finally {
    await session.close();
  }
});

module.exports = router;
