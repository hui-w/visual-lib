function GraphPanel(width, height, wrapperId) {
	this.domContainer = null;
	this.panelCanvas = null;
	this.panelContext = null;

	//setting
	this.borderColor = null;
	this.borderSize = null;

	//getting
	this.clientLeft = null;
	this.clientTop = null;
	this.clientWidth = null;
	this.clientHeight = null;

	this.preRender = function () {
		this.clientLeft = this.borderSize;
		this.clientTop = this.borderSize;
		this.clientWidth = width - 2 * this.borderSize;
		this.clientHeight = height - 2 * this.borderSize;
	};

	this.render = function () {
		this.preRender();
		this.domContainer = $(wrapperId);

		this.panelCanvas = this.domContainer.createChild("canvas", {
				"id" : "panelCanvas",
				"width" : "0",
				"height" : "0"
			});

		if (typeof G_vmlCanvasManager != "undefined") {
			this.panelCanvas = G_vmlCanvasManager.initElement(this.panelCanvas);
		}

		this.panelCanvas.width = width;
		this.panelCanvas.height = height;

		this.panelContext = this.panelCanvas.getContext("2d");

		if (this.borderSize != null && this.borderColor != null) {
			this.panelContext.strokeStyle = this.borderColor;
			this.panelContext.lineWidth = this.borderSize;
			this.panelContext.strokeRect(this.borderSize / 2, this.borderSize / 2, width - this.borderSize, height - this.borderSize);
		}
	}
}
