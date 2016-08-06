/** 
* @author Wang, Hui (huiwang@qlike.com) 
* @repo https://github.com/hui-w/visual-lib
* @licence MIT 
*/ 
function PropertyWnd() {
	this.domObj = null;
	this.header = null;
	this.labelObjId = null;
	this.body = null;
	this.objects = [];
	this.sortType = 1;
	this.selectedId = null;

	this.renderInto = function (wrapperId) {
		var that = this;
		this.domObj = $(wrapperId).createChild("div", {
				"id" : "propertyWnd",
				"class" : "propertyWnd"
			});
		this.header = this.domObj.createChild("div", {
				"id" : "propertyHeader",
				"class" : "header"
			}, "Properties");
		var alphabetic = this.header.createChild("span", {
				"class" : "sort-button"
			}, "A-Z");
		var category = this.header.createChild("span", {
				"class" : "sort-button selected"
			}, "Cate");
		alphabetic.onclick = function () {
			if (that.sortType == 0)
				return;
			that.sortType = 0;
			that.show(that.selectedId);
			this.addClassName("selected");
			category.removeClassName("selected");
		}
		category.onclick = function () {
			if (that.sortType == 1)
				return;
			that.sortType = 1;
			that.show(that.selectedId);
			this.addClassName("selected");
			alphabetic.removeClassName("selected");
		}
		this.labelObjId = this.header.createChild("span");
		this.body = this.domObj.createChild("div", {
				"class" : "body"
			});

		this.show(null);
	};

	this.addObject = function (obj) {
		this.objects.push(obj);
	};

	this.alphabeticSort = function (a, b) {
		return a[2] > b[2] ? 1 : -1;
	};

	this.categorySort = function (a, b) {
		if (a[3] == b[3]) {
			return a[2] > b[2] ? 1 : -1;
		} else {
			return a[3] > b[3] ? 1 : -1;
		}
	};

	this.show = function (propId, snapToObj) {
		this.selectedId = propId;

		//scroll to the top when re-show
		this.body.scrollLeft = 0;
		this.body.scrollTop = 0;

		//clear old property items
		while (this.body.firstChild) {
			this.body.removeChild(this.body.firstChild);
		}
		
		//snap to the right side of the item
		if(snapToObj) {
			var left = snapToObj.offsetLeft + snapToObj.width + 10;
			var top = snapToObj.offsetTop;
			makeMovable("propertyHeader", "propertyWnd", left, top);
			//this.domObj.style.left = snapToObj.offsetLeft + snapToObj.width + 10 + "px";
			//this.domObj.style.top = snapToObj.offsetTop + "px";
		}

		//show the specify one
		if (this.selectedId) {
			for (var i = 0; i < this.objects.length; i++) {
				var obj = this.objects[i];
				if (obj.id == this.selectedId) {
					//show selected object ID in title
					this.labelObjId.innerHTML = " [" + obj.id + "]";
					var items = obj.items;

					//sort items
					if (this.sortType == 1) {
						items.sort(this.categorySort);
					} else {
						items.sort(this.alphabeticSort);
					}

					//show items
					var previousCategory = null;
					var categoryBody = null;
					var categoryId = 0;
					for (var j = 0; j < items.length; j++) {
						var item = items[j];
						var prop = item[0];
						var type = item[1];
						var title = item[2];
						var cate = item[3];
						var options = item[4];

						if (this.sortType == 1) {
							//show category header in the category sort mode
							if (previousCategory != cate) {
								categoryId++;
								var categoryHeader = this.body.createChild("div", {
										"class" : "category-header expand",
										"data-index" : categoryId
									}, cate);
								previousCategory = cate;
								categoryBody = this.body.createChild("div", {
										"id" : "categoryBody_" + categoryId,
										"class" : "hidden"
									});
								categoryHeader.onclick = function (e) {
									var bodyId = "categoryBody_" + this.attributes["data-index"].value;
									if ($(bodyId).hasClassName("hidden")) {
										$(bodyId).removeClassName("hidden");
										this.addClassName("collapse");
										this.removeClassName("expand");
									} else {
										$(bodyId).addClassName("hidden");
										this.addClassName("expand");
										this.removeClassName("collapse");
									}
								}
							}
							this.appendProperty(categoryBody, prop, type, title, options);
						} else {
							//show category header in the alphabetic sort mode
							this.appendProperty(this.body, prop, type, title, options);
						}
					}
					//exit when the properties are shown for the object
					return;
				}
			}
		}

		//id not specified of not found
		this.labelObjId.innerHTML = "";
		this.body.createChild("div", {
			"style" : "text-align: center; padding: 10px 0px;"
		}, "Select an object to check the settings");
	};

	this.appendProperty = function (parent, prop, type, title, options) {
		var that = this;
		var fieldset = parent.createChild("fieldset", null);
		fieldset.setAttribute("data-bindObj", this.selectedId);
		fieldset.setAttribute("data-bindType", type);
		fieldset.setAttribute("data-bindProp", prop);
		var legend = fieldset.createChild("legend", null, title);

		//prepare the form control
		var formControl = null;
		if (options != null) {
			//the options are not empty, show the dropdown list
			formControl = document.createElement("select");
			var selectedIndex = 0;
			var i = 0;
			for(var key in options) {
				var text = options[key];
				formControl.createChild("option", {"value" : key}, text);
				if(eval(this.selectedId + "." + prop) == key) {
					selectedIndex = i;
				}
				i++;
			};
			
			//default selected index
			formControl.selectedIndex = selectedIndex;
			
			//handle the event to apply the value
			formControl.onchange = function () {
				var objId = this.parentNode.getAttribute("data-bindObj");
				var prop = this.parentNode.getAttribute("data-bindProp");
				var type = this.parentNode.getAttribute("data-bindType");
				var selectedValue = this.options[this.selectedIndex].value;
				if(type == "String") {
					eval(objId + "." + prop + " = '" + selectedValue + "'");
				} else {
					eval(objId + "." + prop + " = " + selectedValue);
				}
				eval(objId).redraw();
			};
		}
		else {
			//the input type
			switch (type) {
			case "Number":
				formControl = document.createElement("input");
				formControl.type = "text";
				formControl.value = eval(this.selectedId + "." + prop);
				formControl.setAttribute("onkeypress", "return event.keyCode>=48&&event.keyCode<=57||event.keyCode==46||event.keyCode==45");
				formControl.setAttribute("onpaste", "return !clipboardData.getData('text').match(/\D/)");
				formControl.setAttribute("ondragenter", "return false");
				formControl.setAttribute("style", "width: 30px; ime-mode:Disabled");
				formControl.onkeydown = function () {
					if (event.keyCode == 13) {
						this.blur();
					}
				}
				break;
			case "String":
				formControl = document.createElement("input");
				formControl.type = "text";
				formControl.value = eval(this.selectedId + "." + prop);
				formControl.setAttribute("style", "width: 100%; ime-mode:Disabled");
				formControl.onkeydown = function () {
					if (event.keyCode == 13) {
						this.blur();
					}
				}
				break;
			case "Boolean":
				formControl = document.createElement("select");

				formControl.createChild("option", null, "True");
				formControl.createChild("option", null, "False");
				formControl.selectedIndex = eval(this.selectedId + "." + prop) ? 0 : 1;
				formControl.onchange = function () {
					this.blur();
				};
				break;
			case "Json":
				formControl = document.createElement("textarea");
				formControl.setAttribute("style", "width: 100%; height: 80px; ime-mode:Disabled");
				formControl.value = JSON.stringify(eval(this.selectedId + "." + prop));
				break;
			default:
				break;
			} //end of switch
			
			//handle the event to apply the value
			formControl.onblur = function () {
				try {
					var objId = this.parentNode.getAttribute("data-bindObj");
					var prop = this.parentNode.getAttribute("data-bindProp");
					var type = this.parentNode.getAttribute("data-bindType");
					switch (type) {
					case "Number":
						eval(objId + "." + prop + " = " + this.value);
						break;
					case "String":
						eval(objId + "." + prop + " = '" + this.value + "'");
						break;
					case "Boolean":
						var value = this.selectedIndex == 0 ? true : false;
						eval(objId + "." + prop + " = " + value);
						break;
					case "Json":
						eval(objId + "." + prop + " = JSON.parse('" + this.value + "')");
						break;
					default:
						break;
					}
					eval(objId).redraw();
				} catch (err) {
					alert(err);
				}
			};
		}

		//add the control into the field set
		if (formControl != null) {
			formControl.id = "propControl_" + this.selectedId + "." + prop;
			fieldset.appendChild(formControl);
		} //end of if

		//Add special tool buttons
		if (type == "Json") {
			var button = fieldset.createChild("a", {
					"href" : "#"
				}, "Editor");
			button.onclick = function () {
				var objId = this.parentNode.getAttribute("data-bindObj");
				var prop = this.parentNode.getAttribute("data-bindProp");
				$("jsonEditorWrapper").setAttribute("data-inputId", "propControl_" + that.selectedId + "." + prop);
				eval("showJsonEditor(" + objId + "." + prop + ");");
			}
		}
	};
}

var maxZIndex = 0;
function makeMovable(headerId, objId, initialLeft, initialTop, width, height) {
	var header = $(headerId);
	var obj = $(objId);

	//use width only if initial left is smaller than 0
	width = width ? width : 0;
	height = height ? height : 0;

	var left = initialLeft >= 0 ? initialLeft : document.documentElement.clientWidth + initialLeft - width;
	var top = initialTop >= 0 ? initialTop : document.documentElement.clientHeight + initialTop - height;
	obj.style.position = "absolute";
	obj.style.left = left + "px";
	obj.style.top = top + "px";
	obj.style.zIndex = ++maxZIndex;

	obj.onmousedown = function (e) {
		this.style.zIndex = ++maxZIndex;
	};

	header.onselectstart = function () {
		return (false);
	};

	header.onmousedown = function (e) {
		//console.log(e.layerX + "," + e.offsetX + "," + e.pageX + "," + e.clientX)
		var x0 = e.pageX;
		var y0 = e.pageY;
		document.onmousemove = function (e) {
			left += e.pageX - x0;
			top += e.pageY - y0;
			obj.style.left = left + "px";
			obj.style.top = top + "px";
			x0 = e.pageX;
			y0 = e.pageY;
		};

		document.onmouseup = function () {
			document.onmousemove = null;
		};
	};
}
