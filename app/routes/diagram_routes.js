const express = require('express');
const driver = require('../neo4j');
const router = express.Router();

const path = require('path');

router.get('/diagram', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/controller/diagram.html'));
})

// Роут для всех штрафов без фильтрации
router.get('/diagram/fines_all', async (req, res) => {
    const session = driver.session();
    try {
        const result = await session.run(
            `MATCH (f:Fine)
             OPTIONAL MATCH (p:Passenger) WHERE p._id = f.passanger_id
             RETURN f._id AS id, f.date AS date, f.amount AS amount, f.paid AS paid,
                    p.first_name AS firstName, p.last_name AS lastName`
        );

        const fines = result.records.map(record => ({
            id: record.get('id'),
            date: record.get('date'),
            amount: record.get('amount'),
            paid: record.get('paid'),
            firstName: record.get('firstName'),
            lastName: record.get('lastName'),
        }));

        res.json(fines);
    } catch (err) {
        console.error('Error fetching all fines:', err);
        res.status(500).json({ error: 'Server error' });
    } finally {
        await session.close();
    }
});

// Роут для всех trips без фильтрации
router.get('/diagram/trips_all', async (req, res) => {
    const session = driver.session();
    try {
        const result = await session.run(
            `MATCH (t:Trip)
             RETURN t._id AS id, t.date AS date, t.type AS type, t.coast AS coast,
                    t.passanger_first_name AS firstName, t.passanger_last_name AS lastName`
        );

        const trips = result.records.map(record => ({
            id: record.get('id'),
            date: record.get('date'),
            type: record.get('type'),
            coast: record.get('coast'),
            firstName: record.get('firstName'),
            lastName: record.get('lastName'),
        }));

        res.json(trips);
    } catch (err) {
        console.error('Error fetching all trips:', err);
        res.status(500).json({ error: 'Server error' });
    } finally {
        await session.close();
    }
});

module.exports = router;
