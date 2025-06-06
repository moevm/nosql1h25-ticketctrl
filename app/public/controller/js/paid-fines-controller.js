document.addEventListener('DOMContentLoaded', () => {
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

    let allFines = [];
    let filters = [];

    async function fetchFines() {
        try {
            const res = await fetch('/controller/fines_paid');
            if (!res.ok) throw new Error('Failed to fetch fines');
            allFines = await res.json();
            applyFiltersAndRender();
        } catch (err) {
            console.error(err);
            alert('Ошибка загрузки штрафов');
        }
    }

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
                if (!fineDate) return false;

                if (filter.from && filter.to) {
                    return fineDate >= filter.from && fineDate <= filter.to;
                } else if (filter.from) {
                    return fineDate >= filter.from;
                } else if (filter.to) {
                    return fineDate <= filter.to;
                } else {
                    return true; // Нет ограничений по дате
                }
            });
        } else if (filter.type === 'payments') {
            filtered = filtered.filter(fine => {
                if (filter.from !== null && filter.to !== null) {
                    return fine.amount >= filter.from && fine.amount <= filter.to;
                } else if (filter.from !== null) {
                    return fine.amount >= filter.from;
                } else if (filter.to !== null) {
                    return fine.amount <= filter.to;
                } else {
                    return true; // Нет ограничений по платежу
                }
            });
        }
    });

    renderTable(filtered);
    }

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

    function updateFilterSection() {
        const filterSection = topFilterModal.querySelector('.filter-section');
        filterSection.innerHTML = '';
        
        if (filters.length === 0) {
            filterSection.innerHTML = '<p>No filters applied</p><hr class="modal-divider"/>';
        } else {
            filters.forEach(filter => {
            const p = document.createElement('p');
            if (filter.type === 'date') {
                const from = filter.from ? `From ${filter.from.toLocaleDateString()}` : '';
                const to = filter.to ? `To ${filter.to.toLocaleDateString()}` : '';
                p.textContent = `Date: ${from} ${to}`.trim();
            } else if (filter.type === 'payments') {
                const from = filter.from !== null && filter.from !== undefined ? `From ${filter.from}` : '';
                const to = filter.to !== null && filter.to !== undefined ? `To ${filter.to}` : '';
                p.textContent = `Payment: ${from} ${to}`.trim();
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

    if (!type) {
        alert('Please select a filter segment');
        return;
    }

    if (!from && !to) {
        alert('Please fill at least one field: From or To');
        return;
    }

    if (type === 'date') {
        from = from ? new Date(from) : null;
        to = to ? new Date(to) : null;

        if (from && to && from > to) {
            alert('From date should be earlier than To date');
            return;
        }
    } else if (type === 'payments') {
        from = from ? Number(from) : null;
        to = to ? Number(to) : null;

        if (from && to && from > to) {
            alert('From payment should be less than To payment');
            return;
        }
    }

    filters.push({ type, from, to });

    filterModalOverlay.classList.add('hidden');
    topFilterModal.classList.remove('hidden');
    updateFilterSection();
    });
    
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            topFilterModal.classList.remove('hidden');
            updateFilterSection();
        });
    });

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

    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') {
            filterModalOverlay.classList.add('hidden');
            topFilterModal.classList.add('hidden');
        }
    });

    // Загрузка штрафов при загрузке страницы
    fetchFines();
});

// Загрузка данных аккаунта и обновление UI сайдбара
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

// Навигация по меню
document.getElementById('unpaid-fines-menu').addEventListener('click', e => {
    e.preventDefault();
    window.location.href = '/controller/unpaid-fines';
});

document.getElementById('schedule-menu').addEventListener('click', e => {
    e.preventDefault();
    window.location.href = '/controller/schedule';
});

document.getElementById('diagram-menu').addEventListener('click', e => {
    e.preventDefault();
    window.location.href = '/controller/diagram';
});

// Переход к аккаунту по клику на профиль пользователя
document.addEventListener('DOMContentLoaded', () => {
    const usernameElement = document.getElementById('user-profile');
    if (usernameElement) {
        usernameElement.addEventListener('click', () => {
            window.location.href = 'http://localhost:3000/controller/account';
        });
    }
});