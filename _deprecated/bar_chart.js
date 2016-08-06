function BarChart(panel) {
	this.context = panel.panelContext;
	this.values = [];
	this.barDensity = 0.7;
	this.arrowSize = 16;
	this.barColor = "RGBA(0,150,214,0.8)";
	this.selectedBarColor = "#D7410B";
	this.padding = {
		top : 0,
		right : 0,
		bottom : 0,
		left : 0
	};

	this.render = function () {
		var that = this;
		if (this.values.length == 0) {
			return;
		}

		panel.panelCanvas.addEventListener("click", function (e) {
			p = getEventPosition(e, panel.domContainer);
			that.redraw(p);
		}, false);

		this.redraw();
	}; //end render

	this.redraw = function (p) {
		var clientLeft = panel.clientLeft;
		var clientTop = panel.clientTop;
		var clientWidth = panel.clientWidth;
		var clientHeight = panel.clientHeight;

		//clear old graph
		this.context.clearRect(clientLeft, clientTop, clientWidth, clientHeight);

		//get the maximum value
		var maxValue = this.values[0];
		for (var i = 1; i < this.values.length; i++) {
			if (this.values[i] > maxValue) {
				maxValue = this.values[i];
			}
		}

		var chartWidth = clientWidth - this.padding.left - this.padding.right - 3 * this.arrowSize;
		var chartHeight = clientHeight - this.padding.top - this.padding.bottom - this.arrowSize;
		var barWidth = chartWidth * this.barDensity / this.values.length;
		var barSpacing = chartWidth * (1 - this.barDensity) / (this.values.length - 1);

		//draw the bars
		this.context.fillStyle = this.barColor;
		this.context.font = "12px verdana";
		this.context.textBaseline = "bottom";
		for (var i = 0; i < this.values.length; i++) {
			var barHeight = chartHeight * this.values[i] / maxValue;
			var barLeft = clientLeft + this.padding.left + i * (barWidth + barSpacing) + this.arrowSize;
			var barTop = clientTop + this.padding.top + chartHeight - barHeight + this.arrowSize;

			this.context.beginPath();
			this.context.rect(barLeft, barTop, barWidth, barHeight);
			this.context.closePath();

			if (p && this.context.isPointInPath(p.x, p.y)) {
				this.context.fillStyle = this.selectedBarColor;
			} else {
				this.context.fillStyle = this.barColor;
			}
			this.context.fill();
			var textWidth = this.context.measureText(this.values[i]).width;
			var textLeft = textWidth < barWidth ? barLeft + (barWidth - textWidth) / 2 : barLeft - (textWidth - barWidth) / 2;
			this.context.fillText(this.values[i], barLeft + barWidth / 2 - textWidth / 2, barTop);
		}

		//draw the lines
		this.context.beginPath();

		//v-line
		this.context.moveTo(clientLeft + this.padding.left, clientTop + clientHeight - this.padding.bottom); //zero point
		this.context.lineTo(clientLeft + this.padding.left, clientTop + this.padding.top + this.arrowSize);

		//h-line
		this.context.moveTo(clientLeft + this.padding.left, clientTop + clientHeight - this.padding.bottom); //zero point
		this.context.lineTo(clientLeft + clientWidth - this.padding.right - this.arrowSize, clientTop + clientHeight - this.padding.bottom);

		this.context.closePath();
		this.context.strokeStyle = "#000000";
		this.context.lineWidth = 2;
		this.context.stroke();

		//fill the arrows
		this.context.beginPath();

		//v-arrow
		this.context.moveTo(clientLeft + this.padding.left, clientTop + this.padding.top);
		this.context.lineTo(clientLeft + this.padding.left - this.arrowSize / 2, clientTop + this.padding.top + this.arrowSize);
		this.context.lineTo(clientLeft + this.padding.left + this.arrowSize / 2, clientTop + this.padding.top + this.arrowSize);
		this.context.lineTo(clientLeft + this.padding.left, clientTop + this.padding.top);

		//h-arrow
		this.context.moveTo(clientLeft + clientWidth - this.padding.right, clientTop + clientHeight - this.padding.bottom);
		this.context.lineTo(clientLeft + clientWidth - this.padding.right - this.arrowSize, clientTop + clientHeight - this.padding.bottom - this.arrowSize / 2);
		this.context.lineTo(clientLeft + clientWidth - this.padding.right - this.arrowSize, clientTop + clientHeight - this.padding.bottom + this.arrowSize / 2);
		this.context.lineTo(clientLeft + clientWidth - this.padding.right, clientTop + clientHeight - this.padding.bottom);

		this.context.closePath();
		this.context.fillStyle = "#000000";
		this.context.fill();

		//draw texts
		this.context.save();

		//text colour
		this.context.fillStyle = "rgb(0, 0, 0)";
		this.context.fillStyle = this.poiFontColor;
		this.context.textBaseline = "top";

		//draw text on top
		this.context.fillText("y axis", clientLeft + this.padding.left + this.arrowSize / 2, clientTop + this.padding.top);
		this.context.fillText("x axis", clientLeft + this.padding.left + chartWidth + 2 * this.arrowSize, clientTop + this.padding.top + chartHeight + this.arrowSize * 1.5);

		this.context.restore();

	}; //end redraw
}
