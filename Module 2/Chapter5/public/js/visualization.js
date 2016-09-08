//Hook up actions on page
$(function(){
	$(".jsonFriends").click(function(){
		$.getJSON("/friends", function(json){
			data = json;
		});
	});
	$(".visualize").click(visualize);
});

//cached version of data
var data = [{"name":"Common Sense","count":94517},{"name":"Kelly Sommers","count":69546},{"name":"RogersHelps","count":59953},{"name":"Julie Lerman","count":45941},{"name":"Windows","count":42761},{"name":"Calgary Transit","count":37551},{"name":"Darcy_Lussier","count":37204},{"name":"Phil Plait","count":36558},{"name":"John Bristowe","count":36305},{"name":"Chris Love","count":35416},{"name": "Simon Timms", "count":10000}];
var borderPadding = 20;
function visualize()
{
	var graph = d3.select(".visualization").append("svg").attr("width", 1024).attr("height", 768);
	var colorScale = d3.scale.category10();
	calculateBubbles(data, 1024, 768);
	var currentX = 0;
	graph.selectAll(".bubble")
		.data(data)
		.enter()
			.append("circle")
				.style("fill", function(x,y){return colorScale(y);})
				.attr("cx",  function(d){return d.cx;})
				.attr("cy", function(d){ return d.cy;})
				.attr("r", 0)
				.attr("opacity", .5)
				.transition()
				.duration(750)
				.attr("r", function(d){return d.radius;});
	graph.selectAll(".label")
		.data(data)
		.enter()
			.append("text")
				.text(function(d){return d.name + "(" + d.count + ")";})
				.attr("x", function(d){return d.cx;})
				.attr("y", function(d){return d.cy;})
				.attr("text-anchor", "middle");	
}

//itterativly attempt to fit the bubbles into the SVG to minimize overlap
function calculateBubbles(data, width, height)
{
	var totalTweets = d3.sum(data, function(d){return d.count;});
	var radiusMultiplier = Math.pow((width * height)/totalTweets, .5)/2	;
	var bubbleScale = function(r){ return Math.pow(r, .5) * radiusMultiplier;};

	var previousX = width/2;
	var previousY = height/2;
	var previousRadius = width/4;
	data.forEach(function(dataPoint){
		dataPoint.radius = bubbleScale(dataPoint.count);

		while(true)
		{
			attemptFit(dataPoint, previousX, previousY, previousRadius);
			if(dataPoint.cx > 0 && dataPoint.cx < width - borderPadding && dataPoint.cy > 0 && dataPoint.cy < height - borderPadding)
				break;
		}
		previousX = dataPoint.cx;
		previousY = dataPoint.cy;
		previousRadius = dataPoint.radius;
	});
}

function attemptFit(dataPoint, previousX, previousY, previousRadius)
{
		var xQuadrantShift = getQuadrantShift();
		var yQuadrantShift = getQuadrantShift();

		var xOffset = (xQuadrantShift * (Math.floor(Math.random()*previousRadius) + 1 + (dataPoint.radius * .75)));
		dataPoint.cx = previousX + xOffset;
		dataPoint.cy = previousY + (yQuadrantShift * Math.pow(Math.pow(previousRadius + dataPoint.radius * .75, 2) - Math.pow(xOffset,2) ,.5));  
}

function getQuadrantShift()
{
	if(Math.random() > .5)
		return 1;
	return -1;
}
