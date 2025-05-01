const express = require('express');
const router = express.Router();
const driver = require('../neo4j');
const bcrypt = require('bcrypt');

// Регистрация
router.post('/register', async (req, res) => {
    const { username, password } = req.body;
    const session = driver.session();

    try {
        const hash = await bcrypt.hash(password, 10);

        const result = await session.run(
            'MERGE (u:User {username: $username}) ' +
            'ON CREATE SET u.password = $password ' +
            'RETURN u',
            { username, password: hash }
        );

        if (result.summary.counters.updates().nodesCreated === 0) {
            return res.status(409).send('User already exists');
        }

        res.send('User registered');
    } catch (err) {
        res.status(500).send('Registration error');
    } finally {
        await session.close();
    }
});

// Логин
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const session = driver.session();

    try {
        const result = await session.run(
            'MATCH (u:User {username: $username}) RETURN u.password AS hash',
            { username }
        );

        if (result.records.length === 0) return res.status(401).send('Invalid credentials');

        const hash = result.records[0].get('hash');
        const match = await bcrypt.compare(password, hash);

        if (!match) return res.status(401).send('Invalid credentials');

        res.send('Login successful');
    } catch (err) {
        res.status(500).send('Login error');
    } finally {
        await session.close();
    }
});

module.exports = router;
