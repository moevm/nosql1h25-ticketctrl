const express = require('express');
const path = require('path');
const driver = require('../neo4j');
const bcrypt = require('bcryptjs');

const router = express.Router();

router.get('/unpaid-fines', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/controller/unpaid-fines.html'));
});


router.get('/fines_unpaid', async (req, res) => {
    const session = driver.session();
    const email = req.session.email;

    if (!email) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const result = await session.run(
            `
            MATCH (c:Controller {email: $email})
            WITH c._id AS controllerId
            MATCH (f:Fine)
            WHERE f.controller_id = controllerId AND f.paid = false
            MATCH (p:Passenger) WHERE p._id = f.passanger_id
            RETURN f._id AS id, 
            f.date AS date, 
            f.amount AS amount, 
            f.paid AS paid,
            p.first_name AS firstName, 
            p.last_name AS lastName
            ORDER BY f.date DESC
            `,
            { email }
        );

        const fines = result.records.map(record => {
            const date = new Date(record.get('date'));
            return {
                id: record.get('id'),
                date: date.toLocaleDateString('ru-RU'),
                time: date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
                amount: record.get('amount'),
                paid: record.get('paid'),
                firstName: record.get('firstName'),
                lastName: record.get('lastName')
            };
        });
        res.json(fines);

    } catch (err) {
        console.error('Error fetching fines for controller:', err);
        res.status(500).json({ error: 'Server error' });
    } finally {
        await session.close();
    }
});



router.get('/account-data', async (req, res) => {
    const session = driver.session();
    const email = req.session.email;

    if (!email) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const result = await session.run(
            'MATCH (c:Controller {email: $email}) RETURN c, id(c) as nodeId',
            { email }
        );

        if (result.records.length === 0) {
            return res.status(404).json({ error: 'Controller not found' });
        }

        const controller = result.records[0].get('c').properties;
        const nodeId = result.records[0].get('nodeId').toInt(); // Neo4j integer

        return res.json({
            ...controller,
            _id: nodeId,
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

router.post('/create-fine', async (req, res) => {
    console.log('POST /create-fine called with body:', req.body);

    const session = driver.session();
    const email = req.session.email;

    if (!email) {
        console.log('Unauthorized: no email in session');
        return res.status(401).json({ error: 'Unauthorized' });
    }

    let { date, amount, passengerId } = req.body;

    if (!date || !amount || !passengerId) {
        console.log('Bad request: missing fields', { date, amount, passengerId });
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const passengerIdNum = Number(passengerId);
    if (isNaN(passengerIdNum)) {
        console.log('Invalid passengerId:', passengerId);
        return res.status(400).json({ error: 'Invalid passengerId' });
    }

    try {
        // Получаем _id контроллера по email из сессии
        const controllerRes = await session.run(
            'MATCH (c:Controller {email: $email}) RETURN c._id AS id',
            { email }
        );
        if (controllerRes.records.length === 0) {
            console.log('Controller not found for email:', email);
            return res.status(404).json({ error: 'Controller not found' });
        }
        const controllerId = controllerRes.records[0].get('id');

        // Генерируем уникальный id штрафа
        const fineId = 'fine-' + Date.now() + '-' + Math.floor(Math.random() * 10000);

        // Создаем штраф и привязываем к пассажиру
        const txResult = await session.writeTransaction(tx =>
            tx.run(
                `
                CREATE (f:Fine {
                    _id: $fineId,
                    date: datetime($date),
                    controller_id: $controllerId,
                    passanger_id: $passengerIdNum,
                    amount: $amount,
                    paid: false
                })
                WITH f
                MATCH (p:Passenger {_id: $passengerIdNum})
                SET p.fines = coalesce(p.fines, []) + f._id
                RETURN f._id AS id
                `,
                { fineId, date, controllerId, passengerIdNum, amount }
            )
        );

        console.log('Fine created with id:', fineId);
        res.json({ message: 'Fine created', fineId });
    } catch (err) {
        console.error('Error creating fine:', err);
        res.status(500).json({ error: 'Server error' });
    } finally {
        await session.close();
    }
});



module.exports = router;