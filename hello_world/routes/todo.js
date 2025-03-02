import express from 'express';
import { getSession } from '../neo4j.js';

const router = express.Router();

// Получить все задачи
router.get('/', async (req, res) => {
    const session = getSession();
    const result = await session.run('MATCH (t:Todo) RETURN t');
    const todos = result.records.map(record => record.get('t').properties);
    await session.close();
    res.json(todos);
});

// Создать новую задачу
router.post('/', async (req, res) => {
    const { title } = req.body;
    const session = getSession();
    await session.run('CREATE (t:Todo {title: $title, completed: false})', { title });
    await session.close();
    res.status(201).send('Created');
});

// Обновить задачу (смена статуса)
router.put('/:title', async (req, res) => {
    const { title } = req.params;
    const { completed } = req.body;
    const session = getSession();
    await session.run('MATCH (t:Todo {title: $title}) SET t.completed = $completed', { title, completed });
    await session.close();
    res.send('Updated');
});

// Удалить задачу
router.delete('/:title', async (req, res) => {
    const { title } = req.params;
    const session = getSession();
    await session.run('MATCH (t:Todo {title: $title}) DELETE t', { title });
    await session.close();
    res.send('Deleted');
});

export default router;
