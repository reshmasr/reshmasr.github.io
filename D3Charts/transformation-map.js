async function getData() {
    const data = await d3.json(
        'https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/data_network.json'
    );
    return data;
}
async function renderChart() {
    const innerCircleRadius = 175;
    const outerCircleRadius = 350;
    const svg = d3
        .select('svg')
        .style('width', 500)
        .style('height', 'auto')
        .style('padding', '10px')
        .style('box-sizing', 'border-box')
        .style('font', '10px sans-serif')
        .style('overflow', 'visible');

    const data = await d3.json(
        'https://reshmasr.github.io/D3Charts/transformation-data.json'
    );

    // const angle = 360 / data.nodes.length;
    const forcedData = [...data.parents, ...data.children];

    const link = svg
        .append('g')
        .attr('fill', 'none')
        .attr('stroke', '#fff')
        .attr('stroke-opacity', 1)
        .attr('stroke-width', 1.5)
        .selectAll('path')
        .data(data.links)
        .enter()
        .append('path')
        .attr('class', function (d, i) {
            return d.source;
        });

    const circle = svg
        .append('circle')
        .attr('fill', 'none')
        .attr('stroke', '#555')
        .attr('stroke-dasharray', '5, 5')
        .attr('stroke-opacity', 0.4)
        .attr('stroke-width', 1.5)
        .attr('r', 350);

    svg.append('circle')
        .attr('fill', 'none')
        .attr('stroke', '#437def')
        .attr('stroke-dasharray', '10, 10')
        .attr('stroke-opacity', 1)
        .attr('stroke-width', 1.5)
        .attr('r', 175);

    // Initialize the nodes
    const node = svg
        .append('g')
        .attr('stroke-linejoin', 'round')
        .attr('stroke-width', 3)
        .selectAll('g')
        .data(forcedData)
        .enter()
        .append('g')
        .attr('class', function (d, i) {
            return d.name;
        });

    const nodeCircle = node
        .append('circle')
        .attr('class', 'node-circle')
        .attr('r', 10)
        .attr('fill', '#fff')
        .attr('cursor', 'pointer')
        .style('display', (d) =>
            typeof d.id === typeof '' ? 'static' : 'none'
        )
        .attr('stroke', (d) => (typeof d.id === typeof '' ? '#437def' : 'none'))
        .attr('stroke-opacity', 1)
        .attr('stroke-width', 1.5);
    const nodePath = node
        .append('path', (d) => typeof d.id !== typeof '')
        .attr('fill', '#fff')
        .attr('cursor', 'pointer')
        .attr(
            'd',
            'M-5.5,-8.5 h6 q6,0 6,6 v10 q0,1 -1,1 h-11 q-1,0 -1,-1 v-15 q0,-1 1,-1 Z'
        )
        .style('display', (d) =>
            typeof d.id === typeof '' ? 'none' : 'static'
        );

    nodeCircle.on('mouseenter', function (d) {
        svg.selectAll('.node-circle').attr('fill', '#fff').attr('r', 10);
        d3.select(this)
            .transition()
            .duration(100)
            .attr('r', 20)
            .attr('fill', '#437def');
        is_connected(d, link, nodePath, data);
    });

    // Let's list the force we wanna apply on the network
    var simulation = d3
        .forceSimulation(forcedData) // Force algorithm is applied to data.nodes
        .force(
            'link',
            d3
                .forceLink() // This force provides links between nodes
                .id(function (d) {
                    return d.id;
                }) // This provide  the id of a node
                .links(data.links) // and this the list of links
        )
        .force('charge', d3.forceManyBody().strength(-10)) // This adds repulsion between nodes. Play with the -400 for the repulsion strength
        .on('tick', ticked);

    setTimeout(() => {
        node.append('text')
            .attr('class', 'text-indicator')
            .attr('x', (d) => (d.x < Math.PI ? -20 : 20))
            .attr('text-anchor', (d) => {
                return d.x < Math.PI ? 'end' : 'start';
            })
            .attr('transform', (d) => {
                return typeof d.id !== typeof ''
                    ? `rotate(${(Math.atan(d.y / d.x) * 180) / 3.14})`
                    : 'rotate(0)';
            })
            .text((d, i) => {
                return 'TVM';
                // return d.name;
            })
            .clone(true)
            .lower();
    }, 500);

    // This function is run at each iteration of the force algorithm, updating the nodes position.
    function ticked() {
        node.attr('transform', function (d, i) {
            const a = [-175, 0, 175, 0, -350, 0, 350, 0];
            const b = [0, -175, 0, 175, 0, -350, 0, 350];
            let radius = innerCircleRadius;
            let relativeAngle =
                ((360 / data.parents.length) * i * Math.PI) / 180;
            if (typeof d.id !== typeof '') {
                radius = outerCircleRadius;
                relativeAngle =
                    ((360 / data.children.length) * i * Math.PI) / 180;
            }
            let x = 0;
            let y = 0;
            if (relativeAngle > 270) {
                x = Math.cos(360 - relativeAngle);
                y = -Math.sin(360 - relativeAngle);
            } else if (relativeAngle > 180) {
                x = -Math.cos(270 - relativeAngle);
                y = -Math.sin(270 - relativeAngle);
            } else if (relativeAngle > 90) {
                x = -Math.cos(180 - relativeAngle);
                y = Math.sin(180 - relativeAngle);
            } else {
                x = Math.cos(relativeAngle);
                y = Math.sin(relativeAngle);
            }
            if (typeof d.id !== typeof '') {
                d.x = outerCircleRadius * x;
                d.y = outerCircleRadius * y;
            } else {
                d.x = innerCircleRadius * x;
                d.y = innerCircleRadius * y;
            }

            return `translate(${d.x},${d.y})`;
        });

        link.attr('d', function (d) {
            var dx = d.target.x - d.source.x,
                dy = d.target.y - d.source.y,
                dr = Math.sqrt(dx * dx + dy * dy);
            // return `M${d.source.x},${d.source.y} A${dr},${dr} 0 0, 1 ${d.target.x},${d.target.y}`;

            let pathLength = Math.sqrt(
                (d.target.x - d.source.x) * (d.target.x - d.source.x) +
                    (d.target.y - d.source.y) * (d.target.y - d.source.y)
            );

            const pathPercentage = pathLength / 4;
            const renderOne = () =>
                `M${d.source.x},${d.source.y} C ${
                    d.source.x - pathPercentage
                },${d.source.y - pathPercentage} ${
                    d.target.x + pathPercentage / 2
                },${d.target.y - pathPercentage / 4} ${d.target.x},${
                    d.target.y
                }`;

            const renderTwo = () => {
                const path = `M${d.source.x},${d.source.y} C ${
                    d.source.x * 2 - pathPercentage / 3
                },${d.source.y + pathPercentage} ${
                    d.target.x - pathPercentage
                },${d.target.y - pathPercentage} ${d.target.x},${d.target.y}`;

                return path;
            };

            const renderThree = () => {
                const path = `M${d.source.x},${d.source.y} C ${
                    d.source.x - pathPercentage
                },${d.source.y + pathPercentage} ${
                    d.target.x + pathPercentage
                },${d.target.y - pathPercentage} ${d.target.x},${d.target.y}`;

                return path;
            };

            const renderFour = () => {
                const path = `M${d.source.x},${d.source.y} C ${
                    d.source.x + pathPercentage
                },${d.source.y - pathPercentage * 1.5} ${
                    d.target.x - pathPercentage / 2
                },${d.target.y + pathPercentage} ${d.target.x},${d.target.y}`;

                return path;
            };

            if (pathLength < outerCircleRadius) {
                if (d.source.x < 0 && d.source.y < 0) {
                    return renderOne(); //N6, N7
                } else if (d.source.x < 0) {
                    return renderThree(); // N4, N5
                } else if (d.source.y < 0) {
                    return renderFour();
                } else {
                    // console.log(d.source.x, d.source.y);
                    return renderTwo(); //N1, N2, N3
                }
            } else {
                if (d.source.x < 0 && d.source.y < 0) {
                    return renderThree(); //N6, N7
                } else if (d.source.x < 0) {
                    return renderFour(); // N4, N5
                } else if (d.source.y < 0) {
                    return renderThree();
                } else {
                    return renderOne(); //N1, N2, N3
                }
            }
        });
    }
    return autosize(svg.node());
}
function autosize(svg) {
    // document.body.removeChild(svg);
    // document.body.appendChild(svg);
    const box = svg.getBBox();
    svg.setAttribute('viewBox', `${box.x} ${box.y} ${box.width} ${box.height}`);
    return svg;
}
function is_connected(d, lines, nodes, data) {
    const endNodes = {};
    lines.transition().attr('stroke', function (o) {
        if (o.source === d) {
            endNodes[o.target.id] = o.target;
        }
        return o.source === d || o.target === d ? '#437def' : '#fff';
    });
    nodes.transition().attr('fill', function (o) {
        return endNodes[o.id] === o ? '#437def' : '#fff';
    });
}
$(document).ready(function () {
    renderChart();
});
