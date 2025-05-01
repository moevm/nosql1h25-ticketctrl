document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();

    const response = await fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });


    const data = await response.json();

    if (response.ok) {
        alert('Успешный вход!');
        // можно сохранить JWT или перейти на другую страницу
        // localStorage.setItem('token', data.token);
        // window.location.href = '/dashboard.html';
    } else {
        alert(data.error || 'Ошибка входа');
    }
});
