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

    // Два массива фильтров для двух таблиц
    let unpaidFilters = [];
    let paidFilters = [];

    // Переменная для хранения, для какой таблицы сейчас открыто окно фильтров
    let currentTable = null; // 'unpaid' или 'paid'

    // Загрузка штрафов с сервера
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

    // Применяем фильтры и обновляем обе таблицы
    function applyFiltersAndRender() {
        // Для неоплаченных фильтры unpaidFilters
        const filteredUnpaid = finesData.filter(fine => !fine.paid);
        let filteredUnpaidFinal = filteredUnpaid;
        unpaidFilters.forEach(filter => {
            if (filter.type === 'date') {
                filteredUnpaidFinal = filteredUnpaidFinal.filter(fine => {
                    const fineDate = new Date(fine.date);
                    return fineDate >= filter.from && fineDate <= filter.to;
                });
            } else if (filter.type === 'fine') {
                filteredUnpaidFinal = filteredUnpaidFinal.filter(fine => {
                    return fine.amount >= filter.from && fine.amount <= filter.to;
                });
            }
        });

        // Для оплаченных фильтры paidFilters
        const filteredPaid = finesData.filter(fine => fine.paid);
        let filteredPaidFinal = filteredPaid;
        paidFilters.forEach(filter => {
            if (filter.type === 'date') {
                filteredPaidFinal = filteredPaidFinal.filter(fine => {
                    const fineDate = new Date(fine.date);
                    return fineDate >= filter.from && fineDate <= filter.to;
                });
            } else if (filter.type === 'fine') {
                filteredPaidFinal = filteredPaidFinal.filter(fine => {
                    return fine.amount >= filter.from && fine.amount <= filter.to;
                });
            }
        });

        renderTables(filteredUnpaidFinal, filteredPaidFinal);
    }

    // Отрисовка таблиц (принимаем уже отфильтрованные данные)
    function renderTables(unpaidFines, paidFines) {
        const unpaidTbody = document.querySelectorAll('.trips-table tbody')[0];
        const paidTbody = document.querySelectorAll('.trips-table tbody')[1];

        unpaidTbody.innerHTML = '';
        paidTbody.innerHTML = '';

        let unpaidCount = 0;
        let paidCount = 0;

        unpaidFines.forEach(fine => {
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
            unpaidTbody.appendChild(row);
            unpaidCount++;
        });

        paidFines.forEach(fine => {
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
            paidTbody.appendChild(row);
            paidCount++;
        });

        unpaidTbody.innerHTML += `<tr><td colspan="4">Unpaid fines: ${unpaidCount}</td></tr>`;
        paidTbody.innerHTML += `<tr><td colspan="4">Paid fines: ${paidCount}</td></tr>`;
    }

    // Обновляем содержимое .filter-section с фильтрами для текущей таблицы (currentTable)
    function updateFilterSection() {
        const filterSection = topFilterModal.querySelector('.filter-section');
        filterSection.innerHTML = ''; // очищаем

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

        // Добавляем кнопки + и корзина
        const actionButtonsDiv = document.createElement('div');
        actionButtonsDiv.className = 'action-buttons';

        const plusClone = plusButton.cloneNode(true);
        const trashClone = trashButton.cloneNode(true);

        actionButtonsDiv.appendChild(plusClone);
        actionButtonsDiv.appendChild(trashClone);
        filterSection.appendChild(actionButtonsDiv);

        filterSection.appendChild(document.createElement('hr'));

        // Кнопка Confirm
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

            // Сброс полей
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

    // Обработчик изменения селектора
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

    // При подтверждении добавления фильтра — добавляем в нужный массив и показываем окно с фильтрами
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

    // При нажатии кнопки фильтра в таблице сохраняем currentTable и открываем окно фильтров с правильными данными
    filterButtons.forEach((button, index) => {
        button.addEventListener('click', () => {
            currentTable = index === 0 ? 'unpaid' : 'paid'; // первая кнопка — unpaid, вторая — paid
            topFilterModal.classList.remove('hidden');
            updateFilterSection();
        });
    });

    // Закрытие модальных окон по клику вне
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

    // Закрытие по ESC
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') {
            filterModalOverlay.classList.add('hidden');
            topFilterModal.classList.add('hidden');
        }
    });

    // Загрузка штрафов
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


document.addEventListener('DOMContentLoaded', function() {

    const usernameElement = document.getElementById('user-profile');

    if (usernameElement) {
        usernameElement.addEventListener('click', function() {
            window.location.href = 'http://localhost:3000/user/account';
        });
    }
});

const tripsMenuItem = document.getElementById('trips-menu-item');
const balanceMenuItem = document.getElementById('balance-menu-item');


tripsMenuItem.addEventListener('click', function() {
    window.location.href = 'http://localhost:3000/user/trips';
});


balanceMenuItem.addEventListener('click', function() {
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

