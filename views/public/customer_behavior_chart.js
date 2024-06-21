const svg = d3.select("#chart"),
    margin = { top: 20, right: 80, bottom: 50, left: 50 },
    width = +svg.attr("width") - margin.left - margin.right,
    height = +svg.attr("height") - margin.top - margin.bottom,
    g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

const parseTime = d3.timeParse("%Y-%m-%d");

const x = d3.scaleTime().range([0, width]);
const y = d3.scaleLinear().range([height, 0]);

const line = d3.line()
    .x(d => x(d.Date))
    .y(d => y(d.value));

const colors = {
    Good: "steelblue",
    Bad: "red"
};

d3.csv("csv_collection/customer_behavior.csv", d => {
    d.Date = parseTime(d.Date);
    d.Good = +d.Good;
    d.Bad = +d.Bad;
    return d;
}).then(data => {
    const keys = ["Good", "Bad"];

    x.domain(d3.extent(data, d => d.Date));
    y.domain([0, d3.max(data, d => d3.max(keys, key => d[key]))]);

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
        .text("Values");

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
                .style("stroke", colors[key]);
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
        .attr("x", width - 18)
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", d => colors[d]);

    legend.append("text")
        .attr("x", width - 24)
        .attr("y", 9)
        .attr("dy", ".35em")
        .style("text-anchor", "end")
        .text(d => d);
});
