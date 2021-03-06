const padding = 50; // 20 pixels of padding around the plot
let index = 0; // we have a 2d array of numbers; this says which row to plot
let sampleData = []; // place holder for the sample data that will be loaded next

function updatePlot() {
  // get a d3 reference to the svg placeholder in the HTML
  const plot = d3.select('#d3anchor');

  // get width and height of svg
  const w = plot.node().clientWidth; // this gets us a number in pixels, rather than a string
  const h = plot.node().clientHeight;

  // create the scales to stretch the data out to the width and height of the SVG, with padding
  // also go to 1 less than the minimum value and 1 more than the max in each direction

  // create an x scale that maps the width of the SVG to the
  // number of elements we have, with padding
  const xScale = d3.scaleLinear()
    .domain([0, sampleData[index].length + 1])
    .range([padding, w - padding]);

  // create a y scale the maps the vertical range to the range of values in the array
  // the range looks flipped because SVG puts the origin in the top left, not the bottom left
  const yScale = d3.scaleLinear()
    .domain([d3.min(sampleData[index]) - 1, d3.max(sampleData[index]) + 1])
    .range([h - padding, padding]);

  const plotCircles = plot.selectAll('circle'); // selector for all circles in the plot

  // bind the latest version of sampleData[index]
  const plotData = plotCircles.data(sampleData[index]);

  // do the following for every element of sampleData[index] that is getting added
  const plotNewData = plotData.enter()
    .append('circle') // append a circle for each element in the data set
    .classed('data_point', true); // assign the data_point class to this element

  plotData.merge(plotNewData) // do the following for every point that is updated OR added
    .attr('cx', (d, i) => xScale(i + 1)) // set the x coordinate to the elements array index + 1, scaled to space things out
    .attr('cy', (d) => yScale(d)); // set the y coordinate to the array value, also scaled to space things out

  // replace the axes
  const xAxis = d3.axisBottom(xScale);
  const yAxis = d3.axisLeft(yScale);
  d3.select('#xaxis').call(xAxis).attr('transform', `translate(0 ${h - padding})`);
  d3.select('#yaxis').call(yAxis).attr('transform', `translate(${padding} 0)`);
}

// load and parse d3example.csv
// web browsers will only load external files over the network, not local files,
// so you have to start up a web server
// the simplest way to do this is to run "python -m http.server 8888" in this directory
// if you are using python 2, replace http.server with SimpleHTTPServer

// d3.csv will load a csv directly, but it assumes you have a header row with column labels
// we don't have that, so we have to load it as a text file, then use csvParseRows to
// parse the data, then process it

// The syntax with .then(...) is different than what is in the Murray text
// this is called a javascript "promise" and is part of ES6.  d3 adopted
// it in version 5 (the book uses version 4).  It has the advantages
// of chaining callbacks rather than nesting them (easier to read)
// and letting you use the await keyword.  We don't use the await
// keyword here because it only works inside functions that are declared async.
d3.text('d3example.csv') // load d3example.csv as a text file
  // parse the CSV data into a 2D array, without assuming a header row
  .then((data) => d3.csvParseRows(data, d3.autoType))
  .then((data) => { // d3.autoType is new in d3 v5, and converts numbers
    sampleData = data;
    updatePlot();
  });

// swap which row of the CSV file we show
function toggleData() {
  index = 1 - index; // toggle which row of data we are plotting
  updatePlot();
}
