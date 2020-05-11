let data = null;
async function renderChart() {
    const root = await drawTree();
    const svg = d3
        .select('svg')
        .style('width', 700)
        .style('height', 'auto')
        .style('padding', '10px')
        .style('box-sizing', 'border-box')
        .style('font', '10px sans-serif');
    const link = svg
        .append('g')
        .attr('fill', 'none')
        .attr('stroke', '#fff')
        .attr('stroke-opacity', 1)
        .attr('stroke-width', 1.5)
        .selectAll('path')
        .data(root.links())
        .enter()
        .append('path')
        .attr('class', function (d, i) {
            return d.source.data.name;
        })
        .attr(
            'd',
            d3
                .linkRadial()
                .angle((d) => d.x)
                .radius((d) => d.y)
        );

    const circle = svg
        .append('circle')
        .attr('fill', 'none')
        .attr('stroke', '#555')
        .attr('stroke-dasharray', '5, 5')
        .attr('stroke-opacity', 0.4)
        .attr('stroke-width', 1.5)
        .attr('r', 451);

    svg.append('circle')
        .attr('fill', 'none')
        .attr('stroke', '#437def')
        .attr('stroke-dasharray', '10, 10')
        .attr('stroke-opacity', 1)
        .attr('stroke-width', 1.5)
        .attr('r', 225.5);

    const node = svg
        .append('g')
        .attr('stroke-linejoin', 'round')
        .attr('stroke-width', 3)
        .selectAll('g')
        .data(root.descendants().reverse())
        .enter()
        .append('g')
        .attr('class', function (d, i) {
            return d.data.name;
        })
        .attr(
            'transform',
            (d) => `
        rotate(${(d.x * 180) / Math.PI - 90})
        translate(${d.y},0)
      `
        );

    const nodeCircle = node
        .append('circle', (d) => d.children.length > 0)
        .attr('fill', '#fff')
        .attr('r', 10)
        .attr('cursor', 'pointer')
        .style('display', (d) => (d.children ? 'static' : 'none'))
        .attr('stroke', (d) => (d.children ? '#437def' : 'none'))
        .attr('stroke-opacity', 1)
        .attr('stroke-width', 1.5);

    const nodePath = node
        .append('path', (d) => d.children.length === 0)
        .attr('fill', '#fff')
        .attr('cursor', 'pointer')
        .attr(
            'd',
            'M-5.5,-8.5 h6 q6,0 6,6 v10 q0,1 -1,1 h-11 q-1,0 -1,-1 v-15 q0,-1 1,-1 Z'
        )
        .attr('transform', (d, i) => {
            return `rotate(${(d.x / 180) * Math.PI + 90})`;
        })
        .style('display', (d) => (d.children ? 'none' : 'static'));

    nodeCircle
        .on('mouseenter', function (d) {
            is_connected(d, 0.1, link, nodePath);
            d3.select(this)
                .transition()
                .duration(100)
                .attr('r', 20)
                .attr('fill', '#437def');
        })
        .on('mouseleave', function (d) {
            d3.select(this)
                .transition()
                .duration(100)
                .attr('r', 10)
                .attr('fill', '#fff');
            is_connected(d, 1, link, nodePath);
        });

    node.append('text')
        .attr('dy', '0.31em')
        .attr('x', (d) => (d.x < Math.PI === !d.children ? 20 : -20))
        .attr('text-anchor', (d) =>
            d.x < Math.PI === !d.children ? 'start' : 'end'
        )
        .attr('transform', (d) => (d.x >= Math.PI ? 'rotate(180)' : null))
        .text((d, i) => d.data.name + i)
        .clone(true)
        .lower();

    return autosize(svg.node());
}

async function getData() {
    const map = new Map();
    const imports = await d3.json(
        'https://reshmasr.github.io/D3Charts/tree-map-data.json'
        // 'https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/data_network.json'
        // 'http://localhost:8080/RadialGraph/custom-data.json'
    );

    // 'https://gist.githubusercontent.com/mbostock/1044242/raw/3ebc0fde3887e288b4a9979dad446eb434c54d08/flare.json'
    // 'http://localhost:8080/RadialGraph/data.json'
    //d3.json("https://raw.githubusercontent.com/benamreview/CS5590-Directed-Reading/master/ds3graph.json");

    // imports.forEach(function find(data) {
    //     const { name } = data;
    //     if (map.has(name)) return map.get(name);
    //     const i = name.lastIndexOf('.');
    //     map.set(name, data);
    //     if (i >= 0) {
    //         find({
    //             name: name.substring(0, i),
    //             children: [],
    //         }).children.push(data);
    //         data.name = name.substring(i + 1);
    //     }
    //     return data;
    // });
    // console.log(map.get('flare'));
    // return map.get('flare');
    return imports;
}

async function drawTree() {
    data = await getData();
    console.log(data);
    const radius = 451;
    return d3
        .tree()
        .size([2 * Math.PI, radius])
        .separation((a, b) => (a.parent == b.parent ? 1 : 2) / a.depth)(
        d3.hierarchy(data)
    );
}

function autosize(svg) {
    // document.body.appendChild(svg);
    const box = svg.getBBox();
    // document.body.removeChild(svg);
    svg.setAttribute('viewBox', `${box.x} ${box.y} ${box.width} ${box.height}`);
    return svg;
}

function is_connected(d, opacity, lines, nodes) {
    lines
        .transition()
        .style('stroke-opacity', function (o) {
            return o.source === d || o.target === d ? 1 : opacity;
        })
        .attr('stroke', function (o) {
            return o.source === d || o.target === d ? '#437def' : '#fff';
        });

    nodes.transition().attr('fill', function (o) {
        return o.parent === d ? '#437def' : '#fff';
    });
}

$(document).ready(function () {
    renderChart();
});
