export { drawGroups };

function drawGroups() {
    //print in console
    console.log("drawGroups");

    let circles = d3.packSiblings(d3.range(2000)
        .map(d3.randomUniform(8, 26))
        .map(r => ({r})))
        .filter(d => -500 < d.x && d.x < 500 && -500 < d.y && d.y < 500);

  
    let color = d3.scaleSequential([0, 2 * Math.PI], d3.interpolateRainbow);
    let width = 954;
    let height = 954;
    let size = Math.max(width, height);

    const distributionContainer = d3.select("#visuals").append("div").attr("id", "bubbleGroup-container");

    // Adding the svg element
    let svg = d3.select("#distribution-container")
        .append("svg")
        .attr("viewBox", [-width / 2, -height / 2, width, height])
        .style("background", "#333")
        .attr("stroke", "currentColor")
        .attr("stroke-width", 1.5)
        .attr("id", "bubblegroups-svg");

    svg.selectAll("circle")
        .data(circles)
        .join("circle")
        .attr("fill", d => color(d.angle = Math.atan2(d.y, d.x)))
        .attr("cx", d => Math.cos(d.angle) * (size / Math.SQRT2 + 30))
        .attr("cy", d => Math.sin(d.angle) * (size / Math.SQRT2 + 30))
        .attr("r", d => d.r - 0.25)
        .transition()
        .ease(d3.easeCubicOut)
        .delay(d => Math.sqrt(d.x * d.x + d.y * d.y) * 10)
        .duration(1000)
        .attr("cx", d => d.x)
        .attr("cy", d => d.y);

    console.log("Groups drawned");

    }