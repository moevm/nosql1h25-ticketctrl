document.addEventListener('DOMContentLoaded', () => {
    const modalOverlay = document.getElementById('modal-overlay');
    const topFilterModal = document.getElementById('top-filter-modal');
    const filterButtons = document.querySelectorAll('.filter-button'); // Теперь выбираем все кнопки фильтра
    const plusButton = document.getElementById('plus-button'); // вторая кнопка фильтра
    const trashButton = document.getElementById('trash-button');

    const filterModalOverlay = document.getElementById('filter-modal-overlay');
    const filterStep2Modal = document.getElementById('filter-step2-modal');
    const filterStep2ConfirmButton = document.getElementById('filter-step2-confirm');

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            modalOverlay.classList.add('hidden');
            topFilterModal.classList.add('hidden');
            filterModalOverlay.classList.add('hidden');
            filterStep2Modal.classList.add('hidden');
        }
    });

    filterButtons.forEach((button) => {
        button.addEventListener('click', () => {
            topFilterModal.classList.remove('hidden');
        });
    });

    plusButton.addEventListener('click', () => {
        filterModalOverlay.classList.remove('hidden');
        topFilterModal.classList.add('hidden');
    });

    filterModalOverlay.addEventListener('click', (e) => {
        if (e.target === filterModalOverlay) {
            filterModalOverlay.classList.add('hidden');
        }
    });

    document.getElementById('filter-confirm-button').addEventListener('click', () => {
        filterModalOverlay.classList.add('hidden');
        filterStep2Modal.classList.remove('hidden');
    });

    trashButton.addEventListener('click', () => {
        document.getElementById('top-from-date').value = '';
        document.getElementById('top-to-date').value = '';
        document.getElementById('top-from-payment').value = '';
        document.getElementById('top-to-payment').value = '';
    });

    filterStep2ConfirmButton.addEventListener('click', () => {
        filterStep2Modal.classList.add('hidden');
    });
});

document.addEventListener('DOMContentLoaded', () => {
    const plusButton = document.querySelector('.plus-button');
    const addFineModal = document.getElementById('add-fine-modal');
    const addFineConfirm = document.getElementById('add-fine-confirm');

    plusButton.addEventListener('click', () => {
        addFineModal.classList.remove('hidden');
    });

    addFineModal.addEventListener('click', (e) => {
        if (e.target === addFineModal) {
            addFineModal.classList.add('hidden');
        }
    });

    addFineConfirm.addEventListener('click', () => {
        // Здесь можно добавить логику обработки данных формы
        addFineModal.classList.add('hidden');
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            addFineModal.classList.add('hidden');
        }
    });
});


async function fetchFines() {
    const res = await fetch('/controller/fines_paid');
    const fines = await res.json();
    const tbody = document.querySelector('tbody');
    tbody.innerHTML = '';

    fines.forEach(fine => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${fine.date}</td>
            <td>${fine.time}</td>
            <td>${fine.amount}₽</td>
            <td>${fine.lastName}</td>
            <td>${fine.firstName}</td>
            <td></td>
        `;
        tbody.appendChild(tr);
    });

    const trCount = document.createElement('tr');
    trCount.innerHTML = `<td colspan="6">Count: ${fines.length}</td>`;
    tbody.appendChild(trCount);
}
fetchFines();



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

document.getElementById('schedule-menu').addEventListener('click', function (e) {
    e.preventDefault();
    window.location.href = '/controller/schedule';
});


document.addEventListener('DOMContentLoaded', function() {

    const usernameElement = document.getElementById('user-profile');

    if (usernameElement) {
        usernameElement.addEventListener('click', function() {
            window.location.href = 'http://localhost:3000/controller/account';
        });
    }
});
