<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MITRE ATT&CK Tactics Radar Chart</title>
    <script src="https://d3js.org/d3.v7.min.js"></script>
    <style>
        body { font-family: Arial, sans-serif; }
        #chart { width: 800px; height: 600px; margin: 0 auto; }
    </style>
</head>
<body>
    <div id="chart"></div>
    <script>
        const data = [
            { tactic: "TA0001: Initial Access", value: 0.6 },
            { tactic: "TA0002: Execution", value: 0.4 },
            { tactic: "TA0003: Persistence", value: 0.7 },
            { tactic: "TA0004: Privilege Escalation", value: 0.3 },
            { tactic: "TA0005: Defense Evasion", value: 0.5 },
            { tactic: "TA0006: Credential Access", value: 0.2 },
            { tactic: "TA0007: Discovery", value: 0.6 },
            { tactic: "TA0008: Lateral Movement", value: 0.1 },
            { tactic: "TA0009: Collection", value: 0.4 },
            { tactic: "TA0010: Exfiltration", value: 0.3 },
            { tactic: "TA0011: Command and Control", value: 0.5 },
            { tactic: "TA0040: Impact", value: 0.2 }
        ];

        const width = 800;
        const height = 600;
        const radius = Math.min(width, height) / 2 - 100;

        const svg = d3.select("#chart")
            .append("svg")
            .attr("width", width)
            .attr("height", height)
            .append("g")
            .attr("transform", `translate(${width/2},${height/2})`);

        const angleScale = d3.scaleLinear()
            .domain([0, data.length])
            .range([0, 2 * Math.PI]);

        const radiusScale = d3.scaleLinear()
            .domain([0, 1])
            .range([0, radius]);

        // Draw the circles
        const circles = [0.2, 0.4, 0.6, 0.8, 1];
        svg.selectAll(".circle")
            .data(circles)
            .join("circle")
            .attr("cx", 0)
            .attr("cy", 0)
            .attr("r", d => radiusScale(d))
            .attr("fill", "none")
            .attr("stroke", "#ccc");

        // Draw the lines
        const line = d3.lineRadial()
            .angle((d, i) => angleScale(i))
            .radius(d => radiusScale(d.value))
            .curve(d3.curveLinearClosed);  // Use curveLinearClosed to close the shape

        svg.append("path")
            .datum(data)
            .attr("d", line)
            .attr("fill", "rgba(255, 99, 132, 0.2)")
            .attr("stroke", "rgb(255, 99, 132)")
            .attr("stroke-width", 2);

        // Add axes
        svg.selectAll(".axis")
            .data(data)
            .join("line")
            .attr("x1", 0)
            .attr("y1", 0)
            .attr("x2", (d, i) => radiusScale(1) * Math.cos(angleScale(i) - Math.PI / 2))
            .attr("y2", (d, i) => radiusScale(1) * Math.sin(angleScale(i) - Math.PI / 2))
            .attr("stroke", "#999")
            .attr("stroke-width", 1);

        // Add labels
        svg.selectAll(".label")
            .data(data)
            .join("text")
            .attr("x", (d, i) => radiusScale(1.3) * Math.cos(angleScale(i) - Math.PI / 2))
            .attr("y", (d, i) => radiusScale(1.3) * Math.sin(angleScale(i) - Math.PI / 2))
            .attr("dy", "0.35em")
            .attr("text-anchor", (d, i) => {
                const angle = angleScale(i);
                return (angle < Math.PI / 2 || angle > 3 * Math.PI / 2) ? "start" : "end";
            })
            .text(d => d.tactic)
            .attr("font-size", "10px")
            .attr("alignment-baseline", "middle");

        // Add dots at the data points
        svg.selectAll(".dot")
            .data(data)
            .join("circle")
            .attr("cx", (d, i) => radiusScale(d.value) * Math.cos(angleScale(i) - Math.PI / 2))
            .attr("cy", (d, i) => radiusScale(d.value) * Math.sin(angleScale(i) - Math.PI / 2))
            .attr("r", 4)
            .attr("fill", "rgb(255, 99, 132)");