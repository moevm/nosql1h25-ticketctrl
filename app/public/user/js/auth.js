document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = {
        email: e.target.email.value.trim(),
        password: e.target.password.value.trim()
    };

    try {
        const response = await fetch('/user/auth', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });

        if (response.ok) {
            // После успешного входа перенаправляем на страницу аккаунта
            window.location.href = '/user/account';  // Редирект
        } else {
            const data = await response.json();
            alert(data.error || 'Ошибка входа');
        }
    } catch (err) {
        alert('Ошибка соединения с сервером');
    }
});
