const express = require('express');
const path = require('path');
const driver = require('../neo4j');
const bcrypt = require('bcryptjs');

const router = express.Router();

router.get('/trips', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/user/trips.html'));
});


router.get('/account-data', async (req, res) => {
    const session = driver.session();
    const email = req.session.email;

    if (!email) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const result = await session.run(
            'MATCH (p:Passenger {email: $email}) RETURN p',
            { email }
        );

        if (result.records.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const user = result.records[0].get('p').properties;
        return res.json(user);
    } catch (err) {
        return res.status(500).json({ error: 'Server error' });
    } finally {
        await session.close();
    }
});


router.get('/account/trips', async (req, res) => {
    const session = driver.session();
    const email = req.session.email;

    if (!email) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const result = await session.run(
            `
            MATCH (p:Passenger {email: $email})
            WITH p.trips AS tripIds
            MATCH (t:Trip)
            WHERE t._id IN tripIds
            RETURN t
            ORDER BY t.date DESC
            `,
            { email }
        );

        const trips = result.records.map(record => {
            const trip = record.get('t').properties;
            return {
                id: trip._id,
                date: trip.date,
                route: trip.route,
                passengerId: trip.passanger_id
            };
        });

        res.json(trips);

    } catch (err) {
        console.error('Error fetching trips:', err);
        res.status(500).json({ error: 'Server error' });
    } finally {
        await session.close();
    }
});








module.exports = router;