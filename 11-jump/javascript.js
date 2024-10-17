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

// Define margins for the bar chart
const margins = { top: 50, right: 50, bottom: 50, left: 150 };

// Main SVG container
const svg = d3.select("#chart")
    .append("svg")
    .attr("id", "chart-svg")
    .attr("viewBox", `0 0 ${width} ${height}`)
    .attr("preserveAspectRatio", "xMidYMid meet");

const radarGroup = svg.append("g")
    .attr("id", "radar-group")
    .attr("transform", `translate(${width/2},${height/2})`);

const barGroup = svg.append("g")
    .attr("id", "bar-group")
    .attr("transform", `translate(${margins.left}, ${margins.top})`)
    .style("display", "none"); // Hide bar chart initially

const tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

// Radar Chart Scales and Generators
const angleScale = d3.scaleLinear()
    .domain([0, baseData.length])
    .range([0, 2 * Math.PI]);

let radiusScale = d3.scaleLinear()
    .domain([0, maxValues['24h']])
    .range([0, radius]);

// Bar Chart Scales
const xScaleBar = d3.scaleLinear()
    .range([0, width - margins.left - margins.right]); // Adjusted for margins

const yScaleBar = d3.scaleBand()
    .domain(baseData.map(d => d.label))
    .range([0, height - margins.top - margins.bottom])
    .padding(0.1);

// Color Scale (will be defined dynamically)
let colorScale;

// Draw the radar chart components
function drawRadarChart(data, maxValue) {
    // Update scales
    radiusScale.domain([0, maxValue]);

    // Calculate min and max values for color scaling
    const values = data.map(d => d.value);
    const minValue = d3.min(values);
    const maxValueInData = d3.max(values);

    // Define colorScale dynamically based on current data range
    colorScale = d3.scaleLinear()
        .domain([minValue, maxValueInData])
        .range(["#FF8C00", "#8B0000"]); // From medium dark orange to dark red

    // Update circles
    const circleData = [0.2, 0.4, 0.6, 0.8, 1];
    const circles = radarGroup.selectAll(".circle")
        .data(circleData);

    circles.join(
        enter => enter.append("circle")
            .attr("class", "circle")
            .attr("cx", 0)
            .attr("cy", 0)
            .attr("fill", "none")
            .attr("stroke", "#e0e0e0")
            .attr("stroke-width", 0.5)
            .attr("r", d => radiusScale(d * maxValue)),
        update => update.transition()
            .duration(1000)
            .attr("r", d => radiusScale(d * maxValue)),
        exit => exit.remove()
    );

    // Update circle labels
    const circleLabels = radarGroup.selectAll(".circle-label")
        .data(circleData);

    circleLabels.join(
        enter => enter.append("text")
            .attr("class", "circle-label")
            .attr("x", 5)
            .attr("fill", "#666")
            .attr("font-size", "10px")
            .attr("y", d => -radiusScale(d * maxValue))
            .text(d => Math.round(d * maxValue)),
        update => update.transition()
            .duration(1000)
            .attr("y", d => -radiusScale(d * maxValue))
            .text(d => Math.round(d * maxValue)),
        exit => exit.remove()
    );

    // Only create axes and labels once
    if (radarGroup.selectAll(".axis").empty()) {
        // Add axes
        radarGroup.selectAll(".axis")
            .data(baseData)
            .enter()
            .append("line")
            .attr("class", "axis")
            .attr("x1", 0)
            .attr("y1", 0)
            .attr("x2", (d, i) => radius * Math.cos(angleScale(i) - Math.PI / 2))
            .attr("y2", (d, i) => radius * Math.sin(angleScale(i) - Math.PI / 2))
            .attr("stroke", "#e0e0e0")
            .attr("stroke-width", 0.5);

        // Add labels
        radarGroup.selectAll(".label")
            .data(baseData)
            .enter()
            .append("text")
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
    }

    // Update the radar line
    const radarLineGenerator = d3.lineRadial()
        .angle((d, i) => angleScale(i))
        .radius(d => radiusScale(d.value))
        .curve(d3.curveLinearClosed);

    const radarLine = radarGroup.selectAll(".radarLine")
        .data([data]);

    radarLine.join(
        enter => enter.append("path")
            .attr("class", "radarLine")
            .attr("fill", "none")
            .attr("stroke", "#FF8C00")
            .attr("stroke-width", 2)
            .attr("d", radarLineGenerator),
        update => update.transition()
            .duration(1000)
            .attr("d", radarLineGenerator),
        exit => exit.remove()
    );

    // Update the data points
    const dots = radarGroup.selectAll(".dot")
        .data(data);

    dots.join(
        enter => enter.append("circle")
            .attr("class", "dot")
            .attr("r", 6)
            .attr("stroke", "#fff")
            .attr("stroke-width", 1)
            .attr("cx", (d, i) => radiusScale(d.value) * Math.cos(angleScale(i) - Math.PI / 2))
            .attr("cy", (d, i) => radiusScale(d.value) * Math.sin(angleScale(i) - Math.PI / 2))
            .attr("fill", d => colorScale(d.value))
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
            }),
        update => update.transition()
            .duration(1000)
            .attr("cx", (d, i) => radiusScale(d.value) * Math.cos(angleScale(i) - Math.PI / 2))
            .attr("cy", (d, i) => radiusScale(d.value) * Math.sin(angleScale(i) - Math.PI / 2))
            .attr("fill", d => colorScale(d.value)),
        exit => exit.remove()
    );
}


// Draw the bar chart components
function drawBarChart(data, maxValue) {
    // Update scales
    xScaleBar.domain([0, maxValue]);

    // Calculate min and max values for color scaling
    const values = data.map(d => d.value);
    const minValue = d3.min(values);
    const maxValueInData = d3.max(values);

    // Define colorScale dynamically based on current data range
    colorScale = d3.scaleLinear()
        .domain([minValue, maxValueInData])
        .range(["#FF8C00", "#8B0000"]); // From medium dark orange to dark red

    // Update yScaleBar domain if needed (if data changes dynamically)
    yScaleBar.domain(data.map(d => d.label));

    // Clear previous content
    barGroup.selectAll("*").remove();

    // Draw axes
    const xAxis = d3.axisBottom(xScaleBar).ticks(5);
    const yAxis = d3.axisLeft(yScaleBar);

    barGroup.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0, ${height - margins.top - margins.bottom})`)
        .call(xAxis);

    barGroup.append("g")
        .attr("class", "y-axis")
        .call(yAxis);

    // Draw bars
    barGroup.selectAll(".bar")
        .data(data)
        .join(
            enter => enter.append("rect")
                .attr("class", "bar")
                .attr("y", d => yScaleBar(d.label))
                .attr("height", yScaleBar.bandwidth())
                .attr("x", 0)
                .attr("width", 0) // Start width at 0 for transition
                .attr("fill", d => colorScale(d.value))
                .call(enter => enter.transition()
                    .duration(1000)
                    .attr("width", d => xScaleBar(d.value))
                ),
            update => update
                .call(update => update.transition()
                    .duration(1000)
                    .attr("width", d => xScaleBar(d.value))
                    .attr("fill", d => colorScale(d.value))
                )
        )
        .on("mouseover", function(event, d) {
            d3.select(this).attr("fill", d3.rgb(colorScale(d.value)).darker(1));
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
        .on("mouseout", function(event, d) {
            d3.select(this).attr("fill", colorScale(d.value));
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        });

    // Add value labels to the bars
    barGroup.selectAll(".bar-label")
        .data(data)
        .enter()
        .append("text")
        .attr("class", "bar-label")
        .attr("y", d => yScaleBar(d.label) + yScaleBar.bandwidth() / 2)
        .attr("x", d => xScaleBar(d.value) + 5) // Position to the right of the bar
        .attr("dy", "0.35em")
        .attr("fill", "#333")
        .attr("font-size", "10px")
        .text(d => d.value)
        .style("opacity", 0)
        .transition()
        .delay(1000)
        .duration(500)
        .style("opacity", 1);
}

// Function to update charts based on timeframe
function updateChart(timeframe) {
    const data = datasets[timeframe];
    const maxValue = maxValues[timeframe];

    // Update both charts
    if (currentChartType === 'radar') {
        drawRadarChart(data, maxValue);
    } else {
        drawBarChart(data, maxValue);
    }
}

// Function to toggle between charts
let currentChartType = 'radar';

function toggleChart(chartType) {
    if (chartType === currentChartType) return; // No change

    currentChartType = chartType;

    if (chartType === 'radar') {
        radarGroup.style("display", null);
        barGroup.style("display", "none");
    } else {
        radarGroup.style("display", "none");
        barGroup.style("display", null);
    }
    updateChart(currentTimeframe);
}

// Variable to keep track of the current timeframe
let currentTimeframe = '24h';

// Initialize with 24-hour data
updateChart(currentTimeframe);

// Update the current timeframe and chart when buttons are clicked
function updateTimeframe(timeframe) {
    currentTimeframe = timeframe;
    updateChart(timeframe);
}
