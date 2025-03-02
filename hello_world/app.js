import express from 'express';
import dotenv from 'dotenv';
dotenv.config();  // важно!

import todosRouter from './routes/todo.js';

const app = express();

app.use(express.static('public'));
app.use(express.json());

app.use('/api/todos', todosRouter);

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});

console.log('NEO4J_URI:', process.env.NEO4J_URI);  // можешь временно оставить для дебага
