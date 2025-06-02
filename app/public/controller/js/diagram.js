document.addEventListener('DOMContentLoaded', () => {
    const diagramTypeSelect = document.getElementById('diagram-type');
    const xAxisSelect = document.getElementById('x-axis');
    const filterConfirmBtn = document.getElementById('filter-confirm');

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
        const diagramType = diagramTypeSelect.value;
        let filteredFines = finesData;
        let filteredTrips = tripsData;

        const usingFines = [
            'Number of fines',
            'Number of unpaid fines',
            'Number of paid fines',
            'Amount of fines unpaid',
            'Amount of fines paid'
        ].includes(diagramType);

        const usingTrips = diagramType === 'Number of trips';

        if (usingFines) {
            if (filterFields.lastName.value.trim())
                filteredFines = filteredFines.filter(f => f.lastName && f.lastName.toLowerCase().includes(filterFields.lastName.value.trim().toLowerCase()));
            if (filterFields.firstName.value.trim())
                filteredFines = filteredFines.filter(f => f.firstName && f.firstName.toLowerCase().includes(filterFields.firstName.value.trim().toLowerCase()));
            if (filterFields.email.value.trim())
                filteredFines = filteredFines.filter(f => f.email && f.email.toLowerCase().includes(filterFields.email.value.trim().toLowerCase()));

            filteredFines = filteredFines.filter(f => {
                const amount = f.amount || 0;
                const paid = f.paid === true;

                if (filterFields.amountUnpaidFrom.value && (paid ? 0 : amount) < +filterFields.amountUnpaidFrom.value) return false;
                if (filterFields.amountUnpaidTo.value && (paid ? 0 : amount) > +filterFields.amountUnpaidTo.value) return false;

                if (filterFields.amountPaidFrom.value && (paid ? amount : 0) < +filterFields.amountPaidFrom.value) return false;
                if (filterFields.amountPaidTo.value && (paid ? amount : 0) > +filterFields.amountPaidTo.value) return false;

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
        }

        if (usingTrips) {
            filteredTrips = filteredTrips.filter(t => {
                if (filterFields.lastName.value.trim() &&
                    (!t.lastName || !t.lastName.toLowerCase().includes(filterFields.lastName.value.trim().toLowerCase()))) return false;

                if (filterFields.firstName.value.trim() &&
                    (!t.firstName || !t.firstName.toLowerCase().includes(filterFields.firstName.value.trim().toLowerCase()))) return false;

                if (filterFields.email.value.trim() &&
                    (!t.email || !t.email.toLowerCase().includes(filterFields.email.value.trim().toLowerCase()))) return false;

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

                return true;
            });
        }

        console.log('Filtered fines:', filteredFines);
        console.log('Filtered trips:', filteredTrips);

        renderDiagram(filteredFines, filteredTrips);
    }

    function renderDiagram(fines, trips) {
        const svg = document.getElementById('diagram');
        svg.innerHTML = '';

        const diagramType = diagramTypeSelect.value;
        const xAxis = xAxisSelect.value;

        const groupMap = new Map();

        if ([
            'Number of fines',
            'Number of unpaid fines',
            'Number of paid fines',
            'Amount of fines unpaid',
            'Amount of fines paid'
        ].includes(diagramType)) {
            fines.forEach(f => {
                let key = getKey(f, xAxis);
                let val = 0;
                const paid = f.paid === true;
                const amount = f.amount || 0;

                switch (diagramType) {
                    case 'Number of fines': val = 1; break;
                    case 'Number of unpaid fines': val = paid ? 0 : 1; break;
                    case 'Number of paid fines': val = paid ? 1 : 0; break;
                    case 'Amount of fines unpaid': val = paid ? 0 : amount; break;
                    case 'Amount of fines paid': val = paid ? amount : 0; break;
                }

                groupMap.set(key, (groupMap.get(key) || 0) + val);
            });
        }

        if (diagramType === 'Number of trips') {
            trips.forEach(t => {
                let key = getKey(t, xAxis);
                groupMap.set(key, (groupMap.get(key) || 0) + 1);
            });
        }

        // 🔥 Фильтрация сгруппированных значений
        const filteredGroupMap = new Map();
        for (const [key, val] of groupMap.entries()) {
            let pass = true;

            if (diagramType === 'Number of fines') {
                if (filterFields.numberFinesFrom.value && val < +filterFields.numberFinesFrom.value) pass = false;
                if (filterFields.numberFinesTo.value && val > +filterFields.numberFinesTo.value) pass = false;
            }

            if (diagramType === 'Number of paid fines') {
                if (filterFields.paidFinesFrom.value && val < +filterFields.paidFinesFrom.value) pass = false;
                if (filterFields.paidFinesTo.value && val > +filterFields.paidFinesTo.value) pass = false;
            }

            if (diagramType === 'Number of unpaid fines') {
                if (filterFields.unpaidFinesFrom.value && val < +filterFields.unpaidFinesFrom.value) pass = false;
                if (filterFields.unpaidFinesTo.value && val > +filterFields.unpaidFinesTo.value) pass = false;
            }

            if (diagramType === 'Amount of fines unpaid') {
                if (filterFields.amountUnpaidFrom.value && val < +filterFields.amountUnpaidFrom.value) pass = false;
                if (filterFields.amountUnpaidTo.value && val > +filterFields.amountUnpaidTo.value) pass = false;
            }

            if (diagramType === 'Amount of fines paid') {
                if (filterFields.amountPaidFrom.value && val < +filterFields.amountPaidFrom.value) pass = false;
                if (filterFields.amountPaidTo.value && val > +filterFields.amountPaidTo.value) pass = false;
            }

            if (diagramType === 'Number of trips') {
                if (filterFields.tripsFrom.value && val < +filterFields.tripsFrom.value) pass = false;
                if (filterFields.tripsTo.value && val > +filterFields.tripsTo.value) pass = false;
            }

            if (pass) filteredGroupMap.set(key, val);
        }

        // Рисуем
        const keys = Array.from(filteredGroupMap.keys()).sort();
        const svgWidth = svg.clientWidth || 1000;
        const svgHeight = svg.clientHeight || 600;
        const margin = 60;
        const barWidth = (svgWidth - margin * 2) / keys.length * 0.7;
        const maxVal = Math.max(...filteredGroupMap.values(), 1);

        keys.forEach((key, i) => {
            const val = filteredGroupMap.get(key);
            const barHeight = (val / maxVal) * (svgHeight - margin * 2);

            const x = margin + i * ((svgWidth - margin * 2) / keys.length) + (((svgWidth - margin * 2) / keys.length - barWidth) / 2);

            const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            rect.setAttribute('x', x);
            rect.setAttribute('y', svgHeight - margin - barHeight);
            rect.setAttribute('width', barWidth);
            rect.setAttribute('height', barHeight);
            rect.setAttribute('fill', '#4682b4');
            svg.appendChild(rect);

            const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            label.setAttribute('x', x + barWidth / 2);
            label.setAttribute('y', svgHeight - margin + 15);
            label.setAttribute('text-anchor', 'middle');
            label.setAttribute('font-size', '11px');
            label.textContent = key;
            svg.appendChild(label);

            const valText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            valText.setAttribute('x', x + barWidth / 2);
            valText.setAttribute('y', svgHeight - margin - barHeight - 5);
            valText.setAttribute('text-anchor', 'middle');
            valText.setAttribute('font-size', '11px');
            valText.textContent = val.toFixed(0);
            svg.appendChild(valText);
        });
    }

    function getKey(entry, xAxis) {
        if (xAxis === 'Last name') return entry.lastName || 'Unknown';
        if (xAxis === 'First name') return entry.firstName || 'Unknown';
        if (xAxis === 'Date') return entry.date ? new Date(entry.date).toISOString().slice(0, 10) : 'Unknown';
        if (xAxis === 'Email') return entry.email || 'Unknown';
        return 'Unknown';
    }

    // Навигация
    document.getElementById('unpaid-fines-menu').addEventListener('click', e => {
        e.preventDefault();
        window.location.href = '/controller/unpaid-fines';
    });

    document.getElementById('schedule-menu').addEventListener('click', e => {
        e.preventDefault();
        window.location.href = '/controller/schedule';
    });

    fetchData();

    filterConfirmBtn.addEventListener('click', applyFiltersAndRender);
    diagramTypeSelect.addEventListener('change', applyFiltersAndRender);
    xAxisSelect.addEventListener('change', applyFiltersAndRender);

    // Аккаунт
    fetch('/controller/account-data').then(r => r.json()).then(data => {
        document.querySelector('.username').textContent = `${data.last_name} ${data.first_name[0]}.`;
    });

    document.getElementById('user-profile').addEventListener('click', () => {
        window.location.href = 'http://localhost:3000/controller/account';
    });
});
