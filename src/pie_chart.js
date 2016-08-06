/** 
* @author Wang, Hui (huiwang@qlike.com) 
* @repo https://github.com/hui-w/visual-lib
* @licence MIT 
*/ 
function PieChart(width, height, wrapperId) {
	//inherits all members from base class
	ChartBase(PieChart);

	//override the inherited members
	this.width = width;
	this.height = height;
	this.wrapperId = wrapperId;

	this.data = [];
	this.dataUnit = "Kg";

	//settings: general
	this.selectedBorderColor = "#333333";
	this.selectedBorderSize = 4;

	this.showTitles = true;
	this.titleFont = {
		size : 12,
		face : "verdana",
		color : "#000000"
	};
	this.showSelectedDetail = false;
	this.selectedDetailFont = {
		size : 12,
		face : "verdana",
		color : "#000000"
	};

	this.selectedValueFont = {
		size : 12,
		face : "verdana",
		color : "#000000"
	};
	this.baseAngle = 270;
	/* 0-none; 1-click; 2-scroll */
	this.selectMode = 1;
	this.arrowColor = "RGBA(255,255,255,0.4)";

	//getting
	this.pies = null;
	this.valueSum = 0;
	this.mousePosition = null;
	this.mouseDown = false;
	this.mouseInPie = false;

	this.inertiaTimer = null;
	this.angularVelocity = null;
	this.snapToPieTimer = null;

	//event
	this.selChanged = null;
	this.selectedIndex = -1;
}

PieChart.prototype = {
	render : function () {
		var that = this;
		this.preRender();

		//mouse events
		this.canvas.addEventListener("mousedown", mouseDown, false);
		this.canvas.addEventListener("mouseup", mouseUp, false);
		this.canvas.addEventListener("mouseout", mouseUp, false);
		this.canvas.addEventListener("mousemove", mouseMove, false);

		//touch events
		this.canvas.addEventListener("touchstart", mouseDown, false);
		this.canvas.addEventListener("touchend", mouseUp, false);
		this.canvas.addEventListener("touchmove", mouseMove, false);

		function mouseDown(e) {
			that.mouseDown = true;

			var oldSelectedIndex = that.selectedIndex;
			that.mousePosition = that.getEventPosition(e);
			that.updatePiesInfo();

			if (that.selectMode == 1) {
				//redraw only if selected pie is changed
				if (oldSelectedIndex != that.selectedIndex) {
					that.triggerSelChanged();
					that.redraw(true);
				}
			} else {
				//stop the previous scroll inertia
				if (that.inertiaTimer) {
					clearInterval(that.inertiaTimer);
				}
			}
		}; //end of mouseDown

		function mouseUp(e) {
			that.mouseDown = false;

			if (that.selectMode == 2) {
				//stop the previous scroll inertia
				if (that.inertiaTimer) {
					clearInterval(that.inertiaTimer);
				}

				if (that.angularVelocity != null && that.angularVelocity != 0) {
					that.inertiaTimer = setInterval(function () {
							if (Math.abs(that.angularVelocity) < 1) {
								that.angularVelocity = null;
								clearInterval(that.inertiaTimer);
								//stopped, and snap to the pie centre
								that.snapToPieCenter();
							} else {
								that.angularVelocity *= 0.9;
								that.baseAngle += that.angularVelocity;
								that.redraw();
							}
						}, 30);
				} else if (that.angularVelocity != null) {
					that.snapToPieCenter();
				}
			} //end if scroll select mode
		}; //end of mouseUp

		function mouseMove(e) {
			//scroll the pies
			if (that.selectMode == 2 && that.mouseDown && that.mouseInPie) {
				var p0 = that.mousePosition;
				that.mousePosition = that.getEventPosition(e);
				var circle = that.getCircle();
				var deltaAngle = that.getDeltaAngle({
						x : circle.x,
						y : circle.y
					}, p0, that.mousePosition);
				that.angularVelocity = Math.round(that.radianToAngle(deltaAngle));
				that.baseAngle += that.angularVelocity;

				that.redraw();
			}
		}; //end of mouseMove

		this.redraw();
	}, //end of render

	/*
	scroll the chart and make Pi/2 pointing to the center of selected pie
	 */
	snapToPieCenter : function () {
		var that = this;
		var pie = this.pies[this.selectedIndex];
		var angleIn2pi = this.mapAngleInto2pi(pie.from, pie.to);
		var middleAngular = (angleIn2pi.to - angleIn2pi.from) / 2 + angleIn2pi.from;
		var deltaAngular = Math.PI / 2 - middleAngular;
		var angularVelocity = this.radianToAngle(deltaAngular / 10);
		var count = 0;

		if (that.snapToPieTimer) {
			clearInterval(that.snapToPieTimer);
		}
		that.snapToPieTimer = setInterval(function () {
				that.baseAngle += angularVelocity;
				that.redraw();
				var selectedPie = that.pies[that.selectedIndex];
				if (++count >= 10) {
					clearInterval(that.snapToPieTimer);
					that.triggerSelChanged();
					that.redraw();
				}
			}, 30);
	},

	/*
	when mouse move from p0 to p1,
	get the angel(centre as p) that the circle show rotate
	 */
	getDeltaAngle : function (p, p0, p1) {
		var alpha0 = Math.atan2(p0.x - p.x, p0.y - p.y);
		var alpha1 = Math.atan2(p1.x - p.x, p1.y - p.y);
		return alpha0 - alpha1;
		/*
		//c^2 = a^2 + b^2 - 2abcos(C)
		var a = Math.sqrt((p0.x - p.x) * (p0.x - p.x) + (p0.y - p.y) * (p0.y - p.y));
		var b = Math.sqrt((p1.x - p.x) * (p1.x - p.x) + (p1.y - p.y) * (p1.y - p.y));
		var c = Math.sqrt((p1.x - p0.x) * (p1.x - p0.x) + (p1.y - p0.y) * (p1.y - p0.y));
		var angle = Math.acos((a * a + b * b - c * c) / (2 * a * b));
		 */
	},

	/*
	get the circle properties: centre point and r
	 */
	getCircle : function () {
		var sizeHorizontal = this.contentArea.width;
		var sizevertical = this.contentArea.height;
		var r = (sizeHorizontal < sizevertical ? sizeHorizontal : sizevertical) / 2;
		x = this.contentArea.left + r;
		y = this.contentArea.top + r;

		return {
			x : x,
			y : y,
			r : r
		};
	},

	/*
	get all the pies; update the mouse status; update the selected index
	according to this.mousePosition
	 */
	updatePiesInfo : function () {
		this.pies = [];
		var circle = this.getCircle();

		//only clear the selected index in click mode
		if (this.selectMode == 1) {
			this.selectedIndex = -1;
		}

		if (this.selectMode == 2) {
			this.mouseInPie = false;
		}

		this.valueSum = 0;
		for (var i = 0; i < this.data.length; i++) {
			this.valueSum += this.data[i].value;
		}

		var angleFrom = this.angleToRadian(this.baseAngle);
		for (var i = 0; i < this.data.length; i++) {
			var dataItem = this.data[i];
			var angleTo = angleFrom + Math.PI * 2 * dataItem.value / this.valueSum;

			this.context.beginPath();
			this.context.moveTo(circle.x, circle.y);
			this.context.arc(circle.x, circle.y, circle.r, angleFrom, angleTo, false);
			this.context.closePath();

			if (this.mousePosition && this.context.isPointInPath(this.mousePosition.x, this.mousePosition.y)) {
				//mouse position is in one of the pie means it's in pies
				if (this.selectMode == 2) {
					this.mouseInPie = true;
				}

				//add this.selectedIndex == -1 to make sure only one pie is selected when the border is clicked
				if (this.selectMode == 1 && this.selectedIndex == -1) {
					this.selectedIndex = i;
				}
			}

			this.pies.push({
				index : i,
				from : angleFrom,
				to : angleTo
			});

			//scrolling mode, to check which pie is on the triangle pointer
			if (this.selectMode == 2) {
				var angleIn2pi = this.mapAngleInto2pi(angleFrom, angleTo);
				if (angleIn2pi.from <= Math.PI / 2 && angleIn2pi.to >= Math.PI / 2) {
					this.selectedIndex = i;
				}
			}

			//save the angle for next round
			angleFrom = angleTo;
		}
	},

	/*
	trigger the event if there is
	 */
	triggerSelChanged : function () {
		if (typeof this.selChanged == "function") {
			this.selChanged();
		}
	},

	/*
	map the angle into 2pi
	 */
	mapAngleInto2pi : function (from, to) {
		var n = Math.floor(to / (Math.PI * 2));
		var fromIn2PI = from - n * Math.PI * 2;
		var toIn2PI = to - n * Math.PI * 2;
		return {
			from : fromIn2PI,
			to : toIn2PI
		};
	},

	/*
	redraw the chart
	useExistingPies: set true if only redraw us needed, so it won't update this.pies
	 */
	redraw : function (useExistingPies) {
		this.preRedraw();

		//handle the data
		if (this.data.length == 0) {
			return;
		}

		if (!useExistingPies || this.pies == null) {
			this.updatePiesInfo();
		}

		//draw outer circle
		var circle = this.getCircle();
		var border = 0;
		if (this.selectMode == 2) {
			border = 4;
			this.context.save();
			this.context.fillStyle = "#CCCCCC";
			this.context.beginPath();
			this.context.arc(circle.x, circle.y, circle.r, 0, Math.PI * 2, false);
			this.context.closePath();
			this.context.fill();
			this.context.restore();
		}

		//draw regular pies
		this.resetColor();
		for (var i = 0; i < this.data.length; i++) {
			var dataItem = this.data[i];
			if (!dataItem.color) {
				//apply the default color
				dataItem.color = this.getNextColor();
			}

			var pie = this.pies[i];
			if (i != this.selectedIndex) {
				this.context.save();
				this.context.beginPath();
				this.context.moveTo(circle.x, circle.y);
				this.context.arc(circle.x, circle.y, circle.r - border, pie.from, pie.to, false);
				this.context.closePath();
				this.context.fillStyle = dataItem.color;
				this.context.fill();
				this.context.restore();
			}
		}

		//draw the selected pie
		if (this.selectedIndex != -1) {
			var selectedPie = this.pies[this.selectedIndex];

			if (this.selectMode == 1) {

				this.context.save();
				//selected color
				this.context.beginPath();
				this.context.moveTo(circle.x, circle.y);
				this.context.arc(circle.x, circle.y, circle.r, selectedPie.from, selectedPie.to, false);
				this.context.closePath();
				this.context.fillStyle = this.data[this.selectedIndex].color;
				this.context.fill();

				//selected border
				this.context.strokeStyle = this.selectedBorderColor;
				this.context.lineWidth = this.selectedBorderSize;
				this.context.stroke();

				//selected text
				var selectedText = this.data[this.selectedIndex].title + ": " + this.data[this.selectedIndex].value + this.dataUnit + " (" + toDecimal(this.data[this.selectedIndex].value / this.valueSum * 100) + "%)";
				this.context.textBaseline = "top";
				this.context.font = this.selectedValueFont.size + "px " + this.selectedValueFont.face;
				var textWidth = this.context.measureText(selectedText).width;

				this.context.fillStyle = "RGBA(255,255,255,0.6)";
				this.context.fillRect(this.mousePosition.x, this.mousePosition.y, textWidth, this.selectedValueFont.size * 1.2);

				this.context.fillStyle = this.selectedValueFont.color;
				this.context.fillText(selectedText, this.mousePosition.x, this.mousePosition.y);
				this.context.restore();
			} else if (this.selectMode == 2) {
				this.context.save();
				this.context.beginPath();
				this.context.moveTo(circle.x, circle.y);
				this.context.arc(circle.x, circle.y, circle.r - border, selectedPie.from, selectedPie.to, false);
				this.context.closePath();
				this.context.fillStyle = this.data[this.selectedIndex].color;
				this.context.fill();
				this.context.restore();
			}

		}

		//draw the titles
		this.drawTitle();

		//draw the triangle
		this.drawTriangle();

		//draw the detail of selected pie
		this.drawDataDetail();

		return;
	}, //end of redraw

	/*
	the pie titles
	 */
	drawTitle : function () {
		if (!this.showTitles) {
			return;
		}

		//draw titles
		this.context.save();
		this.context.font = this.titleFont.size + "px " + this.titleFont.face;
		this.context.textBaseline = "top";

		var maxTitleWidth = 0;
		for (var i = 0; i < this.data.length; i++) {
			var dataItem = this.data[i];
			//Calculate and save the title width
			var titleWidth = this.context.measureText(dataItem.title).width;
			if (maxTitleWidth < titleWidth) {
				maxTitleWidth = titleWidth;
			}
		}

		for (var i = 0; i < this.data.length; i++) {
			var dataItem = this.data[i];

			//fill text
			this.context.fillStyle = this.titleFont.color;
			var textLeft = this.contentArea.right - maxTitleWidth;
			var textTop = this.contentArea.top + i * this.titleFont.size * 1.5;
			this.context.fillText(dataItem.title, textLeft, textTop);

			//fill the color rectangle
			this.context.fillStyle = dataItem.color;
			this.context.strokeStyle = "#000000";
			this.context.lineWidth = 1;
			var blockLeft = parseInt(textLeft - this.titleFont.size - this.titleFont.size / 6);
			var blockTop = parseInt(textTop + this.titleFont.size / 6);
			this.context.fillRect(blockLeft, blockTop, this.titleFont.size, this.titleFont.size);

			//draw the selected border on title
			if (i == this.selectedIndex) {
				this.context.strokeRect(blockLeft - 2, blockTop - 2, this.contentArea.right - blockLeft + 4, this.titleFont.size + 4);
			}
		}
		this.context.restore();
	},

	/*
	the triangle for scrolling
	 */
	drawTriangle : function () {
		if (this.selectMode == 2) {
			var circle = this.getCircle();
			var triangleSize = circle.r / 3;
			this.context.save();
			this.context.fillStyle = this.arrowColor;
			this.context.beginPath();

			//triangle
			this.context.arc(circle.x, circle.y, circle.r, Math.PI * (0.5 - 0.05), Math.PI * (0.5 + 0.05), false);
			this.context.lineTo(circle.x, circle.y - triangleSize + circle.r);

			//small circle
			this.context.moveTo(circle.x, circle.y);
			this.context.arc(circle.x, circle.y, triangleSize, 0, Math.PI * 2, false);

			this.context.fill();

			//text in small circle
			this.context.fillStyle = "#fff";
			var fontSize = 12;
			this.context.font = fontSize + "px verdana";
			this.context.fillTextEx("Total", circle.x, circle.y - fontSize, "center", "middle");
			this.context.font = fontSize * 1.2 + "px verdana";
			this.context.fillTextEx(this.valueSum + this.dataUnit, circle.x, circle.y + fontSize, "center", "middle");

			this.context.restore();
		}
	},

	/*
	redraw the detail of selected or selecting item
	 */
	drawDataDetail : function () {
		var itemIndex = -1;
		if (this.showSelectedDetail) {
			if (this.selectMode == 1 && this.selectedIndex != -1) {
				itemIndex = this.selectedIndex;
			}

			if (this.selectMode == 2 && this.selectedIndex != -1) {
				itemIndex = this.selectedIndex;
			}
		}

		if (itemIndex == -1) {
			return;
		}

		var item = this.data[itemIndex];
		var lines = [];
		lines.push("Total: " + this.valueSum + this.dataUnit);
		lines.push(item.title);
		lines.push(item.value + this.dataUnit);
		lines.push(toDecimal(item.value / this.valueSum * 100) + "%");

		this.context.save();
		this.context.font = this.selectedDetailFont.size + "px " + this.selectedDetailFont.face;
		this.context.textBaseline = "bottom";

		var maxTitleWidth = 0;
		for (var i = 0; i < lines.length; i++) {
			//Calculate and save the text width
			var lineWidth = this.context.measureText(lines[i]).width;
			if (maxTitleWidth < lineWidth) {
				maxTitleWidth = lineWidth;
			}
		}

		var lineSpacing = 1.5;
		var textLeft = this.contentArea.right - maxTitleWidth;
		var textTop = this.contentArea.bottom - this.selectedDetailFont.size * lines.length * lineSpacing;

		//background
		this.context.fillStyle = "RGBA(255,255,255,0.5)";
		this.context.fillRect(textLeft, textTop, maxTitleWidth, this.selectedDetailFont.size * 1.5 * lines.length);

		//text
		this.context.fillStyle = item.color;
		for (var i = 0; i < lines.length; i++) {
			textTop += this.selectedDetailFont.size * lineSpacing;
			this.context.fillText(lines[i], textLeft, textTop);
		}
		this.context.restore();
	},

	/*
	backup function, no longer in use
	 */
	isInPie : function (x1, y1, x0, y0, r, angleFrom, angleTo) {
		var r1 = Math.sqrt((x1 - x0) * (x1 - x0) + (y1 - y0) * (y1 - y0));
		if (r1 > r) {
			return false;
		}

		var alpha = Math.atan2((x1 - x0), (y1 - y0));
		angleFrom = angleFrom % (2 * Math.PI);
		angleTo = angleTo == (2 * Math.PI) ? (2 * Math.PI) : (angleTo % (2 * Math.PI));
		if (Math.PI / 2 - alpha >= 0) {
			alpha = Math.PI / 2 - alpha;
		} else {
			alpha = 5 * Math.PI / 2 - alpha;
		}
		if (alpha < angleFrom || alpha > angleTo) {
			return false;
		}

		return true;
	},

	/*
	get the selected value
	 */
	getSelectedItem : function () {
		if (this.selectedIndex == -1 || this.data.length == 0) {
			return null;
		} else {
			if (this.selectedIndex >= this.data.length) {
				return null;
			} else {
				return this.data[this.selectedIndex];
			}
		}
	} //end of getSelectedItem
}
