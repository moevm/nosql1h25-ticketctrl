const express = require('express');
const path = require('path');
const driver = require('../neo4j');
const bcrypt = require('bcryptjs');

const router = express.Router();

// Отображение HTML-страницы аккаунта
router.get('/account', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/controller/account.html'));
});

// Получение данных аккаунта контроллера
router.get('/account-data', async (req, res) => {
    const session = driver.session();
    const email = req.session.email;

    if (!email) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const result = await session.run(
            'MATCH (c:Controller {email: $email}) RETURN c._id AS id, c',
            { email }
        );

        if (result.records.length === 0) {
            return res.status(404).json({ error: 'Controller not found' });
        }

        const controller = result.records[0].get('c').properties;
        const id = result.records[0].get('id').toInt?.() || result.records[0].get('id');

        return res.json({
            ...controller,
            _id: id,
            create_at: controller.create_at ? controller.create_at.toString() : null,
            last_update_at: controller.last_update_at ? controller.last_update_at.toString() : null
        });
    } catch (err) {
        console.error('Error fetching controller data:', err);
        return res.status(500).json({ error: 'Server error' });
    } finally {
        await session.close();
    }
});


// Обновление полей аккаунта контроллера
router.post('/account/update', async (req, res) => {
    const session = driver.session();
    const email = req.session.email;
    const { field, value } = req.body;

    if (!email || !field) {
        return res.status(400).json({ error: 'Invalid data' });
    }

    try {
        const allowedFields = ['email', 'password'];
        if (!allowedFields.includes(field)) {
            return res.status(400).json({ error: 'Field not allowed' });
        }

        let updateValue = value;
        if (field === 'password') {
            updateValue = await bcrypt.hash(value, 10);
        }

        const result = await session.run(
            `MATCH (c:Controller {email: $email})
             SET c.${field} = $value,
                 c.last_update_at = datetime()
             RETURN c`,
            { email, value: updateValue }
        );

        // Обновляем email в сессии, если он поменялся
        if (field === 'email') {
            req.session.email = value;
        }

        return res.status(200).json({ success: true });
    } catch (err) {
        console.error('Ошибка при обновлении данных контроллера:', err);
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
