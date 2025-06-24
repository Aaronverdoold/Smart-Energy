// Dashboard initialization
document.addEventListener('DOMContentLoaded', function() {
    loadDashboardData();
    setupNavigation();
    
    // Expose refreshChartData function globally for date picker to use
    window.refreshChartData = function(start, end) {
        // Format dates as YYYY-MM-DD for the API
        const startFormatted = formatDateForAPI(start);
        const endFormatted = formatDateForAPI(end);
        
        // Show loading indicator
        document.getElementById('dashboard-grid').innerHTML = '<div id="loading-indicator">Loading dashboard data...</div>';
        
        // Reload data with date filter
        loadDashboardData(startFormatted, endFormatted);
    };
});

// Format date for API
function formatDateForAPI(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Fetch data from API
function loadDashboardData(startDate = null, endDate = null) {
    // Build API URL with optional date parameters
    let apiUrl = '../../back-end/api/dashboard-data.php';
    if (startDate && endDate) {
        apiUrl += `?start=${startDate}&end=${endDate}`;
    }
    
    fetch(apiUrl)
        .then(response => response.json())
        .then(result => {
            if (result.status !== 'success') {
                throw new Error(result.message || 'API error');
            }
            
            // Check if we have data
            if (result.data.labels.length === 0) {
                document.getElementById('dashboard-grid').innerHTML = 
                    '<div class="error-message">No data available for the selected date range</div>';
                return;
            }
            
            // Clear loading indicator
            document.getElementById('dashboard-grid').innerHTML = '';
            
            const data = result.data;
            createWidgets(data);
        })
        .catch(error => {
            console.error('Failed to load dashboard data:', error);
            document.getElementById('dashboard-grid').innerHTML = 
                `<div class="error-message">Error loading dashboard data: ${error.message}</div>`;
        });
}

// Create dashboard widgets
function createWidgets(data) {
    // Define widgets
    const widgets = [
        {
            id: 'solar-chart',
            type: 'solar',
            title: 'Solar Panel Output',
            chartData: {
                labels: data.labels,
                datasets: [{
                    label: 'Power (W)',
                    data: data.solar.power,
                    borderColor: '#FFC107',
                    backgroundColor: 'rgba(255, 193, 7, 0.1)'
                }]
            }
        },
        {
            id: 'hydrogen-chart',
            type: 'hydrogen',
            title: 'Hydrogen Production',
            chartData: {
                labels: data.labels,
                datasets: [{
                    label: 'Production (%)',
                    data: data.hydrogen.production,
                    borderColor: '#4CAF50',
                    backgroundColor: 'rgba(76, 175, 80, 0.1)',
                    fill: true
                }]
            }
        },
        {
            id: 'temperature-chart',
            type: 'temperature',
            title: 'Temperature',
            chartData: {
                labels: data.labels,
                datasets: [
                    {
                        label: 'Outside (°C)',
                        data: data.temperature.outside,
                        borderColor: '#F44336',
                        backgroundColor: 'rgba(244, 67, 54, 0.1)'
                    },
                    {
                        label: 'Inside (°C)',
                        data: data.temperature.inside,
                        borderColor: '#2196F3',
                        backgroundColor: 'rgba(33, 150, 243, 0.1)'
                    }
                ]
            }
        },
        {
            id: 'car-chart',
            type: 'car',
            title: 'Car Hydrogen Level',
            chartData: {
                labels: data.labels,
                datasets: [{
                    label: 'Storage (%)',
                    data: data.car.hydrogen,
                    borderColor: '#9C27B0',
                    backgroundColor: 'rgba(156, 39, 176, 0.1)',
                    fill: true
                }]
            }
        }
    ];

    // Add widgets to dashboard
    const grid = document.getElementById('dashboard-grid');
    
    widgets.forEach(widget => {
        const widgetEl = document.createElement('div');
        widgetEl.className = 'widget';
        widgetEl.setAttribute('data-type', widget.type);
        
        widgetEl.innerHTML = `
            <div class="widget-header">${widget.title}</div>
            <div class="chart-container">
                <canvas id="${widget.id}"></canvas>
            </div>
        `;
        
        grid.appendChild(widgetEl);
        
        // Create chart with better options for date filtering
        const canvas = document.getElementById(widget.id);
        new Chart(canvas, {
            type: 'line',
            data: widget.chartData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    tooltip: {
                        mode: 'index',
                        intersect: false
                    }
                },
                scales: {
                    x: {
                        ticks: {
                            maxTicksLimit: 10,
                            maxRotation: 45,
                            minRotation: 45
                        }
                    }
                }
            }
        });
    });
}

// Setup navigation filtering
function setupNavigation() {
    document.querySelectorAll('.navigation a').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Update active state
            document.querySelectorAll('.navigation li').forEach(li => {
                li.classList.remove('active');
            });
            this.parentElement.classList.add('active');
            
            // Filter widgets
            const category = this.getAttribute('data-category');
            document.querySelectorAll('.widget').forEach(widget => {
                if (category === 'all' || widget.getAttribute('data-type') === category) {
                    widget.style.display = '';
                } else {
                    widget.style.display = 'none';
                }
            });
        });
    });
}