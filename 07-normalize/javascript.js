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

const colorScale = d3.scaleSequential(d3.interpolateYlOrRd)
    .domain([0, maxValues['1m']]);

// Draw the circles and labels
const circleGroup = svg.append("g").attr("class", "circles");
const labelGroup = svg.append("g").attr("class", "circle-labels");

function updateCirclesAndLabels(maxValue) {
    const circles = [0.2, 0.4, 0.6, 0.8, 1];
    
    circleGroup.selectAll(".circle")
        .data(circles)
        .join("circle")
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
    .attr("stroke", "rgb(75, 192, 192)")
    .attr("stroke-width", 2);

const dots = svg.selectAll(".dot")
    .data(baseData)
    .join("circle")
    .attr("r", 6)
    .attr("fill", d => colorScale(d.value))
    .attr("stroke", "#fff")
    .attr("stroke-width", 1);

function updateChart(timeframe) {
    const data = datasets[timeframe];
    const maxValue = maxValues[timeframe];

    radiusScale.domain([0, maxValue]);

    updateCirclesAndLabels(maxValue);

    path.datum(data)
        .transition()
        .duration(1000)
        .attrTween("d", function(d) {
            const previous = d3.select(this).attr("d");
            const current = line(d);
            return d3.interpolatePath(previous, current);
        });

    dots.data(data)
        .transition()
        .duration(1000)
        .attr("cx", (d, i) => radiusScale(d.value) * Math.cos(angleScale(i) - Math.PI / 2))
        .attr("cy", (d, i) => radiusScale(d.value) * Math.sin(angleScale(i) - Math.PI / 2))
        .attr("fill", d => colorScale(d.value));

    dots.on("mouseover", function(event, d) {
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
}

// Add legend
const legendItems = [
    { label: "Low", value: 0 },
    { label: "Medium", value: maxValues['1m'] / 2 },
    { label: "High", value: maxValues['1m'] }
];

const legend = d3.select("#legend")
    .selectAll(".legend-item")
    .data(legendItems)
    .enter()
    .append("div")
    .attr("class", "legend-item");

legend.append("div")
    .attr("class", "legend-color")
    .style("background-color", d => colorScale(d.value));

legend.append("span")
    .text(d => d.label);

// Initialize with 24-hour data
updateChart('24h');