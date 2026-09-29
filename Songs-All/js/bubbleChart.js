// set the dimensions and margins of the graph
var margin = {top: 40, right: 350, bottom: 60, left: 30},
    width = 900 - margin.left - margin.right,
    height = 420 - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg = d3.select("#bubble_chart")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

// ---------------------------//
//       AXIS  AND SCALE      //
// ---------------------------//

// Add X axis
var x = d3.scaleLinear()
  .domain([0, 1])
  .range([ 20, 430-30 ]);
svg.append("g")
  .attr("transform", "translate(0," + height + ")")
  .call(d3.axisBottom(x));

// Add X axis label
svg.append("text")
  .attr("text-anchor", "end")
  .attr("x", 430)
  .attr("y", height+50 )
  .text("Classiness Score");

// Add Y axis
var y = d3.scaleLinear()
  .domain([0, 1])
  .range([ height-20, 0]);
svg.append("g")
  .call(d3.axisLeft(y));

// Add Y axis label:
svg.append("text")
    .attr("text-anchor", "end")
    .attr("x", 0)
    .attr("y", -20 )
    .text("Explicitness Score")
    .attr("text-anchor", "start")

// Add a scale for bubble size
var z = d3.scaleSqrt()
  .domain([0, 500000])
  .range([ 3, 30]);

// Add a scale for bubble color
const subgenresResponse = await fetch('/data/subgenres_by_genre.json');
const subgenresMap = await subgenresResponse.json();

const colorSchemeResponse = await fetch('/color_scheme.json');
const colorScheme = await colorSchemeResponse.json();

var myColor = d3.scaleOrdinal()
  .domain(Object.keys(subgenresMap))
  .range(colorScheme);


// ---------------------------//
//      TOOLTIP               //
// ---------------------------//

// -1- Create a tooltip div that is hidden by default:
var tooltip = d3.select("#bubble_chart")
  .append("div")
    .style("position", "absolute")
    .style("opacity", 0)
    .attr("class", "tooltip")

// -2- Create 3 functions to show / update (when mouse move but stay on same circle) / hide the tooltip
var showTooltip = function(event, d) {
  tooltip
    .transition()
    .duration(200)
  tooltip
    .style("opacity", 1)
    .html("Album: " + d.title + "<br>Artist: " + d.name)
    .style("left", (d3.pointer(event)[0]+40) + "px")
    .style("top", (d3.pointer(event)[1]+160) + "px")
}
var moveTooltip = function(event) {
  tooltip
    .style("left", (d3.pointer(event)[0]+40) + "px")
    .style("top", (d3.pointer(event)[1]+160) + "px")
}
var hideTooltip = function(event) {
  tooltip
    .transition()
    .duration(200)
    .style("opacity", 0)
}


// ---------------------------//
//       HIGHLIGHT GROUP      //
// ---------------------------//

// What to do when one group is hovered
var highlight = function(event, d){
  // reduce opacity of all groups
  d3.selectAll(".bubbles").style("opacity", .1)
  // expect the one that is hovered
  d3.selectAll("." + d.replace(/[^\w @]/g, "").replaceAll(" ", ""))
  .style("opacity", 1)
}

// And when it is not hovered anymore
var noHighlight = function(event){
  d3.selectAll(".bubbles").style("opacity", 1)
}


// ---------------------------//
//       LEGEND              //
// ---------------------------//

// Add legend: circles
var valuesToShow = [0, 200000, 500000]
var xCircle = 490
var xLabel = 540
svg
  .selectAll("legend")
  .data(valuesToShow)
  .enter()
  .append("circle")
    .attr("cx", xCircle)
    .attr("cy", function(d){ return height - 100 - z(d) } )
    .attr("r", function(d){ return z(d) })
    .style("fill", "none")
    .attr("stroke", "black")

// Add legend: segments
svg
  .selectAll("legend")
  .data(valuesToShow)
  .enter()
  .append("line")
    .attr('x1', function(d){ return xCircle + z(d) } )
    .attr('x2', xLabel)
    .attr('y1', function(d){ return height - 100 - z(d) } )
    .attr('y2', function(d){ return height - 100 - z(d) } )
    .attr('stroke', 'black')
    .style('stroke-dasharray', ('2,2'))

// Add legend: labels
svg
  .selectAll("legend")
  .data(valuesToShow)
  .enter()
  .append("text")
    .attr('x', xLabel)
    .attr('y', function(d){ return height - 100 - z(d) } )
    .text( function(d){ return d } )
    .style("font-size", 10)
    .attr('alignment-baseline', 'middle')

// Legend title
svg.append("text")
  .attr('x', xCircle)
  .attr("y", height - 100 +30)
  .text("Fans on Deezer")
  .attr("text-anchor", "middle")

// Add one dot in the legend for each name.
var size = 20
var allgroups = Object.keys(subgenresMap)
allgroups.push("Unspecified")
svg.selectAll("myrect")
  .data(allgroups.slice(0, 13))
  .enter()
  .append("circle")
    .attr("cx", 600)
    .attr("cy", function(d,i){ return 10 + i*(size+5)}) // 100 is where the first dot appears. 25 is the distance between dots
    .attr("r", 7)
    .style("fill", function(d){ return myColor(d)})
    .on("mouseover", highlight)
    .on("mouseleave", noHighlight)

// Add labels beside legend dots
svg.selectAll("mylabels")
  .data(allgroups.slice(0, 13))
  .enter()
  .append("text")
    .attr("x", 600 + size*.8)
    .attr("y", function(d,i){ return i * (size + 5) + (size/2)}) // 100 is where the first dot appears. 25 is the distance between dots
    .style("fill", function(d){ return myColor(d)})
    .text(function(d){ return d})
    .attr("text-anchor", "left")
    .style("alignment-baseline", "middle")
    .on("mouseover", highlight)
    .on("mouseleave", noHighlight)

// Add one dot in the legend for each name.
svg.selectAll("myrect")
  .data(allgroups.slice(13))
  .enter()
  .append("circle")
    .attr("cx", 700)
    .attr("cy", function(d,i){ return 10 + i*(size+5)}) // 100 is where the first dot appears. 25 is the distance between dots
    .attr("r", 7)
    .style("fill", function(d){ return myColor(d)})
    .on("mouseover", highlight)
    .on("mouseleave", noHighlight)

// Add labels beside legend dots
svg.selectAll("mylabels")
  .data(allgroups.slice(13))
  .enter()
  .append("text")
    .attr("x", 700 + size*.8)
    .attr("y", function(d,i){ return i * (size + 5) + (size/2)}) // 100 is where the first dot appears. 25 is the distance between dots
    .style("fill", function(d){ return myColor(d)})
    .text(function(d){ return d})
    .attr("text-anchor", "left")
    .style("alignment-baseline", "middle")
    .on("mouseover", highlight)
    .on("mouseleave", noHighlight)


// ---------------------------//
//       CIRCLES              //
// ---------------------------//

const addDots = function(data) {
  // Add dots
  svg.append('g')
  .selectAll("dot")
  .data(data)
  .enter()
  .append("circle")
    .attr("class", function(d) { return "bubbles " + d.genre?.replace(/[^\w @]/g, "").replaceAll(" ", "") })
    .attr("cx", function (d) { return x(d.classiness); } )
    .attr("cy", function (d) { return y(d.explicitness); } )
    .attr("r", function (d) { return z(d.deezerFans); } )
    .style("fill", function (d) { return myColor(d.genre); } )
  // -3- Trigger the functions for hover
  .on("mouseover", showTooltip )
  .on("mousemove", moveTooltip )
  .on("mouseleave", hideTooltip )
}

async function loadAndDisplayData() {
  initializeYearInput();

  const bubbles = document.getElementsByClassName("bubbles");
  while (bubbles.length > 0) bubbles[0].remove();

  try {
    const data = await fetchData();
    if (data && data.length > 0) {
      addDots(data);
    } else {
      alert("No data found for the specified filters.");
    }
  } catch (error) {
    console.error("Error when loading data:", error);
    alert("Failed to load data.");
  }
}

function getQueryParam(name) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(name);
}

function initializeYearInput() {
  const year = getQueryParam("year");
  
  if (year && !document.getElementById("yearInput").value) {
    document.getElementById("yearInput").value = year;
  }
}

async function fetchData() {
  let result;
  let year = document.getElementById("yearInput").value;

  if (!year) {
    year = getQueryParam("year");
  }
  
  await d3.json(`http://localhost:3000/bubbleChartData?year=${year}`).then((data) => {
    result = data;
  });
  return result;
}

loadAndDisplayData();

let bttn = document.getElementById("button");
bttn.addEventListener("click", loadAndDisplayData, false);
