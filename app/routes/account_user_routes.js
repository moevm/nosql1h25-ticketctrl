const express = require('express');
const path = require('path');
const driver = require('../neo4j');
const bcrypt = require('bcryptjs');

const router = express.Router();

router.get('/account', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/user/account.html'));
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

        if (user._id && typeof user._id.toNumber === 'function') {
            user._id = user._id.toNumber();
        }
        return res.json(user);
    } catch (err) {
        return res.status(500).json({ error: 'Server error' });
    } finally {
        await session.close();
    }
});


router.post('/account/update', async (req, res) => {
    const session = driver.session();
    const email = req.session.email;
    const { field, value } = req.body;

    if (!email || !field) {
        return res.status(400).json({ error: 'Invalid data' });
    }

    try {
        const allowedFields = ['phone', 'email', 'password', 'payment_phone', 'card_number'];
        if (!allowedFields.includes(field)) {
            return res.status(400).json({ error: 'Field not allowed' });
        }

        let updateValue = value;
        if (field === 'password') {
            const bcrypt = require('bcryptjs');
            updateValue = await bcrypt.hash(value, 10);
        }

        const result = await session.run(
            `MATCH (p:Passenger {email: $email})
             SET p.${field} = $value,
                 p.last_update_at = datetime()
             RETURN p`,
            { email, value: updateValue }
        );

        if (field === 'email') {
            req.session.email = value; // обновляем сессию!
        }

        return res.status(200).json({ success: true });

    } catch (err) {
        console.error('Update error:', err);
        return res.status(500).json({ error: 'Server error' });
    } finally {
        await session.close();
    }
});


router.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).json({ error: 'Ошибка при выходе' });
        }
        res.clearCookie('connect.sid'); // если используется cookie-сессия
        res.sendStatus(200);
    });
});




module.exports = router;