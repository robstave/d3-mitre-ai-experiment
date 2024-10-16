const baseData = [
    { tactic: "TA0001", label: "Initial Access", hint: "The point of entry for an attack" },
    { tactic: "TA0002", label: "Execution", hint: "Running malicious code" },
    { tactic: "TA0003", label: "Persistence", hint: "Maintaining presence in the system" },
    { tactic: "TA0004", label: "Privilege Escalation", hint: "Gaining higher-level permissions" },
    { tactic: "TA0005", label: "Defense Evasion", hint: "Avoiding detection" },
    { tactic: "TA0006", label: "Credential Access", hint: "Stealing account names and passwords" },
    { tactic: "TA0007", label: "Discovery", hint: "Exploring the environment" },
    { tactic: "TA0008", label: "Lateral Movement", hint: "Moving through the environment" },
    { tactic: "TA0009", label: "Collection", hint: "Gathering data of interest" },
    { tactic: "TA0010", label: "Exfiltration", hint: "Stealing data" },
    { tactic: "TA0011", label: "Command and Control", hint: "Communicating with compromised systems" },
    { tactic: "TA0040", label: "Impact", hint: "Manipulate, interrupt, or destroy systems and data" }
];

const maxValues = {
    '24h': 3,
    '1w': 20,
    '1m': 80
};

function generateRandomData(max) {
    return baseData.map(d => ({...d, value: Math.floor(Math.random() * (max + 1))}));
}

const datasets = {
    '24h': generateRandomData(maxValues['24h']),
    '1w': generateRandomData(maxValues['1w']),
    '1m': generateRandomData(maxValues['1m'])
};

// Ensure cumulative values increase over time
baseData.forEach((d, i) => {
    datasets['1w'][i].value = Math.max(datasets['1w'][i].value, datasets['24h'][i].value);
    datasets['1m'][i].value = Math.max(datasets['1m'][i].value, datasets['1w'][i].value);
});

const width = 800;
const height = 600;
const radius = Math.min(width, height) / 2 - 60;

const svg = d3.select("#chart")
    .append("svg")
    .attr("viewBox", `0 0 ${width} ${height}`)
    .attr("preserveAspectRatio", "xMidYMid meet")
    .append("g")
    .attr("transform", `translate(${width/2},${height/2})`);

const tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

const angleScale = d3.scaleLinear()
    .domain([0, baseData.length])
    .range([0, 2 * Math.PI]);

let radiusScale = d3.scaleLinear()
    .domain([0, maxValues['24h']])
    .range([0, radius]);

// Removed fixed colorScale; will define it dynamically in updateChart

// Draw the circles and labels
const circleGroup = svg.append("g").attr("class", "circles");
const labelGroup = svg.append("g").attr("class", "circle-labels");

function updateCirclesAndLabels(maxValue) {
    const circles = [0.2, 0.4, 0.6, 0.8, 1];
    
    circleGroup.selectAll(".circle")
        .data(circles)
        .join("circle")
        .attr("class", "circle")
        .attr("cx", 0)
        .attr("cy", 0)
        .attr("r", d => radiusScale(d * maxValue))
        .attr("fill", "none")
        .attr("stroke", "#e0e0e0")
        .attr("stroke-width", 0.5);

    labelGroup.selectAll(".circle-label")
        .data(circles)
        .join("text")
        .attr("class", "circle-label")
        .attr("x", 5)
        .attr("y", d => -radiusScale(d * maxValue))
        .text(d => Math.round(d * maxValue))
        .attr("font-size", "10px")
        .attr("fill", "#666");
}

// Add axes
svg.selectAll(".axis")
    .data(baseData)
    .join("line")
    .attr("class", "axis")
    .attr("x1", 0)
    .attr("y1", 0)
    .attr("x2", (d, i) => radius * Math.cos(angleScale(i) - Math.PI / 2))
    .attr("y2", (d, i) => radius * Math.sin(angleScale(i) - Math.PI / 2))
    .attr("stroke", "#e0e0e0")
    .attr("stroke-width", 0.5);

// Add labels
svg.selectAll(".label")
    .data(baseData)
    .join("text")
    .attr("class", "label")
    .attr("x", (d, i) => (radius + 20) * Math.cos(angleScale(i) - Math.PI / 2))
    .attr("y", (d, i) => (radius + 20) * Math.sin(angleScale(i) - Math.PI / 2))
    .attr("dy", "0.35em")
    .attr("text-anchor", (d, i) => {
        const angle = angleScale(i);
        return (angle < Math.PI / 2 || angle > 3 * Math.PI / 2) ? "start" : "end";
    })
    .text(d => d.label)
    .attr("font-size", "10px")
    .attr("fill", "#333")
    .attr("alignment-baseline", "middle");

// Draw the lines and dots
const line = d3.lineRadial()
    .angle((d, i) => angleScale(i))
    .radius(d => radiusScale(d.value))
    .curve(d3.curveLinearClosed);

const path = svg.append("path")
    .attr("fill", "none")
    .attr("stroke", "#FF8C00") // Medium dark orange
    .attr("stroke-width", 2);

const dotsGroup = svg.append("g").attr("class", "dots");

function updateChart(timeframe) {
    const data = datasets[timeframe];
    const maxValue = maxValues[timeframe];

    radiusScale.domain([0, maxValue]);

    updateCirclesAndLabels(maxValue);

    // Calculate min and max values for color scaling
    const values = data.map(d => d.value);
    const minValue = d3.min(values);
    const maxValueInData = d3.max(values);

    // Define colorScale dynamically based on current data range
    const colorScale = d3.scaleLinear()
        .domain([minValue, maxValueInData])
        .range(["#FF8C00", "#8B0000"]); // From medium dark orange to dark red

    // Update path (connecting lines)
    path.datum(data)
        .transition()
        .duration(1000)
        .attr("d", line)
        .attr("stroke", "#FF8C00") // Adjust stroke color if needed
        .attr("fill", "none");

    // Update dots
    const dots = dotsGroup.selectAll(".dot")
        .data(data)
        .join("circle")
        .attr("class", "dot")
        .attr("r", 6)
        .attr("stroke", "#fff")
        .attr("stroke-width", 1)
        .on("mouseover", function(event, d) {
            d3.select(this).attr("r", 8);
            tooltip.transition()
                .duration(200)
                .style("opacity", .9);
            tooltip.html(`<strong>${d.label}</strong><br/>
                          Tactic: ${d.tactic}<br/>
                          Value: ${d.value}<br/>
                          Hint: ${d.hint}`)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function(d) {
            d3.select(this).attr("r", 6);
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        });

    dots.transition()
        .duration(1000)
        .attr("cx", (d, i) => radiusScale(d.value) * Math.cos(angleScale(i) - Math.PI / 2))
        .attr("cy", (d, i) => radiusScale(d.value) * Math.sin(angleScale(i) - Math.PI / 2))
        .attr("fill", d => colorScale(d.value));
}

// Initialize with 24-hour data
updateChart('24h');