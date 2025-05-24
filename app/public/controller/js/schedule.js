async function loadSchedule() {
    const res = await fetch('/controller/schedule_controller');
    if (!res.ok) {
        console.error('Failed to load schedule');
        return;
    }
    const schedule = await res.json();

    const tbody = document.querySelector('.trips-table tbody');
    tbody.innerHTML = '';  // очистить

    schedule.forEach(item => {
        const dateObj = new Date(item.date);
        if (isNaN(dateObj)) {
            // На всякий случай — выводим пустое значение, если не получилось распарсить
            console.warn('Invalid date:', item.date);
        }
        const dateStr = isNaN(dateObj) ? '' : dateObj.toLocaleDateString('ru-RU');
        const timeStr = isNaN(dateObj) ? '' : dateObj.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });

        const tr = document.createElement('tr');
        tr.innerHTML = `
        <td>${dateStr}</td>
        <td>${timeStr}</td>
        <td>${item.route}</td>
    `;

        tbody.appendChild(tr);
    });


    // Добавим строку с подсчетом
    const countTr = document.createElement('tr');
    countTr.innerHTML = `<td colspan="3">Count: ${schedule.length}</td>`;
    tbody.appendChild(countTr);
}

loadSchedule();

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const res = await fetch('/controller/account-data');
        const data = await res.json();

        if (res.ok) {
            // Подпись в сайдбаре
            document.querySelector('.username').textContent = `${data.last_name} ${data.first_name[0]}.`;
        } else {
            alert(data.error || 'Failed to load account data');
        }
    } catch (err) {
        console.error('Error loading controller data:', err);
        alert('Error loading data');
    }
});





document.getElementById('unpaid-fines-menu').addEventListener('click', function (e) {
    e.preventDefault();
    window.location.href = '/controller/unpaid-fines';
});

document.getElementById('paid-fines-menu').addEventListener('click', function (e) {
    e.preventDefault();
    window.location.href = '/controller/paid-fines';
});


document.addEventListener('DOMContentLoaded', function() {

    const usernameElement = document.getElementById('user-profile');

    if (usernameElement) {
        usernameElement.addEventListener('click', function() {
            window.location.href = 'http://localhost:3000/controller/account';
        });
    }
});