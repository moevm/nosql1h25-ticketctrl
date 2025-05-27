document.addEventListener('DOMContentLoaded', () => {
    const modalOverlay = document.getElementById('modal-overlay');
    const topFilterModal = document.getElementById('top-filter-modal');
    const filterButton = document.querySelector('.filter-button');
    const plusButton = document.getElementById('plus-button');
    const trashButton = document.getElementById('trash-button');
    const topFilterConfirmButton = document.getElementById('top-filter-confirm');
    const amountInput = document.getElementById('amount-input');
    const modalTitle = document.getElementById('modal-title');

    const filterModalOverlay = document.getElementById('filter-modal-overlay');
    const filterStep2Modal = document.getElementById('filter-step2-modal');
    const filterStep2ConfirmButton = document.getElementById('filter-step2-confirm');

    const typeMap = {
        'СБП': 'Replenishment by СБП',
        'Telephone': 'Replenishment by phone',
        'Card': 'Replenishment by bank card'
    };

    document.querySelectorAll('.payment-trigger').forEach(row => {
        row.addEventListener('click', () => {
            const type = row.dataset.type;
            modalTitle.textContent = typeMap[type] || 'Replenishment';
            modalOverlay.classList.remove('hidden');
            amountInput.value = '';
            amountInput.focus();
        });
    });

    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
            modalOverlay.classList.add('hidden');
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            modalOverlay.classList.add('hidden');
            topFilterModal.classList.add('hidden');
            filterModalOverlay.classList.add('hidden');
            filterStep2Modal.classList.add('hidden');
        }
    });

    document.getElementById('confirm-button').addEventListener('click', () => {
        const amount = amountInput.value.trim();
        if (amount) {
            modalOverlay.classList.add('hidden');
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
    const balanceAmountEl = document.querySelector('.balance-box .amount');
    const paymentHistoryBody = document.querySelector('.table-wrapper tbody');

    async function fetchTopups() {
        try {
            const res = await fetch('/user/account/balance');
            if (!res.ok) throw new Error('Failed to fetch balance data');
            const topups = await res.json();

            // Очистить таблицу истории платежей
            paymentHistoryBody.innerHTML = '';

            // Переменные для суммы и подсчёта
            let totalAmount = 0;

            // Форматтер дат и времени
            const dateOptions = { day: '2-digit', month: '2-digit', year: 'numeric' };
            const timeOptions = { hour: '2-digit', minute: '2-digit' };

            topups.forEach(topup => {
                totalAmount += topup.amount;

                const dateObj = new Date(topup.date);
                const dateStr = dateObj.toLocaleDateString('ru-RU', dateOptions);
                const timeStr = dateObj.toLocaleTimeString('ru-RU', timeOptions);

                const tr = document.createElement('tr');
                tr.innerHTML = `
          <td>${dateStr}</td>
          <td>${timeStr}</td>
          <td>${topup.amount.toFixed(2)}р</td>
          <td>${topup.type}</td>
        `;
                paymentHistoryBody.appendChild(tr);
            });

            // Добавить строку с подсчётом количества
            const countTr = document.createElement('tr');
            countTr.innerHTML = `<td colspan="4">Count: ${topups.length}</td>`;
            paymentHistoryBody.appendChild(countTr);

            // Обновить общий баланс в левой колонке
            balanceAmountEl.textContent = `${totalAmount.toFixed(2).replace('.', ',')} Р`;

        } catch (err) {
            console.error('Error loading topups:', err);
            balanceAmountEl.textContent = 'Ошибка загрузки';
        }
    }

    fetchTopups();
});





document.addEventListener('DOMContentLoaded', async () => {
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


document.addEventListener('DOMContentLoaded', function () {
    const usernameElement = document.getElementById('user-profile');
    if (usernameElement) {
        usernameElement.addEventListener('click', function () {
            window.location.href = 'http://localhost:3000/user/account';
        });
    }
});

const finesMenuItem = document.getElementById('fines-menu-item');
finesMenuItem.addEventListener('click', function () {
    window.location.href = 'http://localhost:3000/user/fines';
});

const tripsMenuItem = document.getElementById('trips-menu-item');
tripsMenuItem.addEventListener('click', function() {
    window.location.href = 'http://localhost:3000/user/trips';
});