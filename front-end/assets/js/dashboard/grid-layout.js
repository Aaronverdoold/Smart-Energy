// Dashboard initialization
document.addEventListener('DOMContentLoaded', function() {
    loadDashboardData();
    setupNavigation();
});

// Fetch data from API
function loadDashboardData() {
    fetch('../../back-end/api/dashboard-data.php')
        .then(response => response.json())
        .then(result => {
            if (result.status !== 'success') {
                throw new Error(result.message || 'API error');
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
        
        // Create chart
        const canvas = document.getElementById(widget.id);
        new Chart(canvas, {
            type: 'line',
            data: widget.chartData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top'
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false
                    }
                },
                scales: {
                    x: {
                        ticks: {
                            // Show fewer labels on the x-axis for readability
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