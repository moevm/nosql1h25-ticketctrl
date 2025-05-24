const express = require('express');
const path = require('path');
const driver = require('../neo4j');
const bcrypt = require('bcryptjs');

const router = express.Router();

router.get('/schedule', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/controller/schedule.html'));
});


router.get('/schedule_controller', async (req, res) => {
    const session = driver.session();
    const email = req.session.email;

    if (!email) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        // Получаем id контроллера по email
        const controllerResult = await session.run(
            `MATCH (c:Controller {email: $email}) RETURN c._id AS id`,
            { email }
        );

        if (controllerResult.records.length === 0) {
            return res.status(404).json({ error: 'Controller not found' });
        }

        const controllerId = controllerResult.records[0].get('id');

        // Получаем расписание, где есть этот контроллер в массиве controllers_id
        const scheduleResult = await session.run(
            `
            MATCH (s:Schedule)
            WHERE $controllerId IN s.controllers_id
            RETURN s._id AS id, s.date AS date, s.route AS route, s.controllers_id AS controllers_id
            ORDER BY s.date ASC
            `,
            { controllerId }
        );

        const schedule = scheduleResult.records.map(record => {
            const neo4jDate = record.get('date');
            // Если это объект neo4j DateTime, преобразуем в ISO строку
            const dateISO = neo4jDate.toString ? neo4jDate.toString() : neo4jDate;

            const routeObj = record.get('route');
            const route = (routeObj && routeObj.toInt) ? routeObj.toInt() : routeObj;

            return {
                id: record.get('id'),
                date: dateISO,       // теперь строка ISO
                route: route,
                controllers_id: record.get('controllers_id'),
            };
        });

        res.json(schedule);

    } catch (error) {
        console.error(error);
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