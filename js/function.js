function convertMaterialColorToCSS (color,callback)
{
	var timestamp=new Date().getTime();
	$("body").append("<span id='"+timestamp+"' class='"+color+"' style='display:none:'></span>");
	setTimeout(function(){ 
		var colorHEX="";
		if (color.toLowerCase().indexOf("text") >= 0) {
			colorHEX=$("#"+timestamp).css("color");
			colorHEX=rgb2hex(colorHEX);
		} else {
			colorHEX=$("#"+timestamp).css("background-color");
			colorHEX=rgb2hex(colorHEX);
		}
		callback(colorHEX);
	}, 500);
}

function rgb2hex(rgb) {
     if (  rgb.search("rgb") == -1 ) {
          return rgb;
     } else {
          rgb = rgb.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+))?\)$/);
          function hex(x) {
               return ("0" + parseInt(x).toString(16)).slice(-2);
          }
          return "#" + hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]); 
     }
}