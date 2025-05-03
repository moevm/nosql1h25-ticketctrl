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
