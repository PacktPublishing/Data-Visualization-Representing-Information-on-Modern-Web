var data;
$(function()
{
	data = retrieveQuestionAnswers(901115);
	addAge(data);
	var graph = d3.select("#graph");

	var axisWidth = 50;

	var graphWidth = graph.attr("width");
	var graphHeight = graph.attr("height");
	var xScale = d3.scale.linear().domain([0, d3.max(data, function(item){ return item.age;})]).range([axisWidth,graphWidth-axisWidth]);
	var yScale = d3.scale.log().domain([d3.max(data, function(item){return item.score;}),1]).range([axisWidth,graphHeight-axisWidth]);
	
	
	graph.selectAll(".score").data(data)
		.enter()
		.append("circle")
		.attr("class", "score")
		.attr("r", 4)
		.attr("cx", function(item){ return xScale(item.age);})
		.attr("cy", function(item){ return yScale(item.score+1);})
		.on("mouseover", function(item)
			{
				showTip(item);
			});

	var xAxis = d3.svg.axis().scale(xScale).orient('bottom');
	graph.append("g")
		.attr("transform", "translate(0," + (graph.attr("height") - axisWidth)  +")")
		.call(xAxis);
	graph.append("text")
		.attr("x", graphWidth/2)
		.attr("y", graphHeight-5)
		.style("text-anchor", "middle")
		.text("Age in days");

	var yAxis = d3.svg.axis().scale(yScale).orient('left').tickValues([1,5,10,50,100,500,1000,2000]).tickFormat(function(item){return item;});
	graph.append("g")
		.attr("transform", "translate(" + axisWidth +",0)")
		.call(yAxis);
	graph.append("text")
		.attr("x", "0")
		.attr("y", graphHeight/2)
		.attr("transform", "rotate(90, 0, " + graphHeight/2 + ")")
		.text("Score");

});

function showTip(item)
{
	//set circle colors
	d3.selectAll(".score").attr("fill", "black");
	d3.select(d3.event.srcElement).attr("fill", "blue");

	d3.select("#tip").style("opacity", 0);
	d3.select("#count").text(item.score);
	d3.select("#age").text(Math.floor(item.age));
	d3.select("#tip").style("left", d3.event.x + "px");
	d3.select("#tip").style("top", d3.event.y + "px");
	d3.select("#profileImage").attr("src", item.owner.profile_image);
	d3.select("#profileName").text(item.owner.display_name);
	d3.select("#tip").transition().duration(400).style("opacity", .75);
	d3.select("#downvotes").text(item.down_vote_count);
	d3.select("#upvotes").text(item.score - item.down_vote_count);
}

function retrieveQuestionAnswers(id){
	var page = 1;
	var has_more = true;
	var results = [];
	while(has_more)	{
		$.ajax("https://api.stackexchange.com/2.1/questions/" + id + "/answers?site=stackoverflow&filter=!2BjddbKa0El(rE-eV_QT8)5M&page=" + page, 
			{ success: function(json){
					has_more = json.has_more;
					results = results.concat(json.items);}, 
			  failure: function() { 
			  		has_more = false;},
			  async: false
			});
		page++;
	}
	return results;
}

function addAge(data)
{
	for(i = 0; i < data.length; i++)
	{
		data[i].age =  ((new Date()/1000 )- data[i].creation_date) / (60 * 60);
	}
}