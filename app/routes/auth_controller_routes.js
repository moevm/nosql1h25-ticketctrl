const express = require('express');
const path = require('path');
const driver = require('../neo4j');
const bcrypt = require('bcryptjs');

const router = express.Router();

// Страница авторизации
router.get('/auth_controller', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/controller/auth.html'));
});

// Обработка авторизации
router.post('/auth_controller', async (req, res) => {
    const { email, password } = req.body;
    const session = driver.session();

    try {
        const result = await session.run(
            'MATCH (c:Controller {email: $email}) RETURN c',
            { email }
        );

        if (result.records.length === 0) {
            return res.status(400).json({ error: 'Контроллер не найден' });
        }

        const controller = result.records[0].get('c').properties;

        if (!controller.password || typeof controller.password !== 'string') {
            console.error('❌ Ошибка: неправильный формат пароля:', controller.password);
            return res.status(500).json({ error: 'Неверный формат пароля в базе данных' });
        }

        const match = await bcrypt.compare(password, controller.password);

        if (!match) {
            return res.status(400).json({ error: 'Неверный пароль' });
        }

        req.session.email = controller.email;
        return res.redirect('/controller/account'); // Можно заменить на нужную страницу
    } catch (err) {
        console.error('Ошибка входа:', err);
        return res.status(500).json({ error: 'Ошибка сервера' });
    } finally {
        await session.close();
    }
});

module.exports = router;
