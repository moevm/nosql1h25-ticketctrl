document.addEventListener('DOMContentLoaded', () => {
    const plusButton = document.getElementById('plus-button');
    const trashButton = document.getElementById('trash-button');
    const filterButton = document.querySelector('.filter-button');
    const topFilterModal = document.getElementById('top-filter-modal');
    const filterModalOverlay = document.getElementById('filter-modal-overlay');
    const segmentSelect = document.getElementById('segment-select');
    const fromInput = document.getElementById('from-input');
    const toInput = document.getElementById('to-input');
    const filterConfirmButton = document.getElementById('filter-confirm-button');

    let tripsData = [];
    let filters = [];

    async function fetchTrips() {
        try {
            const response = await fetch('/user/account/trips');
            if (!response.ok) throw new Error('Failed to fetch trips');
            const data = await response.json();
            tripsData = data;
            console.log(tripsData)
            applyFiltersAndRender();
        } catch (err) {
            console.error(err);
        }
    }

    function applyFiltersAndRender() {
        let filtered = tripsData;

        filters.forEach(filter => {
            if (filter.type === 'date') {
                filtered = filtered.filter(trip => {
                    const tripDate = new Date(trip.date);
                    return tripDate >= filter.from && tripDate <= filter.to;
                });
            } else if (filter.type === 'coast') {
                filtered = filtered.filter(trip => {
                    const costNumber = Number(trip.coast.toString().replace(/₽/g, '')) || 0;
                    return costNumber >= filter.from && costNumber <= filter.to;
                });
            }
        });

        renderTable(filtered);
    }

    function renderTable(trips) {
        const tbody = document.querySelector('.trips-table tbody');
        tbody.innerHTML = '';

        trips.forEach(trip => {
            const dateObj = new Date(trip.date);
            const date = dateObj.toLocaleDateString();
            const time = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const type = trip.type || '-';
            const coast = trip.coast || '0₽';

            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${date}</td>
                <td>${time}</td>
                <td>${type}</td>
                <td>${coast}</td>
            `;
            tbody.appendChild(row);
        });

        tbody.innerHTML += `<tr><td colspan="4">Count: ${trips.length}</td></tr>`;
    }

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
                } else if (filter.type === 'coast') {
                    p.textContent = `Coast: From ${filter.from} To ${filter.to}`;
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
            filters = [];
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
                alert('From coast should be less than To coast');
                return;
            }
        }

        filters.push({
            type: type === 'date' ? 'date' : 'coast',
            from,
            to
        });

        filterModalOverlay.classList.add('hidden');
        topFilterModal.classList.remove('hidden');
        updateFilterSection();
    });

    // Открытие модалки фильтра по кнопке фильтра
    filterButton.addEventListener('click', () => {
        topFilterModal.classList.remove('hidden');
        updateFilterSection();
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

    // Закрытие по ESC
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') {
            filterModalOverlay.classList.add('hidden');
            topFilterModal.classList.add('hidden');
        }
    });

    // Загрузка trips при старте
    fetchTrips();
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
