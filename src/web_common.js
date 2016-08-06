/** 
* @author Wang, Hui (huiwang@qlike.com) 
* @repo https://github.com/hui-w/visual-lib
* @licence MIT 
*/ 
function $() {
	var elements = new Array();
	for (var i = 0; i < arguments.length; i++) {
		var element = arguments[i];
		if (typeof element == 'string')
			element = document.getElementById(element);
		if (arguments.length == 1)
			return element;
		elements.push(element);
	}
	return elements;
}

function getQueryStringByName(name, url) {
	if (url == null) {
		url = location.search;
	}
	var result = url.match(new RegExp("[\?\&]" + name + "=([^\&]+)", "i"));
	if (result == null || result.length < 1) {
		return null;
	} else {
		return result[1];
	}
}

function getScreenWidth() {
	return document.documentElement.clientWidth;
}

function isSmallScreen() {
	return getScreenWidth() < 800;
}

Element.prototype.hasClassName = function (a) {
	return new RegExp("(?:^|\\s+)" + a + "(?:\\s+|$)").test(this.className);
}

Element.prototype.addClassName = function (a) {
	if (!this.hasClassName(a)) {
		this.className = [this.className, a].join(" ");
	}
}

Element.prototype.removeClassName = function (b) {
	if (this.hasClassName(b)) {
		var a = this.className;
		this.className = a.replace(new RegExp("(?:^|\\s+)" + b + "(?:\\s+|$)", "g"), " ");
	}
}

Element.prototype.toggleClassName = function (a) {
	this[this.hasClassName(a) ? "removeClassName" : "addClassName"](a);
}

var PropertieDictionary = {
	AxisChart : [
		["borderSize", "Number", "Border Size", "General"],
		["borderColor", "String", "Border Color", "General"],
		["showShadow", "Boolean", "Show Shadow (inheritable)", "General"],
		["shadowStyle", "Json", "Shadow Style", "General"],
		["padding", "Json", "Padding", "General"],
		["data", "Json", "Data", "General"],
		
		["showAxis", "Boolean", "Show Axis", "Axis"],
		["showScaleLabel", "Boolean", "Show Scale Label", "Axis"],
		["showScaleLine", "Boolean", "Show Scale Line", "Axis"],
		["xLabel", "String", "X Axis Label", "Axis"],
		["yLabel", "String", "Y Axis Label", "Axis"],
		["arrowSize", "Number", "Arrow Size", "Axis"],
		["arrowStyle", "Number", "Arrow Style", "Axis", {
				"0" : "Solid",
				"1" : "Empty"
			}],
		["scaleCount", "Number", "Scale Count", "Axis"],
		["scaleLineColor", "String", "Scale Line Color", "Axis"],
		["scaleLineSize", "Number", "Scale Line Size", "Axis"],
		["zeroAsOrigin", "Boolean", "Zero As Origin", "Axis"],

		["showKeys", "Boolean", "Show Keys", "Key"],
		["keys", "Json", "Keys", "Key"],
		["keyFont", "Json", "Key Font", "Key"],
		["keyRotate", "Number", "Key Rotate", "Key"],
		["keyBaseline", "String", "Key Baseline", "Key", {
				"top" : "Top",
				"bottom" : "Bottom",
				"middle" : "Middle",
				"alphabetic" : "Alphabetic",
				"hanging" : "Hanging"
			}
		],
		["keyAltitude", "Number", "Key Altitude", "Key"],

		["barDensity", "Number", "Bar Density", "Bar"],
		["barSpacing", "Number", "Bar Spacing", "Bar"],
		["showValueOnBar", "Boolean", "Show Value On Bar (inheritable)", "Bar"],
		["selectedBarColor", "String", "Selected Bar Color", "Bar"],

		["lineSize", "Number", "Line Size (inheritable)", "Line"],
		["linePointSize", "Number", "Line Point Size (inheritable)", "Line"],
		["fitting", "Boolean", "Fitting (inheritable)", "Line"],

		["showSlider", "Boolean", "Show Slider", "Slider"],
		["sliderWidth", "Number", "Slider Width", "Slider"],
		["sliderHeight", "Number", "Slider Height", "Slider"],
		["sliderAltitude", "Number", "Slider Altitude", "Slider"],
		["sliderBlurColor", "String", "Slider Blur Color", "Slider"],
		["sliderFocusColor", "String", "Slider Focus Color", "Slider"]
	],

	PieChart : [
		["borderSize", "Number", "Border Size", "General"],
		["borderColor", "String", "Border Color", "General"],
		["padding", "Json", "Padding", "General"],
		["data", "Json", "Data", "General"],
		["baseAngle", "Number", "Base Angle", "General"],
		["dataUnit", "String", "Data Unit", "General"],

		["showTitles", "Boolean", "Show Titles", "Title"],
		["titleFont", "Json", "Title Font", "Title"],

		["selectedBorderSize", "Number", "Selected Border Size", "Data Selection"],
		["selectedBorderColor", "String", "Selected Border Color", "Data Selection"],
		["selectedValueFont", "Json", "Selected Value Font", "Data Selection"],
		["selectMode", "Number", "Select Mode", "Data Selection", {
				0 : "None",
				1 : "Click",
				2 : "Scroll"
			}
		],
		["arrowColor", "String", "Arrow Color", "Data Selection"],
		["showSelectedDetail", "Boolean", "Show Selected Detail", "Data Selection"],
		["selectedDetailFont", "Json", "Selected Detail Font", "Data Selection"]
	],
	
	RadarChart : [
		["borderSize", "Number", "Border Size", "General"],
		["borderColor", "String", "Border Color", "General"],
		["padding", "Json", "Padding", "General"],
		["data", "Json", "Data", "General"],
		["baseValue", "Number", "Base Value", "General"],
		["fillColor", "String", "Fill Color", "General"],
		["outerStyle", "Number", "Outter Style", "General",  {
				0 : "Circle",
				1 : "Polygon"
			}],
		["lineColor", "String", "Line Color", "General"],
		["titleFont", "Json", "Title Font", "Title"],
		["baseAngle", "Number", "Base Angle", "General"]
	]
}
