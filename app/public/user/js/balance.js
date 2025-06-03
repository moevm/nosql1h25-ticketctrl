document.addEventListener('DOMContentLoaded', () => {
    const modalOverlay = document.getElementById('modal-overlay');
    const topFilterModal = document.getElementById('top-filter-modal');
    const filterButton = document.querySelector('.filter-button');
    const plusButton = document.getElementById('plus-button');
    const trashButton = document.getElementById('trash-button');
    const amountInput = document.getElementById('amount-input');
    const modalTitle = document.getElementById('modal-title');

    const filterModalOverlay = document.getElementById('filter-modal-overlay');
    const filterConfirmButton = document.getElementById('filter-confirm-button');

    const segmentSelect = document.getElementById('segment-select');
    const fromInput = document.getElementById('from-input');
    const toInput = document.getElementById('to-input');

    const balanceAmountEl = document.querySelector('.balance-box .amount');
    const paymentHistoryBody = document.querySelector('.table-wrapper tbody');

    const typeMap = {
        'СБП': 'Replenishment by СБП',
        'Telephone': 'Replenishment by phone',
        'Card': 'Replenishment by bank card'
    };

    let allTopups = [];
    let filters = [];

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

    document.getElementById('confirm-button').addEventListener('click', async (e) => {
        e.preventDefault();
        const amount = amountInput.value.trim();
        const typeKey = Object.keys(typeMap).find(key => typeMap[key] === modalTitle.textContent) || null;

        console.log('Попытка платежа:', { amount, typeKey });

        if (!amount || !typeKey) {
            alert('Please enter an amount and select a valid payment type');
            return;
        }

        try {
            const res = await fetch('/user/account/topup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount,
                    type: typeKey
                })
            });
            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || 'Payment failed');
            }
            modalOverlay.classList.add('hidden');
            alert('Payment successful!');
            fetchTopups();  // Обновляем список пополнений и баланс

        } catch (err) {
            alert(`Error: ${err.message}`);
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            modalOverlay.classList.add('hidden');
            topFilterModal.classList.add('hidden');
            filterModalOverlay.classList.add('hidden');
        }
    });

    filterButton.addEventListener('click', () => {
        topFilterModal.classList.remove('hidden');
        updateFilterSection();
    });

    topFilterModal.addEventListener('click', (e) => {
        if (e.target === topFilterModal) {
            topFilterModal.classList.add('hidden');
        }
    });

    plusButton.addEventListener('click', () => {
        filterModalOverlay.classList.remove('hidden');
        topFilterModal.classList.add('hidden');

        segmentSelect.value = '';
        fromInput.value = '';
        toInput.value = '';
        fromInput.type = 'date';
        toInput.type = 'date';
    });

    trashButton.addEventListener('click', () => {
        filters = [];
        updateFilterSection();
        applyFiltersAndRender();
    });


    filterModalOverlay.addEventListener('click', e => {
        if (e.target === filterModalOverlay) {
            filterModalOverlay.classList.add('hidden');
            topFilterModal.classList.remove('hidden');
        }
    });

    segmentSelect.addEventListener('change', () => {
        if (segmentSelect.value === 'date') {
            fromInput.type = 'date';
            toInput.type = 'date';
        } else if (segmentSelect.value === 'payments') {
            fromInput.type = 'number';
            toInput.type = 'number';
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
        alert('Please fill at least one of the fields: From or To');
        return;
    }

    if (type === 'date') {
        from = from ? new Date(from) : null;
        to = to ? new Date(to) : null;
        if (from && to && from > to) {
            alert('From date should be earlier than To date');
            return;
        }
        if (to) to.setHours(23, 59, 59, 999);
    } else if (type === 'payments') {
        from = from ? parseFloat(from) : null;
        to = to ? parseFloat(to) : null;
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


    function updateFilterSection() {
        const section = topFilterModal.querySelector('.filter-section');
        section.innerHTML = '';

        if (filters.length === 0) {
            section.innerHTML = '<p>No filters applied</p><hr class="modal-divider"/>';
        } else {
            filters.forEach(f => {
                const p = document.createElement('p');
                if (f.type === 'date') {
                    const fromText = f.from ? `From ${f.from.toLocaleDateString()}` : '';
                    const toText = f.to ? `To ${f.to.toLocaleDateString()}` : '';
                    p.textContent = `Date: ${fromText} ${toText}`.trim();
                } else {
                    const fromText = f.from !== null && f.from !== undefined ? `From ${f.from}` : '';
                    const toText = f.to !== null && f.to !== undefined ? `To ${f.to}` : '';
                    p.textContent = `Payment: ${fromText} ${toText}`.trim();
                }
                section.appendChild(p);
                section.appendChild(document.createElement('hr'));
            });
        }

        const buttons = document.createElement('div');
        buttons.className = 'action-buttons';

        const plusClone = plusButton.cloneNode(true);
        const trashClone = trashButton.cloneNode(true);

        buttons.appendChild(plusClone);
        buttons.appendChild(trashClone);
        section.appendChild(buttons);
        section.appendChild(document.createElement('hr'));

        const confirmWrapper = document.createElement('div');
        confirmWrapper.className = 'button-confirm';

        const confirmBtn = document.createElement('button');
        confirmBtn.id = 'top-filter-confirm';
        confirmBtn.className = 'modal-button1';
        confirmBtn.textContent = 'Confirm';
        confirmWrapper.appendChild(confirmBtn);
        section.appendChild(confirmWrapper);

        plusClone.addEventListener('click', () => {
            filterModalOverlay.classList.remove('hidden');
            topFilterModal.classList.add('hidden');
            segmentSelect.value = '';
            fromInput.value = '';
            toInput.value = '';
        });

        trashClone.addEventListener('click', () => {
            filters = [];
            updateFilterSection();
            applyFiltersAndRender();
        });


        confirmBtn.addEventListener('click', () => {
            topFilterModal.classList.add('hidden');
            applyFiltersAndRender();
        });
    }

    function applyFiltersAndRender() {
    let filtered = [...allTopups];

    filters.forEach(filter => {
        if (filter.type === 'date') {
            filtered = filtered.filter(item => {
                const d = new Date(item.date);
                if (filter.from && filter.to) {
                    return d >= filter.from && d <= filter.to;
                } else if (filter.from) {
                    return d >= filter.from;
                } else if (filter.to) {
                    return d <= filter.to;
                }
                return true;
            });
        } else if (filter.type === 'payments') {
            filtered = filtered.filter(item => {
                if (filter.from !== null && filter.to !== null) {
                    return item.amount >= filter.from && item.amount <= filter.to;
                } else if (filter.from !== null) {
                    return item.amount >= filter.from;
                } else if (filter.to !== null) {
                    return item.amount <= filter.to;
                }
                return true;
            });
        }
    });

    renderTopups(filtered);
    }


    function renderTopups(topups) {
        paymentHistoryBody.innerHTML = '';
        let total = 0;

        const dateOptions = { day: '2-digit', month: '2-digit', year: 'numeric' };
        const timeOptions = { hour: '2-digit', minute: '2-digit' };

        topups.forEach(topup => {
            const d = new Date(topup.date);
            const dateStr = d.toLocaleDateString('ru-RU', dateOptions);
            const timeStr = d.toLocaleTimeString('ru-RU', timeOptions);

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${dateStr}</td>
                <td>${timeStr}</td>
                <td>${topup.amount.toFixed(2)}р</td>
                <td>${topup.type}</td>
            `;
            paymentHistoryBody.appendChild(tr);
            total += topup.amount;
        });

        const countTr = document.createElement('tr');
        countTr.innerHTML = `<td colspan="4">Count: ${topups.length}</td>`;
        paymentHistoryBody.appendChild(countTr);

    }

    async function fetchTopups() {
        try {
            const res = await fetch('/user/account/balance');
            if (!res.ok) throw new Error('Failed to fetch');

            const data = await res.json();
            allTopups = data.topups;
            balanceAmountEl.textContent = data.balance.toFixed(2).replace('.', ',') + ' Р';

            applyFiltersAndRender();
        } catch (err) {
            console.error('Ошибка загрузки:', err);
            balanceAmountEl.textContent = 'Ошибка';
        }
    }

    fetchTopups();
});

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const res = await fetch('/user/account-data');
        const user = await res.json();
        if (res.ok) {
            const sidebarName = document.querySelector('.username');
            sidebarName.textContent = `${user.last_name} ${user.first_name[0]}.`;
        }
    } catch (err) {
        console.error('Ошибка загрузки данных аккаунта');
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const usernameElement = document.getElementById('user-profile');
    if (usernameElement) {
        usernameElement.addEventListener('click', () => {
            window.location.href = 'http://localhost:3000/user/account';
        });
    }

    document.getElementById('fines-menu-item').addEventListener('click', () => {
        window.location.href = 'http://localhost:3000/user/fines';
    });

    document.getElementById('trips-menu-item').addEventListener('click', () => {
        window.location.href = 'http://localhost:3000/user/trips';
    });
});
