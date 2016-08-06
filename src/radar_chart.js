/** 
* @author Wang, Hui (huiwang@qlike.com) 
* @repo https://github.com/hui-w/visual-lib
* @licence MIT 
*/ 
function RadarChart(width, height, wrapperId) {
	//inherits all members from base class
	ChartBase(RadarChart);

	//override the inherited members
	this.width = width;
	this.height = height;
	this.wrapperId = wrapperId;

	//settings
	this.data = [];
	this.baseValue = 0;
	this.baseAngle = 270;
	this.fillColor = "RGBA(255,145,0,0.7)";
	this.lineColor = "RGBA(0,0,0,0.5)";
	this.outerStyle = 0;
	/*0: circle; 1：polygon*/
	this.titleFont = {
		size : 12,
		face : "verdana",
		color : "#4057A7"
	};

	//getting
	this.circle = null;
	this.points = null;
	this.dynamicFullValue = null;
}

RadarChart.prototype = {
	render : function () {
		this.preRender();
		this.redraw();
	}, //end of render

	/*
	get the object for drawing
	 */
	postPreRedraw : function () {
		//base value
		this.dynamicFullValue = this.baseValue;
		for (var i = 0; i < this.data.length; i++) {
			var dataItem = this.data[i];
			//check the base value
			if (dataItem.value > this.dynamicFullValue) {
				this.dynamicFullValue = dataItem.value;
			}
		}

		//circle
		var sizeHorizontal = this.contentArea.width;
		var sizevertical = this.contentArea.height;
		var r = (sizeHorizontal < sizevertical ? sizeHorizontal : sizevertical) / 2;
		x = this.contentArea.left + sizeHorizontal / 2;
		y = this.contentArea.top + sizevertical / 2;

		this.circle = {
			x : x,
			y : y,
			r : r
		};

		//adjust and return
		this.adjustRenderObject();
	}, // end of postPreRedraw

	/*
	adjust the render object to make sure all text are in the content area
	 */
	adjustRenderObject : function () {
		//return if the circle is too small
		var sizeHorizontal = this.contentArea.width;
		var sizevertical = this.contentArea.height;
		var minR = (sizeHorizontal < sizevertical ? sizeHorizontal : sizevertical) / 4;
		if (this.circle.r <= minR) {
			//the circle is too small
			this.circle.r = minR;
			this.points = this.getPointsOnCircle();
			return;
		}

		//get the points
		this.points = this.getPointsOnCircle();

		//check the text position
		for (var i = 0; i < this.points.length; i++) {
			var point = this.points[i];

			if (this.contentArea.left - point.textLeft > 1) {
				var delta = (this.contentArea.left - point.textLeft) / 2;
				this.circle.r -= delta;
				this.circle.x += delta;
				this.circle.y += delta;
				/*
				console.log(point.textLeft);
				console.log(this.contentArea.left);
				console.log(delta);
				console.log(this.circle.r);
				console.log(this.circle.x);
				console.log(this.circle.y);
				console.log(" ");
				 */
				this.adjustRenderObject();
				break;
			} else if (point.textRight - this.contentArea.right > 1) {
				var delta = (point.textRight - this.contentArea.right) / 2;
				this.circle.r -= delta;
				this.circle.x -= delta;
				this.circle.y -= delta;
				this.adjustRenderObject();
				break;
			} else if (this.contentArea.top - point.textTop > 1) {
				var delta = (this.contentArea.top - point.textTop) / 2;
				this.circle.r -= delta;
				this.circle.x += delta;
				this.circle.y += delta;
				this.adjustRenderObject();
				break;
			} else if (point.textBottom - this.contentArea.bottom > 1) {
				var delta = (point.textBottom - this.contentArea.bottom) / 2;
				this.circle.r -= delta;
				this.circle.x -= delta;
				this.circle.y -= delta;
				this.adjustRenderObject();
				break;
			}
		}
	}, // end of adjustRenderObject

	/*
	get the points on circle for lines and texts
	 */
	getPointsOnCircle : function () {
		if (this.dynamicFullValue <= 0) {
			return [];
		}

		var unitAngle = 2 * Math.PI / this.data.length;
		var points = [];
		for (var i = 0; i < this.data.length; i++) {
			var dataItem = this.data[i];

			//get the point on circle
			var radian = unitAngle * i + this.angleToRadian(this.baseAngle);
			var x = this.circle.x + this.circle.r * Math.cos(radian);
			var y = this.circle.y + this.circle.r * Math.sin(radian);

			//get the value point
			var valueX = this.circle.x + this.circle.r * (dataItem.value / this.dynamicFullValue) * Math.cos(radian);
			var valueY = this.circle.y + this.circle.r * (dataItem.value / this.dynamicFullValue) * Math.sin(radian);

			//get the text position
			this.context.save();
			this.context.font = this.titleFont.size + "px " + this.titleFont.face;
			var titleWidth = this.context.measureText(dataItem.title).width;
			this.context.restore();

			var textLeft = x;
			var textTop = y;
			var num = parseInt(radian / (Math.PI / 2)) % 4;
			var textMargin = 2;
			switch (num) {
			case 0:
				textLeft = x + textMargin;
				textTop = y + textMargin;
				break;
			case 1:
				textLeft = x - titleWidth - textMargin;
				textTop = y + textMargin;
				break;
			case 2:
				textLeft = x - titleWidth - textMargin;
				textTop = y - this.titleFont.size - textMargin;
				break;
			case 3:
				textLeft = x + textMargin;
				textTop = y - this.titleFont.size - textMargin;
				break;
			default:
				break;
			}

			//adjust for 4 special positions
			if (radian / (Math.PI / 2) % 1 == 0) {
				textLeft += (titleWidth / 2 + textMargin) * Math.sin(radian);
				textTop -= (this.titleFont.size / 2 + textMargin) * Math.cos(radian);
			}

			points.push({
				x : x,
				y : y,
				textLeft : textLeft,
				textTop : textTop,
				textRight : textLeft + titleWidth,
				textBottom : textTop + this.titleFont.size,
				valueX : valueX,
				valueY : valueY
			});
		}

		return points;
	}, //end of getPointsOnCircle

	/*
	redraw the chart
	 */
	redraw : function () {
		this.preRedraw();

		//handle the data
		if (this.data.length == 0) {
			return;
		}

		this.postPreRedraw();

		//draw the outer
		if (this.outerStyle == 0) {
			//circle
			this.context.beginPath();
			this.context.arc(this.circle.x, this.circle.y, this.circle.r, 0, Math.PI * 2, false);
			this.context.closePath();
			this.context.save();
			this.context.strokeStyle = this.lineColor;
			this.context.stroke();
			this.context.restore();
		} else {
			this.context.beginPath();
			for (var i = 0; i < this.points.length; i++) {
				if (i == 0) {
					this.context.moveTo(this.points[i].x, this.points[i].y);
				} else {
					this.context.lineTo(this.points[i].x, this.points[i].y);
				}
			}
			this.context.closePath();
			this.context.save();
			this.context.strokeStyle = this.lineColor;
			this.context.stroke();
			this.context.restore();
		}

		//the lines
		this.context.beginPath();
		for (var i = 0; i < this.points.length; i++) {
			this.context.moveTo(this.circle.x, this.circle.y);
			this.context.lineTo(this.points[i].x, this.points[i].y);
		}
		this.context.save();
		this.context.strokeStyle = this.lineColor;
		this.context.stroke();
		this.context.restore();

		//the area
		this.context.beginPath();
		for (var i = 0; i < this.points.length; i++) {
			var dataItem = this.data[i];
			if (i == 0) {
				this.context.moveTo(this.points[i].valueX, this.points[i].valueY);
			} else {
				this.context.lineTo(this.points[i].valueX, this.points[i].valueY);
			}
		}
		this.context.closePath();
		this.context.save();
		this.context.fillStyle = this.fillColor;
		this.context.fill();
		this.context.restore();

		//the text
		this.context.save();
		for (var i = 0; i < this.points.length; i++) {
			this.context.fillStyle = this.titleFont.color;
			this.context.font = this.titleFont.size + "px " + this.titleFont.face;
			this.context.textBaseline = "top";
			this.context.fillText(this.data[i].title, this.points[i].textLeft, this.points[i].textTop);
		}
		this.context.restore();
	} //end of redraw
}
