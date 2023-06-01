export {drawLineChart};
export {Extract_data};

// Copyright 2021 Observable, Inc.
// Released under the ISC license.
// https://observablehq.com/@d3/line-chart


function drawLineChart(income, transitionDuration) {
    const height = 400;
    const marginLeft = 60;
    const marginRight = 30;
    const marginBottom = 30;
    const marginTop = 20;
    const width = document.getElementById("distribution-container").offsetWidth - marginLeft - marginRight;
    const sliderElement = document.getElementById("slider");
    let X, Y;

    d3.json("/static/data/income_centiles.json").then((data) => {
        [X,Y] = Extract_data(data, {
            x: d => d.percentage,
            y: d => d.international_dollars,
        });

        //keep only the y values smaller than the income
        Y = Y.filter(function(d) { return d < income; });
        //truncate X to make it the same length as Y
        X = X.slice(0, Y.length);

        const I = d3.range(X.length);
        let defined = (d, i) => !isNaN(X[i]) && !isNaN(Y[i]);
        const D = d3.map(data, defined);
        // Compute default domains.
        const xDomain = [0, d3.max(X)];
        const yDomain = [0, d3.max(Y)+5000];

        const xType = d3.scaleLinear;
        const yType = d3.scaleLinear;
        const xRange = [marginLeft, width - marginRight];
        const yRange = [height - marginBottom, marginTop];

        // Construct scales and axes.
        const xScale = xType(xDomain, xRange).nice();
        const yScale = yType(yDomain, yRange);

        LineChart(
            "Income (international dollars)", // yLabel
            "Percentage of world population [%]", // xLabel
            X, // the x-values
            Y, // the y-values
            xScale, // the x-scale
            yScale, // the y-scale
            I, // the indices of the defined values
            D, // the defined values
            width,
            height,
            marginLeft,
            marginRight,
            marginBottom,
            transitionDuration-1000,
        );

        setTimeout(() => {
            const svg = d3.select("#distribution-svg");
            svg.append('circle')
                .attr('cx', marginLeft)
                .attr('cy', height - marginBottom)
                .attr('r', 4)
                .style('fill', 'red')
                .attr('id', 'income-circle');
    
                sliderElement.noUiSlider.on("update", (values, handle) => {
                    let donation_fraq =Math.round(parseFloat(values[handle]))/100;
                    let new_income = income*(1-donation_fraq);

                    //find the new_income closest value to the new_income in the Y array
                    new_income = Y.reduce(function(prev, curr) {
                        return (Math.abs(curr - new_income) < Math.abs(prev - new_income) ? curr : prev);
                    });

                    //find the index of the new_income in the Y array
                    let new_percentile_index = Y.indexOf(new_income);
                    let new_percentile = X[new_percentile_index];
                    
    
                    //move the circle to the new position
                    const newx = xScale(new_percentile);
                    const newy = yScale(new_income);
                    d3.select("#income-circle")
                        .attr("cx", newx)
                        .attr("cy", newy);

                    d3.select("#new-income-text").remove();

                    svg.append("g")
                        .call(g => g.append("text")
                            .attr("x",  newx-170)
                            .attr("y", newy+2)
                            .attr("fill", "currentColor")
                            .attr("text-anchor", "start")
                            .attr("font-size", "14px")
                            .attr("color", "red")
                            .text('"Post-donation" income'))
                            .attr("id", 'new-income-text');
                });
    
            }, transitionDuration);
        
    });
      
};      
        
function Extract_data(data, {
    x = ([x]) => x, // given d in data, returns the (temporal) x-value
    y = ([, y]) => y, // given d in data, returns the (quantitative) y-value
    defined, // for gaps in data
    } = {}) {
        // Compute values.
        let X = d3.map(data, x);
        let Y = d3.map(data, y);
        return [X,Y];
};

function LineChart(
    yLabel,
    xLabel, // a label for the y-axis
    X, // the x-values
    Y, // the y-values
    xScale, // the x-scale
    yScale, // the y-scale
    I, // the indices of the defined values
    D, // the defined values
    width = 800, // outer width, in pixels
    height = 400, // outer height, in pixels
    marginLeft = 60, // left margin, in pixels
    marginRight = 30, // right margin, in pixels
    marginBottom = 30, // bottom margin, in pixels
    transitionDuration = 500, // transition duration, in milliseconds
    color = "currentColor", // stroke color of line
    strokeLinecap = "round", // stroke line cap of the line
    strokeLinejoin = "round", // stroke line join of the line
    strokeWidth = 1.5, // stroke width of line, in pixels
    strokeOpacity = 1, // stroke opacity of line
    curve = d3.curveLinear, // method of interpolation between points
    marginTop = 20, // top margin, in pixels    
    ) {
    // console.log(X);

    const xAxis = d3.axisBottom(xScale).ticks(width / 80).tickSizeOuter(0);
    //const yAxis = d3.axisLeft(yScale).ticks(height / 40, yFormat);
    const yAxis = d3.axisLeft(yScale).ticks(height / 40);


    // Construct a line generator.
    const line = d3.line()
        .defined(i => D[i])
        .curve(curve)
        .x(i => xScale(X[i]))
        .y(i => yScale(Y[i]));

    // Adding the svg element
    let svg = d3.select("#distribution-container")
                .append("svg")
                .attr("width", width)
                .attr("height", height)
                .attr("viewBox", [-10, -10, width, height+30])
                .attr("style", "max-width: 100%; height: auto; ")
                .attr("id", "distribution-svg");

    //Plot x axis
    svg.append("g")
        .attr("transform", `translate(0,${height - marginBottom})`)
        .call(xAxis)
        .call(g => g.select(".domain").remove())
        .call(g => g.append("text")
            .attr("x", width - 200)
            .attr("y", marginBottom+15)
            .attr("fill", "currentColor")
            .attr("text-anchor", "start")
            .attr("font-size", "12px")
            .text(xLabel));
    
    //plot y axis
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
            .attr("font-size", "12px")
            .text(yLabel));

    //This is for the black dot at the end of the line
    svg.append('defs')
        .append('marker')
        .attr('id', 'dot')
        .attr('viewBox', [0, 0, 20, 20])
        .attr('refX', 10)
        .attr('refY', 10)
        .attr('markerWidth', 10)
        .attr('markerHeight', 10)
        .append('circle')
        .attr('cx', 10)
        .attr('cy', 10)
        .attr('r', 4)
        .style('fill', 'black');

    //create the path
    let path = svg.append("path")
        .attr("fill", "none")
        .attr("stroke", color)
        .attr("stroke-width", strokeWidth)
        .attr("stroke-linecap", strokeLinecap)
        .attr("stroke-linejoin", strokeLinejoin)
        .attr("stroke-opacity", strokeOpacity)
        .attr("d", line(I))
        .attr('marker-end', 'url(#dot)') //This is for the black dot at the end of the line
        .attr('fill', 'none');

    // add a straight line from the black dot to the x-axis
    const last_x = xScale(X[I[I.length-1]]);
    const last_y = yScale(Y[I[I.length-1]]);
    console.log(last_x);
    console.log(last_y);
    svg.append("line")
        .attr("x1", last_x)
        .attr("y1", last_y)
        .attr("x2", last_x)
        .attr("y2", height - marginBottom)
        .attr("stroke-width", 1)
        .attr("stroke", "black")
        .attr("stroke-dasharray", "5,5");

    // get the last value of the X array
    let last_x_value = X[I[I.length-1]];
    // round the value to 1 decimal places
    last_x_value = Math.round(X[I[I.length-1]] * 10) / 10;
    // convert the value to string and add a % sign
    last_x_value = last_x_value.toString() + "%";
    
    svg.append("text")
        .attr("x", last_x)
        .attr("y", height - marginBottom + 28)
        .attr("fill", "currentColor")
        .attr("text-anchor", "middle")
        .attr("font-size", "14px")
        .attr("font-weight", "bold")
        .text(last_x_value);


    //create the path transition to show the line progressively
    const transitionPath = d3
    .transition()
    .ease(d3.easeSin)
    .duration(transitionDuration);

    // get the total length of the path
    let totalLength = path.node().getTotalLength();

    //set the stroke dasharray and offset to the total length to hide the line first
    //then transition the stroke dashoffset to 0 to show the line
    path
    .attr("stroke-dasharray", totalLength)
    .attr("stroke-dashoffset", totalLength)
    .transition(transitionPath)
    .attr("stroke-dashoffset", 0);

    //return svg.node();
  };
