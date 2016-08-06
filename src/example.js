/** 
* @author Wang, Hui (huiwang@qlike.com) 
* @repo https://github.com/hui-w/visual-lib
* @licence MIT 
*/ 
function example_load() {
	try {
		document.createElement('canvas').getContext('2d');
	} catch (e) {
		alert("HTML5 Canvas not supported by your browser");
		return;
	}

	var type = getQueryStringByName("type");
	var payload = getQueryStringByName("payload");
	if (type == null || payload == null) {
		$("codes").innerHTML = "No Data";
		return;
	}

	try {
		var codes = "";
		var properties = JSON.parse(base64.decode(payload));
		var propDictItem = PropertieDictionary[type];

		//get the object size
		var width = 600;
		var height = 300;
		if (isSmallScreen()) {
			//size on mobile
			width = getScreenWidth() - 20;
			height = width * 0.6;
		}

		$("codes").style.width = width + "px";
		$("codes").style.height = height + "px";

		//create the object
		var chart = eval("new " + type + "(" + width + ", " + height + ", 'preview')");
		codes += "var chart = new " + type + "(600, 300, \"ContainerDivId\");" + "\n";

		//set the properties
		for (var i = 0; i < properties.length; i++) {
			var key = properties[i][0];
			var value = properties[i][1];
			chart[key] = value;

			var type = getPropType(propDictItem, key);
			if (type == "String") {
				codes += "chart." + key + " = \"" + value + "\";" + "\n";
			} else if (type == "Json") {
				codes += "chart." + key + " = " + JSON.stringify(value) + ";" + "\n";
			} else {
				codes += "chart." + key + " = " + value + ";" + "\n";
			}
		}

		//render the chart
		chart.render();
		codes += "chart.render();" + "\n";
		//codes = codes.replace(/\n/g, "<br />");
		$("codes").innerHTML = codes;
	} catch (err) {
		alert(err);
	}
}

function getPropType(dictItem, key) {
	for (var i = 0; i < dictItem.length; i++) {
		if (dictItem[i][0] == key) {
			return dictItem[i][1];
		}
	}

	return null;
}
