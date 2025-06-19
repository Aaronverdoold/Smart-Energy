document.addEventListener('DOMContentLoaded', function() {
    try {
        // Initialize date picker
        if (typeof flatpickr === 'undefined') {
            console.error('flatpickr is not loaded');
            return;
        }
        
        const dateRangePicker = flatpickr("#date-range", {
            mode: "range",
            dateFormat: "d-m-Y",
            defaultDate: ["17-5-2025", "17-6-2025"],
            onChange: function(selectedDates) {
                if (selectedDates.length === 2) {
                    updateDateDisplay(selectedDates[0], selectedDates[1]);
                    
                    if (window.refreshChartData) {
                        window.refreshChartData(selectedDates[0], selectedDates[1]);
                    }
                }
            }
        });
        
        // Handle period buttons
        document.querySelectorAll('.period-btn').forEach(button => {
            button.addEventListener('click', function() {
                document.querySelectorAll('.period-btn').forEach(btn => {
                    btn.classList.remove('active');
                });
                this.classList.add('active');
                
                const today = new Date();
                let start, end;
                
                switch(this.textContent) {
                    case 'Today':
                        start = end = today;
                        break;
                    case 'Month':
                        start = new Date(today.getFullYear(), today.getMonth(), 1);
                        end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
                        break;
                    case 'Year':
                        start = new Date(today.getFullYear(), 0, 1);
                        end = new Date(today.getFullYear(), 11, 31);
                        break;
                }
                
                dateRangePicker.setDate([start, end]);
                updateDateDisplay(start, end);
                
                if (window.refreshChartData) {
                    window.refreshChartData(start, end);
                }
            });
        });
        
        function updateDateDisplay(start, end) {
            const display = document.querySelector('.date-display');
            if (!display) return;
            
            const formatOptions = { month: 'long', year: 'numeric' };
            
            if (start.getMonth() === end.getMonth() && 
                start.getFullYear() === end.getFullYear()) {
                display.textContent = start.toLocaleDateString(undefined, formatOptions);
            } else {
                display.textContent = 
                    `${start.toLocaleDateString(undefined, formatOptions)} - ${end.toLocaleDateString(undefined, formatOptions)}`;
            }
        }
    } catch (e) {
        console.error('Error initializing date picker:', e);
    }
});