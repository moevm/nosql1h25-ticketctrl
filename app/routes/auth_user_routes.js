const express = require('express');
const path = require('path');
const driver = require('../neo4j');
const bcrypt = require('bcryptjs');

const router = express.Router();


router.get('/auth', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/user/auth.html'));
});


router.post('/auth', async (req, res) => {
    const { email, password } = req.body;
    const session = driver.session();

    try {
        const result = await session.run(
            'MATCH (p:Passenger {email: $email}) RETURN p',
            { email }
        );

        if (result.records.length === 0) {
            return res.status(400).json({ error: 'Пользователь не найден' });
        }

        const user = result.records[0].get('p').properties;

        if (!user.password || typeof user.password !== 'string') {
            console.error('❌ Ошибка: неправильный формат пароля:', user.password);
            return res.status(500).json({ error: 'Неверный формат пароля в базе данных' });
        }

        const match = await bcrypt.compare(password, user.password);

        if (!match) {
            return res.status(400).json({ error: 'Неверный пароль' });
        }

        req.session.email = user.email;
        return res.redirect('/user/account');
    } catch (err) {
        console.error('Login error:', err);
        return res.status(500).json({ error: 'Ошибка сервера' });
    } finally {
        await session.close();
    }
});


module.exports = router;