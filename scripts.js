// scripts.js

// 读取 CSV 文件
fetch('/data/contributor_all.csv')
    .then(response => response.text())
    .then(csvText => {
        var data = Papa.parse(csvText, { header: true }).data;

        // 将数据转换为 ECharts 需要的格式
        var seriesData = data.map(row => ({
            name: row['community'],
            value: parseInt(row['contributor_count'])
        }));

        var colors = [
            '#FF6347', // Tomato
            '#4682B4', // SteelBlue
            '#32CD32', // LimeGreen
            '#FFD700', // Gold
            '#6A5ACD', // SlateBlue
            '#FF4500', // OrangeRed
            '#8A2BE2', // BlueViolet
            '#00FA9A', // MediumSpringGreen
            '#FF1493', // DeepPink
            '#1E90FF'  // DodgerBlue
        ];

        // 配置 ECharts 饼图选项
        var option = {
            title: {
                text: 'Contributors by Community',
                left: 'center'
            },
            tooltip: {
                trigger: 'item'
            },
            legend: {
                orient: 'vertical',
                left: 'left'
            },
            color: colors,
            series: [{
                name: 'Contributors',
                type: 'pie',
                radius: '50%',
                data: seriesData,
                emphasis: {
                    itemStyle: {
                        shadowBlur: 10,
                        shadowOffsetX: 0,
                        shadowColor: 'rgba(0, 0, 0, 0.5)'
                    }
                },
                label: {
                    show: true,
                    formatter: '{b}: {d}%'
                }
            }]
        };
        // 使用配置项和数据显示图表
        let chart = echarts.init(document.getElementById(`chart1`));
        chart.setOption(option);
    })
    .catch(error => console.error('Error reading CSV file:', error));


    // scripts.js

// 读取 CSV 文件
fetch('/data/log_all.csv')
.then(response => response.text())
.then(csvText => {
    var data = Papa.parse(csvText, { header: true }).data;
    data = data.filter(row => row['year'] && row['community'] && row['count']);
    // 汇总每个社区每年的贡献量
    var yearCommunityTotals = data.reduce((acc, row) => {
        let year = row['year'];
        let community = row['community'];
        let count = parseInt(row['count']);
        
        if (!acc[year]) {
            acc[year] = {};
        }
        if (acc[year][community]) {
            acc[year][community] += count;
        } else {
            acc[year][community] = count;
        }
        
        return acc;
    }, {});

    // 将数据转换为 ECharts 需要的格式
    var years = Object.keys(yearCommunityTotals);
    var communities = Array.from(new Set(data.map(row => row['community'])));
    var seriesData = communities.map(community => ({
        name: community,
        type: 'bar',
        stack: 'total',
        data: years.map(year => yearCommunityTotals[year][community] || 0)
    }));

    // 自定义颜色列表（根据需要调整）
    var colors = [
        '#FF6347', '#4682B4', '#32CD32', '#FFD700', '#6A5ACD',
        '#FF4500', '#8A2BE2', '#00FA9A', '#FF1493', '#1E90FF'
    ];


    // 配置 ECharts 堆叠柱状图选项
    var option = {
        title: {
            text: 'Contributors by Community and Year',
            left: 'center'
        },
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'shadow'
            }
        },
        legend: {
            orient: 'vertical',
            left: 'left',
            data: communities
        },
        xAxis: {
            type: 'category',
            data: years,
            name: 'Year'
        },
        yAxis: {
            type: 'value',
            name: 'Contributors'
        },
        color: colors, // 使用自定义颜色列表
        series: seriesData
    };

    for (let i = 2; i <= 7; i++) {
        let chart = echarts.init(document.getElementById(`chart${i}`));
        chart.setOption(option);
    }
})
.catch(error => console.error('Error reading CSV file:', error));