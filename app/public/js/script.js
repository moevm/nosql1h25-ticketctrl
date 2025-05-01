const form = document.getElementById('todo-form');
const input = document.getElementById('todo-input');
const list = document.getElementById('todo-list');

async function loadTodos() {
    const response = await fetch('/api/todos');
    const todos = await response.json();
    list.innerHTML = '';
    todos.forEach(todo => {
        const li = document.createElement('li');

        const text = document.createElement('span');
        text.textContent = `${todo.title} - ${todo.completed ? '✅' : '❌'}`;
        text.onclick = () => toggleTodo(todo.title, !todo.completed);

        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Delete';
        deleteBtn.classList.add('delete-btn');
        deleteBtn.onclick = (e) => {
            e.stopPropagation();  // чтобы не сработало переключение статуса
            deleteTodo(todo.title);
        };

        li.appendChild(text);
        li.appendChild(deleteBtn);
        list.appendChild(li);
    });
}

form.onsubmit = async (e) => {
    e.preventDefault();
    const title = input.value.trim();
    if (title) {
        await fetch('/api/todos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title })
        });
        input.value = '';
        loadTodos();
    }
};

async function toggleTodo(title, completed) {
    await fetch(`/api/todos/${encodeURIComponent(title)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed })
    });
    loadTodos();
}

async function deleteTodo(title) {
    await fetch(`/api/todos/${encodeURIComponent(title)}`, {
        method: 'DELETE'
    });
    loadTodos();
}

loadTodos();
