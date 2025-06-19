document.addEventListener('DOMContentLoaded', function() {
    console.log("Initializing dashboard");
    
    // Widget configuration
    const widgets = [
        { id: 'solar', title: 'Solar Panel Performance', type: 'solar', x: 0, y: 0, w: 6, h: 4 },
        { id: 'hydrogen', title: 'Hydrogen Production', type: 'hydrogen', x: 6, y: 0, w: 6, h: 4 },
        { id: 'temperature', title: 'Temperature & Humidity', type: 'temperature', x: 0, y: 4, w: 6, h: 4 },
        { id: 'car', title: 'Car Energy Status', type: 'car', x: 6, y: 4, w: 6, h: 4 }
    ];
    
    // Colors for charts
    const colors = {
        blue: {line: 'rgb(54, 162, 235)', fill: 'rgba(54, 162, 235, 0.2)'},
        green: {line: 'rgb(75, 192, 192)', fill: 'rgba(75, 192, 192, 0.2)'},
        red: {line: 'rgb(255, 99, 132)', fill: 'rgba(255, 99, 132, 0.2)'},
        yellow: {line: 'rgb(255, 205, 86)', fill: 'rgba(255, 205, 86, 0.2)'}
    };
    
    // Store chart instances
    const charts = {};
    
    // Initialize GridStack with a fallback for manual layout
    let grid;
    try {
        if (typeof GridStack === 'undefined') {
            throw new Error("GridStack not available");
        }
        
        // Force higher z-index for dragged items
        const style = document.createElement('style');
        style.innerHTML = '.grid-stack-item-content {z-index: auto !important;} .ui-draggable-dragging {z-index: 100 !important;}';
        document.head.appendChild(style);
        
        // Initialize with explicit draggable and animation options
        grid = GridStack.init({
            column: 12,
            cellHeight: 80,
            margin: 10,
            resizable: true,
            draggable: {
                handle: '.widget-header', // Optional: drag only by header
                scroll: true 
            },
            animate: true,
            float: true
        });
        
        console.log("GridStack initialized successfully");
    } catch (e) {
        console.log("GridStack not available, using basic layout");
        createBasicLayout();
    }
    
    // Create grid with GridStack if available
    if (grid) {
        // Wait for GridStack to fully initialize
        setTimeout(() => {
            // First remove any existing widgets
            grid.removeAll();
            
            // Then add new widgets
            widgets.forEach(widget => {
                const content = `
                    <div class="widget" data-type="${widget.type}">
                        <div class="widget-header">${widget.title}</div>
                        <div class="chart-container">
                            <canvas id="${widget.id}-chart"></canvas>
                        </div>
                    </div>
                `;
                
                grid.addWidget({
                    x: widget.x, y: widget.y, w: widget.w, h: widget.h,
                    content: content,
                    id: widget.id
                });
            });
            
            // Save layout when it changes
            grid.on('change', function() {
                const layout = grid.save();
                localStorage.setItem('dashboardLayout', JSON.stringify(layout));
                console.log('Layout saved', layout);
            });
            
            // Handle resize events
            grid.on('resizestop', function(event, el) {
                const chartId = el.getAttribute('gs-id');
                if (charts[chartId]) {
                    setTimeout(() => {
                        charts[chartId].resize();
                        charts[chartId].update();
                    }, 200);
                }
            });
            
            // Load saved layout if available
            const savedLayout = localStorage.getItem('dashboardLayout');
            if (savedLayout) {
                try {
                    grid.load(JSON.parse(savedLayout));
                } catch (e) {
                    console.error('Error loading saved layout:', e);
                }
            }
            
            // Now load data for charts
            setTimeout(() => widgets.forEach(loadData), 300);
        }, 100);
    }
    
    // Create a basic layout without GridStack
    function createBasicLayout() {
        const container = document.querySelector('.grid-stack');
        container.style.display = 'grid';
        container.style.gridTemplateColumns = 'repeat(2, 1fr)';
        container.style.gap = '20px';
        container.style.padding = '20px';
        
        widgets.forEach(widget => {
            const div = document.createElement('div');
            div.className = 'basic-widget';
            div.innerHTML = `
                <div class="widget" data-type="${widget.type}">
                    <div class="widget-header">${widget.title}</div>
                    <div class="chart-container">
                        <canvas id="${widget.id}-chart"></canvas>
                    </div>
                </div>
            `;
            container.appendChild(div);
        });
        
        // Add some basic styling
        const style = document.createElement('style');
        style.innerHTML = `
            .basic-widget {
                background-color: white;
                border-radius: 10px;
                padding: 15px;
                box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
                min-height: 300px;
            }
            .chart-container {
                height: 250px;
            }
        `;
        document.head.appendChild(style);
        
        // Load data for charts
        setTimeout(() => widgets.forEach(loadData), 100);
    }
    
    // Load data from API for each widget
    function loadData(widget) {
        // In a real app, fetch from your API endpoint
        // fetch(`../../../back-end/api/dashboard-data.php?type=${widget.type}`)
        
        // For now, use sample data
        const data = getSampleData(widget.type);
        createChart(widget.id, data, widget.type);
    }
    
    // Create or update chart with data
    function createChart(id, data, type) {
        const canvas = document.getElementById(`${id}-chart`);
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const chartType = getChartType(type);
        const chartData = formatChartData(data, type);
        
        // Destroy existing chart if it exists
        if (charts[id]) {
            charts[id].destroy();
        }
        
        charts[id] = new Chart(ctx, {
            type: chartType,
            data: chartData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: false
                    }
                }
            }
        });
    }
    
    // Get chart type based on data type
    function getChartType(type) {
        switch(type) {
            case 'car': return 'bar';
            default: return 'line';
        }
    }
    
    // Format data for chart based on type
    function formatChartData(data, type) {
        const labels = data.labels;
        
        switch(type) {
            case 'solar':
                return {
                    labels: labels,
                    datasets: [
                        {
                            label: 'Power (W)',
                            data: data.power,
                            borderColor: colors.yellow.line,
                            backgroundColor: colors.yellow.fill,
                            tension: 0.3
                        },
                        {
                            label: 'Voltage (V)',
                            data: data.voltage,
                            borderColor: colors.red.line,
                            backgroundColor: colors.red.fill,
                            tension: 0.3
                        }
                    ]
                };
                
            case 'hydrogen':
                return {
                    labels: labels,
                    datasets: [
                        {
                            label: 'Storage (%)',
                            data: data.storage,
                            borderColor: colors.green.line,
                            backgroundColor: colors.green.fill,
                            tension: 0.3
                        }
                    ]
                };
                
            case 'temperature':
                return {
                    labels: labels,
                    datasets: [
                        {
                            label: 'Temperature (°C)',
                            data: data.temp,
                            borderColor: colors.red.line,
                            backgroundColor: colors.red.fill,
                            tension: 0.3
                        },
                        {
                            label: 'Humidity (%)',
                            data: data.humidity,
                            borderColor: colors.blue.line,
                            backgroundColor: colors.blue.fill,
                            tension: 0.3
                        }
                    ]
                };
                
            case 'car':
                return {
                    labels: labels,
                    datasets: [
                        {
                            label: 'Battery Level (%)',
                            data: data.battery,
                            backgroundColor: colors.blue.fill,
                            borderColor: colors.blue.line
                        }
                    ]
                };
                
            default:
                return {
                    labels: labels,
                    datasets: [
                        {
                            label: 'Data',
                            data: data.values,
                            borderColor: colors.blue.line,
                            backgroundColor: colors.blue.fill
                        }
                    ]
                };
        }
    }
    
    // Sample data generator (replace with actual API calls)
    function getSampleData(type) {
        const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
        
        switch(type) {
            case 'solar':
                return {
                    labels: labels,
                    power: [250, 320, 380, 330, 420, 550],
                    voltage: [12, 12.5, 13, 12.8, 13.2, 13.5]
                };
                
            case 'hydrogen':
                return {
                    labels: labels,
                    storage: [65, 72, 68, 74, 82, 85]
                };
                
            case 'temperature':
                return {
                    labels: labels,
                    temp: [20, 22, 25, 23, 24, 26],
                    humidity: [45, 48, 52, 50, 47, 49]
                };
                
            case 'car':
                return {
                    labels: labels,
                    battery: [85, 72, 65, 82, 93, 78]
                };
                
            default:
                return {
                    labels: labels,
                    values: [12, 19, 3, 5, 2, 3]
                };
        }
    }
    
    // Filter widgets by category
    document.querySelectorAll('.navigation a').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Update active state
            document.querySelectorAll('.navigation li').forEach(li => {
                li.classList.remove('active');
            });
            this.parentElement.classList.add('active');
            
            // Get the category
            const category = this.getAttribute('data-category');
            
            // Filter widgets
            if (grid) {
                document.querySelectorAll('.grid-stack-item').forEach(item => {
                    const widget = item.querySelector('.widget');
                    if (!widget) return;
                    
                    const widgetType = widget.getAttribute('data-type');
                    if (category === 'all' || category === widgetType) {
                        grid.update(item, {hidden: false});
                    } else {
                        grid.update(item, {hidden: true});
                    }
                });
            } else {
                document.querySelectorAll('.basic-widget').forEach(item => {
                    const widget = item.querySelector('.widget');
                    if (!widget) return;
                    
                    const widgetType = widget.getAttribute('data-type');
                    item.style.display = (category === 'all' || category === widgetType) ? '' : 'none';
                });
            }
            
            // Update charts after filtering
            setTimeout(() => {
                Object.values(charts).forEach(chart => {
                    if (typeof chart.resize === 'function') chart.resize();
                    chart.update();
                });
            }, 300);
        });
    });
    
    // Expose this function for date picker
    window.refreshChartData = function(startDate, endDate) {
        console.log(`Refreshing data from ${startDate} to ${endDate}`);
        // In a real app, fetch new data based on date range
        widgets.forEach(loadData);
    };
});