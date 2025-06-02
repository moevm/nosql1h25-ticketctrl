const express = require('express');
const path = require('path');
const driver = require('../neo4j');
const bcrypt = require('bcryptjs');

const router = express.Router();

router.get('/fines', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/user/fines.html'));
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


router.get('/account/fines', async (req, res) => {
    const session = driver.session();
    const email = req.session.email;

    if (!email) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const result = await session.run(
            `
            MATCH (p:Passenger {email: $email})
            WITH p._id AS passengerId
            MATCH (f:Fine)
            WHERE f.passanger_id = passengerId
            RETURN f._id AS id, f.date AS date, f.controller_id AS controller_id, f.passanger_id AS passanger_id, f.amount AS amount, f.paid AS paid
            ORDER BY f.date DESC
            `,
            { email }
        );

        const fines = result.records.map(record => ({
            id: record.get('id'),
            date: record.get('date'),
            controller_id: record.get('controller_id'),
            passanger_id: record.get('passanger_id'),
            amount: record.get('amount'),
            paid: record.get('paid')
        }));

        res.json(fines);

    } catch (err) {
        console.error('Error fetching fines:', err);
        res.status(500).json({ error: 'Server error' });
    } finally {
        await session.close();
    }
});

router.post('/account/fines/pay', async (req, res) => {
    const session = driver.session();
    const { fineId } = req.body;

    if (!fineId) {
        return res.status(400).json({ error: 'fineId is required' });
    }

    try {
        const result = await session.run(
            `
            MATCH (f:Fine {_id: $fineId})
            SET f.paid = true
            RETURN f._id AS id, f.paid AS paid
            `,
            { fineId }
        );

        if (result.records.length === 0) {
            return res.status(404).json({ error: 'Fine not found' });
        }

        const updated = result.records[0].toObject();
        return res.json({ message: 'Fine updated', updated });
    } catch (err) {
        console.error('Error updating fine:', err);
        return res.status(500).json({ error: 'Server error' });
    } finally {
        await session.close();
    }
});







module.exports = router;
