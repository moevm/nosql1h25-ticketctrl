const express = require('express');
const driver = require('../neo4j');

const router = express.Router();

router.post('/import-statistics', async (req, res) => {
  const session = driver.session();
  const { fines = [], trips = [], users = [], passengers = [], controllers = [] } = req.body;

  try {
    // Импорт штрафов
    for (const fine of fines) {
      await session.run(`
        MERGE (f:Fine { _id: $id })
        SET f += $props
      `, { id: fine._id, props: fine });
    }

    // Импорт поездок
    for (const trip of trips) {
      await session.run(`
        MERGE (t:Trip { _id: $id })
        SET t += $props
      `, { id: trip._id, props: trip });
    }

    // Импорт пользователей
    for (const user of users) {
      await session.run(`
        MERGE (u:User { email: $email })
        SET u += $props
      `, { email: user.email, props: user });
    }

    // Импорт пассажиров и их связей
    for (const passenger of passengers) {
      await session.run(`
        MERGE (p:Passenger { _id: $id })
        SET p += $props
      `, { id: passenger._id, props: passenger });

      // Связь с поездками
      if (passenger.trips) {
        const tripIds = passenger.trips.split(',');
        for (const tripId of tripIds) {
          await session.run(`
            MATCH (p:Passenger { _id: $pid }), (t:Trip { _id: $tid })
            MERGE (p)-[:PASSENGER_HAS_TRIP]->(t)
          `, { pid: passenger._id, tid: tripId });
        }
      }

      // Связь с штрафами
      if (passenger.fines) {
        const fineIds = passenger.fines.split(',');
        for (const fineId of fineIds) {
          await session.run(`
            MATCH (p:Passenger { _id: $pid }), (f:Fine { _id: $fid })
            MERGE (p)-[:PASSENGER_HAS_FINE]->(f)
          `, { pid: passenger._id, fid: fineId });
        }
      }
    }

    // Импорт контроллеров и их связей
    for (const controller of controllers) {
      await session.run(`
        MERGE (c:Controller { _id: $id })
        SET c += $props
      `, { id: controller._id, props: controller });

      if (controller.fines) {
        const fineIds = controller.fines.split(',').filter(Boolean);
        for (const fineId of fineIds) {
          await session.run(`
            MATCH (c:Controller { _id: $cid }), (f:Fine { _id: $fid })
            MERGE (c)-[:CONTROLLER_ISSUED_FINE]->(f)
          `, { cid: controller._id, fid: fineId });
        }
      }
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
