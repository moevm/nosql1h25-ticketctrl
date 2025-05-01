const express = require('express');
const path = require('path');
const driver = require('../neo4j'); // подключение драйвера Neo4j
const bcrypt = require('bcrypt');

const router = express.Router();

router.get('/register', (req, res) => {
    res.sendFile(path.join(process.cwd(), 'public/user/registration.html'));
});

router.post('/register', async (req, res) => {
    const session = driver.session();

    const {
        email,
        password,
        last_name,
        first_name,
        balance = null,
        card = null,
        phone_number = null
    } = req.body;

    if (!email || !password || !last_name || !first_name) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        // 🔍 Проверка: есть ли уже пассажир с таким email
        const existing = await session.run(
            'MATCH (p:Passenger {email: $email}) RETURN p',
            { email }
        );

        if (existing.records.length > 0) {
            return res.status(409).json({ error: 'Email already registered' });
        }

        // ✅ Хеширование и создание нового пассажира
        const hashedPassword = await bcrypt.hash(password, 10);
        const id = Date.now();

        await session.run(
            `
            CREATE (p:Passenger {
                _id: $id,
                email: $email,
                password: $password,
                first_name: $first_name,
                last_name: $last_name,
                balance: $balance,
                card: $card,
                phone_number: $phone_number,
                create_at: datetime(),
                last_update_at: datetime()
            })
            `,
            {
                id,
                email,
                password: hashedPassword,
                first_name,
                last_name,
                balance,
                card,
                phone_number
            }
        );

        res.status(201).json({ message: 'Passenger created' });
    } catch (err) {
        console.error('Neo4j Error:', err);
        res.status(500).json({ error: err.message });
    } finally {
        await session.close();
    }
});


router.get('/login', (req, res) => {
    res.sendFile(path.join(process.cwd(), 'public/user/auth.html'));
});

router.post('/login', async (req, res) => {
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

        res.json({ message: 'Вход выполнен успешно' });

    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Ошибка сервера' });
    } finally {
        await session.close();
    }
});



module.exports = router;
