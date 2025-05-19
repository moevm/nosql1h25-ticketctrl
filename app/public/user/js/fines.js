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


window.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('/user/account-data');
        const user = await response.json();

        if (!response.ok) {
            console.error(user.error || 'Ошибка получения данных');
            return;
        }



        const sidebarName = document.querySelector('.username');
        sidebarName.textContent = `${user.last_name} ${user.first_name[0]}.`;
    } catch (err) {
        console.error('Ошибка загрузки данных аккаунта:', err);
    }
});


document.addEventListener('DOMContentLoaded', function() {

    const usernameElement = document.getElementById('user-profile');

    if (usernameElement) {
        usernameElement.addEventListener('click', function() {
            window.location.href = 'http://localhost:3000/user/account';
        });
    }
});

const tripsMenuItem = document.getElementById('trips-menu-item');


tripsMenuItem.addEventListener('click', function() {
    window.location.href = 'http://localhost:3000/user/trips';
});



document.addEventListener('DOMContentLoaded', () => {
    loadFines();
});

async function loadFines() {
    try {
        const response = await fetch('/user/account/fines');
        if (!response.ok) throw new Error('Failed to fetch fines');

        const fines = await response.json();

        const unpaidTbody = document.querySelectorAll('.trips-table tbody')[0];
        const paidTbody = document.querySelectorAll('.trips-table tbody')[1];

        if (!unpaidTbody || !paidTbody) throw new Error('Table body not found');

        unpaidTbody.innerHTML = '';
        paidTbody.innerHTML = '';

        let unpaidCount = 0;
        let paidCount = 0;

        for (const fine of fines) {
            const dateObj = new Date(fine.date);
            const date = dateObj.toLocaleDateString();
            const time = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const amount = `${fine.amount}₽`;

            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${date}</td>
                <td>${time}</td>
                <td>${amount}</td>
                <td class="dots">&#8942;</td>
            `;

            if (fine.paid) {
                paidTbody.appendChild(row);
                paidCount++;
            } else {
                unpaidTbody.appendChild(row);
                unpaidCount++;
            }
        }

        const unpaidCountRow = document.createElement('tr');
        unpaidCountRow.innerHTML = `<td colspan="4">Unpaid fines: ${unpaidCount}</td>`;
        unpaidTbody.appendChild(unpaidCountRow);

        const paidCountRow = document.createElement('tr');
        paidCountRow.innerHTML = `<td colspan="4">Paid fines: ${paidCount}</td>`;
        paidTbody.appendChild(paidCountRow);

    } catch (err) {
        console.error('Error loading fines:', err);
    }
}

