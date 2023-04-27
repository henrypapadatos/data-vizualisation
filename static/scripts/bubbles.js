function drawBubbles() {
    console.log("drawBubbles");
    bubbles();
}

function bubbles(){
    var width = 700, height = 700;
    const bubblesContainer = d3.select("#visuals")
        .append("div")
        .attr("id", "bubbles-container");
    var svg = bubblesContainer
        .append("svg")
        .attr("height", height)
        .attr("width", width)
        .append("g")
        .attr("transform","translate(0,0)")

    var radiusScale = d3.scaleSqrt().domain([10,50]).range([60,140])

    // the simulation is a collection of forces
    // about where we cant our circles to go
    // and how we want our circles to move
    // step one get in middle 
    // step two : don't have then collide ! 
    var simulation = d3.forceSimulation()
        .force("x", d3.forceX(width / 2).strength(0.05))
        .force("y", d3.forceY(height / 2).strength(0.05))
        .force("collide", d3.forceCollide(function(d) {
            return radiusScale(d.cost_effectiveness)
        }))

    d3.csv("static/data/charities.csv").then(ready);

    function ready(datapoints) {
        function ticked(){
            circles
                .attr("cx", function(d){
                    return d.x
                })
                .attr("cy", function(d){
                    return d.y
                })
            labels
                .attr("x", function(d){
                    return d.x
                })
                .attr("y", function(d){
                    return d.y
                })
                .text(function(d){
                    return d.name
                })    
        }

        var circles = svg.selectAll(".charity")
            .data(datapoints)
            .join("circle")
            .attr("class", "charity")
            .attr("r", function(d) {
                return radiusScale(d.cost_effectiveness)
            })
            .attr("fill", "lightblue")
            /*
            .style("fill", function(d) {
                return "url(" + "static/data/" + d.image_path + ")";
            })
            .style("stroke", "white")
            .style("stroke-width", "1px");
            */


        var labels = svg.selectAll(".label")
            .data(datapoints)
            .join("text")
            .attr("class", "label")
            .attr("text-anchor", "middle")
            .attr("font-size", "10px")
            .attr("dy", ".35em")
            .text(function(d){
                return d.name
            }) 
        simulation.nodes(datapoints).on('tick', ticked)
    }
}

export {drawBubbles};