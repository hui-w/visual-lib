/** 
* @author Wang, Hui (huiwang@qlike.com) 
* @repo https://github.com/hui-w/visual-lib
* @licence MIT 
*/ 
var axisChart = null;
var pieChart = null;
var radarChart = null;

var propertyWnd = null;
var jsonEditor = null;

//window.onload = function () {
function sandbox_load() {
	try {
		document.createElement('canvas').getContext('2d');
	} catch (e) {
		alert("HTML5 Canvas not supported by your browser");
		return;
	}

	renderAxisChart();
	renderPieChart();
	renderRadarChart();
	showColorTable();

	//prepare the property window
	propertyWnd = new PropertyWnd();
	propertyWnd.addObject({
		"id" : "axisChart",
		"items" : PropertieDictionary.AxisChart
	});
	propertyWnd.addObject({
		"id" : "pieChart",
		"items" : PropertieDictionary.PieChart
	});
	propertyWnd.addObject({
		"id" : "radarChart",
		"items" : PropertieDictionary.RadarChart
	});
	propertyWnd.renderInto("propertyWndWrapper");

	//load sample data
	loadAxisSample(0);
	loadPieSample(0);
	loadRadarSample(0);

	//clear the selection
	propertyWnd.show(null);

	//JSON Editor
	var options = {
		mode : 'tree',
		modes : ['code', 'form', 'text', 'tree', 'view'], // allowed modes
		error : function (err) {
			alert(err.toString());
		}
	};
	jsonEditor = new JSONEditor($("jsonEditor"), options);
	windowResized();
}

var axisSamples = [{
		data : [{
				"type" : "bar",
				"color" : "RGBA(0,150,214,0.8)",
				"selectedColor" : "#87DB39",
				"values" : [30, 40, 50, 20, 80, 100, 120, 55, 10, 20, 8, 72]
			}, {
				"type" : "line",
				"color" : "#D53F26",
				"showShadow" : true,
				"values" : [120, 60, 30, 70, 60, 67, 99, 55, 80, 40, 13, 30]
			}, {
				"type" : "line",
				"color" : "#009F73",
				"fitting" : true,
				"linePointSize" : 0,
				"values" : [67, 99, 110, 80, 40, 13, 30, 120, 130, 80, 70, 90]
			}
		],
		keys : ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
		showSlider : false,
		padding : {
			top : 10,
			right : 30,
			bottom : 30,
			left : 50
		},
		xLabel : "Month",
		yLabel : "Value",
		showScaleLine : false,
		showAxis : true
	}, {
		data : [{
				"type" : "bar",
				"values" : [30, 40, 50, 20, 80, 100, 120, 55, 10, 20]
			}
		],
		keys : ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"]
	}, {
		data : [{
				"type" : "line",
				"shadow" : "true",
				"values" : [120, 60, 30, 70, 60, 67, 99, 55, 80, 20]
			}
		],
		keys : ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"]
	}, {
		data : [{
				"type" : "bar",
				"values" : [30, 40, 50, 20, 80, 100, 120, 55, 10, 20]
			}, {
				"type" : "line",
				"fitting" : "true",
				"values" : [120, 60, 30, 70, 60, 67, 99, 55, 80, 20]
			}
		],
		keys : ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"]
	}, {
		data : [{
				"type" : "bar",
				"color" : "#00B1D4",
				"values" : [30, 40, 50, 20, 80, 100, 120, 55]
			}, {
				"type" : "bar",
				"color" : "#00D435",
				"values" : [120, 60, 30, 70, 60, 67, 10, 20]
			}
		],
		keys : ["Q1 FY13", "Q2 FY13", "Q3 FY13", "Q4 FY13", "Q1 FY14", "Q2 FY14", "Q3 FY14", "Q3 FY14"]
	}, {
		data : [{
				"type" : "bar",
				"values" : [30, 40, 50, 20, 80, 100, 120, 55, 10, 20]
			}, {
				"type" : "line",
				"values" : [120, 60, 30, 70, 60, 67, 99, 55, 80, 20]
			}, {
				"type" : "line",
				"values" : [70, 66, 67, 120, 43, 30, 12, null, 24, 16]
			}
		],
		keys : ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"]
	}, {
		showSlider : true,
		padding : {
			top : 10,
			right : 30,
			bottom : 60,
			left : 50
		}
	}, {
		showScaleLine : true,
		showAxis : false
	}
];
var pieSamples = [{
		data : [{
				"color" : "#4057A7",
				"title" : "Apple",
				"value" : 12
			}, {
				"color" : "#F25822",
				"title" : "Orange",
				"value" : 6
			}, {
				"color" : "#00ff00",
				"title" : "Kiwi",
				"value" : 8
			}, {
				"color" : "#FBD602",
				"title" : "Banana",
				"value" : 4
			}
		],
		padding : {
			top : 10,
			right : 10,
			bottom : 10,
			left : 10
		},
		selectMode : 1,
		showSelectedDetail : true
	}, {
		data : [{
				"color" : "#00ff00",
				"title" : "Pass",
				"value" : 40
			}, {
				"color" : "#ff3300",
				"title" : "Failed",
				"value" : 12
			}, {
				"color" : "#ffff00",
				"title" : "Blocked",
				"value" : 5
			}, {
				"color" : "#0099cc",
				"title" : "No Run",
				"value" : 3
			}
		]
	}, {
		selectMode : 2,
		showTitles : false,
		showSelectedDetail : true
	}, {
		data : [{
				"color" : "#ff0000",
				"title" : "255,0,0",
				"value" : 1
			}, {
				"color" : "#ff3300",
				"title" : "255,51,0",
				"value" : 1
			}, {
				"color" : "#ff6600",
				"title" : "255,102,0",
				"value" : 1
			}, {
				"color" : "#ff9900",
				"title" : "255,153,0",
				"value" : 1
			}, {
				"color" : "#ffff00",
				"title" : "255,255,0",
				"value" : 1
			}, {
				"color" : "#99ff00",
				"title" : "153,255,0",
				"value" : 1
			}, {
				"color" : "#00ff00",
				"title" : "0,255,0",
				"value" : 1
			}, {
				"color" : "#00ffff",
				"title" : "0,255,255",
				"value" : 1
			}, {
				"color" : "#0000ff",
				"title" : "0,0,255",
				"value" : 1
			}, {
				"color" : "#6600ff",
				"title" : "102,0,255",
				"value" : 1
			}, {
				"color" : "#ff00ff",
				"title" : "255,0,255",
				"value" : 1
			}, {
				"color" : "#ff0066",
				"title" : "255,0,102",
				"value" : 1
			}
		],
		dataUnit : "",
		showSelectedDetail : ""
	}
];

var radarSamples = [{
		data : [{
				"title" : "Specific",
				"value" : 8
			}, {
				"title" : "Measurable",
				"value" : 5
			}, {
				"title" : "Attainable",
				"value" : 4
			}, {
				"title" : "Relevant",
				"value" : 6
			}, {
				"title" : "Time-bound",
				"value" : 7
			}
		],
		outerStyle : 0
	}, {
		data : [{
				"title" : "Innovation",
				"value" : 4
			}, {
				"title" : "Presentation",
				"value" : 2
			}, {
				"title" : "Business",
				"value" : 3
			}, {
				"title" : "Technical",
				"value" : 3
			}
		],
		baseValue : 5
	}, {
		outerStyle : 1
	}
];

function showJsonEditor(jsonObj) {
	jsonEditor.set(jsonObj);
	jsonEditor.setMode("tree")
	$("mask").removeClassName("hidden");
}

function closeJsonEditor(save) {
	$("mask").addClassName("hidden");
	if (save) {
		var controlId = $("jsonEditorWrapper").getAttribute("data-inputId");
		var jsonObj = jsonEditor.get();
		var jsonString = JSON.stringify(jsonObj);
		$(controlId).value = jsonString;
		$(controlId).focus();
		$(controlId).blur();
	}
}

function windowResized() {
	if (isSmallScreen()) {
		if (!$("propertyWnd").hasClassName("hidden")) {
			$("propertyWnd").addClassName("hidden");
			$("output").addClassName("hidden");
			$("axisTools").addClassName("hidden");
			$("pieTools").addClassName("hidden");
		}

		//customize chart properties
		axisChart.borderSize = 0;
		axisChart.keyRotate = -45;
		axisChart.keyAltitude = -20;
		axisChart.keyBaseline = "hanging";
		axisChart.linePointSize = 2;
		axisChart.showSlider = true;
		axisChart.sliderWidth = 10;
		axisChart.sliderHeight = 16;
		axisChart.sliderAltitude = -40;
		axisChart.padding = {
			top : 10,
			right : 25,
			bottom : 60,
			left : 30
		};
		axisChart.redraw();
		pieChart.borderSize = 0;
		pieChart.showTitles = false;
		pieChart.selectMode = 2;
		pieChart.redraw();

		return;
	} else {
		if ($("propertyWnd").hasClassName("hidden")) {
			$("propertyWnd").removeClassName("hidden");
			$("output").removeClassName("hidden");
			$("axisTools").removeClassName("hidden");
			$("pieTools").removeClassName("hidden");
		}
	}
	var b = document.documentElement.clientHeight ? document.documentElement : document.body,
	    height = b.scrollHeight > b.clientHeight ? b.scrollHeight : b.clientHeight,
	    width = b.scrollWidth > b.clientWidth ? b.scrollWidth : b.clientWidth;
	$("mask").style.width = width + "px";
	$("mask").style.height = height + "px";
	$("jsonEditorWrapper").style.height = document.documentElement.clientHeight * 0.8 + "px";
	$("jsonEditorWrapper").style.marginTop = document.documentElement.clientHeight * 0.1 + "px";
	$("jsonEditor").style.height = (document.documentElement.clientHeight * 0.8 - 40) + "px";

	//make the windows movable and set the initial position
	makeMovable("propertyHeader", "propertyWnd", -10, 10, 300);
	makeMovable("outputHeader", "output", -10, 550, 300);
}

function renderAxisChart() {
	//create the demo AxisChart
	var width = 600;
	var height = 300;
	if (isSmallScreen()) {
		//size on mobile
		width = getScreenWidth() - 20;
		height = width * 0.6;
	}
	axisChart = new AxisChart(width, height, "pnl_Axis");
	axisChart.selChanged = function () {
		if (axisChart.selectedIndex == -1) {
			log("[Axis]Cancel Selected");
		} else {
			log("[Axis]Selected Values: <b>[" + axisChart.getSelectedValues() + "]</b>");
		}
	};

	axisChart.render();
}

function renderPieChart() {
	var width = 400;
	var height = 250;
	if (isSmallScreen()) {
		//size on mobile
		width = (getScreenWidth() - 20) * 0.8;
		height = width;
	}
	pieChart = new PieChart(width, height, "pnl_Pie");

	pieChart.selChanged = function () {
		if (pieChart.selectedIndex == -1) {
			log("[Pie]Cancel Selected");
		} else {
			log("[Pie]Selected Value: <b>[" + pieChart.getSelectedItem().title + ", " + pieChart.getSelectedItem().value + "]</b>");
		}
	};

	pieChart.render();
}

function renderRadarChart() {
	var width = 400;
	var height = 300;
	if (isSmallScreen()) {
		//size on mobile
		width = (getScreenWidth() - 20) * 0.8;
		height = width;
	}
	radarChart = new RadarChart(width, height, "pnl_Radar");
	radarChart.render();
}

function showColorTable() {
	for (var i = 0; i < axisChart.colors.length; i++) {
		$("defaultColorTable").createChild("div", {
			"style" : "float: left; width: 24px; height: 24px; background-color: " + axisChart.colors[i],
			"title" : "Default Color Table " + i + ": " + axisChart.colors[i]
		});
	}
}

function loadAxisSample(id) {
	var sample = axisSamples[id];
	for (var key in sample) {
		axisChart[key] = sample[key];
	}
	axisChart.redraw();
	propertyWnd.show("axisChart", axisChart.canvas);
}

function loadPieSample(id) {
	var sample = pieSamples[id];
	for (var key in sample) {
		pieChart[key] = sample[key];
	}
	pieChart.redraw();
	propertyWnd.show("pieChart", pieChart.canvas);
}

function loadRadarSample(id) {
	var sample = radarSamples[id];
	for (var key in sample) {
		radarChart[key] = sample[key];
	}
	radarChart.redraw();
	propertyWnd.show("radarChart", radarChart.canvas);
}

function log() {
	var str = "";
	for (var i = 0; i < arguments.length; i++) {
		str += arguments[i];
		if (i != arguments.length - 1) {
			str += " ";
		}
	}
	$("outputBody").innerHTML = str + "<br />" + $("outputBody").innerHTML;
}

function selectAxisByIndex() {
	try {
		var index = window.prompt("Input an index:", 1);
		axisChart.selectByIndex(parseInt(index));
	} catch (err) {
		alert(err);
	}
}

function getCodes(object, type) {
	var payload = [];
	var propDictItem = PropertieDictionary[type];
	var tempObj = eval("new " + type + "()");
	for (var i = 0; i < propDictItem.length; i++) {
		var key = propDictItem[i][0];
		var value = eval(object + "." + key);
		var tempValue = tempObj[key];
		if (value != tempValue) {
			payload.push([key, value]);
		}
	}
	location.href = "example.html?type=" + type + "&payload=" + base64.encode(JSON.stringify(payload));
}
