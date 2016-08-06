/** 
* @author Wang, Hui (huiwang@qlike.com) 
* @repo https://github.com/hui-w/visual-lib
* @licence MIT 
*/ 
function TempChart(width, height, wrapperId) {
	//inherits all members from base class
	ChartBase(TempChart);

	//override the inherited members
	this.width = width;
	this.height = height;
	this.wrapperId = wrapperId;

	//settings
	this.baseAngle = 270;
	this.source = "Big Sur is a sparsely populated region of the Central Coast of California where the Santa Lucia Mountains rise abruptly from the Pacific Ocean. Although it has no specific boundaries, many definitions of the area include the 90 miles (140 km) of coastline from the Carmel River in Monterey County south to the San Carpoforo Creek in San Luis Obispo County, and extend about 20 miles (32 km) inland to the eastern foothills of the Santa Lucias. ";
	this.splitter = " ,.[]()";

	//getting
	this.wordHash = new HashTable();
	this.wordArray = [];
}

TempChart.prototype = {
	render : function () {
		//get the words into hash table
		var word = "";
		for (var i = 0; i < this.source.length; i++) {
			var chr = this.source[i];
			if (this.isSplitter(chr)) {
				if (word.length > 0) {
					if (this.wordHash.containsKey(word)) {
						this.wordHash.add(word, this.wordHash.getValue(word) + 1);
					} else {
						this.wordHash.add(word, 1)
					}
					word = "";
				}
			} else {
				word += chr;
			}
		}
		//console.log(this.wordHash.getKeys().join('|'));
		//console.log(this.wordHash.getValues().join('|'))

		//get the words into array for sorting
		var keys = this.wordHash.getKeys();
		for (var i = 0; i < keys.length; i++) {
			var key = keys[i];
			var value = this.wordHash.getValue(key);
			this.wordArray.push({
				key : key,
				value : value
			});
			//console.log(key + "=" + value);
		}
		this.wordArray.sort(sortBy);
		function sortBy(a, b) {
			return b.value - a.value;
		}
		//console.log(this.wordArray);

		//inherited parent method
		this.preRender();
		this.redraw();
	}, //end of render

	/*
	redraw the chart
	 */
	redraw : function () {
		this.preRedraw();

		//cycle
		this.context.beginPath();
		this.context.bezierEllipse(this.contentArea.centerX, this.contentArea.centerY, this.contentArea.width / 2, this.contentArea.height / 2);

		//x-axis
		this.context.antiFuzzyLine(this.contentArea.left, this.contentArea.centerY, this.contentArea.right, this.contentArea.centerY);

		//y-axis
		this.context.antiFuzzyLine(this.contentArea.centerX, this.contentArea.top, this.contentArea.centerX, this.contentArea.bottom);

		this.context.save();
		this.context.strokeStyle = "#CCC";
		this.context.stroke();
		this.context.restore();

		//inner line
		this.context.beginPath();
		var n = 1080;
		var wordIndex = 0;
		for (var i = 0; i < n; i += 1) {
			var radian = this.angleToRadian(this.baseAngle + i);
			var x = this.contentArea.centerX + this.contentArea.width / 2 / n * i * Math.cos(radian);
			var y = this.contentArea.centerY + this.contentArea.height / 2 / n * i * Math.sin(radian);
			this.context.lineTo(x, y);

			if (i % 60 == 0 && wordIndex < this.wordArray.length) {
				this.context.save();
				this.context.fillTextEx(this.wordArray[wordIndex ++].key, x, y, "center", "middle");
				this.context.restore();
			}
		}
		
		this.context.save();
		this.context.strokeStyle = "RGBA(200,0,0,0.3)";
		this.context.stroke();
		this.context.restore();
	}, //end of redraw

	isSplitter : function (chr) {
		for (var i = 0; i < this.splitter.length; i++) {
			if (chr == this.splitter[i]) {
				return true;
			}
		}

		return false;
	} //end of isSplitter
}

function HashTable() {
	var size = 0;
	var entry = new Object();

	this.add = function (key, value) {
		if (!this.containsKey(key)) {
			size++;
		}
		entry[key] = value;
	}

	this.getValue = function (key) {
		return this.containsKey(key) ? entry[key] : null;
	}

	this.remove = function (key) {
		if (this.containsKey(key) && (delete entry[key])) {
			size--;
		}
	}

	this.containsKey = function (key) {
		return (key in entry);
	}

	this.containsValue = function (value) {
		for (var prop in entry) {
			if (entry[prop] == value) {
				return true;
			}
		}
		return false;
	}

	this.getValues = function () {
		var values = new Array();
		for (var prop in entry) {
			values.push(entry[prop]);
		}
		return values;
	}

	this.getKeys = function () {
		var keys = new Array();
		for (var prop in entry) {
			keys.push(prop);
		}
		return keys;
	}

	this.getSize = function () {
		return size;
	}

	this.clear = function () {
		size = 0;
		entry = new Object();
	}
}

function temp_load() {
	var width = 600;
	var height = 600;
	var tempChart = new TempChart(width, height, "pnl_temp");
	tempChart.borderColor = "#CCC";
	tempChart.render();
}

/*
var map = new HashTable();
map.add("A","1");
map.add("B","2");
map.add("A","5");
map.add("C","3");
map.add("A","4");

var arrayKey = new Array("1","2","3","4");
var arrayValue = new Array("A","B","C","D");
map.add(arrayKey,arrayValue);
var value = map.getValue(arrayKey);

var object1 = new MyObject("小4");
var object2 = new MyObject("小5");

map.add(object1,"小4");
map.add(object2,"小5");

$('#console').html(map.getKeys().join('|') + '<br>');
*/
