export {drawBubbles};
function drawBubbles() {
    console.log("drawBubbles");
    bubbles();
}


function bubbles(){
    var width = 1000, height = 1000;
    const bubblesContainer = d3.select("#bubbles-container")
        .append("div")
        .attr("id", "bubbles-container")
        .style("position","relative");
    var svg = bubblesContainer
        .append("svg")
        .attr("height", height)
        .attr("width", width)
        .append("g")
        .attr("transform","translate(0,0)")
    

    const cornerBoxData = [
        { className: 'top-left', top: height / 8, left: width / 8, text: 'Human wellbeing' },
        { className: 'top-right', top: height / 8, left: width * (3/4), text: 'Climate Change' },
        { className: 'bottom-left', top:  height * (5/8), left: width / 8, text: 'Animal Welfare' },
        { className: 'bottom-right', top: height * (5/8), left:  width * (5/8), text: 'Creating a better future' }
    ];
    const causeAreaBox = bubblesContainer.append('div')
        .attr('class', 'cause-area-boxes');
    bubblesContainer.selectAll('.cause_area-box')
        .data(cornerBoxData)
        .join('div')
        .attr('class', 'cause_area-box')
        .style('position', 'absolute')
        .style('top', d => d.top ? d.top + 'px' : null)
        .style('bottom', d => d.bottom ? d.bottom + 'px' : null)
        .style('left', d => d.left ? d.left + 'px' : null)
        .style('right', d => d.right ? d.right + 'px' : null)
        .style('background-color', 'white')
        .style('border', '1px solid #ba2934')
        .style('padding', '10px')
        .style('font', 'sans-serif')
        .style('font-size', '20px')
        .style('opacity', '1.0') 
        .text(d => d.text);
    


    const button_cause = d3.select("#visuals")
        .append("button")
        .attr("id", "button_cause")
        .text("Cause Separation");
    const button_combine = d3.select("#visuals")
        .append("button")
        .attr("id", "combine")
        .text("Combine");

    // Add div elements for the four corners
 


    var defs = svg.append("defs"); 

    var radiusScale = d3.scaleSqrt().domain([10,50]).range([25,120])

    // the simulation is a collection of forces
    // about where we cant our circles to go
    // and how we want our circles to move
    // get them in the middle and don't let them collide 


    var forceX_Separate = d3.forceX(function(d)  {
        if(d.cause_area == 'Human wellbeing' || d.cause_area == 'Animal Welfare'){
            return width/4
        }else{
            return (width * (3/4))
        }}).strength(0.10)
    
    var forceX_Combine = d3.forceX(width / 2).strength(0.10)

    var forceY_Separate = d3.forceY(function(d)  {
        if(d.cause_area == 'Human wellbeing' || d.cause_area == 'Creating a better future'){
            return height/4
        }else{
            return (height * (3/4))
        }}).strength(0.10)


    var forceY_Combine = d3.forceY(d => height /2).strength(0.10)


    var simulation = d3.forceSimulation()
        .force("x", forceX_Combine)
        .force("y", forceY_Combine)
        .force("collide", d3.forceCollide(function(d) {
            return radiusScale(d.cost_effectiveness) +5
        }))


    d3.select("#button_cause").on('click', () => {
        simulation
            .force("x", forceX_Separate)
            .force("y", forceY_Separate)
            .alphaTarget(0.5)
            .restart();
        d3.select("#bubbles-container").selectAll('.cause_area-box')
            .style('opacity', '1.0');
        });

    d3.select("#combine").on('click', () => {
        simulation
            .force("x", forceX_Combine)
            .force("y", forceY_Combine)
            .alphaTarget(0.5)
            .restart();
        d3.select("#bubbles-container").selectAll('.cause_area-box')
            .style('opacity', '0.0');
        
    });

    d3.csv("static/data/charities.csv").then(ready);

    function ready(datapoints) {
        function ticked(){
            circles
                .attr('cx', d => d.x)
                .attr('cy', d => d.y);
/*             labels
                .attr('x', d => d.x)
                .attr('y', d => d.y)
                .text(d => d.name);  */
        }

    

        defs.selectAll(".artist-pattern")
            .data(datapoints)
            .join("pattern")
            .attr("class", "artist-pattern")
            .attr('id', d => d.id.toLowerCase().replace(/ /g, '-'))
            .attr("height","100%")
            .attr("width", "100%")
            .attr("patternContentUnits","objectBoundingBox")
            .append("image")
            .attr("height", 1)
            .attr("width", 1)
            .attr("preserveAspectRatio", "none")
            .attr("xmlns:xlink", "http://www.w3.org/1999/xlink")
            .attr("xlink:href", d =>  "static/data/images/" + d.image_path)


        const circles = svg.selectAll('.charity')
            .data(datapoints)
            .join('circle')
            .attr('class', 'charity')
            .attr('r', d => radiusScale(d.cost_effectiveness))
            .attr('fill', d => `url(#${d.id.toLowerCase().replace(/ /g, '-')})`)


            .on("mouseover", function(event, d) {
                // Create a box with some text when hovering over the circle
                var box = d3.select('body')
                    .append("div")
                    .attr("id", "charity-box")
                    .attr("class", "charity-box")
                    .style("left", event.pageX + "px")
                    .style("top", event.pageY + "px")

                box.style("width", "240px")
                    .style("height", "240px")
                    .text(`Name : ${d.name} Description : ${d.description}`);
                // Update the position of the box as the mouse moves
                d3.select('body')
                    .on("mousemove", function() {
                        box.style("left", event.pageX + "px")
                        .style("top", event.pageY + "px");
                    });
            })
			// Remove the box when moving the cursor out of the circle
            .on("mouseout", () =>
				d3.select('#charity-box').remove()
			);
          

        //text label
        
/*         const labels = svg.selectAll('.label')
            .data(datapoints)
            .join('text')
            .attr('class', 'label')
            .attr('text-anchor', 'middle')
            .attr('font-size', '10px')
            .attr('dy', '.35em')
            .text(d => d.name) */
        
        simulation.nodes(datapoints).on('tick', ticked)
        
    }
}

