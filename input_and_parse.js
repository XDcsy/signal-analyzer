  // Setup the listeners.
  document.getElementById('files').addEventListener('change', handleFileSelect, false);
  var dropZone = document.getElementById('drop_zone');
  var IDselecter = document.getElementById('IDselecter');
  var notlog = document.getElementById('notlog');
  var log = document.getElementById('log');
  
  dropZone.addEventListener('dragover', handleDragOver, false);
  dropZone.addEventListener('drop', handleFileDrag, false);
  IDselecter.addEventListener('change', draw, false);
  notlog.addEventListener('click',draw, false);
  log.addEventListener('click', draw, false);

  //判断浏览器是否支持FileReader.readAsBinaryString
  var rABS = typeof FileReader !== "undefined" && typeof FileReader.prototype !== "undefined" && typeof FileReader.prototype.readAsBinaryString !== "undefined";
  
  var signals = [];
  var num = 0;  //记录signal的序号
  
  
  function signal(data) {  //构造函数
	  this.data = data;
	  this.regression = ecStat.regression('polynomial', data, 16);
	  this.num = num;
	  //this.d1 = d1();
	  //this.d2 = d2();
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
  var o = "", l = 0, w = 10240;
  for(; l<Bdata.byteLength/w; ++l) o+=String.fromCharCode.apply(null,new Uint8Array(Bdata.slice(l*w,l*w+w)));
  o+=String.fromCharCode.apply(null, new Uint8Array(Bdata.slice(l*w)));
  return o;
  }
  
  function processFiles(files) {
	for (var i = 0, f; f = files[i]; i++) {  //依次读取选中的文件
        var reader = new FileReader();
        reader.onload = function(e) {
		    var Bdata = e.target.result; //Bdata为以二进制格式读取的文件
		    parsing(Bdata);
	    }
	    if(rABS) reader.readAsBinaryString(f);
	    else reader.readAsArrayBuffer(f);
	}
  }


  	function parsing(Bdata) {  //将Bdata解析为可处理的string/json/HTML等
		try {
			if(rABS) {
		    	workbook = XLSX.read(Bdata, {type: 'binary'}); //将Bdata解析为workbook
		    } else {
		        var arr = fixdata(Bdata); 
		        workbook = XLSX.read(btoa(arr), {type: 'base64'});
		    }
		}
		catch(e) {
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
		tempAry = c.split("\n");  //look like [["2","3","4","5"],[...],...]
		for (var i = 0; i < tempAry.length; i++) {
		    tempAry[i] = tempAry[i].split(",").map(s => +s);  //look like [[2,3,4,5],[...]]
		}
		var amount = tempAry[0].length - 1; //一个csv中所包含的信号数量
		for (var i = 0; i < amount; i++) {
		    var data = [];
			var head = 2;
			var end = tempAry.length - 165;  //只使用从head到end的数据
		    for (var j = head; j < end; j++) {
			    data.push([tempAry[j][0],tempAry[j][i + 1]]);  //get data like [[2,3],[...],...]
				}
			signals.push(new signal(data));
			var option = new Option(num.toString(), num); IDselecter.options.add(option); num++; //将每一个新信号，添加进选择框
		}
		if (signals.length != 0) {draw();} //!!!全部数据生成完毕后，初始化第一副图
	}



	


//****************
	 function draw(){
		
		var signalID = IDselecter.value;
		if (log.checked){
			xType = "log";
		}
		else{
			xType = "value";
		}
		
		var myChart = echarts.init(document.getElementById('main'));
		var option = {
                title: {// 图表标题，可以通过show:true/false控制显示与否，还有subtext:'二级标题',link:'http://www.baidu.com'等  
                    text: 'Signal'  
                },  
                tooltip : {// 这个是鼠标浮动时的工具条，显示鼠标所在区域的数据，trigger这个地方每种图有不同的设置，见官网吧，一两句说不清楚  
                    trigger: 'axis'  
                },  
                legend: {// 这个就是图例，也就是每条折线或者项对应的示例，就是这个<a target=_blank href="http://img.blog.csdn.net/20160622094820180?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQv/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/Center">图例</a>  
                    data:["data"]  //需要与series或data的名字一致
                },  
                toolbox: {  
                    feature: {  
                        saveAsImage: {}// 工具，提供几个按钮，例如动态图表转换，数据视图，保存为图片等  
                    }  
                 },  
                grid: {  
                    left: '3%',  
                    right: '4%',  
                    bottom: '3%',// 这几个属性可以控制图表上下左右的空白尺寸，可以自己试试。  
                    containLabel: true  
                 },  
                xAxis : {  
					type : xType,  //对数轴
                    name:'log(time)',
					splitLine: {  //分隔线
                        lineStyle: {
                            type: 'dashed'
                        }
                    },
                },
 
                yAxis: {
                    type: 'value',
                    splitLine: {
                        lineStyle: {
                            type: 'dashed'
                        }
                    },
                },

                series: {
                    name: 'data',
                    type: 'line',
                    label: {
                        emphasis: {
                            show: true,
                            position: 'left',
                            textStyle: {
                                color: 'blue',
                                fontSize: 16
                            }
                        }
                    },
                    data: signals[signalID].data
                },// 这里就是数据了  
            };
		//myChart.clear();
		myChart.setOption(option, true);	
		}
		
