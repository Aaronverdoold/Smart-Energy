document.addEventListener('DOMContentLoaded', function() {
    // Initialize GridStack
    const grid = GridStack.init({
        column: 12,
        cellHeight: 80,
        margin: 50, // 50px spacing between items
        resizable: true,
        draggable: true,
        float: true
    });

    // Define widget content
    const widgets = [
        {
            id: 'solar-panels',
            title: 'Solar panels',
            x: 0, y: 0, w: 6, h: 4,
            chartType: 'line'
        },
        {
            id: 'hydrogen-production',
            title: 'Hydrogen production', 
            x: 6, y: 0, w: 6, h: 4,
            chartType: 'line'
        },
        {
            id: 'house-electricity',
            title: 'House electricity use',
            x: 0, y: 4, w: 6, h: 4,
            chartType: 'pie'
        },
        {
            id: 'car-electricity',
            title: 'Car electricity use',
            x: 6, y: 4, w: 6, h: 4,
            chartType: 'bar'
        }
    ];

    // Add widgets to the grid
    widgets.forEach(widget => {
        const content = `
            <div class="widget-header">${widget.title}</div>
            <div id="${widget.id}-chart" class="chart-container">
                <canvas></canvas>
            </div>
        `;
        
        grid.addWidget({
            x: widget.x,
            y: widget.y,
            w: widget.w,
            h: widget.h,
            content: content,
            id: widget.id
        });
        
        // Initialize chart after widget is added
        setTimeout(() => createDummyChart(widget.id, widget.chartType), 100);
    });

    // Period selector functionality
    const periodButtons = document.querySelectorAll('.period-btn');
    periodButtons.forEach(button => {
        button.addEventListener('click', function() {
            periodButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Save layout when it changes
    grid.on('change', function() {
        const layout = grid.save();
        localStorage.setItem('dashboardLayout', JSON.stringify(layout));
    });

    // Load saved layout if available
    const savedLayout = localStorage.getItem('dashboardLayout');
    if (savedLayout) {
        grid.load(JSON.parse(savedLayout));
        
        // Reinitialize charts after layout is loaded
        setTimeout(() => {
            widgets.forEach(widget => {
                createDummyChart(widget.id, widget.chartType);
            });
        }, 300);
    }
    
    // Make charts responsive to widget resize
    grid.on('resizestop', function(event, el) {
        const widgetId = el.getAttribute('gs-id');
        const chartInstance = Chart.getChart(document.querySelector(`#${widgetId}-chart canvas`));
        if (chartInstance) {
            setTimeout(() => chartInstance.resize(), 200);
        }
    });
});

// Create simple dummy charts for testing
function createDummyChart(widgetId, chartType) {
    const container = document.querySelector(`#${widgetId}-chart`);
    const canvas = container.querySelector('canvas');
    
    let config;
    
    switch (chartType) {
        case 'line':
            config = {
                type: 'line',
                data: {
                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                    datasets: [{
                        label: 'Dataset 1',
                        data: [12, 19, 3, 5, 2, 3, 7, 8, 9, 10, 11, 12],
                        borderColor: 'rgb(75, 192, 192)',
                        tension: 0.1
                    }, 
                    {
                        label: 'Dataset 2',
                        data: [5, 10, 15, 10, 15, 10, 15, 10, 15, 10, 15, 10],
                        borderColor: 'rgb(255, 99, 132)',
                        tension: 0.1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false
                }
            };
            break;
        case 'bar':
            config = {
                type: 'bar',
                data: {
                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                    datasets: [{
                        label: 'Usage',
                        data: [12, 19, 3, 5, 2, 3],
                        backgroundColor: 'rgba(255, 159, 64, 0.7)'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false
                }
            };
            break;
        case 'pie':
            config = {
                type: 'pie',
                data: {
                    labels: ['Solar', 'Battery', 'Grid'],
                    datasets: [{
                        data: [654.7, 393.9, 233.9],
                        backgroundColor: [
                            'rgb(255, 205, 86)',
                            'rgb(255, 99, 132)',
                            'rgb(54, 162, 235)'
                        ]
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false
                }
            };
            break;
    }
    
    new Chart(canvas, config);
}