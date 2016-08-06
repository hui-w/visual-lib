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

function getEventPosition(ev, objId) {
	/*
	var x,
	y;
	if (ev.layerX || ev.layerX == 0) {
	x = ev.layerX;
	y = ev.layerY;
	} else if (ev.offsetX || ev.offsetX == 0) { // Opera
	x = ev.offsetX;
	y = ev.offsetY;
	}
	return {
	x : x,
	y : y
	};
	 */
	var obj = $(objId);
	return {
		x : ev.pageX - obj.offsetLeft,
		y : ev.pageY - obj.offsetTop
	};
}

function getEventPosition(ev, obj) {
	/*
	var x,
	y;
	if (ev.layerX || ev.layerX == 0) {
	x = ev.layerX;
	y = ev.layerY;
	} else if (ev.offsetX || ev.offsetX == 0) { // Opera
	x = ev.offsetX;
	y = ev.offsetY;
	}
	return {
	x : x,
	y : y
	};
	 */
	return {
		x : ev.pageX - obj.offsetLeft,
		y : ev.pageY - obj.offsetTop
	};
}