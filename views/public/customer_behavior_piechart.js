// Load the data
d3.csv("csv_collection/customer_behavior_per_period.csv").then(data => {
    const parsedData = data.map(d => ({
        Good: +d.Good,
        Bad: +d.Bad,
        Good_rate: +d.Good_rate,
        Bad_rate: +d.Bad_rate
    }))[0];

    createPieChart("#good-bad-chart", [
        { label: "Good", value: parsedData.Good },
        { label: "Bad", value: parsedData.Bad }
    ]);
});

function createPieChart(selector, data) {
    const width = 500;
    const height = 500;
    const radius = Math.min(width, height) / 2;

    const svg = d3.select(selector)
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", `translate(${width / 2},${height / 2})`);

    const color = d3.scaleOrdinal()
        .domain(data.map(d => d.label))
        .range(["#4daf4a", "#e41a1c"]);

    const pie = d3.pie()
        .value(d => d.value)
        .sort(null);

    const arc = d3.arc()
        .innerRadius(0)
        .outerRadius(radius);

    const arcs = svg.selectAll(".arc")
        .data(pie(data))
        .enter().append("g")
        .attr("class", "arc");

    arcs.append("path")
        .attr("d", arc)
        .attr("fill", d => color(d.data.label));

    const total = d3.sum(data, d => d.value);

    arcs.append("text")
        .attr("transform", d => `translate(${arc.centroid(d)})`)
        .attr("dy", "-0.35em")
        .attr("class", "label")
        .style("font-size", "16px")
        .style("font-weight", "bold")
        .style("fill", "white")
        .text(d => `${((d.data.value / total) * 100).toFixed(1)}%`);

    arcs.append("text")
        .attr("transform", d => `translate(${arc.centroid(d)})`)
        .attr("dy", "1.0em")
        .attr("class", "label")
        .style("font-size", "14px")
        .style("font-weight", "bold")
        .style("fill", "white")
        .text(d => d.data.value);
}
