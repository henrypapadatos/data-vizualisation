export {drawLineChart};

// Copyright 2021 Observable, Inc.
// Released under the ISC license.
// https://observablehq.com/@d3/line-chart
function drawLineChart(income) {
    console.log("drawLineChart");
    d3.json("/static/data/income_centiles.json").then((data) => {
        let line_chart = LineChart(data, {
            income: income,
            x: d => d.percentage,
            y: d => d.international_dollars,
            yLabel: "Income (international dollars)",
            xLabel: "Percentage of world population [%]",
        });
    });
    // const distributionContainer = d3.select("#root").append("div").attr("id", "distribution-container");

    // d3.select('distribution-container').append('line_chart');

	// Adding the line_chart element
    

};


function LineChart(data, {
    income, // income of the user
    x = ([x]) => x, // given d in data, returns the (temporal) x-value
    y = ([, y]) => y, // given d in data, returns the (quantitative) y-value
    defined, // for gaps in data
    curve = d3.curveLinear, // method of interpolation between points
    marginTop = 20, // top margin, in pixels
    marginRight = 30, // right margin, in pixels
    marginBottom = 30, // bottom margin, in pixels
    marginLeft = 60, // left margin, in pixels
    width = 800, // outer width, in pixels
    height = 400, // outer height, in pixels
    xType = d3.scaleLinear, // the x-scale type
    xDomain, // [xmin, xmax]
    xRange = [marginLeft, width - marginRight], // [left, right]
    xLabel,
    yType = d3.scaleLinear, // the y-scale type
    yDomain, // [ymin, ymax]
    yRange = [height - marginBottom, marginTop], // [bottom, top]
    yFormat, // a format specifier string for the y-axis
    yLabel, // a label for the y-axis
    color = "currentColor", // stroke color of line
    strokeLinecap = "round", // stroke line cap of the line
    strokeLinejoin = "round", // stroke line join of the line
    strokeWidth = 1.5, // stroke width of line, in pixels
    strokeOpacity = 1, // stroke opacity of line
  } = {}) {

    width = document.getElementById("distribution-container").offsetWidth - marginLeft - marginRight;
    //height = width*0.6;
    // Compute values.
    let X = d3.map(data, x);
    let Y = d3.map(data, y);

    //keep onnly the y values smaller than the income
    Y = Y.filter(function(d) { return d < income; });
    //truncate X to make it the same length as Y
    X = X.slice(0, Y.length);

    const I = d3.range(X.length);
    if (defined === undefined) defined = (d, i) => !isNaN(X[i]) && !isNaN(Y[i]);
    const D = d3.map(data, defined);
    // Compute default domains.
    if (xDomain === undefined) xDomain = [0, d3.max(X)];
    if (yDomain === undefined) yDomain = [0, d3.max(Y)+5000];

    // Construct scales and axes.
    const xScale = xType(xDomain, xRange).nice();
    const yScale = yType(yDomain, yRange);
    const xAxis = d3.axisBottom(xScale).ticks(width / 80).tickSizeOuter(0);
    const yAxis = d3.axisLeft(yScale).ticks(height / 40, yFormat);
  
    // Construct a line generator.
    const line = d3.line()
        .defined(i => D[i])
        .curve(curve)
        .x(i => xScale(X[i]))
        .y(i => yScale(Y[i]));

    const distributionContainer = d3.select("#distribution-container");

    // Adding the svg element
    let svg = d3.select("#distribution-container")
                .append("svg")
                .attr("width", width)
                .attr("height", height)
                .attr("viewBox", [-10, -10, width, height+20])
                .attr("style", "max-width: 100%; height: auto; ")
                .attr("id", "map-svg");
  
    // const svg = d3.create("svg")
    //     .attr("width", width)
    //     .attr("height", height)
    //     .attr("viewBox", [0, 0, width, height])
    //     .attr("style", "max-width: 100%; height: auto; height: intrinsic;");
  
    svg.append("g")
        .attr("transform", `translate(0,${height - marginBottom})`)
        .call(xAxis)
        .call(g => g.select(".domain").remove())
        .call(g => g.append("text")
            .attr("x", width - 150)
            .attr("y", marginBottom)
            .attr("fill", "currentColor")
            .attr("text-anchor", "start")
            .text(xLabel));
    
    svg.append("g")
        .attr("transform", `translate(${marginLeft},0)`)
        .call(yAxis)
        .call(g => g.select(".domain").remove())
        .call(g => g.selectAll(".tick line").clone()
            .attr("x2", width - marginLeft - marginRight)
            .attr("stroke-opacity", 0.1))
        .call(g => g.append("text")
            .attr("x", -marginLeft)
            .attr("y", marginTop-5)
            .attr("fill", "currentColor")
            .attr("text-anchor", "start")
            .text(yLabel));
  
    let path = svg.append("path")
        .attr("fill", "none")
        .attr("stroke", color)
        .attr("stroke-width", strokeWidth)
        .attr("stroke-linecap", strokeLinecap)
        .attr("stroke-linejoin", strokeLinejoin)
        .attr("stroke-opacity", strokeOpacity)
        .attr("d", line(I));
        
    //create the path transition to show the line progressively
    const transitionPath = d3
    .transition()
    .ease(d3.easeSin)
    .duration(2500);

    // get the total length of the path
    let totalLength = path.node().getTotalLength();

    //set the stroke dasharray and offset to the total length to hide the line first
    //then transition the stroke dashoffset to 0 to show the line
    path
    .attr("stroke-dasharray", totalLength)
    .attr("stroke-dashoffset", totalLength)
    .transition(transitionPath)
    .attr("stroke-dashoffset", 0);

    return svg.node();
  };