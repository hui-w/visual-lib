/** 
* @author Wang, Hui (huiwang@qlike.com) 
* @repo https://github.com/hui-w/visual-lib
* @licence MIT 
*/ 
function AxisChart(width, height, wrapperId) {
	//inherits all members from base class
	ChartBase(AxisChart);

	//override the inherited members
	this.width = width;
	this.height = height;
	this.wrapperId = wrapperId;

	this.data = [];
	this.keys = [];
	/* Sample data:
	[{type: bar, values: [30, 40, 50, 20, 80, 100, 120, 55, 10, 20]},{type: line, values: [20, 60, 30, 70, 60, 67, 99, 55, 190, 20]}]
	 */

	//settings: general
	this.showShadow = false;
	this.shadowStyle = {
		offsetX : 10,
		offsetY : 5,
		blur : 2,
		color : "RGBA(0, 0, 0, 0.5)"
	};
	this.showGrid = false;

	//settings: axis
	this.xLabel = "x axis";
	this.yLabel = "y axis";
	this.showAxis = true;
	this.showScaleLabel = true;
	this.showKeys = true;
	this.scaleCount = 5;
	this.zeroAsOrigin = true;
	this.scaleLineColor = "#000";
	this.scaleLineSize = 1;

	//settings: key
	this.keyFont = {
		size : 12,
		face : "verdana",
		color : "#000000"
	};
	this.keyRotate = 0;
	this.keyBaseline = "top";
	/* top; bottom; middle; alphabetic; hanging */
	this.keyAltitude = 0;

	//setting: bar
	this.barDensity = 0.7;
	this.barSpacing = 2;
	this.arrowSize = 16;
	/* 0; solid; 1; empty; */
	this.arrowStyle = 0;
	this.selectedBarColor = "RGBA(242,88,34,0.8)";
	this.showValueOnBar = false;

	//setting: line
	this.lineSize = 2;
	this.linePointSize = 4;
	this.fitting = false;

	//setting: slider
	this.showSlider = false;
	this.sliderWidth = 12;
	this.sliderHeight = 16;
	this.sliderAltitude = -32;
	this.sliderBlurColor = "RGB(51, 171, 222)";
	this.sliderFocusColor = "RGBA(51, 171, 222, 0.5)";

	//getting
	this.maxValue = null;
	this.minValue = null;
	this.valueCount = 0;
	this.barCount = 0;
	this.unitWidth = 0;
	this.unitHeight = 0;
	this.unitLeft = [];
	this.verticalScales = [];
	this.minScale = null;
	this.maxScale = null;
	this.mousePosition = null;
	this.sliderPosition = null;
	this.holdingSlider = false;

	//event
	this.selChanged = null;
	this.selectedIndex = -1;
}

AxisChart.prototype = {
	render : function () {
		var that = this;
		this.preRender();

		this.canvas.addEventListener("mousedown", mouseDown, false);
		this.canvas.addEventListener("mouseup", mouseUp, false);
		this.canvas.addEventListener("mouseout", mouseUp, false);
		this.canvas.addEventListener("mousemove", mouseMove, false);
		this.canvas.addEventListener("touchstart", mouseDown, false);
		this.canvas.addEventListener("touchend", mouseUp, false);
		this.canvas.addEventListener("touchmove", mouseMove, false);

		function mouseDown(e) {
			that.mousePosition = that.getEventPosition(e);
			that.redraw(that.mousePosition);
		};

		function mouseUp(e) {
			that.releaseSlider();
			that.redraw(that.mousePosition);
		};

		function mouseMove(e) {
			if (that.holdingSlider) {
				var p0 = that.mousePosition;
				that.mousePosition = that.getEventPosition(e);
				that.sliderPosition.x += that.mousePosition.x - p0.x;

				//get current slider item
				var firstUnitLeft = that.contentArea.left + that.arrowSize / 2;
				var sliderIndex = (that.sliderPosition.x - firstUnitLeft) / that.unitWidth;
				if (sliderIndex > 0) {
					that.setSelectedIndex(Math.floor(sliderIndex));
				} else {
					that.setSelectedIndex(-1);
				}

				var range = that.getSliderRange();
				//min value of slider
				if (that.sliderPosition.x < range.min) {
					that.sliderPosition.x = range.min;
					//that.releaseSlider();
				}

				//max value of slider
				if (that.sliderPosition.x > range.max) {
					that.sliderPosition.x = range.max;
					//that.releaseSlider();
				}

				that.redraw();
			}
		};

		this.redraw();
	}, //end of render

	getSliderRange : function () {
		var left = this.contentArea.left + this.arrowSize / 2;
		var right = this.contentArea.right - 3 * this.arrowSize / 2;
		return {
			min : left,
			max : right
		};
	},

	releaseSlider : function () {
		this.holdingSlider = false;
		this.mousePosition = null;
	},

	updateStatus : function (p) {
		this.valueCount = 0;
		this.barCount = 0;
		this.unitLeft = [];
		//TODO: check why max value and min value are not reset as 0 or null

		for (var i = 0; i < this.data.length; i++) {
			var dataItem = this.data[i];

			//bar count
			if (dataItem.type == "bar") {
				this.barCount++;
			}

			//Values count, max and min
			if (dataItem.values.length > this.valueCount) {
				this.valueCount = dataItem.values.length;
			}
			for (var j = 0; j < dataItem.values.length; j++) {
				if (dataItem.values[j] > this.maxValue || this.maxValue == null) {
					this.maxValue = dataItem.values[j];
				}

				if (dataItem.values[j] < this.minValue || this.minValue == null) {
					this.minValue = dataItem.values[j];
				}
			}
		}

		//update value count if the length of key is larger
		if (this.keys.length > this.valueCount) {
			this.valueCount = this.keys.length;
		}

		//calculate the width of each unit, as well as the height
		var totalUnitWidth = this.contentArea.width - 2 * this.arrowSize;
		this.unitWidth = totalUnitWidth / this.valueCount;
		var unitTop = this.contentArea.top + 1.5 * this.arrowSize;
		this.unitHeight = this.contentArea.bottom - unitTop;

		for (var i = 0; i < this.valueCount; i++) {
			var unitLeft = this.contentArea.left + i * this.unitWidth + this.arrowSize / 2;
			//cache it for redraw
			this.unitLeft.push(unitLeft);
			this.context.beginPath();
			this.context.rect(unitLeft, unitTop, this.unitWidth, this.unitHeight);
			//this.context.fillSample(unitLeft, unitTop, this.unitWidth - 2, this.unitHeight);

			if (p && this.context.isPointInPath(p.x, p.y)) {
				//handle the select changed event
				this.setSelectedIndex(i);
			}
		}

		if (this.showSlider) {
			//get the initial slider position
			var top = this.contentArea.bottom - this.sliderAltitude;
			if (this.sliderPosition == null) {
				var left = this.getSliderRange().min;
				this.sliderPosition = {
					x : left,
					y : top
				};
			} else {
				this.sliderPosition.y = top;
			}

			//check if mouse is on the slider
			this.context.beginPath();
			this.context.bezierEllipse(this.sliderPosition.x, this.sliderPosition.y, this.sliderWidth, this.sliderHeight);
			if (p && this.context.isPointInPath(p.x, p.y)) {
				this.holdingSlider = true;
			} else {
				//this.holdingSlider = false;
			}
		}
	},

	redraw : function (p) {
		this.preRedraw();

		//handle the data
		if (this.data.length == 0) {
			return;
		}

		this.updateStatus(p);

		//prepare to draw the data
		this.resetColor();
		var genes = [];
		for (var i = 0; i < this.data.length; i++) {
			var dataItem = this.data[i];
			var gene = {};
			
			gene.color = dataItem.color == null ? this.getNextColor() : dataItem.color;
			
			//The override properties
			gene.showValueOnBar = isset(dataItem.showValueOnBar) ? dataItem.showValueOnBar : this.showValueOnBar;
			gene.fitting = isset(dataItem.fitting) ? dataItem.fitting : this.fitting;
			gene.showShadow = isset(dataItem.showShadow) ? dataItem.showShadow : this.showShadow;
			gene.lineSize = isset(dataItem.lineSize) ? dataItem.lineSize : this.lineSize;
			gene.linePointSize = isset(dataItem.linePointSize) ? dataItem.linePointSize : this.linePointSize;
			genes.push(gene);
		}

		//prepare the vertical scale
		this.verticalScales = this.getVerticalScale(this.minValue, this.maxValue, this.scaleCount, this.zeroAsOrigin);
		this.minScale = this.verticalScales[0];
		this.maxScale = this.verticalScales[this.verticalScales.length - 1];

		//draw the scale
		this.drawScale();

		//draw the chart
		var currentBarIndex = 0;
		for (var dataCount = 0; dataCount < this.data.length; dataCount++) {
			var dataItem = this.data[dataCount];
			var gene = genes[dataCount];
			if (dataItem.type == "bar") {
				//draw the bars
				this.context.save();
				this.context.fillStyle = gene.color;
				this.context.font = "12px verdana";
				this.context.textBaseline = "bottom";
				if (gene.showShadow) {
					this.context.shadowOffsetX = this.shadowStyle.offsetX;
					this.context.shadowOffsetY = this.shadowStyle.offsetY;
					this.context.shadowBlur = this.shadowStyle.blur;
					this.context.shadowColor = this.shadowStyle.color;
				}
				for (var i = 0; i < dataItem.values.length; i++) {
					if (dataItem.values[i] == null) {
						continue;
					}
					var barWidth = (this.unitWidth * this.barDensity - (this.barCount - 1) * this.barSpacing) / this.barCount;
					var barHeight = this.unitHeight / this.maxScale * (dataItem.values[i] - this.minScale);
					var barTop = this.contentArea.top + this.unitHeight - barHeight + 1.5 * this.arrowSize;
					var firstBarLeft = this.unitLeft[i] + this.unitWidth * (1 - this.barDensity) / 2;
					var barLeft = firstBarLeft + currentBarIndex * (barWidth + this.barSpacing);

					this.context.beginPath();
					//parseInt for anti-aliasing
					this.context.rect(parseInt(barLeft), parseInt(barTop), parseInt(barWidth), parseInt(barHeight));

					if (this.selectedIndex == i) {
						this.context.fillStyle = this.selectedBarColor;
					} else {
						this.context.fillStyle = gene.color;
					}

					this.context.fill();
					if (gene.showValueOnBar) {
						var textWidth = this.context.measureText(dataItem.values[i]).width;
						var textLeft = textWidth < barWidth ? barLeft + (barWidth - textWidth) / 2 : barLeft - (textWidth - barWidth) / 2;
						this.context.fillText(dataItem.values[i], textLeft, barTop);
					}
				}
				this.context.restore();
				currentBarIndex++;
			} else if (dataItem.type == "line") {
				//draw the line
				this.context.save();
				this.context.fillStyle = gene.color;
				this.context.strokeStyle = gene.color;
				this.context.lineWidth = gene.lineSize;

				//shadow
				if (gene.showShadow) {
					this.context.shadowOffsetX = this.shadowStyle.offsetX;
					this.context.shadowOffsetY = this.shadowStyle.offsetY;
					this.context.shadowBlur = this.shadowStyle.blur;
					this.context.shadowColor = this.shadowStyle.color;
				}

				//extended point.y array whose length equals (dateItem.values.length + 2)
				//copy the point.y of dateItem.values[0] to pointYList[0]; and calculate the last value of pointYList
				var pointYList = [0];
				for (var i = 0; i < dataItem.values.length; i++) {
					var pointHeight = this.unitHeight / this.maxScale * (dataItem.values[i] - this.minScale);
					var pointY = this.contentArea.top + this.unitHeight - pointHeight + 2 * this.arrowSize;
					pointY -= gene.linePointSize / 2;
					pointY -= this.arrowSize / 2;
					pointYList.push(pointY);
				}
				pointYList[0] = pointYList[1];
				pointYList.push(pointYList[pointYList.length - 1] + (pointYList[pointYList.length - 1] - pointYList[pointYList.length - 2]));

				//draw the line and dot
				this.context.beginPath();
				var previousPoint = null;
				for (var i = 0; i < dataItem.values.length; i++) {
					if (dataItem.values[i] == null) {
						continue;
					}
					var pointX = this.unitLeft[i];
					pointX += this.unitWidth / 2;
					var pointY = pointYList[i + 1];

					//the point itself - inherit the value from parent if it's not set
					if (gene.linePointSize > 0) {
						this.context.moveTo(pointX + gene.linePointSize, pointY); //move to the start of circle
						this.context.arc(pointX, pointY, gene.linePointSize, 0, Math.PI * 2, true);
						this.context.moveTo(pointX, pointY);
					}

					//the line connecting two points
					if (gene.fitting) {
						if (i != dataItem.values.length) {
							for (var k = 1; k <= this.unitWidth; k++) {
								var tempPointY = this.spline(k / this.unitWidth, pointYList[i], pointYList[i + 1], pointYList[i + 2], pointYList[i + 3]);
								this.context.lineTo(pointX + k, tempPointY);
								this.context.moveTo(pointX + k, tempPointY);
							}
						}
					} else {
						if (previousPoint != null) {
							this.context.moveTo(previousPoint.x, previousPoint.y);
							this.context.lineTo(pointX, pointY);
						}
						previousPoint = {
							x : pointX,
							y : pointY
						};
					}
				}
				this.context.fill();
				this.context.stroke();

				this.context.restore();
			}
		} // end for all data items

		//draw the axis
		this.drawAxis();

		//draw the keys
		this.drawKeys();

		//draw the slider
		this.drawSlider(p);
	}, //end of redraw

	//for line fitting
	spline : function (t, P0, P1, P2, P3) {
		return 0.5 * ((2 * P1) +
			((0 - P0) + P2) * t +
			((2 * P0 - (5 * P1) + (4 * P2) - P3) * (t * t) +
				((0 - P0) + (3 * P1) - (3 * P2) + P3) * (t * t * t)));
	},

	drawAxis : function () {
		if (!this.showAxis) {
			return;
		}
		this.context.save();
		this.context.beginPath();

		//v-line
		this.context.moveTo(
			this.contentArea.left,
			this.contentArea.bottom); //zero point
		this.context.lineTo(
			this.contentArea.left,
			this.contentArea.top + this.arrowSize);

		//h-line
		this.context.moveTo(
			this.contentArea.left,
			this.contentArea.bottom); //zero point
		this.context.lineTo(
			this.contentArea.right - this.arrowSize,
			this.contentArea.bottom);

		this.context.strokeStyle = "#000000";
		this.context.lineWidth = 2;
		this.context.stroke();

		//fill the arrows
		this.context.beginPath();

		//v-arrow
		this.context.moveTo(
			this.contentArea.left,
			this.contentArea.top);
		this.context.lineTo(
			this.contentArea.left - this.arrowSize / 2,
			this.contentArea.top + this.arrowSize);
		this.context.lineTo(
			this.contentArea.left + this.arrowSize / 2,
			this.contentArea.top + this.arrowSize);
		this.context.closePath();

		//h-arrow
		this.context.moveTo(
			this.contentArea.right,
			this.contentArea.bottom);
		this.context.lineTo(
			this.contentArea.right - this.arrowSize,
			this.contentArea.bottom - this.arrowSize / 2);
		this.context.lineTo(
			this.contentArea.right - this.arrowSize,
			this.contentArea.bottom + this.arrowSize / 2);
		this.context.closePath();

		if(this.arrowStyle == 0) {
			this.context.fillStyle = "#000000";
			this.context.fill();
		} else {
			this.context.strokeStyle = "#000000";
			this.context.stroke();
		}
		this.context.restore();

		//draw texts

		//draw axis labels
		this.context.save();
		this.context.fillStyle = "rgb(0, 0, 0)";
		this.context.font = "12px verdana";
		this.context.textBaseline = "top";
		this.context.fillText(this.yLabel,
			this.contentArea.left + this.arrowSize / 2,
			this.contentArea.top);
		this.context.fillText(this.xLabel,
			this.contentArea.right - this.arrowSize,
			this.contentArea.bottom + this.arrowSize / 2);
		this.context.restore();
	}, //end of drawAxis

	drawScale : function () {
		if (!this.showScaleLabel && !this.showScaleLine) {
			return;
		}

		//draw the vertical scale labels and lines
		this.context.save();
		this.context.fillStyle = "#000000";
		this.context.strokeStyle = this.scaleLineColor;
		this.context.lineWidth = this.scaleLineSize;
		this.context.font = "12px verdana";
		this.context.textBaseline = "bottom";
		this.context.beginPath();
		for (var i = 0; i < this.verticalScales.length; i++) {
			var scaleHeight = this.unitHeight / this.maxScale * (this.verticalScales[i] - this.minScale);
			var scaleTop = this.contentArea.top + this.unitHeight - scaleHeight + 1.5 * this.arrowSize;
			if (this.showScaleLabel) {
				var scaleTextLength = this.context.measureText(this.verticalScales[i]).width;
				var scaleLeft = this.contentArea.left - scaleTextLength - this.arrowSize / 2;
				this.context.fillText(this.verticalScales[i], scaleLeft, scaleTop);
			}
			if (this.showScaleLine && (i != 0 || !this.showAxis)) { //to avoid drawing on x axis
				var ptFrom = {
					x : parseInt(this.contentArea.left),
					y : parseInt(scaleTop)
				};
				var ptTo = {
					x : parseInt(this.contentArea.right),
					y : parseInt(scaleTop)
				};
				this.context.antiFuzzyLine(ptFrom.x, ptFrom.y, ptTo.x, ptTo.y);
			}
		}
		if (this.showScaleLine) {
			this.context.stroke();
		}

		this.context.restore();
	}, //end of drawScale

	drawKeys : function () {
		if (!this.showKeys) {
			return;
		}

		//keys
		this.context.save();
		this.context.fillStyle = this.keyFont.color;
		this.context.font = this.keyFont.size + "px " + this.keyFont.face;
		this.context.textBaseline = this.keyBaseline;
		var textTop = this.contentArea.bottom - this.keyAltitude;
		for (var i = 0; i < this.keys.length; i++) {
			var unitLeft = this.contentArea.left + i * this.unitWidth + this.arrowSize / 2;
			var textWidth = this.context.measureText(this.keys[i]).width;
			var textLeft = textWidth < this.unitWidth ? unitLeft + (this.unitWidth - textWidth) / 2 : unitLeft - (textWidth - this.unitWidth) / 2;
			//this.context.fillText(this.keys[i], textLeft, textTop);
			this.context.fillTextWithRotate(this.keys[i], textLeft, textTop, this.angleToRadian(this.keyRotate), "left", "top");
		}

		this.context.restore();
	}, //end of drawKeys

	drawSlider : function (p) {
		if (!this.showSlider) {
			return;
		}

		//slider ruler
		var range = this.getSliderRange();

		this.context.save();
		this.context.beginPath();
		this.context.lineWidth = 1;
		this.context.strokeStyle = "#CCC";
		this.context.antiFuzzyLine(range.min, this.sliderPosition.y, range.max, this.sliderPosition.y);
		this.context.stroke();

		//slider ball
		this.context.beginPath();
		this.context.bezierEllipse(this.sliderPosition.x, this.sliderPosition.y, this.sliderWidth, this.sliderHeight);
		this.context.strokeStyle = this.sliderBlurColor;
		if (this.holdingSlider) {
			this.context.fillStyle = this.sliderBlurColor;
		} else {
			this.context.fillStyle = this.sliderFocusColor;
		}
		this.context.fill();
		this.context.restore();
	}, //end of drawSlider

	/*
	Apply the selected index and fire the event if the new value is different
	 */
	setSelectedIndex : function (newSelectedIndex) {
		if (newSelectedIndex != this.selectedIndex) {
			this.selectedIndex = newSelectedIndex;
			if (typeof this.selChanged == "function") {
				this.selChanged();
			}

			//change the slider position if slider is not pointing here
			if (this.showSlider) {
				if(newSelectedIndex == -1) {
					this.sliderPosition.x = this.getSliderRange().min;
				} else {
					var unitLeft = this.unitLeft[newSelectedIndex];
					if (this.sliderPosition.x < unitLeft || this.sliderPosition.x > unitLeft + this.unitWidth) {
						this.sliderPosition.x = unitLeft + this.unitWidth / 2;
					}
				}
			}

			return true;
		} else {
			return false;
		}
	}, //end of setSelectedIndex

	/*
	Redraw after set the selected index
	 */
	selectByIndex : function (index) {
		if (this.setSelectedIndex(index)) {
			this.redraw();
		}
	}, //end of selectByIndex

	getVerticalScale : function (min, max, count, zeroAsOrigin) {
		count = count || 5;
		function getMagnitude(n) {
			function handleInteger(i) {
				if (i == 0) {
					return null;
				}
				if (i / 10 >= 1) {
					return 1 + handleInteger(i / 10);
				} else {
					return 0;
				}
			}
			function handleFloat(f) {
				if (f * 10 >= 1) {
					return -1;
				} else {
					return -1 + handleFloat(f * 10);
				}
			}
			var p = 0;
			if (n > 0 && Math.abs(n) < 1.0) {
				p = handleFloat(Math.abs(n));
			} else {
				p = handleInteger(Math.abs(n));
			}
			return p;
		}
		function getMaxPrecision(a) {
			if (a && a instanceof Array) {
				var l = a.length;
				var maxPrecision = 0;
				for (var i = 0; i < l; i++) {
					if (!isInt(a[i])) {
						var precision = (a[i] + "").split(".")[1].length;
						if (precision > maxPrecision) {
							maxPrecision = precision;
						}
					}
				}
				return maxPrecision;
			}
			return null;
		}
		function isInt(n) {
			return typeof n === 'number' && parseFloat(n) == parseInt(n, 10) && !isNaN(n);
		}
		var matrix = [];
		var q = (max - min) / count;
		var magnitude = getMagnitude(q);
		var precision = getMaxPrecision([min, max]);
		var delta = q % Math.pow(10, magnitude) == 0 ? Math.floor(q / Math.pow(10, magnitude)) * Math.pow(10, magnitude) : (Math.floor(q / Math.pow(10, magnitude)) + 1) * Math.pow(10, magnitude);
		var qf = Math.floor(min / Math.pow(10, magnitude));
		var floor = (Math.abs(qf) - 1) < 0 ? 0 : ((qf - 1) * Math.pow(10, magnitude));
		for (var i = 0; i <= count; i++) {
			matrix.push((floor + delta * i).toFixed(precision));
		}

		return matrix;
	},

	getSelectedValues : function () {
		if (this.selectedIndex == -1 || this.data.length == 0) {
			return [];
		} else {
			var returnValues = [];
			for (var i = 0; i < this.data.length; i++) {
				var dataItem = this.data[i];
				if (dataItem.values.length > this.selectedIndex) {
					returnValues.push(dataItem.values[this.selectedIndex]);
				} else {
					returnValues.push(null);
				}
			}
			return returnValues;
		}
	} //end of getSelectedValues
}
