// Функция для парсинга даты из объекта с полями year, month, day, hour и т.д.
function parseDateFromObject(obj) {
    if (!obj || typeof obj !== 'object') return null;

    const year = obj.year?.low ?? 0;
    const month = (obj.month?.low ?? 1) - 1; // месяцы в JS с 0
    const day = obj.day?.low ?? 1;
    const hour = obj.hour?.low ?? 0;
    const minute = obj.minute?.low ?? 0;
    const second = obj.second?.low ?? 0;

    return new Date(Date.UTC(year, month, day, hour, minute, second));
}

// Функция для форматирования даты и времени
function formatDateTime(dateObjFromServer) {
    const dateObj = parseDateFromObject(dateObjFromServer);
    if (!dateObj || isNaN(dateObj)) return { date: "Invalid Date", time: "Invalid Date" };

    const day = String(dateObj.getUTCDate()).padStart(2, '0');
    const month = String(dateObj.getUTCMonth() + 1).padStart(2, '0');
    const year = dateObj.getUTCFullYear();

    const hours = String(dateObj.getUTCHours()).padStart(2, '0');
    const minutes = String(dateObj.getUTCMinutes()).padStart(2, '0');

    return {
        date: `${day}.${month}.${year}`,
        time: `${hours}:${minutes}`
    };
}

document.addEventListener('DOMContentLoaded', () => {
    const plusButton = document.getElementById('plus-button');
    const trashButton = document.getElementById('trash-button');
    const filterButtons = document.querySelectorAll('.filter-button');
    const topFilterModal = document.getElementById('top-filter-modal');
    const filterModalOverlay = document.getElementById('filter-modal-overlay');
    const segmentSelect = document.getElementById('segment-select');
    const fromInput = document.getElementById('from-input');
    const toInput = document.getElementById('to-input');
    const filterConfirmButton = document.getElementById('filter-confirm-button');

    let finesData = [];
    let unpaidFilters = [];
    let paidFilters = [];
    let currentTable = null; // 'unpaid' или 'paid'
    let selectedFineId = null;

    async function fetchFines() {
        try {
            const response = await fetch('/user/account/fines');
            if (!response.ok) throw new Error('Failed to fetch fines');
            const data = await response.json();
            finesData = data;
            applyFiltersAndRender();
        } catch (err) {
            console.error(err);
        }
    }

    function applyFiltersAndRender() {
        let filteredUnpaid = finesData.filter(fine => !fine.paid);
        unpaidFilters.forEach(filter => {
            if (filter.type === 'date') {
                filteredUnpaid = filteredUnpaid.filter(fine => {
                    const fineDate = parseDateFromObject(fine.date);
                    return fineDate >= filter.from && fineDate <= filter.to;
                });
            } else if (filter.type === 'fine') {
                filteredUnpaid = filteredUnpaid.filter(fine => {
                    return fine.amount >= filter.from && fine.amount <= filter.to;
                });
            }
        });

        let filteredPaid = finesData.filter(fine => fine.paid);
        paidFilters.forEach(filter => {
            if (filter.type === 'date') {
                filteredPaid = filteredPaid.filter(fine => {
                    const fineDate = parseDateFromObject(fine.date);
                    return fineDate >= filter.from && fineDate <= filter.to;
                });
            } else if (filter.type === 'fine') {
                filteredPaid = filteredPaid.filter(fine => {
                    return fine.amount >= filter.from && fine.amount <= filter.to;
                });
            }
        });

        renderTables(filteredUnpaid, filteredPaid);
    }

    function renderTables(unpaidFines, paidFines) {
        const unpaidTbody = document.querySelectorAll('.trips-table tbody')[0];
        const paidTbody = document.querySelectorAll('.trips-table tbody')[1];

        unpaidTbody.innerHTML = '';
        paidTbody.innerHTML = '';

        let unpaidCount = 0;
        let paidCount = 0;

        unpaidFines.forEach(fine => {
            const { date, time } = formatDateTime(fine.date);
            const amount = `${fine.amount}₽`;

            const row = document.createElement('tr');
            row.innerHTML = `
        <td>${date}</td>
        <td>${time}</td>
        <td>${amount}</td>
        <td class="dots payment-trigger" data-id="${fine.id}">&#8942;</td>
      `;
            unpaidTbody.appendChild(row);
            unpaidCount++;
        });

        paidFines.forEach(fine => {
            const { date, time } = formatDateTime(fine.date);
            const amount = `${fine.amount}₽`;

            const row = document.createElement('tr');
            row.innerHTML = `
        <td>${date}</td>
        <td>${time}</td>
        <td>${amount}</td>
        <td class="dots">&#8942;</td>
      `;
            paidTbody.appendChild(row);
            paidCount++;
        });

        unpaidTbody.innerHTML += `<tr><td colspan="4">Unpaid fines: ${unpaidCount}</td></tr>`;
        paidTbody.innerHTML += `<tr><td colspan="4">Paid fines: ${paidCount}</td></tr>`;
    }

    // Обновление UI фильтров (оставляю ваш существующий код)
    function updateFilterSection() {
        const filterSection = topFilterModal.querySelector('.filter-section');
        filterSection.innerHTML = '';

        const activeFilters = currentTable === 'unpaid' ? unpaidFilters : paidFilters;

        if (activeFilters.length === 0) {
            filterSection.innerHTML = '<p>No filters applied</p><hr class="modal-divider"/>';
        } else {
            activeFilters.forEach(filter => {
                const p = document.createElement('p');
                if (filter.type === 'date') {
                    p.textContent = `Date: From ${filter.from.toLocaleDateString()} To ${filter.to.toLocaleDateString()}`;
                } else if (filter.type === 'fine') {
                    p.textContent = `Payment: From ${filter.from} To ${filter.to}`;
                }
                filterSection.appendChild(p);
                filterSection.appendChild(document.createElement('hr'));
            });
        }

        const actionButtonsDiv = document.createElement('div');
        actionButtonsDiv.className = 'action-buttons';

        const plusClone = plusButton.cloneNode(true);
        const trashClone = trashButton.cloneNode(true);

        actionButtonsDiv.appendChild(plusClone);
        actionButtonsDiv.appendChild(trashClone);
        filterSection.appendChild(actionButtonsDiv);

        filterSection.appendChild(document.createElement('hr'));

        const buttonConfirmDiv = document.createElement('div');
        buttonConfirmDiv.className = 'button-confirm';

        const confirmBtn = document.createElement('button');
        confirmBtn.id = 'top-filter-confirm';
        confirmBtn.className = 'modal-button1';
        confirmBtn.textContent = 'Confirm';
        buttonConfirmDiv.appendChild(confirmBtn);

        filterSection.appendChild(buttonConfirmDiv);

        plusClone.addEventListener('click', () => {
            filterModalOverlay.classList.remove('hidden');
            topFilterModal.classList.add('hidden');

            segmentSelect.value = '';
            fromInput.value = '';
            toInput.value = '';
            fromInput.type = 'date';
            toInput.type = 'date';
        });

        trashClone.addEventListener('click', () => {
            if (currentTable === 'unpaid') {
                unpaidFilters = [];
            } else {
                paidFilters = [];
            }
            updateFilterSection();
            applyFiltersAndRender();
        });

        confirmBtn.addEventListener('click', () => {
            applyFiltersAndRender();
            topFilterModal.classList.add('hidden');
        });
    }

    segmentSelect.addEventListener('change', () => {
        if (segmentSelect.value === 'date') {
            fromInput.type = 'date';
            toInput.type = 'date';
            fromInput.value = '';
            toInput.value = '';
        } else if (segmentSelect.value === 'payments') {
            fromInput.type = 'number';
            toInput.type = 'number';
            fromInput.value = '';
            toInput.value = '';
        }
    });

    filterConfirmButton.addEventListener('click', () => {
        const type = segmentSelect.value;
        let from = fromInput.value;
        let to = toInput.value;

        if (!type || !from || !to) {
            alert('Please fill in all fields');
            return;
        }

        if (type === 'date') {
            from = new Date(from);
            to = new Date(to);
            if (from > to) {
                alert('From date should be earlier than To date');
                return;
            }
        } else if (type === 'payments') {
            from = Number(from);
            to = Number(to);
            if (from > to) {
                alert('From amount should be less than To amount');
                return;
            }
        }

        const newFilter = {
            type: type === 'date' ? 'date' : 'fine',
            from,
            to
        };

        if (currentTable === 'unpaid') {
            unpaidFilters.push(newFilter);
        } else if (currentTable === 'paid') {
            paidFilters.push(newFilter);
        }

        filterModalOverlay.classList.add('hidden');
        topFilterModal.classList.remove('hidden');
        updateFilterSection();
    });

    filterButtons.forEach((button, index) => {
        button.addEventListener('click', () => {
            currentTable = index === 0 ? 'unpaid' : 'paid';
            topFilterModal.classList.remove('hidden');
            updateFilterSection();
        });
    });

    filterModalOverlay.addEventListener('click', (e) => {
        if (e.target === filterModalOverlay) {
            filterModalOverlay.classList.add('hidden');
            topFilterModal.classList.remove('hidden');
        }
    });

    topFilterModal.addEventListener('click', (e) => {
        if (e.target === topFilterModal) {
            topFilterModal.classList.add('hidden');
        }
    });

    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') {
            filterModalOverlay.classList.add('hidden');
            topFilterModal.classList.add('hidden');
        }
    });

    fetchFines();
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

document.addEventListener('DOMContentLoaded', function () {
    const usernameElement = document.getElementById('user-profile');

    if (usernameElement) {
        usernameElement.addEventListener('click', function () {
            window.location.href = 'http://localhost:3000/user/account';
        });
    }
});

const tripsMenuItem = document.getElementById('trips-menu-item');
const balanceMenuItem = document.getElementById('balance-menu-item');

tripsMenuItem.addEventListener('click', function () {
    window.location.href = 'http://localhost:3000/user/trips';
});

balanceMenuItem.addEventListener('click', function () {
    window.location.href = 'http://localhost:3000/user/balance';
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
            const { date, time } = formatDateTime(fine.date);
            const amount = `${fine.amount}₽`;

            const row = document.createElement('tr');

            const cell = fine.paid
                ? `<td class="dots">&#8942;</td>`
                : `<td class="dots payment-trigger" data-id="${fine.id}">&#8942;</td>`;

            row.innerHTML = `
                <td>${date}</td>
                <td>${time}</td>
                <td>${amount}</td>
                ${cell}
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

document.addEventListener('click', e => {
    if (e.target.classList.contains('payment-trigger')) {
        selectedFineId = e.target.dataset.id;
        document.getElementById('pay-fine-modal').classList.remove('hidden');
    }
});

document.getElementById('confirm-pay-fine').addEventListener('click', async () => {
    if (!selectedFineId) return;
    try {
        const res = await fetch('/user/account/fines/pay', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fineId: selectedFineId })
        });
        if (!res.ok) throw new Error('Ошибка при оплате');
        document.getElementById('pay-fine-modal').classList.add('hidden');
        selectedFineId = null;
        loadFines(); // перезагрузка данных
    } catch (err) {
        console.error(err);
    }
});

document.getElementById('cancel-pay-fine').addEventListener('click', () => {
    selectedFineId = null;
    document.getElementById('pay-fine-modal').classList.add('hidden');
});
