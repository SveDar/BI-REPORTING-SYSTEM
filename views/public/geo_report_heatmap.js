// Define the dimensions and margins for the heatmap
const margin = { top: 100, right: 60, bottom: 100, left: 100 },
    width = 850 - margin.left - margin.right,
    height = 310 - margin.top - margin.bottom;

// Append the SVG object to the body of the page for each heatmap
const svg1 = d3.select("#heatmap1")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

const svg2 = d3.select("#heatmap2")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

const svg3 = d3.select("#heatmap3")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// Read the data from the CSV file
d3.csv("csv_collection/geo_report.csv").then(data => {
    // Split the metrics into three categories
    const metrics1 = ["Good", "Bad", "NTU", "Accept", "Reject"];
    const metrics2 = ["Good_%", "Bad_%", "NTU_%", "Accept_%", "Reject_%"];
    const metrics3 = ["Granted_Amount", "Repaid_Amount"];

    // Convert numeric values
    data.forEach(d => {
        metrics1.concat(metrics2).forEach(metric => {
            d[metric] = parseFloat(d[metric]);
        });
        metrics3.forEach(metric => {
            d[metric] = Math.round(parseFloat(d[metric]));
        });
    });

    // Function to create a heatmap
    function createHeatmap(svg, metrics, colorScheme, format) {
        const regions = data.map(d => d.Region);

        const x = d3.scaleBand()
            .range([0, width])
            .domain(regions)
            .padding(0.05);

        const y = d3.scaleBand()
            .range([height, 0])
            .domain(metrics)
            .padding(0.05);

        const colorScale = d3.scaleSequential(colorScheme)
            .domain([0, d3.max(data, d => d3.max(metrics, m => d[m]))]);

        svg.selectAll()
            .data(data)
            .enter()
            .append("g")
            .selectAll("rect")
            .data(d => metrics.map(metric => ({ region: d.Region, metric, value: d[metric] })))
            .enter()
            .append("rect")
            .attr("x", d => x(d.region))
            .attr("y", d => y(d.metric))
            .attr("width", x.bandwidth())
            .attr("height", y.bandwidth())
            .style("fill", d => colorScale(d.value))
            .append("title")
            .text(d => `${d.metric}: ${format(d.value)}`);

        svg.append("g")
            .attr("transform", `translate(0, ${height})`)
            .call(d3.axisBottom(x))
            .selectAll("text")
            .attr("transform", "translate(-10,0)rotate(-45)")
            .style("text-anchor", "end");

        svg.append("g")
            .call(d3.axisLeft(y));

        // Create a legend
        const legend = svg.append("g")
            .attr("class", "legend")
            .attr("transform", `translate(${width + 20}, 0)`);

        const legendHeight = 200;
        const legendWidth = 20;
        const legendScale = d3.scaleLinear()
            .domain(colorScale.domain())
            .range([legendHeight, 0]);

        const legendAxis = d3.axisRight(legendScale)
            .ticks(5)
            .tickFormat(format);

        const defs = legend.append("defs");

        const linearGradient = defs.append("linearGradient")
            .attr("id", "linear-gradient")
            .attr("x1", "0%")
            .attr("y1", "0%")
            .attr("x2", "0%")
            .attr("y2", "100%");

        linearGradient.selectAll("stop")
            .data(colorScale.ticks().map((t, i, n) => ({
                offset: `${100 * (i / n.length)}%`,
                color: colorScale(t)
            })))
            .enter().append("stop")
            .attr("offset", d => d.offset)
            .attr("stop-color", d => d.color);

        legend.append("rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", legendWidth)
            .attr("height", legendHeight)
            .style("fill", "url(#linear-gradient)");

        legend.append("g")
            .attr("transform", `translate(${legendWidth}, 0)`)
            .call(legendAxis);
    }

    // Create the three heatmaps with appropriate formatting
    createHeatmap(svg1, metrics1, d3.interpolateYlGnBu, d3.format(".0f"));
    createHeatmap(svg2, metrics2, d3.interpolatePuRd, d3.format(".2%"));
    createHeatmap(svg3, metrics3, d3.interpolateBlues, d3.format(".2f"));

});
