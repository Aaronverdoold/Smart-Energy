document.addEventListener('DOMContentLoaded', function() {
    // Initialize date picker with range mode
    const dateRangePicker = flatpickr("#date-range", {
        mode: "range",
        dateFormat: "d-m-Y",
        defaultDate: ["17-5-2025", "17-6-2025"],
        theme: "dark",
        disableMobile: true,
        onChange: function(selectedDates, dateStr) {
            if(selectedDates.length === 2) {
                // Update displayed date range
                updateDateDisplay(selectedDates[0], selectedDates[1]);
                
                // In a real app, you would fetch new data for the selected range here
                refreshChartData(selectedDates[0], selectedDates[1]);
            }
        }
    });

    // Handle period buttons
    const periodButtons = document.querySelectorAll('.period-btn');
    periodButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Update active state
            periodButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');

            // Set date range based on selected period
            const today = new Date();
            let startDate, endDate;

            if (this.textContent === 'Today') {
                startDate = today;
                endDate = today;
                dateRangePicker.setDate([startDate, endDate]);
            } else if (this.textContent === 'Month') {
                startDate = new Date(today.getFullYear(), today.getMonth(), 1);
                endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
                dateRangePicker.setDate([startDate, endDate]);
            } else if (this.textContent === 'Year') {
                startDate = new Date(today.getFullYear(), 0, 1);
                endDate = new Date(today.getFullYear(), 11, 31);
                dateRangePicker.setDate([startDate, endDate]);
            }

            updateDateDisplay(startDate, endDate);
            refreshChartData(startDate, endDate);
        });
    });

    function updateDateDisplay(startDate, endDate) {
        const months = ['Januari', 'Februari', 'Maart', 'April', 'Mei', 'Juni', 
                        'Juli', 'Augustus', 'September', 'Oktober', 'November', 'December'];
        
        const dateDisplay = document.querySelector('.date-display');
        
        // For same year display
        if (startDate.getFullYear() === endDate.getFullYear()) {
            // Same month
            if (startDate.getMonth() === endDate.getMonth()) {
                dateDisplay.textContent = `${months[startDate.getMonth()]} ${startDate.getFullYear()}`;
            } else {
                dateDisplay.textContent = `${months[startDate.getMonth()]} - ${months[endDate.getMonth()]} ${startDate.getFullYear()}`;
            }
        } else {
            dateDisplay.textContent = `${months[startDate.getMonth()]} ${startDate.getFullYear()} - ${months[endDate.getMonth()]} ${endDate.getFullYear()}`;
        }
    }

    function refreshChartData(startDate, endDate) {
        console.log(`Fetching data from ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}`);
        // In a real implementation, this would trigger API calls to get new data
        // For now, we'll just log the action
        
        // Here you would update each chart with new data
        // For example:
        // updateSolarChart(startDate, endDate);
        // updateHydrogenChart(startDate, endDate);
        // etc.
    }
});