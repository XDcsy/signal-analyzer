var chart1, chart2, chart3, chart4;
var chartAry = [];
// Setup the listeners.
document.getElementById('files').addEventListener('change', handleFileSelect, false);
var dropZone = document.getElementById('drop_zone');
var IDselecter = document.getElementById('IDselecter');
var notlog1 = document.getElementById('notlog1');
var log1 = document.getElementById('log1');
var notlog2 = document.getElementById('notlog2');
var log2 = document.getElementById('log2');
var notlog3 = document.getElementById('notlog3');
var log3 = document.getElementById('log3');
var notlog4 = document.getElementById('notlog4');
var log4 = document.getElementById('log4');
var resultArea = document.getElementById('resultArea');
var pre = document.getElementById('pre');
var next = document.getElementById('next');
var notice = document.getElementById("notice");
var pointNotice = document.getElementById("pointNum");
var left = document.getElementById("left");
var right = document.getElementById("right");


var notlogAry = [notlog1,notlog2,notlog3,notlog4];
var logAry = [log1,log2,log3,log4];

dropZone.addEventListener('dragover', handleDragOver, false);
dropZone.addEventListener('drop', handleFileDrag, false);
IDselecter.addEventListener('change', changeID, false);
notlog1.addEventListener('click',function(){setNotLog(0)});
log1.addEventListener('click', function(){setLog(0)});
notlog2.addEventListener('click',function(){setNotLog(1)});
log2.addEventListener('click', function(){setLog(1)});
notlog3.addEventListener('click',function(){setNotLog(2)});
log3.addEventListener('click', function(){setLog(2)});
notlog4.addEventListener('click',function(){setNotLog(3)});
log4.addEventListener('click', function(){setLog(3)});
pre.addEventListener('click', preChart);
next.addEventListener('click', nextChart);

function preChart(){
	if (IDselecter.value > 0){
		IDselecter.value--;
	    changeID();
	}
}

function nextChart(){
	if (IDselecter.value < num-1){
		IDselecter.value++;
		changeID();
	}
}

function setNotLog(i) {
	chartAry[i].setOption({
        xAxis : {
            type : 'value'
		}
	})
}
function setLog(i) {
	chartAry[i].setOption({
        xAxis : {
            type : 'log'
		}
	})
}

//判断浏览器是否支持FileReader.readAsBinaryString
var rABS = typeof FileReader !== "undefined" && typeof FileReader.prototype !== "undefined" && typeof FileReader.prototype.readAsBinaryString !== "undefined";

var signals = [];
var num = 0; //记录signal的序号
var index;  //记录特征点的范围


function signal(data) { //构造函数
    function split(data) {
        var T = [],
        logT = [],
        Y = [];
        for (var i = 0; i < data.length; i++) {
            T.push(data[i][0]);
            logT.push(Math.log(data[i][0]) / Math.LN10); //对横坐标取10为底的对数
            Y.push(data[i][1]);
        }
        return [T, logT, Y];
    }
    function combine(X, Y) {
        var newData = [];
        console.assert(X.length == Y.length);
        for (var i = 0; i < X.length; i++) {
            newData.push([X[i], Y[i]]);
        }
        return newData;
    }

    function getDerivative(d, x, p) { //d为导数的阶数，x为横坐标的数据，p为系数
        var exp = "";
        var dy = [];
        if (d == 1) {
            for (var i = d; i < p.length; i++) {
                exp = exp + "+" + p[i].toString() + "*" + i.toString() + "* Math.pow(x[j]," + (i - d).toString() + ")"; //exp look like: "+p[1]*1*Math.pow(x, 0) + +p[2]*2*Math.pow(x, 1) ..."
            }
        }
        if (d == 2) {
            for (var i = d; i < p.length; i++) {
                exp = exp + "+" + p[i].toString() + "*" + i.toString() + "*" + (i - 1).toString() + "* Math.pow(x[j]," + (i - d).toString() + ")"; //exp look like: "+p[1]*1*Math.pow(x, 0) + +p[2]*2*Math.pow(x, 1) ..."
            }
        }
        for (var j = 0; j < x.length; j++) {
            dy.push(eval(exp));
        }
        return dy; //dy为导数的值（数组形式）
    }
    function getCurvature(d1, d2) {
        console.assert(d1.length == d2.length);
        var c = [];
        for (var i = 0; i < d1.length; i++) {
            c.push(Math.log(Math.abs(d2[i]) / Math.pow(1 + Math.pow(d1[i], 2), 1.5)) / Math.LN10); //对曲率取了对数
        }
        return c;
    }
	
    this.data = data; //t,y
    this.num = num;
    var splitedData = split(data);
    var T = splitedData[0];
    var logT = splitedData[1];
    var Y = splitedData[2];

    this.logData = combine(logT, Y); //log(t),y  仅用作拟合，不用于画图
    reg = ecStat.regression('polynomial', this.logData, 16);  //以log(t),y 进行拟合
    this.regression = reg;
	

    var d1Y = getDerivative(1, logT, reg.parameter);
    var d2Y = getDerivative(2, logT, reg.parameter);
    var cY = getCurvature(d1Y, d2Y);
	this.logC = cY;
    //this.d1LogData = combine(logT, d1Y); //log(t),dy
    //this.d2LogData = combine(logT, d2Y); //log(t),ddy
    this.d1Data = combine(T, d1Y); //t, dy
    this.d2Data = combine(T, d2Y); //t, ddy
    this.cData = combine(T, cY); //t, log(c)
    this.cLogData = combine(logT, cY); //log(t), log(c)
        //this.d1 = d1();
        //this.d2 = d2();
	this.featurePoints = [];
}

function handleFileDrag(evt) {
    evt.stopPropagation();
    evt.preventDefault();
    var files = evt.dataTransfer.files; // FileList object.
    processFiles(files);
}

function handleFileSelect(evt) {
    var files = evt.target.files; // FileList object
    processFiles(files);
}

function handleDragOver(evt) {
    evt.stopPropagation();
    evt.preventDefault();
    evt.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
}

function fixdata(Bdata) {
    //浏览器无法直接读取二进制文件时的处理函数
    var o = "",
    l = 0,
    w = 10240;
    for (; l < Bdata.byteLength / w; ++l)
        o += String.fromCharCode.apply(null, new Uint8Array(Bdata.slice(l * w, l * w + w)));
    o += String.fromCharCode.apply(null, new Uint8Array(Bdata.slice(l * w)));
    return o;
}

function processFiles(files) {
    notice.innerHTML = "Reading files, please wait...";  //开始处理前进行提示
	for (var i = 0, f; f = files[i]; i++) { //依次读取选中的文件
        var reader = new FileReader();
        reader.onload = function (e) {
            var Bdata = e.target.result; //Bdata为以二进制格式读取的文件
            parsing(Bdata);
        }
        if (rABS)
            reader.readAsBinaryString(f);
        else
            reader.readAsArrayBuffer(f);
    }
}

function parsing(Bdata) { //将Bdata解析为可处理的string/json/HTML等
    try {
        if (rABS) {
            workbook = XLSX.read(Bdata, {
                    type : 'binary'
                }); //将Bdata解析为workbook
        } else {
            var arr = fixdata(Bdata);
            workbook = XLSX.read(btoa(arr), {
                    type : 'base64'
                });
        }
    } catch (e) {
        console.log(e);
        alert("Error parsing the workbooks.");
    }
    csv = XLSX.utils.sheet_to_csv(workbook.Sheets[workbook.SheetNames[0]]); //只处理sheet1中的数据
    //其他可选：sheet_to_json, sheet_to_html, sheet_to_formulae
    //csv中存储所有表格文件转换得到的csv(type:string)
    //console.log(csv);
    csvToAry(csv);
    //每获得一个csv，就进行处理，算出后续画出图形所需要的所有必须数据
}

function csvToAry(c) {
    tempAry = c.split("\n"); //look like [["2","3","4","5"],[...],...]
    for (var i = 0; i < tempAry.length; i++) {
        tempAry[i] = tempAry[i].split(",").map(s => +s); //look like [[2,3,4,5],[...]]
    }
    var amount = tempAry[0].length - 1; //一个csv中所包含的信号数量
    for (var i = 0; i < amount; i++) {
        var data = [];
        var head = 2;
        var end = tempAry.length - 165; //只使用从head到end的数据
        for (var j = head; j < end; j++) {
            data.push([tempAry[j][0], tempAry[j][i + 1]]); //get data like [[2,3],[...],...]
        }
        signals.push(new signal(data));
        var signalOption = new Option(num.toString(), num);
        IDselecter.options.add(signalOption);
        num++; //将每一个新信号，添加进选择框
    }
    if (signals.length != 0) {
        preProcess();
    } //!!!全部数据生成完毕后，通过交互读取数据范围等
}


function preProcess() {
    document.getElementById('selectArea').hidden = true; //隐藏文件选择的按钮
	var chart0 = echarts.init(document.getElementById('chart0'), "dark");
	var rangeSet = document.getElementById('rangeSet');
	
	for (var i = 0; i < signals.length; i++){
		chart0Options.series.push({name:"signal"+i.toString(), type:"line", sampling:"average",symbol:"none", itemStyle:{normal:{color:"#A9A9A9"}},data:signals[i].cLogData}); //对chart0使用了sampling:"average"进行降采样，优化性能
		chart0Options.series.push({name:"ssignal"+i.toString(), type:"scatter", symbolSize:3, z:100, data:signals[i].cLogData});
	}
	chart0.setOption(chart0Options, true);
	chart0.on('brushselected', brushed);
	rangeSet.hidden = false;
	rangeSet.addEventListener('click', getFeaturePoints);
	notice.innerHTML="请点击图表右上角的“横向选择”工具，选择出特征点可能出现的大致范围。可以使用“保持选择”功能选择多个区域。"
}

function getFeaturePoints() {
	var preArea = document.getElementById("preArea");
	preArea.hidden = true;  //获得特殊点范围后，隐藏chart0
	var range = splitIndex();
	findMaxPoint(range); //寻找极大值点
	initialDraw(); //画初始图
}

function splitIndex() {
	var range = [];
	var tmp = [];
	for (var i = 0; i < index.length-1; i++) {
		if (index[i]+1 == index[i+1]) {
			tmp.push(index[i]);
		}
		else {
			tmp.push(index[i]);
			range.push(tmp);
			tmp = [];
		}
	}
	range.push(tmp);
	return range;
}

function findMaxPoint(range) {
	for (var k = 0; k < signals.length; k++) { //对每一个信号
		for (var i = 0; i < range.length; i++)  //对每一个范围寻找极大值点
		{
			var find = false;
			for (var j = 0; j < range[i].length; j++) { //index遍历range每个点
			    p = range[i][j];  //p为真实的下标
				if ( (signals[k].cData[p][1] > signals[k].cData[p-1][1]) && (signals[k].cData[p][1] > signals[k].cData[p+1][1]) ) {
					signals[k].featurePoints.push(p);  //signals[k].featurePoints存储的是特征点的index
					find = true;
					break;
				}
				
			}
			if (!(find)) {
				signals[k].featurePoints.push(p);  //若未找到极大值点，以范围中最后一个点的后一个点作为极大值点
			}
		}
	}
}

function brushed(params) {
	index = params.batch[0].selected[0].dataIndex;  //!!!特征点的范围目前仅由第一条曲线的index决定
}
//****************从此处开始所有数据均由signals[x]. 获得
//初始化

//初始option


//function changeData(option, dataAry) { //注意这里是引用而非赋值（克隆）
//    for (var i = 0; i < option.series.length; i++) {
//        option.series[i].data = dataAry[i]
//    }
//}

function initMarkPoints(chart, chartNum) {
	var pointsData = [], pointsC = [], pointsD1 = [], pointsD2 = [];
	for (i = 0; i < signals[chartNum].featurePoints.length; i++){
		pointsData.push({coord:signals[chartNum].data[signals[chartNum].featurePoints[i]]});  //[{coord:[x, y]}, {coord:[x, y]}] 的对象数组
		pointsC.push({coord:signals[chartNum].cData[signals[chartNum].featurePoints[i]]});
		pointsD1.push({coord:signals[chartNum].d1Data[signals[chartNum].featurePoints[i]]});
		pointsD2.push({coord:signals[chartNum].d2Data[signals[chartNum].featurePoints[i]]});
	}
	chart.setOption ({
		series:[{
            name: 'data',
            markPoint: {data: pointsData},
        },
		{
            name: 'curvature',
            markPoint: {data: pointsC},
		},
		{
            name: '2ndDerivative',
            markPoint: {data: pointsD2},
		},
		{
            name: '1stDerivative',
            markPoint: {data: pointsD1},
		}]
	});
}

function changeData(chart, chartNum) {
	chart.setOption ({
		series:[{
            name: 'data',
            data: signals[chartNum].data
        },
		{
            name: 'curvature',
            data: signals[chartNum].cData
		},
		{
            name: '2ndDerivative',
            data: signals[chartNum].d2Data
		},
		{
            name: '1stDerivative',
            data: signals[chartNum].d1Data
		}]
	});
	initMarkPoints(chart, chartNum);  //在更新过图上数据之后还需要重绘特征点
}

function initialDraw() {
    resultArea.hidden = false;
	chart1 = echarts.init(document.getElementById('chart1'),"dark");
    chart2 = echarts.init(document.getElementById('chart2'),"dark");
    chart3 = echarts.init(document.getElementById('chart3'),"dark");
    chart4 = echarts.init(document.getElementById('chart4'),"dark");
    chartAry = [chart1, chart2, chart3, chart4];
	chart1.setOption(initOption, true);
	chart1.setOption(
	{
		legend:{
			selected:{
				"data":true, "curvature":false, "2ndDerivative":false, "1stDerivative":false
			}
		},
	});
	changeData(chart1, 0);
	
    chart2.setOption(initOption, true);
	chart2.setOption(
	{
		legend:{
			selected:{
				"data":false, "curvature":true, "2ndDerivative":false, "1stDerivative":false
			}
		},
	});
	changeData(chart2, 0);
	
    chart3.setOption(initOption, true);
	chart3.setOption(
	{
		legend:{
			selected:{
				"data":false, "curvature":false, "2ndDerivative":true, "1stDerivative":false
			}
		},
	});
	changeData(chart3, 0);
	
    chart4.setOption(initOption, true);
	chart4.setOption(
	{
		legend:{
			selected:{
				"data":false, "curvature":false, "2ndDerivative":false, "1stDerivative":true
			}
		},
	});
	changeData(chart4, 0);
    
	chart1.on('click', dealChartOnClick);
	chart2.on('click', dealChartOnClick);
	chart3.on('click', dealChartOnClick);
	chart4.on('click', dealChartOnClick);
}

function dealChartOnClick(params) { 
		var pointIndex = params.dataIndex;
		var chartNum = IDselecter.value;
		pointNotice.innerHTML = "Now is edting feature point " + pointIndex.toString();
		setMoveFunction(left, -1);
		setMoveFunction(right, 1);
		function setMoveFunction(buttonObj, step) {
			buttonObj.onclick = function() {
				signals[chartNum].featurePoints[pointIndex] += step;
				initMarkPoints(chart1, chartNum);
				initMarkPoints(chart2, chartNum);
				initMarkPoints(chart3, chartNum);
				initMarkPoints(chart4, chartNum);
			};
		}
}

function changeID() {
	var chartNum = IDselecter.value;
	for (var j = 0; j < chartAry.length; j++) {
	    changeData(chartAry[j], chartNum);
	}
}
