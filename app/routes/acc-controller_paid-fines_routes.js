const express = require('express');
const path = require('path');
const driver = require('../neo4j');
const bcrypt = require('bcryptjs');

const router = express.Router();

router.get('/paid-fines', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/controller/paid-fines.html'));
});


router.get('/fines_paid', async (req, res) => {
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
            WHERE f.controller_id = controllerId AND f.paid = true
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
            return {
                id: record.get('id'),
                date: record.get('date'),
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





module.exports = router;