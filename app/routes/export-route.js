const express = require('express');
const driver = require('../neo4j');

const router = express.Router();

function cleanNodeProperties(props) {
  const newProps = {};
  for (const key in props) {
    const val = props[key];

    if (val === null || val === undefined) {
      newProps[key] = val;
    } else if (typeof val === 'object') {
      if (
        ('year' in val && 'month' in val && 'day' in val) ||
        typeof val.toString === 'function'
      ) {
        newProps[key] = val.toString();
      } else {
        newProps[key] = val;
      }
    } else {
      newProps[key] = val;
    }
  }
  return newProps;
}

router.get('/export-statistics', async (req, res) => {
  const session = driver.session();

  try {
    const finesResult = await session.run('MATCH (f:Fine) RETURN f');
    const fines = finesResult.records.map(r => cleanNodeProperties(r.get('f').properties));

    const tripsResult = await session.run('MATCH (t:Trip) RETURN t');
    const trips = tripsResult.records.map(r => cleanNodeProperties(r.get('t').properties));

    const usersResult = await session.run('MATCH (u:User) RETURN u');
    const users = usersResult.records.map(r => cleanNodeProperties(r.get('u').properties));

    const passengersResult = await session.run('MATCH (p:Passenger) RETURN p');
    const passengers = passengersResult.records.map(r => cleanNodeProperties(r.get('p').properties));

    const controllersResult = await session.run('MATCH (c:Controller) RETURN c');
    const controllers = controllersResult.records.map(r => cleanNodeProperties(r.get('c').properties));

    res.json({ fines, trips, users, passengers, controllers });
  } catch (error) {
    console.error('Ошибка экспорта:', error);
    res.status(500).json({ error: 'Ошибка при экспорте данных' });
  } finally {
    await session.close();
  }
});

module.exports = router;
