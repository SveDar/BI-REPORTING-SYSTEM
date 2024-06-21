
// Set dimensions and margins for the chart
const margin = { top: 70, right: 30, bottom: 40, left: 80 };
const width = 1200 - margin.left - margin.right;
const height = 500 - margin.top - margin.bottom;

// Set the base param to show
var param = 3;

// Set up the x and y scales
const x = d3.scaleTime()
  .range([0, width]);

const y = d3.scaleLinear()
  .range([height, 0]);

const y1 = d3.scaleLinear()
  .range([height, 0]);

// Set up the line generator
const line_Opened_Contract_Rate = d3.line()
  .x(d => x(d.date))
  .y(d => y(d.Opened_Contract_Rate));

const line_Closed_Contract_Rate = d3.line()
  .x(d => x(d.date))
  .y(d => y(d.Closed_Contract_Rate));

const line_Refinanced_Rate = d3.line()
  .x(d => x(d.date))
  .y(d => y(d.Refinanced_Rate));

const line_Paid_off_Rate = d3.line()
  .x(d => x(d.date))
  .y(d => y(d.Paid_off_Rate));
  

// Create the SVG element and append it to the chart container
const svg = d3.select("#chart-container")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", `translate(${margin.left},${margin.top})`);

// create tooltip div

const tooltip = d3.select("body")
  .append("div")
  .attr("class", "tooltip");



// Load and process the data
d3.csv("csv_collection/contract.csv").then(data => {
  // Parse the date and convert the value to a number
  const parseDate = d3.timeParse("%Y-%m-%d");
  data.forEach(d => {
    d.date = parseDate(d.date);
    d.Closed_Contract_Rate = +d.Closed_Contract_Rate;
    d.Refinanced_Rate = +d.Refinanced_Rate;
  }); 

  // Set the domains for the x and y scales
  x.domain(d3.extent(data, d => d.date));
  y.domain([0, d3.max(data, d => d.Closed_Contract_Rate)]);
  //y1.domain([0, d3.max(data, d => d.Refinanced_Rate)]);

  // Add the x-axis
  svg.append("g")
    .attr("transform", `translate(0,${height})`)
    .style("font-size", "14px")
    .call(d3.axisBottom(x)
      .tickValues(x.ticks(d3.timeMonth.every(6))) // Display ticks every 6 months
      .tickFormat(d3.timeFormat("%b %Y"))) // Format the tick labels to show Month and Year
    .call(g => g.select(".domain").remove()) // Remove the x-axis line
    .selectAll(".tick line_Closed_Contract_Rate") // Select all tick lines
    .style("stroke-opacity", 0)

  svg.selectAll(".tick text")
    .attr("fill", "#777");

  // Add vertical gridlines
  svg.selectAll("xGrid")
    .data(x.ticks().slice(1))
    .join("line")
    .attr("x1", d => x(d))
    .attr("x2", d => x(d))
    .attr("y1", 0)
    .attr("y2", height)
    .attr("stroke", "#e0e0e0")
    .attr("stroke-width", .5);

  // Add the y-axis
  svg.append("g")
    .style("font-size", "14px")
    .call(d3.axisLeft(y)
      .ticks((d3.max(data, d => d.Closed_Contract_Rate) - 0) / Math.round((d3.max(data, d => d.Closed_Contract_Rate) - 0) * 0.1)) // Dencity of y-axis result from divison
      .tickFormat(d => {
        if (isNaN(d)) return "";
        return `${(d).toFixed(0)}`;
      })
      .tickSize(0)
      .tickPadding(10))
    .call(g => g.select(".domain").remove()) // Remove the y-axis line
    .selectAll(".tick text")
    .style("fill", "#777") // Make the font color grayer
    .style("visibility", (d, i, nodes) => {
      if (i === 0) {
        return "hidden"; // Hide the first and last tick labels
      } else {
        return "visible"; // Show the remaining tick labels
      }
    });

  // Add Y-axis label
  svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left)
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .style("font-size", "14px")
    .style("fill", "#777")
    .style("font-family", "sans-serif")
    .text("Total count");

  // Add horizontal gridlines
  svg.selectAll("yGrid")
    .data(y.ticks((d3.max(data, d => d.Closed_Contract_Rate) - 7000) / Math.round((d3.max(data, d => d.Closed_Contract_Rate) - 0) * 0.1)).slice(1))
    .join("line")
    .attr("x1", 0)
    .attr("x2", width)
    .attr("y1", d => y(d))
    .attr("y2", d => y(d))
    .attr("stroke", "#e0e0e0")
    .attr("stroke-width", .5)

  // Add the line path
  const path_Closed_Contract_Rate = svg.append("path")
    .datum(data)
    .attr("fill", "none")
    .attr("stroke", "steelblue")
    .attr("stroke-width", 1)
    .attr("d", line_Closed_Contract_Rate);
  
  const path_Refinanced_Rate = svg.append("path")
    .datum(data)
    .attr("fill", "none")
    .attr("stroke", "red")
    .attr("stroke-width", 1)
    .attr("d", line_Refinanced_Rate);

  const path_Paid_off_Rate = svg.append("path")
    .datum(data)
    .attr("fill", "none")
    .attr("stroke", "green")
    .attr("stroke-width", 1)
    .attr("d", line_Paid_off_Rate);

  // Add a circle element

  const circle = svg.append("circle")
    .attr("r", 0)
    .attr("fill", "steelblue")
    .style("stroke", "white")
    .attr("opacity", .70)
    .style("pointer-events", "none");
  // create a listening rectangle

  const listeningRect = svg.append("rect")
    .attr("width", width)
    .attr("height", height);

  // create the mouse move function

  listeningRect.on("mousemove", function (event) {
    const [xCoord] = d3.pointer(event, this);
    const bisectDate = d3.bisector(d => d.date).left;
    const x0 = x.invert(xCoord);
    const i = bisectDate(data, x0, 1);
    const d0 = data[i - 1];
    const d1 = data[i];
    const d = x0 - d0.date > d1.date - x0 ? d1 : d0;
    const xPos = x(d.date);
    const yPos = y(d.Closed_Contract_Rate);


    // Update the circle position

    circle.attr("cx", xPos)
      .attr("cy", yPos);

    // Add transition for the circle radius

    circle.transition()
      .duration(50)
      .attr("r", 5);

    // add in  our tooltip

    tooltip
      .style("display", "block")
      .style("left", `${xPos + 100}px`) 
      .style("top", `${yPos + 50}px`)
      .html(`<strong>Date:</strong> ${d.date.toLocaleDateString()}<br><strong>count:</strong> ${d.Closed_Contract_Rate !== undefined ? (d.Closed_Contract_Rate).toFixed(0) + 'cases' : 'N/A'}`)
  });
  // listening rectangle mouse leave function

  listeningRect.on("mouseleave", function () {
    circle.transition()
      .duration(50)
      .attr("r", 0);

    tooltip.style("display", "none");
  });

  // Add the chart title
  svg.append("text")
    .attr("class", "chart-title")
    .attr("x", margin.left - 115)
    .attr("y", margin.top - 100)
    .style("font-size", "24px")
    //.style("font-weight", "bold")
    .style("font-family", "sans-serif")
    .text("Counts ⦁	Contracts ");


});







