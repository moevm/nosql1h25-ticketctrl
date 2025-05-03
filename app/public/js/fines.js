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
