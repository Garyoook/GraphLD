import * as d3 from 'd3';
import { useEffect, useRef } from 'react';
import './styles.scss';

const width = window.innerWidth * 1.2;
const height = window.innerHeight * 1.5;

function CirclePack(props) {
  const d3Pack = useRef(null);
  const color = useRef(null);
  const size = useRef(null);
  const simulation = useRef(null);
  const nodesGroup = useRef(null);
  // const [data, setData] = useState(dataSource);

  const getSvg = () => d3.select(d3Pack.current);
  const checkElementExist = (element) => {
    if (element) {
      element.remove();
    }
  };

  // What happens when a circle is dragged?
  function dragstarted(event, d) {
    if (!event.active) simulation.current.alphaTarget(0.03).restart();
    d.fx = d.x;
    d.fy = d.y;
  }
  function dragged(event, d) {
    d.fx = event.x;
    d.fy = event.y;
  }
  function dragended(event, d) {
    if (!event.active) simulation.current.alphaTarget(0.03);
    d.fx = null;
    d.fy = null;
  }

  // initialise the graph props
  useEffect(() => {
    checkElementExist(getSvg().selectAll('svg'));
    let svg = getSvg()
      .append('svg')
      .attr('width', width)
      .attr('height', height);

    // create a tooltip
    const Tooltip = d3
      .select(d3Pack.current)
      .append('div')
      .style('opacity', 0)
      .attr('class', 'tooltip')
      .style('background-color', 'white')
      .style('border', 'solid')
      .style('border-width', '2px')
      .style('border-radius', '5px')
      .style('padding', '5px');

    // Three function that change the tooltip when user hover / move / leave a cell
    const mouseover = function (event, d) {
      Tooltip.style('opacity', 1);
    };
    const mousemove = function (event, d) {
      Tooltip.html('<u>' + d.key + '</u>' + '<br>' + d.value + ' inhabitants')
        .style('position', 'absolute')
        .style('left', event.pageX + 5 + 'px')
        .style('top', event.pageY - 5 + 'px');
    };
    var mouseleave = function (event, d) {
      Tooltip.style('opacity', 0);
    };

    d3.csv(
      'https://raw.githubusercontent.com/holtzy/data_to_viz/master/Example_dataset/11_SevCatOneNumNestedOneObsPerGroup.csv',
    ).then(function (data) {
      color.current = d3
        .scaleOrdinal()
        .domain(['Asia', 'Europe', 'Africa', 'Oceania', 'Americas'])
        .range(d3.schemeSet1);

      size.current = d3.scaleLinear().domain([0, 1400000000]).range([20, 200]);

      simulation.current = d3
        .forceSimulation()
        .force(
          'center',
          d3
            .forceCenter()
            .x(width / 2)
            .y(height / 2),
        ) // Attraction to the center of the svg area
        .force('charge', d3.forceManyBody().strength(0.1)) // Nodes are attracted one each other of value is > 0
        .force(
          'collide',
          d3
            .forceCollide()
            .strength(0.1)
            .radius(function (d: any) {
              return size.current(d.value) + 5;
            })
            .iterations(3),
        ); // Force that avoids circle overlapping

      nodesGroup.current = svg.append('g');

      let nodes = nodesGroup.current
        .selectAll('circle')
        .data(data)
        .join('circle')
        .attr('class', 'node')
        .attr('r', (d) => size.current(d.value))
        .attr('cx', width / 2)
        .attr('cy', height / 2)
        .style('fill', (d) => color.current(d.region))
        .style('fill-opacity', 0.5)
        .attr('stroke', '#69a2b2')
        .style('stroke-width', 2)
        .on('mouseover', mouseover) // What to do when hovered
        .on('mousemove', mousemove)
        .on('mouseleave', mouseleave)
        .call(
          d3
            .drag() // call specific function when circle is dragged
            .on('start', dragstarted)
            .on('drag', dragged)
            .on('end', dragended),
        );

      simulation.current.nodes(data).on('tick', function (d) {
        nodes
          .attr('cx', function (d) {
            return d.x;
          })
          .attr('cy', function (d) {
            return d.y;
          });
      });
    });
  }, []);

  return <div className="d3-pack" ref={d3Pack} />;
}

export default CirclePack;
