export {drawCrowdofPeople};

function onLevelofPyramid(index){
    return Math.floor(( -1 + Math.sqrt(1 + 8 * index) ) / 2) + 1;
}

function indexInRow(index){
    return index - (onLevelofPyramid(index) * (onLevelofPyramid(index) - 1) / 2);
}

function drawCrowdofCircles(people) {
    const margin = {top: 0, right: 0, bottom: 0, left: 0};
    const parentElement = document.getElementById("crowd-container")
	const width = parentElement.offsetWidth; 
    const height = 400 - margin.top - margin.bottom;

    const crowdContainer = d3.select("#crowd-container");

    // Adding the svg element
    let svg = crowdContainer
                .append("svg")
                .attr("width", "100%")
                .attr("height", height)
                .attr("id", "crowd-svg");

    // Adding a group element for the crowd
    let crowd = svg.append("g")
                    .attr("class", "pb-5");

    let r = 20;
    const bottomPadding = height * 0.25;
    let epsilon = -10;
    let start_x = width / 2;
    let start_y = height - r - bottomPadding;
    let x = (2 * r + epsilon) / Math.sqrt(2);
    const colors = ["light-yellow", "yellow", "orange", "red", "pink", "purple", "dark-purple", "darkest-purple"]
    let availableRowIndexes = [];

    const circles = crowd.selectAll("circle")
        .data(d3.range(people))
        .enter()
        .append("circle")
        .attr("id", "crowd-circle")
        .attr("cx", function(d, i) {
            let level = onLevelofPyramid(i);
            let naturalRowIndex = indexInRow(i);
            if (naturalRowIndex == 0) {
                availableRowIndexes = d3.range(level);
            }
            let randomRowIndex = availableRowIndexes[Math.floor(Math.random() * availableRowIndexes.length)];
            availableRowIndexes = availableRowIndexes.filter(function(value, index, arr){
                return value != randomRowIndex;
            });
            let a = (2 * r + epsilon) * level;
            let distBtwCircles = Math.sqrt(2 * Math.pow(a, 2)) / level;
            
            return start_x - level * x + randomRowIndex * distBtwCircles;
            })
        .attr("cy", function(d, i) {
            let level = onLevelofPyramid(i) - 1;
            return start_y - (level * x) - epsilon * level;
        })
        .attr("r", 0)
        .sort(function(a, b) { 
            return onLevelofPyramid(b) - onLevelofPyramid(a);
        })
        .style("z-index", function(d, i) { 
            return -onLevelofPyramid(i); 
        })
        .style("fill", function () {
            return `var(--${colors[Math.floor(Math.random() * colors.length)]})`
        })
        .style("stroke", "var(--black)")
        .style("stroke-width", 1)
        .transition()
        .duration(500)
        .delay(function(d, i) {
            let level = onLevelofPyramid(i);
            let rowIndex = indexInRow(i);
            return (people - level * (level + 1) / 2 - rowIndex) * 100;
        })
        .attr("r", r);
}

function createEventListener(householdIncome) {
    const sliderElement = document.getElementById("slider");
    const crowdContainer = document.getElementById("crowd-container")
 
	sliderElement.addEventListener('mouseup', () => {
        crowdContainer.innerHTML = "";
        drawCrowdofPeople(householdIncome);
    })
}

function drawCrowdofPeople(householdIncome) {
    createEventListener(householdIncome);

    const COST_OF_SAVING_A_LIFE = 4500;

    const margin = {top: 0, right: 0, bottom: 0, left: 0};
    const parentElement = document.getElementById("crowd-container")
    const height = 400 - margin.top - margin.bottom;
    const parentWidth = parentElement.clientWidth; 

    const donationAmount = parseInt(document.getElementById("value-bubble").innerText.slice(0, -1));
    let people = (householdIncome * (donationAmount / 100) / COST_OF_SAVING_A_LIFE * 10).toFixed(1);

    const r = 40;
    // const scale = 0.008
    const epsilon = -10;
    const start_x = parentWidth / 2;
    const start_y = height * 0.15;
    const x_spacing = (2 * r + epsilon) / Math.sqrt(2);
    const colors = ["light-yellow", "yellow", "orange", "red", "pink", "purple", "dark-purple", "darkest-purple"]
    const stickfigure = "M 3026 12790 c -654 -83 -1182 -573 -1305 -1214 c -44 -224 -37 -438 19 -661 c 126 -501 503 -903 1000 -1065 c 106 -35 154 -45 310 -69 c 32 -5 -323 -9 -856 -10 c -869 -1 -914 -2 -987 -21 c -176 -45 -329 -134 -470 -275 c -167 -167 -299 -403 -352 -630 c -34 -147 -36 -271 -33 -1985 l 3 -1695 l 480 0 l 480 0 l 3 1688 l 2 1687 l 160 0 l 160 0 l 2 -4267 l 3 -4268 l 702 -3 l 703 -2 l 2 2291 l 3 2290 l 145 0 l 145 0 l 3 -2290 l 2 -2291 l 703 2 l 702 3 l 3 4268 l 2 4267 l 160 0 l 160 0 l 2 -1687 l 3 -1688 l 480 0 l 480 0 l 0 1745 c 0 1633 -1 1751 -18 1840 c -77 406 -331 770 -651 930 c -189 94 -130 90 -1165 91 c -596 1 -884 5 -841 11 c 414 58 741 235 994 538 c 379 451 458 1092 202 1623 c -76 157 -158 271 -295 408 c -227 226 -468 357 -775 420 c -114 23 -357 33 -470 19 z"
    let availableRowIndexes = [];
    
    let scale = 0.008
    if (people < 10) {
        scale = 0.016
    }
    else if (people < 20) {
        scale = 0.012
    }

    d3.select("#crowd-container")
        .append("p")
        .attr("class", "text-4xl font-bold")
        .text("... saving the lives of ...")

    // Adding the svg element
    let svg = d3.select("#crowd-container")
                .append("svg")
                .attr("width", "100%")
                .attr("height", height)
                .attr("id", "crowd-svg")
                .style("padding-top", "50px");

    // Adding a group element for the crowd
    let crowd = svg.append("g")
                    .attr("class", "pb-5 h-full w-full")
                    .attr("transform", `matrix(${scale} 0 0 -${scale} ${parentWidth} ${height})`);

    // Adding the crowd of people
    const drawings = crowd.selectAll("path")
        .data(d3.range(people))
        .enter()
        .append("path")
        .attr("id", "person")
        .attr("d", stickfigure)
        .style("transform", function(d, i) {
            let level = onLevelofPyramid(i);
            let naturalRowIndex = indexInRow(i);
            
            if (naturalRowIndex == 0) {
                availableRowIndexes = d3.range(level);
            }
            
            let randomRowIndex = availableRowIndexes[Math.floor(Math.random() * availableRowIndexes.length)];
            
            availableRowIndexes = availableRowIndexes.filter(function(value, index, arr){
                return value != randomRowIndex;
            });
            let a = (2 * r + epsilon) * level;
            let distBtwCircles = Math.sqrt(2 * Math.pow(a, 2)) / level;
            let translate_x = (-start_x - level * x_spacing  + randomRowIndex * distBtwCircles) / scale;
            let translate_y = (start_y - epsilon * level) / scale;

            // Squished closer together version
            // let translate_y = start_y - (level * x * 25) - epsilon * level / scale;
            return `translate(${translate_x}px,${translate_y}px)`;
        })
        .sort(function(a, b) { 
            return onLevelofPyramid(b) - onLevelofPyramid(a);
        })
        .style("z-index", function(d, i) { 
            return -onLevelofPyramid(i); 
        })
        .style("fill", function () {
            return `var(--${colors[Math.floor(Math.random() * colors.length)]})`
        })
        .style("stroke", "black")
        .style("stroke-width", 0.5 / scale)
        .style("opacity", 0)
        .transition()
        .duration(500)
        .delay(function(d, i) {
            let level = onLevelofPyramid(i);
            let rowIndex = indexInRow(i);
            return (people - level * (level + 1) / 2 - rowIndex) * 100;
        })
        .style("opacity", 1)
    

    // Adding the text
    d3.select("#crowd-container")
        .append("p")
        .attr("id", "crowd-text")
        .attr("class", "font-bold text-4xl")
        .text("... " + people + " people every 10 years ...")

}