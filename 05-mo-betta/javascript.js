const data = [
    { tactic: "TA0001", label: "Initial Access", value: 0.6, hint: "The point of entry for an attack" },
    { tactic: "TA0002", label: "Execution", value: 0.4, hint: "Running malicious code" },
    { tactic: "TA0003", label: "Persistence", value: 0.7, hint: "Maintaining presence in the system" },
    { tactic: "TA0004", label: "Privilege Escalation", value: 0.3, hint: "Gaining higher-level permissions" },
    { tactic: "TA0005", label: "Defense Evasion", value: 0.5, hint: "Avoiding detection" },
    { tactic: "TA0006", label: "Credential Access", value: 0.2, hint: "Stealing account names and passwords" },
    { tactic: "TA0007", label: "Discovery", value: 0.6, hint: "Exploring the environment" },
    { tactic: "TA0008", label: "Lateral Movement", value: 0.1, hint: "Moving through the environment" },
    { tactic: "TA0009", label: "Collection", value: 0.4, hint: "Gathering data of interest" },
    { tactic: "TA0010", label: "Exfiltration", value: 0.3, hint: "Stealing data" },
    { tactic: "TA0011", label: "Command and Control", value: 0.5, hint: "Communicating with compromised systems" },
    { tactic: "TA0040", label: "Impact", value: 0.2, hint: "Manipulate, interrupt, or destroy systems and data" }
];

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
    .domain([0, data.length])
    .range([0, 2 * Math.PI]);

const radiusScale = d3.scaleLinear()
    .domain([0, 1])
    .range([0, radius]);

const colorScale = d3.scaleSequential(d3.interpolateYlOrRd)
    .domain([0, 1]);

// Draw the circles
const circles = [0.2, 0.4, 0.6, 0.8, 1];
svg.selectAll(".circle")
    .data(circles)
    .join("circle")
    .attr("cx", 0)
    .attr("cy", 0)
    .attr("r", d => radiusScale(d))
    .attr("fill", "none")
    .attr("stroke", "#e0e0e0")
    .attr("stroke-width", 0.5);

// Draw the lines
const line = d3.lineRadial()
    .angle((d, i) => angleScale(i))
    .radius(d => radiusScale(d.value))
    .curve(d3.curveLinearClosed);

svg.append("path")
    .datum(data)
    .attr("d", line)
    .attr("fill", "none")
    .attr("stroke", "rgb(75, 192, 192)")
    .attr("stroke-width", 2);

// Add axes
svg.selectAll(".axis")
    .data(data)
    .join("line")
    .attr("x1", 0)
    .attr("y1", 0)
    .attr("x2", (d, i) => radiusScale(1) * Math.cos(angleScale(i) - Math.PI / 2))
    .attr("y2", (d, i) => radiusScale(1) * Math.sin(angleScale(i) - Math.PI / 2))
    .attr("stroke", "#e0e0e0")
    .attr("stroke-width", 0.5);

// Add labels
svg.selectAll(".label")
    .data(data)
    .join("text")
    .attr("x", (d, i) => radiusScale(1.15) * Math.cos(angleScale(i) - Math.PI / 2))
    .attr("y", (d, i) => radiusScale(1.15) * Math.sin(angleScale(i) - Math.PI / 2))
    .attr("dy", "0.35em")
    .attr("text-anchor", (d, i) => {
        const angle = angleScale(i);
        return (angle < Math.PI / 2 || angle > 3 * Math.PI / 2) ? "start" : "end";
    })
    .text(d => d.label)
    .attr("font-size", "10px")
    .attr("fill", "#333")
    .attr("alignment-baseline", "middle");

// Add dots at the data points with tooltips
svg.selectAll(".dot")
    .data(data)
    .join("circle")
    .attr("cx", (d, i) => radiusScale(d.value) * Math.cos(angleScale(i) - Math.PI / 2))
    .attr("cy", (d, i) => radiusScale(d.value) * Math.sin(angleScale(i) - Math.PI / 2))
    .attr("r", 6)
    .attr("fill", d => colorScale(d.value))
    .attr("stroke", "#fff")
    .attr("stroke-width", 1)
    .on("mouseover", function(event, d) {
        d3.select(this).attr("r", 8);
        tooltip.transition()
            .duration(200)
            .style("opacity", .9);
        tooltip.html(`<strong>${d.label}</strong><br/>
                      Tactic: ${d.tactic}<br/>
                      Value: ${d.value.toFixed(2)}<br/>
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

// Add legend
const legendItems = [
    { label: "Low", value: 0 },
    { label: "Medium", value: 0.5 },
    { label: "High", value: 1 }
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