// Update GridStack initialization to better handle scrolling

// Dashboard initialization
document.addEventListener('DOMContentLoaded', function() {
    console.log("Grid layout initializing...");
    
    // Initialize GridStack only once
    const grid = GridStack.init({
        column: 12,
        cellHeight: 80,
        margin: 10,
        resizable: true,
        draggable: {
            handle: '.widget-header', // Only allow dragging from the header
            scroll: true, // Enable scrolling while dragging
            appendTo: 'body', // Append drag helper to body for better performance
            containment: '.grid-stack' // Contain dragging within grid
        },
        animate: true,
        float: true,
        alwaysShowResizeHandle: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    });
    
    // Store grid globally for other functions to use
    window.dashboardGrid = grid;
    
    // Add grid event listeners
    grid.on('added removed change', function(e, items) {
        console.log('Grid layout changed', e, items);
        saveGridLayout();
    });
    
    // Load dashboard data
    loadDashboardData();
    setupNavigation();
    
    // Expose refreshChartData function globally for date picker to use
    window.refreshChartData = function(start, end) {
        // Format dates as YYYY-MM-DD for the API
        const startFormatted = formatDateForAPI(start);
        const endFormatted = formatDateForAPI(end);
        
        console.log(`Refreshing chart data for ${startFormatted} to ${endFormatted}`);
        
        // Reload data with date filter
        loadDashboardData(startFormatted, endFormatted);
    };
    
    // Try to load saved layout if available
    const savedLayout = localStorage.getItem('dashboardLayout');
    if (savedLayout) {
        try {
            console.log("Attempting to restore saved layout");
            grid.load(JSON.parse(savedLayout));
        } catch (e) {
            console.error('Could not load saved layout', e);
        }
    }
});

// Function to save the current layout
function saveGridLayout() {
    if (!window.dashboardGrid) return;
    
    const serializedData = window.dashboardGrid.save();
    localStorage.setItem('dashboardLayout', JSON.stringify(serializedData));
    console.log("Layout saved to localStorage", serializedData);
}

// Format date for API
function formatDateForAPI(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Fetch data from API
function loadDashboardData(startDate = null, endDate = null) {
    console.log("Loading dashboard data...", { startDate, endDate });
    
    // Build API URL with optional date parameters
    let apiUrl = '../../back-end/api/dashboard-data.php';
    if (startDate && endDate) {
        apiUrl += `?start=${startDate}&end=${endDate}`;
    }
    
    fetch(apiUrl)
        .then(response => {
            console.log("API response received");
            return response.json();
        })
        .then(result => {
            console.log("API data processed", result);
            
            if (result.status !== 'success') {
                throw new Error(result.message || 'API error');
            }
            
            // Check if we have data
            if (!result.data || result.data.labels.length === 0) {
                document.getElementById('dashboard-grid').innerHTML = 
                    '<div class="error-message">No data available for the selected date range</div>';
                return;
            }
            
            // Create widgets with data
            createWidgets(result.data);
        })
        .catch(error => {
            console.error('Failed to load dashboard data:', error);
            document.getElementById('dashboard-grid').innerHTML = 
                `<div class="error-message">Error loading dashboard data: ${error.message}</div>`;
        });
}

// Toast queue
let toastQueue = [];
let toastActive = false;

function showToast(message, type = 'warning') {
    toastQueue.push({ message, type });
    if (!toastActive) showNextToast();
}

function showNextToast() {
    if (toastQueue.length === 0) {
        toastActive = false;
        return;
    }
    toastActive = true;
    const { message, type } = toastQueue.shift();
    const toast = document.getElementById('toast');
    if (!toast) return;

    // Set icon and color (same as before)
    let iconClass = 'ri-error-warning-line';
    let borderColor = '#FFA500';
    if (type === 'error') {
        iconClass = 'ri-close-circle-line';
        borderColor = '#f44336';
    } else if (type === 'success') {
        iconClass = 'ri-checkbox-circle-line';
        borderColor = '#4caf50';
    }

    toast.innerHTML = `<i class="${iconClass}"></i><span class="message">${message}</span>`;
    toast.style.borderLeft = `5px solid ${borderColor}`;
    toast.classList.add('show');
    toast.classList.remove('hidden');
    setTimeout(() => {
        toast.classList.remove('show');
        toast.classList.add('hidden');
        setTimeout(showNextToast, 300); // Small gap between toasts
    }, 3000);
}


// Create dashboard widgets
function createWidgets(data) {
    console.log("Creating dashboard widgets");

    // Clear the grid first
    if (window.dashboardGrid) {
        window.dashboardGrid.removeAll();
    }

    // Define widgets
    const widgets = [
        {
            id: 'solar-chart',
            type: 'solar',
            title: 'Solar Panel Output',
            x: 0, y: 0, w: 6, h: 4,
            chartData: {
                labels: data.labels,
                datasets: [{
                    label: 'Solar Panel Output (W)',
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
            x: 6, y: 0, w: 6, h: 4,
            chartData: {
                labels: data.labels,
                datasets: [{
                    label: 'Hydrogen Production (L/h)',
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
            x: 0, y: 4, w: 6, h: 4,
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
            x: 6, y: 4, w: 6, h: 4,
            chartData: {
                labels: data.labels,
                datasets: [{
                    label: 'Car Hydrogen Level (%)',
                    data: data.car.hydrogen,
                    borderColor: '#9C27B0',
                    backgroundColor: 'rgba(156, 39, 176, 0.1)',
                    fill: true
                }]
            }
        },
        {
            id: 'home-power-chart',
            type: 'home-power',
            title: 'Home Electricity Consumption',
            x: 0, y: 8, w: 6, h: 4,
            chartData: {
                labels: data.labels,
                datasets: [{
                    label: 'Home Power (kW)',
                    data: data.home.power,
                    borderColor: '#FF9800',
                    backgroundColor: 'rgba(255, 152, 0, 0.1)',
                    fill: true
                }]
            }
        },
        {
            id: 'home-hydrogen-chart',
            type: 'home-hydrogen',
            title: 'Home Hydrogen Storage',
            x: 6, y: 8, w: 6, h: 4,
            chartData: {
                labels: data.labels,
                datasets: [{
                    label: 'Home Hydrogen Storage (%)',
                    data: data.home.hydrogen,
                    borderColor: '#009688',
                    backgroundColor: 'rgba(0, 150, 136, 0.1)',
                    fill: true
                }]
            }
        },
        {
            id: 'environment-chart',
            type: 'environment',
            title: 'Air Quality',
            x: 0, y: 12, w: 6, h: 4,
            chartData: {
                labels: data.labels,
                datasets: [
                    {
                        label: 'CO₂ (ppm)',
                        data: data.environment.co2,
                        borderColor: '#795548',
                        backgroundColor: 'rgba(121, 85, 72, 0.1)',
                        yAxisID: 'y'
                    },
                    {
                        label: 'Humidity (%)',
                        data: data.environment.humidity,
                        borderColor: '#03A9F4',
                        backgroundColor: 'rgba(3, 169, 244, 0.1)',
                        yAxisID: 'y1'
                    }
                ]
            },
            options: {
                scales: {
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        title: {
                            display: true,
                            text: 'CO₂ (ppm)'
                        }
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        grid: {
                            drawOnChartArea: false
                        },
                        title: {
                            display: true,
                            text: 'Humidity (%)'
                        }
                    }
                }
            }
        },
        {
            id: 'battery-chart',
            type: 'battery',
            title: 'Battery Level',
            x: 6, y: 12, w: 3, h: 4,
            chartData: {
                labels: data.labels,
                datasets: [{
                    label: 'Battery Level (%)',
                    data: data.environment.battery,
                    borderColor: '#8BC34A',
                    backgroundColor: 'rgba(139, 195, 74, 0.1)',
                    fill: true
                }]
            }
        },
        {
            id: 'pressure-chart',
            type: 'pressure',
            title: 'Atmospheric Pressure',
            x: 9, y: 12, w: 3, h: 4,
            chartData: {
                labels: data.labels,
                datasets: [{
                    label: 'Atmospheric Pressure (hPa)',
                    data: data.environment.pressure,
                    borderColor: '#607D8B',
                    backgroundColor: 'rgba(96, 125, 139, 0.1)'
                }]
            }
        }
    ];

    // Temperature toast if inside temp hits exactly 20°C
    if (data.temperature.inside.includes(20)) {
        showToast("Inside temperature is exactly 20°C");
    }

    if (data.solar.power.some(val => val > 40)) {
        showToast("Warning: Solar panel output is above 40 W!");
    }

    // Add widgets to dashboard
    widgets.forEach(widget => {
        const widgetContent = `
            <div class="widget" data-type="${widget.type}">
                <div class="widget-header">${widget.title}</div>
                <div class="chart-container">
                    <canvas id="${widget.id}"></canvas>
                </div>
            </div>
        `;

        // Add the widget to GridStack
        if (window.dashboardGrid) {
            console.log(`Adding widget: ${widget.id}`);
            window.dashboardGrid.addWidget({
                x: widget.x,
                y: widget.y,
                w: widget.w,
                h: widget.h,
                content: widgetContent
            });
        }

        // Create chart after the widget is added to DOM
        setTimeout(() => {
            const canvas = document.getElementById(widget.id);
            if (canvas) {
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
                            },
                            ...(widget.options?.scales || {})
                        },
                        ...(widget.options || {})
                    }
                });
            }
        }, 100);
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
                    widget.closest('.grid-stack-item').style.display = '';
                } else {
                    widget.closest('.grid-stack-item').style.display = 'none';
                }
            });
        });
    });
}