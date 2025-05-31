const express = require('express');
const router = express.Router();  // <-- This is where the error is happening
const path = require('path');
const driver = require('../neo4j');
const bcrypt = require('bcryptjs');

// Define routes
router.get('/registration', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/user/registration.html'));
});

router.post('/registration', async (req, res) => {
    const session = driver.session();
    const { email, password, last_name, first_name } = req.body;

    if (!email || !password || !last_name || !first_name) {
        await session.close();
        return res.status(400).send('Недостаточно данных');
    }

    try {
        const existing = await session.run('MATCH (p:Passenger {email: $email}) RETURN p', { email });

        if (existing.records.length > 0) {
            await session.close();
            return res.status(409).send('Этот email уже занят');
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        await session.run(
    `CREATE (p:Passenger {
            _id: $id,
            email: $email,
            password: $password,
            first_name: $first_name,
            last_name: $last_name,
            phone: null,
            payment_phone: null,
            card_number: null,
            create_at: datetime(),
            last_update_at: datetime()
             })`,
            {
                id: Date.now(),
                email,
                password: hashedPassword,
                first_name,
                last_name
            }
        );


        // Редирект на страницу авторизации после успешной регистрации
        return res.redirect('/user/auth');
    } catch (err) {
        return res.status(500).send('Ошибка сервера');
    } finally {
        await session.close();
    }
});


module.exports = router;
