export {drawCrowd};

function onLevelofPyramid(index){
    return Math.floor(( -1 + Math.sqrt(1 + 8 * index) ) / 2) + 1;
}

function indexInRow(index){
    return index - (onLevelofPyramid(index) * (onLevelofPyramid(index) - 1) / 2);
}

function drawCrowd(people) {
    const margin = {top: 0, right: 0, bottom: 0, left: 0};
	const width = 600 - margin.left - margin.right;
    const height = 600 - margin.top - margin.bottom;

    const crowdContainer = d3.select("#root").append("div").attr("id", "crowd-container");

    // Adding the svg element
    let svg = d3.select("#crowd-container")
                .append("svg")
                .attr("width", width)
                .attr("height", height)
                .attr("id", "crowd-svg");

    // Adding a group element for the crowd
    let crowd = svg.append("g").attr("class", "crowd");

    let r = 30;
    let epsilon = -5;
    let start_x = width / 2;
    let start_y = height - r;
    let x = (2 * r + epsilon) / Math.sqrt(2);
    
    const circles = crowd.selectAll("circle")
    .data(d3.range(people))
    .enter()
    .append("circle")
    .attr("cx", function(d, i) {
        let level = onLevelofPyramid(i);
        let rowIndex = indexInRow(i);
        let a = (2 * r + epsilon) * level;
        let distBtwCircles = Math.sqrt(2 * Math.pow(a, 2)) / level;
        // console.log("Index", i , "Level", level, "Row index", rowIndex, "a",a, "distBtwCircles", distBtwCircles);
        return start_x - level * x + rowIndex * distBtwCircles;
        })
    .attr("cy", function(d, i) {
        // console.log("Index", i , "Level", onLevelofPyramid(i), "Y", start_y - (onLevelofPyramid(i) * x));
        let level = onLevelofPyramid(i) - 1;
        return start_y - (level * x);
    })
    .attr("r", r)
    .attr("fill", "green")
    .attr("stroke", "blue")
    .attr("stroke-width", 2)
    .attr("z-index", function(d, i) { return people - i; });
}