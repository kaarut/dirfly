document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('pto-form');
    const resultElement = document.querySelector('.pto-result h3');

    if (form && resultElement) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();

            // Get form values
            const startDate = new Date(document.getElementById('start-date').value);
            const endDate = new Date(document.getElementById('end-date').value);
            const previousBalance = parseFloat(document.getElementById('previous-balance').value);
            const accrueRate = parseFloat(document.getElementById('accrue-rate').value);
            const accrueFrequency = document.getElementById('accrue-frequency').value;
            const hoursPerDay = parseFloat(document.getElementById('hours-per-day').value);
            const daysOff = parseFloat(document.getElementById('days-off').value) || 0;
            const maxHours = parseFloat(document.getElementById('max-hours').value) || Infinity;

            // Calculate working days
            const daysWorked = Array.from(document.getElementsByName('days-worked'))
                .filter(checkbox => checkbox.checked)
                .map(checkbox => checkbox.value);

            // Calculate PTO
            let totalDays = 0;
            let currentDate = new Date(startDate);

            while (currentDate <= endDate) {
                if (daysWorked.includes(currentDate.toLocaleDateString('en-US', { weekday: 'short' }).toLowerCase())) {
                    totalDays++;
                }
                currentDate.setDate(currentDate.getDate() + 1);
            }

            let ptoHours = previousBalance;

            switch (accrueFrequency) {
                case 'hour':
                    ptoHours += (totalDays * hoursPerDay - daysOff * hoursPerDay) * accrueRate;
                    break;
                case 'day':
                    ptoHours += (totalDays - daysOff) * accrueRate;
                    break;
                case 'week':
                    ptoHours += ((totalDays - daysOff) / 7) * accrueRate;
                    break;
                case 'month':
                    ptoHours += ((totalDays - daysOff) / 30) * accrueRate;
                    break;
            }

            ptoHours = Math.min(ptoHours, maxHours);

            // Update result
            resultElement.textContent = `${ptoHours.toFixed(2)} hours of PTO`;
        });
    }
});