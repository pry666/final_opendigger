// scripts.js

// 读取 CSV 文件
fetch('data.csv')
    .then(response => response.text())
    .then(csvText => {
        var data = Papa.parse(csvText, { header: true }).data;

        // 将数据转换为 ECharts 需要的格式
        var categories = data.map(row => row['category']);
        var values = data.map(row => parseFloat(row['value']));

        // 初始化 ECharts 实例
        //var chart = echarts.init(document.getElementById('chart'));

        // 配置 ECharts 图表选项
        var option = {
            title: {
                text: 'CSV 数据示例'
            },
            tooltip: {},
            xAxis: {
                type: 'category',
                data: categories
            },
            yAxis: {
                type: 'value'
            },
            series: [{
                data: values,
                type: 'bar'
            }]
        };

        // 使用配置项和数据显示图表
        for (let i = 1; i <= 7; i++) {
            let chart = echarts.init(document.getElementById(`chart${i}`));
            chart.setOption(option);
        }
    })
    .catch(error => console.error('Error reading CSV file:', error));
