/** 
* @author Wang, Hui (huiwang@qlike.com) 
* @repo https://github.com/hui-w/visual-lib
* @licence MIT 
*/ 
function ChartBase(child) {
	/*
	base class for charts
	 */
	for (key in ChartBase.prototype) {
		child.prototype[key] = ChartBase.prototype[key];
	}
}

ChartBase.prototype = {
	canvas : null,
	context : null,
	width : null,
	height : null,
	wrapperId : null,

	//default colours
	colors : ["#00B1D4", "#FF0036", "#00D435", "#FF9100", "#DE4574", "#8B4AB5", "#DFD80F",
		"#009F73", "#4057A7", "#D55E00"],
	currentColorIndex : 0,

	//settings
	borderColor : "#000000",
	borderSize : 1,
	padding : {
		top : 10,
		right : 10,
		bottom : 10,
		left : 10
	},

	//getting
	/*
	client rectangle without border, but paddings are included
	 */
	clientRect : {
		left : 0,
		top : 0,
		width : 0,
		height : 0
	},

	/*
	client rectangle without border or paddings
	 */
	contentArea : {
		left : 0,
		top : 0,
		right : 0,
		bottom : 0,
		width : 0,
		height : 0,
		centerx: 0,
		centery: 0
	},

	getClientId : function () {
		return this.wrapperId + "_canvas";
	},

	angleToRadian : function (angle) {
		return angle / 180 * Math.PI;
	},

	radianToAngle : function (angle) {
		return angle * 180 / Math.PI;
	},

	/*
	to be called in children's render()
	 */
	preRender : function () {
		var wrapper = document.getElementById(this.wrapperId);

		this.canvas = wrapper.createChild("canvas", {
				"id" : this.getClientId(),
				"width" : this.width,
				"height" : this.height
			});

		if (typeof G_vmlCanvasManager != "undefined") {
			this.canvas = G_vmlCanvasManager.initElement(this.canvas);
		}

		this.context = this.canvas.getContext("2d");
	},

	/*
	to be called in children's redraw()
	 */
	preRedraw : function () {
		//get the client rectangle according to the border settings
		this.clientRect.left = this.borderSize;
		this.clientRect.top = this.borderSize;
		this.clientRect.width = this.width - 2 * this.borderSize;
		this.clientRect.height = this.height - 2 * this.borderSize;

		//get the content area which not includes the borders and paddings
		this.contentArea.left = this.clientRect.left + this.padding.left;
		this.contentArea.top = this.clientRect.top + this.padding.top;
		this.contentArea.right = this.clientRect.left + this.clientRect.width - this.padding.right;
		this.contentArea.bottom = this.clientRect.top + this.clientRect.height - this.padding.bottom;
		this.contentArea.width = this.contentArea.right - this.contentArea.left;
		this.contentArea.height = this.contentArea.bottom - this.contentArea.top;
		this.contentArea.centerX = this.contentArea.left + this.contentArea.width / 2;
		this.contentArea.centerY = this.contentArea.top + this.contentArea.height / 2;

		//clear the old graph
		this.context.clearRect(this.clientRect.left, this.clientRect.top, this.clientRect.width, this.clientRect.height);

		//draw the borders
		if (this.borderSize > 0) {
			this.context.save();
			this.context.strokeStyle = this.borderColor;
			this.context.lineWidth = this.borderSize;
			this.context.strokeRect(this.borderSize / 2, this.borderSize / 2, this.width - this.borderSize, this.height - this.borderSize);
			this.context.restore();
		}
	},

	getEventPosition : function (ev) {
		/*
		return {
		x : ev.offsetX,
		y : ev.offsetY
		};
		 */
		return {
			x : ev.pageX - this.canvas.offsetLeft,
			y : ev.pageY - this.canvas.offsetTop
		};
	},

	resetColor : function () {
		this.currentColorIndex = 0;
	},

	getNextColor : function () {
		return this.colors[this.currentColorIndex++ % this.colors.length];
	}
}
