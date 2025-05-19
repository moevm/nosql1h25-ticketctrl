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


window.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('/user/account-data');
        const user = await response.json();

        if (!response.ok) {
            console.error(user.error || 'Ошибка получения данных');
            return;
        }

        const rows = document.querySelectorAll('.trips-table:first-of-type tbody tr');

        rows[0].children[1].textContent = safeValue(user._id);
        rows[1].children[1].textContent = safeValue(user.last_name);
        rows[2].children[1].textContent = safeValue(user.first_name);
        rows[3].children[1].textContent = safeValue(user.phone);
        rows[4].children[1].textContent = safeValue(user.email);

        // password оставляем скрытым
        rows[6].children[1].textContent = formatNeo4jDateTime(user.create_at);
        rows[7].children[1].textContent = formatNeo4jDateTime(user.last_update_at);

        // вторая таблица (платёжная информация)
        const payRows = document.querySelectorAll('.trips-table')[1].querySelectorAll('tbody tr');
        payRows[0].children[1].textContent = safeValue(user.phone);
        payRows[1].children[1].textContent = safeValue(user.card_number);


        // И имя в боковой панели
        const sidebarName = document.querySelector('.username');
        sidebarName.textContent = `${user.last_name} ${user.first_name[0]}.`;
    } catch (err) {
        console.error('Ошибка загрузки данных аккаунта:', err);
    }
});


paymentPhoneDots.addEventListener('click', function(event) {
    const row = event.target.closest('tr');
    const paymentCell = row.querySelector('td:nth-child(2)');
    if (paymentCell) {
        phoneInput.value = paymentCell.textContent;
        modalOverlayPaymentPhone.classList.remove('hidden');
    }
});

paymentCardDots.addEventListener('click', function(event) {
    const row = event.target.closest('tr');
    const paymentCell = row.querySelector('td:nth-child(2)');
    if (paymentCell) {
        paymentInputs.forEach(input => input.value = '');
        paymentExpiry.value = '';
        paymentCVC.value = '';
        modalOverlayPaymentCard.classList.remove('hidden');
    }
});

// Обработчики для других полей
phoneDots.addEventListener('click', function(event) {
    const row = event.target.closest('tr');
    const phoneCell = row.querySelector('td:nth-child(2)');
    if (phoneCell) {
        phoneInput.value = phoneCell.textContent;
        modalOverlayPhone.classList.remove('hidden');
    }
});

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

modalOverlayPhone.addEventListener('click', function(event) {
    if (event.target === modalOverlayPhone) {
        modalOverlayPhone.classList.add('hidden');
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

modalOverlayPaymentCard.addEventListener('click', function(event) {
    if (event.target === modalOverlayPaymentCard) {
        modalOverlayPaymentCard.classList.add('hidden');
    }
});

modalOverlayPaymentPhone.addEventListener('click', function(event) {
    if (event.target === modalOverlayPaymentPhone) {
        modalOverlayPaymentPhone.classList.add('hidden');
    }
});

confirmPhoneButton.addEventListener('click', function() {
    const newPhoneNumber = phoneInput.value;
    console.log('Новый номер телефона:', newPhoneNumber);
    modalOverlayPhone.classList.add('hidden');
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

confirmPaymentCardButton.addEventListener('click', function() {
    const newPaymentNumber = paymentInputs.map(input => input.value).join(' ');
    const expiryDate = paymentExpiry.value;
    const cvc = paymentCVC.value;
    console.log('Номер карты:', newPaymentNumber);
    console.log('Срок действия:', expiryDate);
    console.log('CVC:', cvc);
    modalOverlayPaymentCard.classList.add('hidden');
});

confirmPaymentPhoneButton.addEventListener('click', async function () {
    const newPhoneNumber = phoneInput.value;
    await updateField('phone', newPhoneNumber);
    modalOverlayPaymentPhone.classList.add('hidden');
});


function formatNeo4jDateTime(obj) {
    if (!obj || typeof obj !== 'object') return 'N/A';
    const y = obj.year.low || obj.year;
    const m = obj.month.low || obj.month;
    const d = obj.day.low || obj.day;
    const h = obj.hour.low || obj.hour;
    const min = obj.minute.low || obj.minute;
    const s = obj.second.low || obj.second;

    return `${String(d).padStart(2, '0')}.${String(m).padStart(2, '0')}.${y} ${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}


function safeValue(value) {
    if (value === null || value === undefined || value === '') return '—';
    return value;
}


confirmPhoneButton.addEventListener('click', async function () {
    const newPhoneNumber = phoneInput.value;
    await updateField('phone', newPhoneNumber);
    modalOverlayPhone.classList.add('hidden');
});


confirmEmailButton.addEventListener('click', async function () {
    const newEmail = emailInput.value;
    await updateField('email', newEmail);
    modalOverlayEmail.classList.add('hidden');
});


confirmPasswordButton.addEventListener('click', async function () {
    const newPassword = passwordInput.value;
    await updateField('password', newPassword);
    modalOverlayPassword.classList.add('hidden');
});


confirmPaymentCardButton.addEventListener('click', async function () {
    const newCard = paymentInputs.map(input => input.value.trim()).join('');
    await updateField('card_number', newCard);
    modalOverlayPaymentCard.classList.add('hidden');
});


async function updateField(field, value) {
    try {
        const res = await fetch('/user/account/update', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ field, value })
        });

        if (res.ok) {
            updateDOMField(field, value);
        } else {
            const err = await res.json();
            alert(err.error || 'Ошибка при обновлении');
        }
    } catch (err) {
        alert('Ошибка соединения');
    }
}


function updateDOMField(field, value) {
    const rows = document.querySelectorAll('.trips-table')[0].querySelectorAll('tbody tr');
    const payRows = document.querySelectorAll('.trips-table')[1].querySelectorAll('tbody tr');
    const safe = safeValue(value);

    switch (field) {
        case 'phone':
            rows[3].children[1].textContent = safe;
            payRows[0].children[1].textContent = safe;
            break;
        case 'email':
            rows[4].children[1].textContent = safe;
            break;
        case 'card_number':
            payRows[1].children[1].textContent = safe;
            break;
        case 'password':
        
            break;
    }


    const now = new Date();
    rows[7].children[1].textContent = `${now.toLocaleDateString()} ${now.toLocaleTimeString()}`;
}


const tripsMenuItem = document.getElementById('trips-menu-item');


tripsMenuItem.addEventListener('click', function() {
    window.location.href = 'http://localhost:3000/user/trips';
});

const finesMenuItem = document.getElementById('fines-menu-item');


finesMenuItem.addEventListener('click', function() {
    window.location.href = 'http://localhost:3000/user/fines';
});


