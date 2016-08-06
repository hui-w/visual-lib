/** 
* @author Wang, Hui (huiwang@qlike.com) 
* @repo https://github.com/hui-w/visual-lib
* @licence MIT 
*/ 
Element.prototype.createChild = function (tag, param, innerHTML) {
	var element = document.createElement(tag);
	this.appendChild(element);
	if (param) {
		for (key in param) {
			element.setAttribute(key, param[key]);
		}
	}
	if (innerHTML) {
		element.innerHTML = innerHTML;
	}

	return element;
};

var canvasPrototype = window.CanvasRenderingContext2D && CanvasRenderingContext2D.prototype;

canvasPrototype.fillTextWithRotate = function (text, x, y, angle, horizontalAlign, verticalAlign) {
	this.save();
	this.translate(x, y);
	this.rotate(angle);
	this.fillTextEx(text, 0, 0, horizontalAlign, verticalAlign);
	this.restore();
}

/*
horizontalAlign: left, center, right
verticalAlign: top, middle, bottom
 */
canvasPrototype.fillTextEx = function (text, x, y, horizontalAlign, verticalAlign) {
	this.save();
	var textLeft = x;
	if (horizontalAlign != "left") {
		var textWidth = this.measureText(text).width;
		if (horizontalAlign == "center") {
			textLeft -= textWidth / 2;
		} else if (horizontalAlign == "right") {
			textLeft -= textWidth;
		}
	}
	this.textBaseline = verticalAlign;
	this.fillText(text, textLeft, y);
	this.restore();
}

canvasPrototype.bezierEllipse = function (x, y, a, b) {
	var ox = 0.5 * a,
	oy = 0.6 * b;
	this.save();
	this.translate(x, y);
	this.beginPath();
	this.moveTo(0, b);
	this.bezierCurveTo(ox, b, a, oy, a, 0);
	this.bezierCurveTo(a, -oy, ox, -b, 0, -b);
	this.bezierCurveTo(-ox, -b, -a, -oy, -a, 0);
	this.bezierCurveTo(-a, oy, -ox, b, 0, b);
	this.closePath();
	this.restore();
}

canvasPrototype.antiFuzzyLine = function (x1, y1, x2, y2) {
	if (this.lineWidth == 1) {
		//+0.5 to avoid fuzzy line
		x1 -= 0.5;
		y1 -= 0.5;
		x2 -= 0.5;
		y2 -= 0.5;
	}
	this.moveTo(x1, y1);
	this.lineTo(x2, y2);
}

canvasPrototype.fillSample = function (left, top, width, height) {
	this.save();
	this.fillStyle = "RGBA(255, 0, 0, 0.3)";
	this.fillRect(left, top, width, height);
	this.restore();
}

canvasPrototype.strokeSample = function (left, top, width, height) {
	this.save();
	this.strokeStyle = "RGBA(255, 0, 0, 0.3)";
	this.strokeRect(left, top, width, height);
	this.restore();
}

function toDecimal(x) {
	var f = parseFloat(x);
	if (isNaN(f)) {
		return;
	}
	f = Math.round(x * 100) / 100;
	return f;
}

function isset(o) {
	return typeof o != "undefined";
}
