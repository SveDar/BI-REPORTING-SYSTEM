// Set the dimensions and margins of the graph
const svg = d3.select("#chart"),
    margin = { top: 20, right: 150, bottom: 50, left: 70 },
    width = +svg.attr("width") - margin.left - margin.right,
    height = +svg.attr("height") - margin.top - margin.bottom,
    g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

// Parse the date / time
const parseTime = d3.timeParse("%Y-%m-%d");

// Set the ranges
const x = d3.scaleTime().range([0, width]);
const y = d3.scaleLinear().range([height, 0]);

// Define the line
const line = d3.line()
    .x(d => x(d.date))
    .y(d => y(d.value))
    .curve(d3.curveMonotoneX); // Add curve for smoother lines

// Color scale
const colors = {
    Reject_rate: "red",
    Accept_rate: "blue",
    Contract_rate: "green",
    Refinancing_rate: "purple",
    New_Contract_rate: "orange",
    NTU_rate: "brown"
};

// Load the data
d3.csv("csv_collection/applications_rate.csv", d => {
    d.date = parseTime(d.date);
    d.Reject_rate = +d.Reject_rate;
    d.Accept_rate = +d.Accept_rate;
    d.Contract_rate = +d.Contract_rate;
    d.Refinancing_rate = +d.Refinancing_rate;
    d.New_Contract_rate = +d.New_Contract_rate;
    d.NTU_rate = +d.NTU_rate;
    return d;
}).then(data => {
    const keys = ["Reject_rate", "Accept_rate", "Contract_rate", "Refinancing_rate", "New_Contract_rate", "NTU_rate"];

    x.domain(d3.extent(data, d => d.date));
    y.domain([0, 1]); // Assuming rates are between 0 and 1

    // Add the X Axis
    g.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x))
        .append("text")
        .attr("fill", "#000")
        .attr("x", width / 2)
        .attr("y", margin.bottom - 10)
        .attr("dy", "0.71em")
        .attr("text-anchor", "middle")
        .attr("class", "axis-label")
        .text("Date");

    // Add the Y Axis
    g.append("g")
        .attr("class", "axis axis--y")
        .call(d3.axisLeft(y))
        .append("text")
        .attr("fill", "#000")
        .attr("transform", "rotate(-90)")
        .attr("y", -margin.left + 10)
        .attr("x", -height / 2)
        .attr("dy", "-2.5em")
        .attr("text-anchor", "middle")
        .attr("class", "axis-label")
        .text("Rates");

    // Add gridlines
    const gridLines = d3.axisLeft(y)
        .ticks(10)
        .tickSize(-width)
        .tickFormat("");

    g.append("g")
        .attr("class", "grid")
        .call(gridLines);

    const updateChart = () => {
        const selectedKeys = [];
        d3.selectAll(".line-checkbox").each(function() {
            const checkbox = d3.select(this);
            if (checkbox.property("checked")) {
                selectedKeys.push(checkbox.attr("data-line"));
            }
        });

        // Remove existing lines
        g.selectAll(".line").remove();

        // Draw selected lines
        selectedKeys.forEach(key => {
            g.append("path")
                .datum(data)
                .attr("class", `line ${key}-line`)
                .attr("d", line.y(d => y(d[key])))
                .style("stroke", colors[key])
                .style("stroke-width", 2)
                .style("fill", "none");
        });
    };

    // Initial chart rendering
    updateChart();

    // Add event listeners to checkboxes
    d3.selectAll(".line-checkbox").on("change", updateChart);

    const legend = g.selectAll(".legend")
        .data(keys)
        .enter().append("g")
        .attr("class", "legend")
        .attr("transform", (d, i) => `translate(0,${i * 20})`);

    legend.append("rect")
        .attr("x", width + 10)
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", d => colors[d]);

    legend.append("text")
        .attr("x", width + 35)
        .attr("y", 9)
        .attr("dy", ".35em")
        .style("text-anchor", "start")
        .style("fill", d => colors[d])
        .text(d => d.replace('_rate', ' Rate').replace(/_/g, ' '));
});
