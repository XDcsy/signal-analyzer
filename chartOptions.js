//用于初始化的通用option
var initOption = {
    title : { // 图表标题，可以通过show:true/false控制显示与否，还有subtext:'二级标题',link:'http://www.baidu.com'等
        text : 'Signal'
    },
    tooltip : { // 这个是鼠标浮动时的工具条，显示鼠标所在区域的数据，trigger这个地方每种图有不同的设置，见官网吧，一两句说不清楚
        trigger : 'axis'
    },
    legend : { // 这个就是图例，也就是每条折线或者项对应的示例
        data : ["data", "curvature", "2ndDerivative", "1stDerivative"]//需要与series或data的名字一致
    },
    toolbox : {
        feature : {
            saveAsImage : {}
            // 工具，提供几个按钮，例如动态图表转换，数据视图，保存为图片等
        }
    },
    grid : {
        left : '3%',
        right : '4%',
        bottom : '3%', // 这几个属性可以控制图表上下左右的空白尺寸，可以自己试试。
        containLabel : true
    },
    xAxis : {
        type : 'log', //'log'为对数轴
        name : 'time',
        splitLine : { //分隔线
            lineStyle : {
                type : 'dashed'
            }
        },
    },

    yAxis : [{
            type : 'value',
            splitLine : {
                lineStyle : {
                    type : 'dashed'
                }
            },
        }, {
            type : 'value',
            splitLine : {
                lineStyle : {
                    type : 'dashed'
                }
            },
        },
    ],

    dataZoom : [{ // 这个dataZoom组件，默认控制x轴。
            type : 'inside', // 这个 dataZoom 组件是 slider 型 dataZoom 组件
            start : 0, // 左边在 10% 的位置。
            end : 100 // 右边在 60% 的位置。
        }
    ],

    series : [{
            name : 'data',
			symbol: 'none',
            type : 'line',
            yAxisIndex : 0,
            markPoint: {
				symbolSize: 20,
				itemStyle: {
					normal: {
						color: 'red'
					}
				},
				label: {
					normal: {
						show: true,
						position: 'left',
						textStyle: {
							color: '#333',
							fontSize:17
						},
						formatter:function(params){  //将特征点标签显示的坐标取5位有效数字
							return([params.data.coord[0].toPrecision(5), params.data.coord[1].toPrecision(5)]); 
						}
					}
				},
            },
        }, {
            name : 'curvature',
			symbol: 'none',
            type : 'line',
            yAxisIndex : 1,
            markPoint: {
				symbolSize: 20,
				itemStyle: {
					normal: {
						color: 'red'
					}
				},
				label: {
					normal: {
						show: true,
						position: 'left',
						textStyle: {
							color: '#333',
							fontSize:14
						},
						formatter:function(params){  //将特征点标签显示的坐标取5位有效数字
							return([params.data.coord[0].toPrecision(5), params.data.coord[1].toPrecision(5)]); 
						}
					}
				},
            },
        }, {
            name : '2ndDerivative',
			symbol: 'none',
            type : 'line',
            yAxisIndex : 0,
            markPoint: {
				symbolSize: 20,
				itemStyle: {
					normal: {
						color: 'red'
					}
				},
				label: {
					normal: {
						show: true,
						position: 'left',
						textStyle: {
							color: '#333',
							fontSize:14
						},
						formatter:function(params){  //将特征点标签显示的坐标取5位有效数字
							return([params.data.coord[0].toPrecision(5), params.data.coord[1].toPrecision(5)]); 
						}
					}
				},
            },
        }, {
            name : '1stDerivative',
			symbol: 'none',
            type : 'line',
            yAxisIndex : 0,
            markPoint: {
				symbolSize: 20,
				itemStyle: {
					normal: {
						color: 'red'
					}
				},
				label: {
					normal: {
						show: true,
						position: 'left',
						textStyle: {
							color: '#333',
							fontSize:14
						},
						formatter:function(params){  //将特征点标签显示的坐标取5位有效数字
							return([params.data.coord[0].toPrecision(5), params.data.coord[1].toPrecision(5)]); 
						}
					}
				},
            },
        },
    ]
};
