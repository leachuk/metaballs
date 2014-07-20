//setup the drawing environment
var canvas = document.getElementById('canvas');
var context = canvas.getContext('2d');

var xr = context.canvas.width;
var yr = context.canvas.height;
var imgd = context.createImageData(xr, yr);
var pix = imgd.data;
console.log("height yr:" + yr);
console.log("width yr:" + xr);

var mouseXY=[xr/2,yr/2];
canvas.addEventListener('mousemove', function(event) {
	mouseXY= [
		event.offsetX,
		event.offsetY
	];
	draw();
	context.clearRect(0, 0, 200, 20);
	context.font = '10pt Calibri';
    context.fillStyle = 'black';
	context.fillText(mouseXY, 10, 10);
	//console.log(mouseXY);
	
}, false);

// these are for coloring the image
//black
var mr0 = 0; 
var mg0 = 0; 
var mb0 = 0;
//white
var mr1 = 255; 
var mg1 = 255;
var mb1 = 255;
//global placeholders to set colour;
var mr = mr0,mg = mg0,mb = mb0;

//need to map canvas x/y to cartesian plane
//we then calculate each x/y as an equivalent cartesian co-ord
//used by returnCartesianCoordXY(x,y)
var xmin = -1.0; var xmax = 1.0; 
var ymin = -1.0; var ymax = 1.0;

//field function equation
//x0, y0 defines the center of the circle
//F(x,y) = (x - x0)^2 + (y - y0)^2
//Metaball function equation. R = radius of metaball.
//M(x,y) = R / sqrt( (x - x0)^2 + (y - y0)^2 )

//var x0 = y0 = xr / 2; //center point for no. Assumes square canvas.
function renderMetaball(locX,locY,x,y,r){
	var x1 = x, y1 = y;
	var x0 = locX, y0 = locY;
	var xA = (x1-x0)*(x1-x0);
	var yA = (y1-y0)*(y1-y0);
	var result = r/Math.sqrt(xA + yA);
	//console.log("result["+result+"], xA2["+(x1 - x0)+"], x1["+x1+"], y1["+y1+"], xA["+xA+"], yA["+yA+"]");
	return result;
}

//timestamp start
function draw(){
	var then = new Date();
	var metaballObj = [];
	var combinedVals = 0;
	//loop over canvas
	for (var ky = 0; ky < yr; ky++)	//iterate height Y 
	{	
		for(var kx = 0; kx < xr; kx++)	//iterate width X
		{
			var ab = returnCartesianCoordXY(kx,ky);
			var cartesianMouseXY = returnCartesianCoordXY(mouseXY[0],mouseXY[1]);
			var metaVar = renderMetaball(cartesianMouseXY[0],cartesianMouseXY[1],ab[0],ab[1],5.0);
			var metaVar2 = renderMetaball(0,0,ab[0],ab[1],10.0);
			//console.log(metaVar);
			mra = calculateColour(metaVar);
			mrb = calculateColour(metaVar2);
		
			mr = mra[0],mg = mra[1],mb = mra[2];
			mr += mrb[0],mg += mrb[1],mb += mrb[2];
			
			//todo: add metaball to array and iterate over
			metaballObj = [metaVar.toFixed(2),metaVar2.toFixed(2)];
			//combinedVals = renderMetaballFields(metaballObj);
			var comb2 = metaVar + metaVar2;
			if (ab[0] > -0.5 && ab[0] < 0.5 && ab[1] == 0){
				//console.log(combinedVals);
				//console.log("combined["+combinedVals+"], x["+ kx +"],y["+ ky + "], metavar["+ metaVar +"]");
			}
			
			if (comb2 >= 41.0){
			 mr = 0;
			 mg = 255;
			 mb = 0;
			}
			var p = (xr * ky + kx) * 4;
			pix[p + 0] = mr; //r
			pix[p + 1] = mg; //g
			pix[p + 2] = mb; //b
			pix[p + 3] = 255; //a
			//console.log(p);   
		}
	}
	context.putImageData(imgd, 0, 0);
	//timestamp end
	var now = new Date();
	//console.log("elapsed time(ms):" + (now-then));
}
function renderMetaballFields(metaballArray){
	var combinedVals = 0;
	for (i=0; i <= metaballArray.length; i++){
		combinedVals += parseFloat(metaballArray[i]);
	}
	
	return combinedVals;
}


//UTILITIES
function returnCartesianCoordXY(x,y){
//map the pixel to the cartesian plane
	pixelX = x;
	pixelY = y;
	var cartesianRangeX = Math.abs(xmin) + Math.abs(xmax);
	var cartesianRangeY = Math.abs(ymin) + Math.abs(ymax);
	var normalisedX = x / xr;
	var normalisedY = y / yr;
	var result = [
		(cartesianRangeX * normalisedX) + xmin,
		(cartesianRangeY * normalisedY) + ymin
	]; 
	return result;	
}

function calculateColour(XY){
	//using greyscale so r,g,b are all the same
	var rgbMax = 0;
	var rgbMin = 255;
	var rgbRange = rgbMax - rgbMin;	
	//smooth colouring algorithm which prevents the typical banding
	//var v = itr - Math.log(Math.log(Math.sqrt(absZ)))/Math.log(2.0);
	var red = green = blue = XY*2;
	//red for border test.
	if (XY >= 41.0){
	 red = 255;
	 green = 0;
	 blue = 0;
	}
	
	//var colour = (v / maxIt) * rgbRange + rgbMin;
	//colour = (colour > 255) ? 255 : colour;
	//console.log("colour["+colour+"]")
	return [
		red,
		green,
		blue
	]
}
