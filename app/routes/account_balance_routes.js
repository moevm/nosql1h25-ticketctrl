const express = require('express');
const path = require('path');
const driver = require('../neo4j');

const router = express.Router();

router.get('/balance', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/user/balance.html'));
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


router.get('/account/balance', async (req, res) => {
    const session = driver.session();
    const email = req.session.email;

    if (!email) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const result = await session.run(
            `
            MATCH (p:Passenger {email: $email})
            WITH p.topups AS topupIds
            MATCH (t:Topup)
            WHERE t._id IN topupIds
            RETURN t
            ORDER BY t.date DESC
            `,
            { email }
        );

        const topups = result.records.map(record => {
            const topup = record.get('t').properties;
            return {
                _id: topup._id,
                date: topup.date,
                type: topup.type,
                amount: parseFloat(topup.amount),
                passanger_id: topup.passanger_id // оставлено как есть, если это не опечатка
            };
        });

        res.json(topups);

    } catch (err) {
        console.error('Error fetching balance:', err);
        res.status(500).json({ error: 'Server error' });
    } finally {
        await session.close();
    }
});


module.exports = router;
