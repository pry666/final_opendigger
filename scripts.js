function initChart(id, option) {
    let chart = echarts.init(document.getElementById(id));
    chart.setOption(option);
    return chart;
}

// 获取并交换图表配置的函数
function swapCharts(bigChart, smallChart, bigChartContainer, smallChartContainer) {
    let bigOption = bigChart.getOption();
    let smallOption = smallChart.getOption();

    bigChart.clear();
    smallChart.clear();

    bigChart.setOption(smallOption);
    smallChart.setOption(bigOption);
}

// 为小图表添加点击事件的函数
function addClickEvent(smallChart, bigChart, bigChartContainer, smallChartContainer) {
    smallChart.getDom().onclick = function () {
        swapCharts(bigChart, smallChart, bigChartContainer, smallChartContainer);
    };
}

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
        var option1 = {
            title: {
                text: 'Contributors by Community',
                left: 'center'
            },
            tooltip: {
                trigger: 'item'
            },
            legend: {
                top: 'bottom',
                textStyle: {
                    fontSize: 10,
                },
                itemWidth: 10,
                itemHeight: 10 
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
        let bigChartContainer = document.getElementById('chart1');
        let bigChart = initChart(bigChartContainer.id, option1);
        //let chart = echarts.init(document.getElementById(`chart1`));



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
    var option2 = {
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
            top: 'bottom',
            textStyle: {
                fontSize: 10,
            },
            itemWidth: 10,
            itemHeight: 10,
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

    let smallChartContainer = document.getElementById('chart2');
    let smallChart = initChart(smallChartContainer.id, option2);
    addClickEvent(smallChart, bigChart, bigChartContainer, smallChartContainer);
})
.catch(error => console.error('Error reading CSV file:', error));

// scripts.js

// 读取 CSV 文件
fetch('/data/merge_all.csv')
    .then(response => response.text())
    .then(csvText => {
        var data = Papa.parse(csvText, { header: true }).data;

        // 过滤掉空行
        data = data.filter(row => row['year_month'] && row['record_num'] && row['community']);


        // 按社区分组数据
        var communityGroups = {};
        data.forEach(row => {
            let community = row['community'];
            let yearMonth = row['year_month'];
            let recordNum = parseInt(row['record_num']);

            if (!communityGroups[community]) {
                communityGroups[community] = [];
            }
            communityGroups[community].push([yearMonth, recordNum]);
        });



        // 自定义颜色列表（根据需要调整）
        var colors = [
            '#FF6347', '#4682B4', '#32CD32', '#FFD700', '#6A5ACD',
            '#FF4500', '#8A2BE2', '#00FA9A', '#FF1493', '#1E90FF',
            '#DA70D6', '#87CEEB', '#3CB371', '#B8860B', '#8B4513'
        ];

        // 准备系列数据
        var seriesData = Object.keys(communityGroups).map((community, index) => ({
            name: community,
            type: 'scatter',
            data: communityGroups[community],
            symbolSize: function (data) {
                return Math.sqrt(data[1]); // 根据 record_num 动态调整大小
            },
            itemStyle: {
                color: colors[index % colors.length]
            }
        }));


        // 配置 ECharts 散点图选项
        var option3 = {
            title: {
                text: 'Record Numbers by Community and Year-Month',
                left: 'center'
            },
            tooltip: {
                trigger: 'item',
                formatter: function (params) {
                    return params.seriesName + '<br/>' + 
                           'Year-Month: ' + params.data[0] + '<br/>' + 
                           'Records: ' + params.data[1];
                }
            },
            legend: {
                top: 'bottom',
                textStyle: {
                    fontSize: 10,
                },
                itemWidth: 10,
                itemHeight: 10,
                data: Object.keys(communityGroups)
            },
            xAxis: {
                type: 'category',
                name: 'Year-Month',
                data: [...new Set(data.map(row => row['year_month']))]
            },
            yAxis: {
                type: 'value',
                name: 'Record Numbers'
            },
            series: seriesData
        };

        // 使用配置项和数据显示图表
        let smallChartContainer = document.getElementById('chart3');
        let smallChart = initChart(smallChartContainer.id, option3);
        addClickEvent(smallChart, bigChart, bigChartContainer, smallChartContainer);
    })
    .catch(error => console.error('Error reading CSV file:', error));


// 读取 CSV 文件
fetch('/data/star_all.csv')
.then(response => response.text())
.then(csvText => {
    var data = Papa.parse(csvText, { header: true }).data;

    // 过滤掉空行
    data = data.filter(row => row['year_month'] && row['stars'] && row['community']);


    // 按社区分组数据
    var communityGroups = {};
    data.forEach(row => {
        let community = row['community'];
        let yearMonth = row['year_month'];
        let stars = parseInt(row['stars']);

        if (!communityGroups[community]) {
            communityGroups[community] = [];
        }
        communityGroups[community].push([yearMonth, stars]);
    });



    // 自定义颜色列表（根据需要调整）
    var colors = [
        '#FF6347', '#4682B4', '#32CD32', '#FFD700', '#6A5ACD',
        '#FF4500', '#8A2BE2', '#00FA9A', '#FF1493', '#1E90FF',
        '#DA70D6', '#87CEEB', '#3CB371', '#B8860B', '#8B4513'
    ];

    // 准备系列数据
    var seriesData = Object.keys(communityGroups).map((community, index) => ({
        name: community,
        type: 'line',
        data: communityGroups[community],
        itemStyle: {
            color: colors[index % colors.length]
        }
    }));


    // 配置 ECharts 散点图选项
    var option4 = {
        title: {
            text: 'Star by Community and Year-Month',
            left: 'center'
        },
        tooltip: {
            trigger: 'item',
            formatter: function (params) {
                return params.seriesName + '<br/>' + 
                       'Year-Month: ' + params.data[0] + '<br/>' + 
                       'Stars: ' + params.data[1];
            }
        },
        legend: {
            top: 'bottom',
            textStyle: {
                fontSize: 10,
            },
            itemWidth: 10,
            itemHeight: 10,
            data: Object.keys(communityGroups)
        },
        xAxis: {
            type: 'category',
            name: 'Year-Month',
            data: [...new Set(data.map(row => row['year_month']))]
        },
        yAxis: {
            type: 'value',
            name: 'Record Numbers'
        },
        series: seriesData
    };

    // 使用配置项和数据显示图表
    let smallChartContainer = document.getElementById('chart4');
    let smallChart = initChart(smallChartContainer.id, option4);
    addClickEvent(smallChart, bigChart, bigChartContainer, smallChartContainer);
})
.catch(error => console.error('Error reading CSV file:', error));

// 读取 CSV 文件
fetch('/data/fork_all.csv')
.then(response => response.text())
.then(csvText => {
    var data = Papa.parse(csvText, { header: true }).data;

    // 过滤掉空行
    data = data.filter(row => row['year_month'] && row['forks'] && row['community']);


    // 按社区分组数据
    var communityGroups = {};
    data.forEach(row => {
        let community = row['community'];
        let yearMonth = row['year_month'];
        let forks = parseInt(row['forks']);

        if (!communityGroups[community]) {
            communityGroups[community] = [];
        }
        communityGroups[community].push([yearMonth, forks]);
    });



    // 自定义颜色列表（根据需要调整）
    var colors = [
        '#FF6347', '#4682B4', '#32CD32', '#FFD700', '#6A5ACD',
        '#FF4500', '#8A2BE2', '#00FA9A', '#FF1493', '#1E90FF',
        '#DA70D6', '#87CEEB', '#3CB371', '#B8860B', '#8B4513'
    ];

    // 准备系列数据
    var seriesData = Object.keys(communityGroups).map((community, index) => ({
        name: community,
        type: 'line',
        data: communityGroups[community],
        itemStyle: {
            color: colors[index % colors.length]
        }
    }));


    // 配置 ECharts 散点图选项
    var option5 = {
        title: {
            text: 'Forks by Community and Year-Month',
            left: 'center'
        },
        tooltip: {
            trigger: 'item',
            formatter: function (params) {
                return params.seriesName + '<br/>' + 
                       'Year-Month: ' + params.data[0] + '<br/>' + 
                       'Forks: ' + params.data[1];
            }
        },
        legend: {
            top: 'bottom',
            textStyle: {
                fontSize: 10,
            },
            itemWidth: 10,
            itemHeight: 10,
            data: Object.keys(communityGroups)
        },
        xAxis: {
            type: 'category',
            name: 'Year-Month',
            data: [...new Set(data.map(row => row['year_month']))]
        },
        yAxis: {
            type: 'value',
            name: 'Record Numbers'
        },
        series: seriesData
    };

    // 使用配置项和数据显示图表
    let smallChartContainer = document.getElementById('chart5');
    let smallChart = initChart(smallChartContainer.id, option5);
    addClickEvent(smallChart, bigChart, bigChartContainer, smallChartContainer);
})
.catch(error => console.error('Error reading CSV file:', error));

fetch('/data/activity_all.csv')
    .then(response => response.text())
    .then(csvText => {
        var data = Papa.parse(csvText, { header: true }).data;

        // 过滤掉空行
        data = data.filter(row => row['year_month'] && row['actor_count'] && row['community']);


        // 按社区分组数据
        var communityGroups = {};
        data.forEach(row => {
            let community = row['community'];
            let yearMonth = row['year_month'];
            let actorNum = parseInt(row['actor_count']);

            if (!communityGroups[community]) {
                communityGroups[community] = [];
            }
            communityGroups[community].push([yearMonth, actorNum]);
        });



        // 自定义颜色列表（根据需要调整）
        var colors = [
            '#FF6347', '#4682B4', '#32CD32', '#FFD700', '#6A5ACD',
            '#FF4500', '#8A2BE2', '#00FA9A', '#FF1493', '#1E90FF',
            '#DA70D6', '#87CEEB', '#3CB371', '#B8860B', '#8B4513'
        ];

        // 准备系列数据
        var seriesData = Object.keys(communityGroups).map((community, index) => ({
            name: community,
            type: 'scatter',
            data: communityGroups[community],
            symbolSize: function (data) {
                return Math.sqrt(data[1]); // 根据 record_num 动态调整大小
            },
            itemStyle: {
                color: colors[index % colors.length]
            }
        }));


        // 配置 ECharts 散点图选项
        var option6 = {
            title: {
                text: 'Actor Numbers by Community and Year-Month',
                left: 'center'
            },
            tooltip: {
                trigger: 'item',
                formatter: function (params) {
                    return params.seriesName + '<br/>' + 
                           'Year-Month: ' + params.data[0] + '<br/>' + 
                           'Actors: ' + params.data[1];
                }
            },
            legend: {
                top: 'bottom',
                textStyle: {
                    fontSize: 10,
                },
                itemWidth: 10,
                itemHeight: 10,
                data: Object.keys(communityGroups)
            },
            xAxis: {
                type: 'category',
                name: 'Year-Month',
                data: [...new Set(data.map(row => row['year_month']))]
            },
            yAxis: {
                type: 'value',
                name: 'Actor Numbers'
            },
            series: seriesData
        };

        // 使用配置项和数据显示图表
        let smallChartContainer = document.getElementById('chart6');
        let smallChart = initChart(smallChartContainer.id, option6);
        addClickEvent(smallChart, bigChart, bigChartContainer, smallChartContainer);
    })
    .catch(error => console.error('Error reading CSV file:', error));


    // scripts.js

// 读取 CSV 文件
fetch('/data/star_and_fork.csv')
.then(response => response.text())
.then(csvText => {
    var data = Papa.parse(csvText, { header: true }).data;

    // 过滤掉空行
    data = data.filter(row => row['year'] && row['stars'] && row['forks'] && row['community']);


    // 按社区和年份分组数据
    var communityYearGroups = {};
    data.forEach(row => {
        let community = row['community'];
        let year = row['year'];
        let stars = parseInt(row['stars']);
        let forks = parseInt(row['forks']);
        let total = stars + forks;

        if (!communityYearGroups[community]) {
            communityYearGroups[community] = {};
        }
        if (!communityYearGroups[community][year]) {
            communityYearGroups[community][year] = 0;
        }
        communityYearGroups[community][year] += total;
    });


    // 获取所有社区和年份
    var communities = Object.keys(communityYearGroups);
    var years = [...new Set(data.map(row => row['year']))];

    // 准备系列数据
    var seriesData = years.map(year => ({
        name: year.toString(),
        type: 'bar',
        data: communities.map(community => communityYearGroups[community][year] || 0)
    }));



    // 配置 ECharts 柱状图选项
    var option7 = {
        title: {
            text: 'Stars and Forks by Community and Year',
            left: 'center'
        },
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'shadow'
            },
            formatter: function (params) {
                let tooltipText = params[0].axisValue + '<br/>';
                params.forEach(param => {
                    tooltipText += param.seriesName + ': ' + param.data + '<br/>';
                });
                return tooltipText;
            }
        },
        legend: {
            data: years.map(year => year.toString()),
            textStyle: {
                fontSize: 10,
            },
            itemWidth: 10,
            itemHeight: 10,
            top: 'bottom'
        },
        xAxis: {
            type: 'category',
            name: 'Community',
            data: communities
        },
        yAxis: {
            type: 'value',
            name: 'Stars + Forks'
        },
        series: seriesData
    };

        // 初始化 ECharts 实例
        let smallChartContainer = document.getElementById('chart7');
        let smallChart = initChart(smallChartContainer.id, option7);
        addClickEvent(smallChart, bigChart, bigChartContainer, smallChartContainer);
})
.catch(error => console.error('Error reading CSV file:', error));

})
.catch(error => console.error('Error reading CSV file:', error));
