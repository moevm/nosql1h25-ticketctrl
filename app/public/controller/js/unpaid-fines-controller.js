document.addEventListener('DOMContentLoaded', () => {
    // Элементы управления
    const modalOverlay = document.getElementById('modal-overlay');
    const topFilterModal = document.getElementById('top-filter-modal');
    const filterButtons = document.querySelectorAll('.filter-button');
    const plusButton = document.getElementById('plus-button');
    const trashButton = document.getElementById('trash-button');

    const filterModalOverlay = document.getElementById('filter-modal-overlay');
    const filterConfirmButton = document.getElementById('filter-confirm-button');

    const segmentSelect = document.getElementById('segment-select');
    const fromInput = document.getElementById('from-input');
    const toInput = document.getElementById('to-input');

    // Для добавления штрафа (плюс)
    const addFineModal = document.getElementById('add-fine-modal');
    const addFineConfirm = document.getElementById('add-fine-confirm');
    const plusMainButton = document.querySelector('.plus-button');

    let allFines = [];
    let filters = [];

    // Загрузка штрафов с сервера и применение фильтров
    async function fetchFines() {
        try {
            const res = await fetch('/controller/fines_unpaid');
            if (!res.ok) throw new Error('Failed to fetch fines');
            allFines = await res.json();
            applyFiltersAndRender();
        } catch (err) {
            console.error(err);
            alert('Ошибка загрузки штрафов');
        }
    }

    // Фильтрация и рендер таблицы
    function parseDateDMY(str) {
        const parts = str.split('.');
        if (parts.length !== 3) return null;
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const year = parseInt(parts[2], 10);
        return new Date(year, month, day);
    }

    function applyFiltersAndRender() {
        let filtered = allFines;

        filters.forEach(filter => {
            if (filter.type === 'date') {
                filtered = filtered.filter(fine => {
                    let fineDate = parseDateDMY(fine.date);
                    if (!fineDate) return false; // если дата невалидна — исключаем
                    return fineDate >= filter.from && fineDate <= filter.to;
                });
            } else if (filter.type === 'payments') {
                filtered = filtered.filter(fine => {
                    return fine.amount >= filter.from && fine.amount <= filter.to;
                });
            }
        });

        renderTable(filtered);
    }

    // Отрисовка таблицы штрафов
    function renderTable(fines) {
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

        const countRow = document.createElement('tr');
        countRow.innerHTML = `<td colspan="6">Count: ${fines.length}</td>`;
        tbody.appendChild(countRow);
    }

    // Обновление блока с фильтрами в topFilterModal
    function updateFilterSection() {
        const filterSection = topFilterModal.querySelector('.filter-section');
        filterSection.innerHTML = '';

        if (filters.length === 0) {
            filterSection.innerHTML = '<p>No filters applied</p><hr class="modal-divider"/>';
        } else {
            filters.forEach(filter => {
                const p = document.createElement('p');
                if (filter.type === 'date') {
                    p.textContent = `Date: From ${filter.from.toLocaleDateString()} To ${filter.to.toLocaleDateString()}`;
                } else if (filter.type === 'payments') {
                    p.textContent = `Payment: From ${filter.from} To ${filter.to}`;
                }
                filterSection.appendChild(p);
                filterSection.appendChild(document.createElement('hr'));
            });
        }

        // Добавляем кнопки + и корзину
        const actionButtonsDiv = document.createElement('div');
        actionButtonsDiv.className = 'action-buttons';

        const plusClone = plusButton.cloneNode(true);
        const trashClone = trashButton.cloneNode(true);

        actionButtonsDiv.appendChild(plusClone);
        actionButtonsDiv.appendChild(trashClone);
        filterSection.appendChild(actionButtonsDiv);

        filterSection.appendChild(document.createElement('hr'));

        // Добавляем кнопку Confirm
        const buttonConfirmDiv = document.createElement('div');
        buttonConfirmDiv.className = 'button-confirm';

        const confirmBtn = document.createElement('button');
        confirmBtn.id = 'top-filter-confirm';
        confirmBtn.className = 'modal-button1';
        confirmBtn.textContent = 'Confirm';
        buttonConfirmDiv.appendChild(confirmBtn);

        filterSection.appendChild(buttonConfirmDiv);

        // Обработчики кнопок
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
            filters = [];
            updateFilterSection();
            applyFiltersAndRender();
        });

        confirmBtn.addEventListener('click', () => {
            applyFiltersAndRender();
            topFilterModal.classList.add('hidden');
        });
    }

    // Изменение типа инпутов по выбору фильтра
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

    // Добавление фильтра
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
                alert('From payment should be less than To payment');
                return;
            }
        }

        filters.push({ type, from, to });

        filterModalOverlay.classList.add('hidden');
        topFilterModal.classList.remove('hidden');
        updateFilterSection();
    });

    // Открытие окна фильтра при нажатии на кнопку
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            topFilterModal.classList.remove('hidden');
            updateFilterSection();
        });
    });

    // Закрытие модалок при клике вне
    filterModalOverlay.addEventListener('click', e => {
        if (e.target === filterModalOverlay) {
            filterModalOverlay.classList.add('hidden');
            topFilterModal.classList.remove('hidden');
        }
    });

    topFilterModal.addEventListener('click', e => {
        if (e.target === topFilterModal) {
            topFilterModal.classList.add('hidden');
        }
    });

    // Закрытие модалок по ESC
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') {
            filterModalOverlay.classList.add('hidden');
            topFilterModal.classList.add('hidden');
        }
    });

    // Логика для открытия модалки добавления штрафа
    plusMainButton.addEventListener('click', () => {
        addFineModal.classList.remove('hidden');
    });

    addFineModal.addEventListener('click', e => {
        if (e.target === addFineModal) {
            addFineModal.classList.add('hidden');
        }
    });

    addFineConfirm.addEventListener('click', () => {
        // Можно тут добавить логику отправки новых штрафов
        addFineModal.classList.add('hidden');
    });

    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') {
            addFineModal.classList.add('hidden');
        }
    });

    // Загрузка штрафов при старте
    fetchFines();
});

// Отдельно – загрузка данных пользователя в сайдбар
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const res = await fetch('/controller/account-data');
        const data = await res.json();

        if (res.ok) {
            document.querySelector('.username').textContent = `${data.last_name} ${data.first_name[0]}.`;
        } else {
            alert(data.error || 'Failed to load account data');
        }
    } catch (err) {
        console.error('Error loading controller data:', err);
        alert('Error loading data');
    }
});

// Навигация меню
document.getElementById('paid-fines-menu').addEventListener('click', e => {
    e.preventDefault();
    window.location.href = '/controller/paid-fines';
});

document.getElementById('schedule-menu').addEventListener('click', e => {
    e.preventDefault();
    window.location.href = '/controller/schedule';
});

// Переход к аккаунту по клику на профиль
document.addEventListener('DOMContentLoaded', () => {
    const usernameElement = document.getElementById('user-profile');
    if (usernameElement) {
        usernameElement.addEventListener('click', () => {
            window.location.href = 'http://localhost:3000/controller/account';
        });
    }
});