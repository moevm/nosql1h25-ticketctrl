document.addEventListener('DOMContentLoaded', () => {
    const modalOverlay = document.getElementById('modal-overlay');
    const topFilterModal = document.getElementById('top-filter-modal');
    const filterButton = document.querySelector('.filter-button');
    const plusButton = document.getElementById('plus-button');
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

    filterButton.addEventListener('click', () => {
        topFilterModal.classList.remove('hidden');
    });

    topFilterModal.addEventListener('click', (e) => {
        if (e.target === topFilterModal) {
            topFilterModal.classList.add('hidden');
        }
    });

    plusButton.addEventListener('click', () => {
        filterModalOverlay.classList.remove('hidden');
        topFilterModal.classList.add('hidden');
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
    loadTrips();
});

async function loadTrips() {
    try {
        const response = await fetch('/user/account/trips');
        if (!response.ok) throw new Error('Failed to fetch');

        const trips = await response.json();
        const tbody = document.querySelector('.trips-table tbody');
        if (!tbody) throw new Error('Table body not found');

        tbody.innerHTML = '';

        for (const trip of trips) {
            const dateObj = new Date(trip.date);
            const date = dateObj.toLocaleDateString();
            const time = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${date}</td>
                <td>${time}</td>
                <td>Bus</td>
                <td>70₽</td>
            `;
            tbody.appendChild(row);
        }


        const countRow = document.createElement('tr');
        countRow.innerHTML = `<td colspan="4">Count: ${trips.length}</td>`;
        tbody.appendChild(countRow);

    } catch (err) {
        console.error('Error loading trips:', err);
    }
}

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


const finesMenuItem = document.getElementById('fines-menu-item');


finesMenuItem.addEventListener('click', function() {
    window.location.href = 'http://localhost:3000/user/fines';
});


