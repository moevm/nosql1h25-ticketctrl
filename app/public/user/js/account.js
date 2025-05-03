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

confirmPaymentPhoneButton.addEventListener('click', function() {
    const newPhoneNumber = phoneInput.value;
    console.log('Новый номер телефона для оплаты:', newPhoneNumber);
    modalOverlayPaymentPhone.classList.add('hidden');
});
