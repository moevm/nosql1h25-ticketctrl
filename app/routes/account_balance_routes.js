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
        // Получаем пассажира
        const userResult = await session.run(
            'MATCH (p:Passenger {email: $email}) RETURN p',
            { email }
        );

        if (userResult.records.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const passenger = userResult.records[0].get('p').properties;
        const passanger_id = passenger._id;

        // Получаем все пополнения
        const topupResult = await session.run(
            `
            MATCH (t:Topup)
            WHERE t.passanger_id = $passanger_id
            RETURN t
            ORDER BY t.date DESC
            `,
            { passanger_id }
        );

        const topups = topupResult.records.map(r => {
            const t = r.get('t').properties;
            return {
                _id: t._id,
                date: t.date,
                type: t.type,
                amount: parseFloat(t.amount),
                passenger_id: t.passanger_id
            };
        });

        // Получаем все оплаченные штрафы
        const fineResult = await session.run(
            `
            MATCH (f:Fine)
            WHERE f.passanger_id = $passanger_id AND f.paid = true
            RETURN f.amount AS amount
            `,
            { passanger_id }
        );

        const totalTopup = topups.reduce((sum, t) => sum + t.amount, 0);
        const totalFines = fineResult.records.reduce((sum, r) => sum + parseFloat(r.get('amount')), 0);
        const actualBalance = totalTopup - totalFines;

        res.json({ topups, balance: actualBalance });// отправляем историю пополнений, как раньше

        // 👉 Если хочешь отдельно вернуть actualBalance:
        // res.json({ topups, balance: actualBalance });

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