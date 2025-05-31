const phoneDots = document.querySelector('.phone-dots');
const emailDots = document.querySelector('.email-dots');
const passwordDots = document.querySelector('.password-dots');
const paymentPhoneDots = document.querySelector('.payment-phone-dots');
const paymentCardDots = document.querySelector('.payment-card-dots');

const modalOverlayPhone = document.getElementById('modal-overlay');
const modalOverlayEmail = document.getElementById('modal-overlay-email');
const modalOverlayPassword = document.getElementById('modal-overlay-password');
const modalOverlayPaymentCard = document.getElementById('modal-overlay-payment-card');
const modalOverlayPaymentPhone = document.getElementById('modal-overlay-payment');

const confirmPhoneButton = document.getElementById('confirm-button');
const confirmEmailButton = document.getElementById('confirm-email-button');
const confirmPasswordButton = document.getElementById('confirm-password-button');
const confirmPaymentCardButton = document.getElementById('confirm-payment-card-button');
const confirmPaymentPhoneButton = document.getElementById('confirm-payment-button');

const phoneInput = document.getElementById('phone-input');
const emailInput = document.getElementById('email-input');
const passwordInput = document.getElementById('password-input');
const paymentInputs = [
    document.getElementById('payment-input-1'),
    document.getElementById('payment-input-2'),
    document.getElementById('payment-input-3'),
    document.getElementById('payment-input-4'),
];
const paymentExpiry = document.getElementById('payment-expiry');
const paymentCVC = document.getElementById('payment-cvc');

emailDots.addEventListener('click', function(event) {
    const row = event.target.closest('tr');
    const emailCell = row.querySelector('td:nth-child(2)');
    if (emailCell) {
        emailInput.value = emailCell.textContent;
        modalOverlayEmail.classList.remove('hidden');
    }
});

passwordDots.addEventListener('click', function(event) {
    const row = event.target.closest('tr');
    const passwordCell = row.querySelector('td:nth-child(2)');
    if (passwordCell) {
        passwordInput.value = '';
        modalOverlayPassword.classList.remove('hidden');
    }
});

modalOverlayEmail.addEventListener('click', function(event) {
    if (event.target === modalOverlayEmail) {
        modalOverlayEmail.classList.add('hidden');
    }
});

modalOverlayPassword.addEventListener('click', function(event) {
    if (event.target === modalOverlayPassword) {
        modalOverlayPassword.classList.add('hidden');
    }
});

confirmEmailButton.addEventListener('click', function() {
    const newEmail = emailInput.value;
    console.log('Новый email:', newEmail);
    modalOverlayEmail.classList.add('hidden');
});

confirmPasswordButton.addEventListener('click', function() {
    const newPassword = passwordInput.value;
    console.log('Новый пароль:', newPassword);
    modalOverlayPassword.classList.add('hidden');
});


document.addEventListener('DOMContentLoaded', async () => {
    try {
        const res = await fetch('/controller/account-data');
        const data = await res.json();

        if (res.ok) {
            const rows = document.querySelectorAll('.trips-table tbody tr');

            rows[0].children[1].textContent = data._id || '-';
            rows[1].children[1].textContent = data.last_name || '-';
            rows[2].children[1].textContent = data.first_name || '-';
            rows[3].children[1].textContent = data.email || '-';
            rows[5].children[1].textContent = formatDate(data.create_at) || '-';
            rows[6].children[1].textContent = formatDate(data.last_update_at) || '-';

            // Подпись в сайдбаре
            document.querySelector('.username').textContent = `${data.last_name} ${data.first_name[0]}.`;
        } else {
            alert(data.error || 'Failed to load account data');
        }
    } catch (err) {
        console.error('Error loading controller data:', err);
        alert('Error loading data');
    }
});

function formatDate(datetimeStr) {
    if (!datetimeStr) return '-';
    try {
        const date = new Date(datetimeStr);
        if (isNaN(date)) return '-';
        return date.toLocaleString('ru-RU');
    } catch (e) {
        return '-';
    }
}

document.getElementById('unpaid-fines-menu').addEventListener('click', function (e) {
    e.preventDefault();
    window.location.href = '/controller/unpaid-fines';
});

document.getElementById('paid-fines-menu').addEventListener('click', function (e) {
    e.preventDefault();
    window.location.href = '/controller/paid-fines';
});

document.getElementById('schedule-menu').addEventListener('click', function (e) {
    e.preventDefault();
    window.location.href = '/controller/schedule';
});
