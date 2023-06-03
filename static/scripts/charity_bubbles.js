export {
    drawCharityBubbles
};

function drawCharityBubbles() {
    // Define constants
    const width = 975,
        height = 500;
    const bubblesContainer = d3.select("#bubbles-container")
    const TRANS_DURATION = 1000;
    const SIZE_CIRCLE = 27;
    const CELL_BORDER_COLOR = "#ba2934";
    const CELL_INTERACTION_BORDER_COLOR = "#e8c52b";

    // Create a new paragraph element for narration
    const paragraph1 = document.createElement("p");
    paragraph1.textContent = "if you gave to effective charities";
    paragraph1.classList.add("font-bold", "text-3xl");

    // Append the paragraph element to the bubblesContainer
    bubblesContainer.node().appendChild(paragraph1);

    // Create the new paragraph that appears after animation
    const paragraph2 = document.createElement("p");
    paragraph2.textContent = "in different cause areas";
    paragraph2.classList.add("delay_paragraph", "font-bold", "text-3xl");

    // Set initial opacity to 0
    paragraph2.style.opacity = "0";
    bubblesContainer.node().appendChild(paragraph2);

    // the simulation is a collection of forces
    // about where we cant our circles to go
    // and how we want our circles to move

    // First define particular forces applied on the two axes that depend on the cause of the charity
    const forceX_Separate = d3.forceX(function(d) {
        let offset = 0;
        if (d.cause_area === 'Global Health and Development' || d.cause_area === 'Catastrophic Risks') {
            return width * (4 / 16) - 3 //- 60
        } else if (d.cause_area === 'Animal Welfare' || d.cause_area === 'Funds') {
            return width * (12 / 16) - 23 //- 75 
        }
        return offset
    }).strength(0.05)

    const forceY_Separate = d3.forceY(function(d) {
        if (d.cause_area == 'Global Health and Development' || d.cause_area == 'Animal Welfare') {

            return cornerBoxData[0].top + SIZE_CIRCLE * 1.8
        } else {
            return cornerBoxData[3].top + SIZE_CIRCLE * 1
        }
    }).strength(0.08)

    const forceX_Combine = d3.forceX(d => width / 2).strength(0.09)

    const forceY_Combine = d3.forceY(d => height / 2).strength(0.08)

    // Define the simulation, first get the forces in the middle and don't let them collide
    const simulation = d3.forceSimulation()
        .force("charge", d3.forceManyBody().strength(-(SIZE_CIRCLE) + 5))
        .force("x", forceX_Combine)
        .force("y", forceY_Combine)
        .force("collide", d3.forceCollide(() =>
            SIZE_CIRCLE + 3
        ));

    //Create svg
    var svg = bubblesContainer
        .append("svg")
        .attr("height", height)
        .attr("width", width)
        .style("background", "rgb(250 244 244)")
        .attr("stroke", "currentColor")
        .attr("stroke-width", 1.5);

    // Add div elements for the four corners
    var defs = svg.append("defs");

    // Data for the causes boxes
    const cornerBoxData = [{
            className: 'top-left',
            top: height * (4 / 16),
            left: width * (4 / 16),
            text: 'Global Health and Development',
            url: "https://www.givingwhatwecan.org/cause-areas/improving-human-wellbeing"
        },
        {
            className: 'top-right',
            top: height * (4 / 16),
            left: width * (12 / 16),
            text: 'Animal Welfare',
            url: "https://www.givingwhatwecan.org/cause-areas/animal-welfare"
        },
        {
            className: 'bottom-left',
            top: height * (12 / 16),
            left: width * (4 / 16),
            text: 'Catastrophic Risks Reduction',
            url: "https://www.givingwhatwecan.org/cause-areas/long-term-future"
        },
        {
            className: 'bottom-right',
            top: height * (12 / 16),
            left: width * (12 / 16),
            text: 'Funds',
            url: "https://www.givingwhatwecan.org/cause-areas#multiple-cause-areas"
        }
    ];

    // Append the cause boxes with 0 opacity
    bubblesContainer.selectAll('.cause_area-box')
        .data(cornerBoxData)
        .join('div')
        .attr('class', 'cause_area-box')
        .style('position', 'absolute')
        .style('text-align', 'center')
        .style('background-color', 'white')
        .style('border', '2px solid' + CELL_BORDER_COLOR)
        .style('font-weight', 'bold')
        .style('padding', '5px')
        .style('font', 'sans-serif')
        .style('font-size', '20px')
        .style("border-radius", "0.5rem")
        .style('cursor', 'pointer')
        .text(d => d.text)
        .each(function(d) {
            var textBox = this.getBoundingClientRect();
            var boxHeight = textBox.height;
            var boxWidth = textBox.width;
            d3.select(this)
                .style('top', d.top ? (d.top - (boxHeight / 2)) + 12 + 'px' : null)
                .style('left', d.left ? (d.left - (boxWidth / 2)) + 12 + 'px' : null);
        })
        .on("click", function(_,d) {
            // Open the URL in a new tab when clicking on the circle
            window.open(d.url, d.name);
        })
        .on("mouseover", function() {
            // Open the URL in a new tab when clicking on the circle
            d3.select(this)
                .style('border', '2px solid' + CELL_INTERACTION_BORDER_COLOR);
        })
        .on("mouseout", function() {
            // Open the URL in a new tab when clicking on the circle
            d3.select(this)
                .style('border', '2px solid' + CELL_BORDER_COLOR);
        })
        .style('opacity', '0') // Set initial opacity to 0
        .style('pointer-events', 'none')

    // State variable, the bubbles are initially not separated
    let separated_bubbles = false;

    // Call ready function when charities dataset is loaded
    d3.csv("static/data/charities.csv").then(ready);

    /**
     * Call when the dataset is loaded and ready for processing.
     *
     * @param {Array} datapoints - The dataset containing the data points to be processed.
     */
    function ready(datapoints) {

        // tick function updates circles position
        function ticked() {
            circles
                .attr('cx', d => d.x)
                .attr('cy', d => d.y);
        }


        // Feed definitions to add images to circles, from images folder
        defs.selectAll(".artist-pattern")
            .data(datapoints)
            .join("pattern")
            .attr("class", "artist-pattern")
            .attr('id', d => d.id.toLowerCase().replace(/ /g, '-'))
            .attr("height", "100%")
            .attr("width", "100%")
            .attr("patternContentUnits", "objectBoundingBox")
            .append("image")
            .attr("height", 1)
            .attr("width", 1)
            .attr("preserveAspectRatio", "none")
            .attr("xmlns:xlink", "http://www.w3.org/1999/xlink")
            .attr("xlink:href", d => "static/data/images/" + d.image_path)

        /**
         * Join the data points with the circles and apply various attributes and event listeners.
         *
         * @param {Array} datapoints - The dataset containing the data points to be joined with the circles.
         * @returns {Selection} circles - The selection of circles joined with the data points.
         */
        function join_circles(datapoints) {
            var circles = svg.selectAll('.charity')
                .data(datapoints)
                .join('circle')
                .attr('class', 'charity')
                .attr('r', () => SIZE_CIRCLE)
                .attr('fill', d => `url(#${d.id.toLowerCase().replace(/ /g, '-')})`)
                .style('cursor', 'pointer')
                .style('stroke', CELL_BORDER_COLOR) // Set the initial border color to current color
                .style('stroke-width', '3px')
                .on("mouseover", function(event, d) {
                    //modularize this
                    // Create a box with some text when hovering over the circle
                    mouseover_charity_bubbles(event, d);
                    //Change the border color
                    d3.select(this).style('stroke', CELL_INTERACTION_BORDER_COLOR);
                })

                // Remove the box when moving the cursor out of the circle
                .on("mouseout", function() {
                    d3.select('#charity_info_box').remove()
                    d3.select(this)
                        .style('stroke', CELL_BORDER_COLOR);
                })
                .on("click", function(_, d) {
                    // Open the URL in a new tab when clicking on the circle
                    window.open(d.url, d.name);
                });
            return circles
        }

        var circles = join_circles(datapoints);

        // Separate the bubbles using force
        function separate_bubbles() {
            simulation
                .nodes(datapoints)
                .force("center", null)
                .force("x", forceX_Separate)
                .force("y", forceY_Separate)
                .alphaTarget(0.5)
                .restart();
            separated_bubbles = true
        }

        // Launch simulation
        simulation.nodes(datapoints).on('tick', ticked)

        /* The event occurs when the charity bubbles container is loaded, 
        the goal is to delay the appearance of area boxes and the separation of bubbles */
        document.addEventListener("bubblesContainerEvent", function() {
            // Perform desired action when the event is triggered
            bubblesContainer.selectAll('.cause_area-box')
                .transition() // Apply transition
                .duration(4000)
                .delay(4000) // Delay for 5 seconds
                .style('opacity', '1')
                .style('pointer-events', 'auto'); // Change opacity to 1
            // separate bubbles
            setTimeout(() => {
                separate_bubbles();
            }, 4000);

            // Apply transition on upper paragraph
            paragraph2.style.transition = "opacity 4.5s 3s";
            paragraph2.style.opacity = "1";
        });
        // add some useful instructoin 
        bubblesContainer.append("p").text("(Hover over bubbles for more details and click on any cell to open the corresponding website)");
    }
}

/**
 * Event handler for hovering over charity bubbles.
 *
 * @param {Event} event - The mouseover event object.
 * @param {Object} d - The data point associated with the hovered circle.
 */
function mouseover_charity_bubbles(event, d) {
    var box = d3.select('body')
        .append("div")
        .attr("id", "charity_info_box")
        .style("position", "absolute")
    box.style("width", "240px")
        .style("height", "auto")
        .style("background-color", "white")
        .style("border", "1px solid black")
        .style("padding", "8px")
        .style("border-radius", "0.5rem")
        .style("font-family", "'Metropolis', sans-serif;")
        .style("font-size", "14px")
        .html(`<span style="font-weight: bold;">${d.name}</span><br> ${d.description}`);

    // Update the position of the box as the mouse moves
    function place_info_box_coordinates(event) {
        var mouseX = event.pageX;
        var mouseY = event.pageY;
        let windowHeight = document.body.clientHeight;
        var boxHeight = box.node().clientHeight;
        // In case the cursor is at critical button of the page
        if (mouseY + boxHeight > windowHeight) {
            box.style('left', mouseX + 'px')
                .style('top', (mouseY - boxHeight) + 'px');
        } else {
            box.style('left', mouseX + 'px')
                .style('top', mouseY + 'px');
        }
    }
    place_info_box_coordinates(event)
    d3.select('body')
        .on("mousemove", function(event) {
            place_info_box_coordinates(event)
        })
}