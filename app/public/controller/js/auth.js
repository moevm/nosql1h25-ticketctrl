document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = {
        email: e.target.email.value.trim(),
        password: e.target.password.value.trim()
    };

    try {
        const response = await fetch('/controller/auth_controller', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });

        if (response.ok) {
            // После успешного входа перенаправляем на страницу аккаунта
            window.location.href = '/controller/account';  // Редирект
        } else {
            const data = await response.json();
            alert(data.error || 'Ошибка входа');
        }
    } catch (err) {
        alert('Ошибка соединения с сервером');
    }
});

document.getElementById('passenger-login').addEventListener('click', function (e) {
    e.preventDefault();
    window.location.href = '/user/auth'; // редирект на контроллерскую страницу авторизации
});
