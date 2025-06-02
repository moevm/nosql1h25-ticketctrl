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
                passenger_id: topup.passenger_id  // исправлено на passenger_id
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

router.post('/account/topup', async (req, res) => {
    const session = driver.session();
    const email = req.session.email;
    const { amount, type } = req.body;

    if (!email) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    if (!amount || !type) {
        return res.status(400).json({ error: 'Missing amount or type' });
    }

    try {
        const passengerResult = await session.run(
            'MATCH (p:Passenger {email: $email}) RETURN p',
            { email }
        );
        if (passengerResult.records.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        const passengerNode = passengerResult.records[0].get('p').properties;
        // оставляем passanger_id как число
        const passanger_id = passengerNode._id;

        const topup_id = Date.now(); // число, например 1, 2, 3, или лучше UUID, если нужно
        const date = new Date().toISOString(); // ISO строка

        await session.run(
            `
            CREATE (t:Topup {
                _id: $topup_id,
                date: $date,
                type: $type,
                amount: $amount,
                passanger_id: $passanger_id
            })
            WITH t
            MATCH (p:Passenger {_id: $passanger_id})
            SET p.topups = coalesce(p.topups, []) + t._id
            RETURN p
            `,
            {
                topup_id, // число
                date,    // строка
                type,    // строка
                amount: parseFloat(amount), // число
                passanger_id // число
            }
        );

        res.json({ message: 'Topup successful' });

    } catch (err) {
        console.error('Error during topup:', err);
        res.status(500).json({ error: 'Server error' });
    } finally {
        await session.close();
    }
});

module.exports = router;