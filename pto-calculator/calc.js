document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('pto-form');
    const resultElement = document.querySelector('.pto-result h3');
    const accrueFrequencySelect = document.getElementById('accrue-frequency');
    const hourlyFields = document.querySelector('.hourly-field');
    const calculateButton = document.getElementById('calculate-pto');
    const errorBanner = document.getElementById('error-banner');

    function toggleHourlyFields() {
        if (accrueFrequencySelect.value === 'hour') {
            hourlyFields.style.display = 'block';
            hourlyFields.style.opacity = '1';
            hourlyFields.style.maxHeight = hourlyFields.scrollHeight + 'px';
        } else {
            hourlyFields.style.opacity = '0';
            hourlyFields.style.maxHeight = '0';
            setTimeout(() => {
                hourlyFields.style.display = 'none';
            }, 300);
        }
    }

    if (accrueFrequencySelect) {
        accrueFrequencySelect.addEventListener('change', toggleHourlyFields);
        toggleHourlyFields();
    }

    function showError(message) {
        errorBanner.textContent = message;
        errorBanner.style.display = 'block';
    }

    function hideError() {
        errorBanner.style.display = 'none';
    }

    function calculatePTO() {
        hideError(); // Hide any previous errors

        // Validate inputs
        const startDate = new Date(document.getElementById('start-date').value);
        const endDate = new Date(document.getElementById('end-date').value);
        const previousBalance = parseFloat(document.getElementById('previous-balance').value) || 0;
        const accrueRate = parseFloat(document.getElementById('accrue-rate').value);
        const accrueFrequency = document.getElementById('accrue-frequency').value;
        const maxHours = parseFloat(document.getElementById('max-hours').value) || Infinity;

        // Check if dates are valid
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            showError("Please enter valid start and end dates.");
            return;
        }

        // Check if end date is after start date
        if (endDate <= startDate) {
            showError("End date must be after start date.");
            return;
        }

        // Check if accrue rate is valid
        if (isNaN(accrueRate) || accrueRate <= 0) {
            showError("Please enter a valid accrue rate.");
            return;
        }

        // Check if accrue frequency is selected
        if (!accrueFrequency) {
            showError("Please select an accrue frequency.");
            return;
        }

        let ptoHours = previousBalance;

        if (accrueFrequency === 'hour') {
            const hoursPerDay = parseFloat(document.getElementById('hours-per-day').value) || 8;
            const daysOff = parseFloat(document.getElementById('days-off').value) || 0;
            const daysWorked = Array.from(document.getElementsByName('days-worked'))
                .filter(checkbox => checkbox.checked)
                .map(checkbox => checkbox.value);

            if (daysWorked.length === 0) {
                showError("Please select at least one working day.");
                return;
            }

            let totalDays = 0;
            let currentDate = new Date(startDate);

            while (currentDate <= endDate) {
                if (daysWorked.includes(currentDate.toLocaleDateString('en-US', { weekday: 'short' }).toLowerCase())) {
                    totalDays++;
                }
                currentDate.setDate(currentDate.getDate() + 1);
            }

            ptoHours += (totalDays * hoursPerDay - daysOff * hoursPerDay) * accrueRate;
        } else {
            const totalDays = (endDate - startDate) / (1000 * 60 * 60 * 24);
            if (accrueFrequency === 'week') {
                ptoHours += (totalDays / 7) * accrueRate;
            } else if (accrueFrequency === 'month') {
                ptoHours += (totalDays / 30) * accrueRate;
            }
        }

        ptoHours = Math.min(ptoHours, maxHours);

        if (isNaN(ptoHours) || ptoHours < 0) {
            showError("Invalid calculation result. Please check your inputs.");
        } else {
            resultElement.textContent = `${ptoHours.toFixed(2)} hours of PTO`;
        }
    }

    if (calculateButton && resultElement) {
        calculateButton.addEventListener('click', calculatePTO);
    }
});