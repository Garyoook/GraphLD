import { Button } from "@mui/material";
import * as d3 from "d3";
import _ from "lodash";
import { useEffect, useRef, useState } from "react";
import "./styles.scss";

const dataSource = {
    nodes: [
        {
            id: "id1",
            group: 1,
        },
        {
            id: "id2",
            group: 2,
        },
        {
            id: "id3",
            group: 3,
        },
        {
            id: "id4",
            group: 4,
        },
    ],
    links: [
        {
            source: "id1",
            target: "id2",
            value: 1,
        },
        {
            source: "id1",
            target: "id3",
            value: 1,
        },
        {
            source: "id1",
            target: "id4",
            value: 1,
        },
    ],
};

const width = window.innerWidth;
const height = window.innerHeight / 2;

function LinkedNode(props) {
    const d3Node = useRef(null);
    const color = useRef(null);
    const simulation = useRef(null);
    const linksGroup = useRef(null);
    const nodesGroup = useRef(null);
    const [data, setData] = useState(dataSource);

    const getSvg = () => d3.select(d3Node.current);
    const checkElementExist = (element) => {
        if (element) {
            element.remove();
        }
    };

    useEffect(() => {
        checkElementExist(getSvg().selectAll("svg"));
        let svg = getSvg()
            .append("svg")
            .attr("width", width)
            .attr("height", height);
        color.current = d3.scaleOrdinal(d3.schemeCategory10);
        simulation.current = d3
            .forceSimulation()
            .force(
                "link",
                // @ts-ignore
                d3.forceLink().id((d) => d.id)
            )
            .force("charge", d3.forceManyBody())
            .force("center", d3.forceCenter(width / 2, height / 2));
        linksGroup.current = svg.append("g");
        nodesGroup.current = svg.append("g");
        // eslint-disable-next-line
    }, []);

    // updateDiagrarm
    useEffect(() => {
        const dragstarted = (event, d) => {
            if (!event.active) simulation.current.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
        };
        const dragged = (event, d) => {
            d.fx = event.x;
            d.fy = event.y;
        };
        const dragended = (event, d) => {
            if (!event.active) simulation.current.alphaTarget(0);
            d.fx = null;
            d.fy = null;
        };

        let link = linksGroup.current
            .attr("class", "links")
            .selectAll("line")
            .data(data.links);

        link.exit().remove();
        link = link
            .enter()
            .append("line")
            .attr("stroke-width", function (d) {
                return Math.sqrt(d.value) + 1;
            })
            .merge(link);

        let node = nodesGroup.current
            .attr("class", "nodes")
            .selectAll("circle")
            .data(data.nodes);
        node.exit().remove();
        node = node
            .enter()
            .append("circle")
            .attr("r", (d) => (d.id === "id1" ? 40 : 25))
            .attr("fill", (d) => {
                console.log(color.current(d.group));
                return color.current(d.group);
            })
            .call(
                d3
                    .drag()
                    .on("start", dragstarted)
                    .on("drag", dragged)
                    .on("end", dragended)
            )
            .merge(node);

        simulation.current.nodes(data.nodes).on("tick", ticked);

        simulation.current.force("link").links(data.links).distance(100);

        simulation.current.alpha(1).restart();

        function ticked() {
            link.attr("stroke", "#c7c7c7")
                .attr("x1", (d) => d.source.x)
                .attr("y1", (d) => d.source.y)
                .attr("x2", (d) => d.target.x)
                .attr("y2", (d) => d.target.y);

            node.attr("cx", (d) => d.x).attr("cy", (d) => d.y);
        }
        console.log("data change");
    }, [data]);

    const handleAddNode = () => {
        const id = `id${new Date().getTime()}`;
        const node = { id, group: _.random(1, 9) };

        setData((prevState) => ({
            nodes: [...prevState.nodes, node],
            links: [
                ...prevState.links,
                { source: "id1", target: id, value: 1 },
            ],
        }));
    };

    return (
        <div className='d3-sample'>
            <div style={{ margin: "0 0 20px 0" }}>
                <Button onClick={handleAddNode}>Add node</Button>
            </div>
            <div className='d3-node' ref={d3Node} />
        </div>
    );
}

export default LinkedNode;
