document.addEventListener('DOMContentLoaded', () => {
    const diagramTypeSelect = document.getElementById('diagram-type');
    const xAxisSelect = document.getElementById('x-axis');
    const filterConfirmBtn = document.getElementById('filter-confirm');

    // Все поля фильтра справа
    const filterFields = {
        lastName: document.getElementById('last-name'),
        firstName: document.getElementById('first-name'),
        email: document.getElementById('email'),
        numberFinesFrom: document.getElementById('number-fines-from'),
        numberFinesTo: document.getElementById('number-fines-to'),
        unpaidFinesFrom: document.getElementById('unpaid-fines-from'),
        unpaidFinesTo: document.getElementById('unpaid-fines-to'),
        paidFinesFrom: document.getElementById('paid-fines-from'),
        paidFinesTo: document.getElementById('paid-fines-to'),
        amountUnpaidFrom: document.getElementById('amount-unpaid-from'),
        amountUnpaidTo: document.getElementById('amount-unpaid-to'),
        amountPaidFrom: document.getElementById('amount-paid-from'),
        amountPaidTo: document.getElementById('amount-paid-to'),
        tripsFrom: document.getElementById('trips-from'),
        tripsTo: document.getElementById('trips-to'),
        dateFrom: document.getElementById('date-from'),
        dateTo: document.getElementById('date-to'),
    };

    let finesData = [];
    let tripsData = [];

    async function fetchData() {
        try {
            const [finesResp, tripsResp] = await Promise.all([
                fetch('/controller/diagram/fines_all'),
                fetch('/controller/diagram/trips_all')
            ]);

            if (!finesResp.ok) throw new Error('Failed to fetch fines');
            if (!tripsResp.ok) throw new Error('Failed to fetch trips');

            finesData = await finesResp.json();
            tripsData = await tripsResp.json();

            console.log('Loaded fines:', finesData);
            console.log('Loaded trips:', tripsData);

            applyFiltersAndRender();
        } catch (err) {
            console.error('Error loading data:', err);
        }
    }

    function applyFiltersAndRender() {
        let filteredFines = finesData;
        let filteredTrips = tripsData;

        console.log('Applying filters with values:', {
            lastName: filterFields.lastName.value,
            firstName: filterFields.firstName.value,
            email: filterFields.email.value,
            numberFinesFrom: filterFields.numberFinesFrom.value,
            numberFinesTo: filterFields.numberFinesTo.value,
            unpaidFinesFrom: filterFields.unpaidFinesFrom.value,
            unpaidFinesTo: filterFields.unpaidFinesTo.value,
            paidFinesFrom: filterFields.paidFinesFrom.value,
            paidFinesTo: filterFields.paidFinesTo.value,
            amountUnpaidFrom: filterFields.amountUnpaidFrom.value,
            amountUnpaidTo: filterFields.amountUnpaidTo.value,
            amountPaidFrom: filterFields.amountPaidFrom.value,
            amountPaidTo: filterFields.amountPaidTo.value,
            tripsFrom: filterFields.tripsFrom.value,
            tripsTo: filterFields.tripsTo.value,
            dateFrom: filterFields.dateFrom.value,
            dateTo: filterFields.dateTo.value,
        });

        // Фильтрация fines
        if (filterFields.lastName.value.trim())
            filteredFines = filteredFines.filter(f => f.lastName && f.lastName.toLowerCase().includes(filterFields.lastName.value.trim().toLowerCase()));
        if (filterFields.firstName.value.trim())
            filteredFines = filteredFines.filter(f => f.firstName && f.firstName.toLowerCase().includes(filterFields.firstName.value.trim().toLowerCase()));

        // email в fines нет, уберём фильтр email для fines (если надо — добавь)

        filteredFines = filteredFines.filter(f => {
            const amount = f.amount || 0;
            const paid = f.paid === true;

            // numberFines — не известно, пропускаем или считаем 1 на штраф
            if (filterFields.numberFinesFrom.value && 1 < +filterFields.numberFinesFrom.value) return false;
            if (filterFields.numberFinesTo.value && 1 > +filterFields.numberFinesTo.value) return false;

            // unpaidFines / paidFines - считать через paid
            if (filterFields.unpaidFinesFrom.value && (paid ? 0 : 1) < +filterFields.unpaidFinesFrom.value) return false;
            if (filterFields.unpaidFinesTo.value && (paid ? 0 : 1) > +filterFields.unpaidFinesTo.value) return false;

            if (filterFields.paidFinesFrom.value && (paid ? 1 : 0) < +filterFields.paidFinesFrom.value) return false;
            if (filterFields.paidFinesTo.value && (paid ? 1 : 0) > +filterFields.paidFinesTo.value) return false;

            // amount unpaid / paid
            if (filterFields.amountUnpaidFrom.value && (paid ? 0 : amount) < +filterFields.amountUnpaidFrom.value) return false;
            if (filterFields.amountUnpaidTo.value && (paid ? 0 : amount) > +filterFields.amountUnpaidTo.value) return false;

            if (filterFields.amountPaidFrom.value && (paid ? amount : 0) < +filterFields.amountPaidFrom.value) return false;
            if (filterFields.amountPaidTo.value && (paid ? amount : 0) > +filterFields.amountPaidTo.value) return false;

            // Фильтрация по дате fines
            if (filterFields.dateFrom.value) {
                const df = new Date(filterFields.dateFrom.value);
                const fd = new Date(f.date);
                if (fd < df) return false;
            }
            if (filterFields.dateTo.value) {
                const dt = new Date(filterFields.dateTo.value);
                const fd = new Date(f.date);
                if (fd > dt) return false;
            }

            return true;
        });

        // Фильтрация trips
        filteredTrips = filteredTrips.filter(t => {
            const coastLow = (t.coast && t.coast.low) ? t.coast.low : 0;

            // tripsFrom / tripsTo — считаем количество поездок (нужно учитывать количество поездок где? Если t - один trip, значит 1)
            if (filterFields.tripsFrom.value && 1 < +filterFields.tripsFrom.value) return false;
            if (filterFields.tripsTo.value && 1 > +filterFields.tripsTo.value) return false;

            // Фильтрация по дате trips
            if (filterFields.dateFrom.value) {
                const df = new Date(filterFields.dateFrom.value);
                const td = new Date(t.date);
                if (td < df) return false;
            }
            if (filterFields.dateTo.value) {
                const dt = new Date(filterFields.dateTo.value);
                const td = new Date(t.date);
                if (td > dt) return false;
            }

            // Можно добавить фильтрацию по стоимости (coast.low)
            // Например:
            // if (filterFields.amountUnpaidFrom.value && coastLow < +filterFields.amountUnpaidFrom.value) return false;
            // if (filterFields.amountUnpaidTo.value && coastLow > +filterFields.amountUnpaidTo.value) return false;

            return true;
        });

        console.log('Filtered fines:', filteredFines);
        console.log('Filtered trips:', filteredTrips);

        renderDiagram(filteredFines, filteredTrips);
    }

    function renderDiagram(fines, trips) {
        const svg = document.getElementById('diagram');
        svg.innerHTML = '';

        const diagramType = diagramTypeSelect.value;
        const xAxis = xAxisSelect.value;

        console.log('Rendering diagram with type:', diagramType, 'and xAxis:', xAxis);

        const groupMap = new Map();

        fines.forEach(fine => {
            let key = '';
            if (xAxis === 'Last name') key = fine.last_name || 'Unknown';
            else if (xAxis === 'First name') key = fine.first_name || 'Unknown';
            else if (xAxis === 'Date') key = fine.date ? new Date(fine.date).toISOString().slice(0, 10) : 'Unknown';

            let val = 0;
            switch (diagramType) {
                case 'Number of fines':
                    val = 1;
                    break;
                case 'Number of unpaid fines':
                    val = fine.paid ? 0 : 1;
                    break;
                case 'Number of paid fines':
                    val = fine.paid ? 1 : 0;
                    break;
                case 'Amount of fines unpaid':
                    val = fine.paid ? 0 : (fine.amount || 0);
                    break;
                case 'Amount of fines paid':
                    val = fine.paid ? (fine.amount || 0) : 0;
                    break;
                case 'Number of trips':
                    val = 0;
                    break;
                default:
                    val = 0;
            }

            if (!groupMap.has(key)) groupMap.set(key, 0);
            groupMap.set(key, groupMap.get(key) + val);
        });

        if (diagramType === 'Number of trips') {
            trips.forEach(trip => {
                let key = '';
                if (xAxis === 'Last name') key = trip.last_name || 'Unknown';
                else if (xAxis === 'First name') key = trip.first_name || 'Unknown';
                else if (xAxis === 'Date') key = trip.date ? new Date(trip.date).toISOString().slice(0, 10) : 'Unknown';

                if (!groupMap.has(key)) groupMap.set(key, 0);
                groupMap.set(key, groupMap.get(key) + 1);
            });
        }

        console.log('Grouped data for diagram:', groupMap);

        const keys = Array.from(groupMap.keys()).sort();

        const svgWidth = svg.clientWidth || 1000;
        const svgHeight = svg.clientHeight || 600;
        const margin = 60;
        const barWidth = (svgWidth - margin * 2) / keys.length * 0.7;

        const maxVal = Math.max(...groupMap.values(), 1);

        keys.forEach((key, i) => {
            const val = groupMap.get(key);
            const barHeight = (val / maxVal) * (svgHeight - margin * 2);

            const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            rect.setAttribute('x', margin + i * ((svgWidth - margin * 2) / keys.length) + (((svgWidth - margin * 2) / keys.length) - barWidth) / 2);
            rect.setAttribute('y', svgHeight - margin - barHeight);
            rect.setAttribute('width', barWidth);
            rect.setAttribute('height', barHeight);
            rect.setAttribute('fill', '#4682b4');
            svg.appendChild(rect);

            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', margin + i * ((svgWidth - margin * 2) / keys.length) + ((svgWidth - margin * 2) / keys.length) / 2);
            text.setAttribute('y', svgHeight - margin + 15);
            text.setAttribute('text-anchor', 'middle');
            text.setAttribute('font-size', '11px');
            text.textContent = key;
            svg.appendChild(text);

            const valText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            valText.setAttribute('x', margin + i * ((svgWidth - margin * 2) / keys.length) + ((svgWidth - margin * 2) / keys.length) / 2);
            valText.setAttribute('y', svgHeight - margin - barHeight - 5);
            valText.setAttribute('text-anchor', 'middle');
            valText.setAttribute('font-size', '11px');
            valText.textContent = val.toFixed(0);
            svg.appendChild(valText);
        });
    }

    // Навигация меню как в твоём примере
    document.getElementById('unpaid-fines-menu').addEventListener('click', e => {
        e.preventDefault();
        window.location.href = '/controller/unpaid-fines';
    });

    document.getElementById('schedule-menu').addEventListener('click', e => {
        e.preventDefault();
        window.location.href = '/controller/schedule';
    });

    async function loadAccountData() {
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
    }

    loadAccountData();

    const usernameElement = document.getElementById('user-profile');
    if (usernameElement) {
        usernameElement.addEventListener('click', () => {
            window.location.href = 'http://localhost:3000/controller/account';
        });
    }

    filterConfirmBtn.addEventListener('click', () => {
        applyFiltersAndRender();
    });

    diagramTypeSelect.addEventListener('change', applyFiltersAndRender);
    xAxisSelect.addEventListener('change', applyFiltersAndRender);

    fetchData();
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

// Переход к аккаунту по клику на профиль пользователя
document.addEventListener('DOMContentLoaded', () => {
    const usernameElement = document.getElementById('user-profile');
    if (usernameElement) {
        usernameElement.addEventListener('click', () => {
            window.location.href = 'http://localhost:3000/controller/account';
        });
    }
});

