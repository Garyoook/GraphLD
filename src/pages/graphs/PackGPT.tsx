import * as d3 from "d3";
import { useEffect, useRef } from "react";

interface DataNode {
    name: string;
    value?: number;
    color?: string;
    children?: DataNode[];
}

const data = {
    name: "root",
    value: 0,
    color: "red",
    children: [
        {
            name: "A",
            value: 10,
            color: "orange",
            children: [
                {
                    name: "D",
                    value: 40,
                    color: "green",
                },
            ],
        },
        {
            name: "B",
            value: 20,
            color: "gray",
            children: [],
        },
        {
            name: "C",
            value: 30,
            color: "yellow",
            children: [],
        },
    ],
};

const width = window.innerWidth;
const height = window.innerHeight;
const margin = { top: 20, right: 20, bottom: 20, left: 20 };

// @ts-ignore
function D3CircularPacking(props) {
    const svgRef = useRef<SVGSVGElement | null>(null);
    const simulation = useRef<d3.Simulation<any, undefined> | null>(null);

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

    useEffect(() => {
        if (svgRef.current) {
            const svg = d3.select(svgRef.current);

            const root = d3
                .hierarchy(data)
                .sum((d) => d.value)
                .sort((a, b) => b.value - a.value);

            const pack = d3
                .pack()
                .size([
                    width - margin.left - margin.right,
                    height - margin.top - margin.bottom,
                ])
                .padding(3);

            pack(root);

            const nodes = svg
                .selectAll(".node")
                .data(root.descendants())
                .enter()
                .append("g")
                .attr("class", (d) => (d.children ? "node" : "leaf node"))
                .attr(
                    "transform",
                    // @ts-ignore
                    (d) => `translate(${d.x + margin.left},${d.y + margin.top})`
                );

            nodes
                .append("circle")
                // @ts-ignore
                .attr("r", (d) => (d.data.children ? d.r : d.r / 2))
                .style("fill", (d) => d.data.color || "grey")
                .style("fill-opacity", 0.8)
                .style("stroke", "#000")
                .style("stroke-width", 3);

            nodes
                .filter((d) => d.data.name !== "root")
                .append("text")
                .attr("dy", "-8%")
                .style("text-anchor", "middle")

                .text((d) => d.data.name);

            nodes.call(
                d3
                    .drag() // call specific function when circle is dragged
                    .on("start", dragstarted)
                    .on("drag", dragged)
                    .on("end", dragended)
            );

            simulation.current = d3
                // @ts-ignore
                .forceSimulation(root.descendants())
                .force("charge", d3.forceManyBody().strength(-20))
                .force("center", d3.forceCenter(width / 2, height / 2))
                // .force(
                //     "collide",
                //     d3
                //         .forceCollide()
                //         .radius((d: any) => (d.r ?? 0) + 1)
                //         .strength(0.1)
                // )
                // .stop()
                .on("tick", () => {
                    nodes.attr(
                        "transform",
                        (d: any) =>
                            `translate(${d.x + margin.left},${
                                d.y + margin.top
                            })`
                    );
                });
        }
    }, []);

    return <svg ref={svgRef} width={width} height={height} />;
}

export default D3CircularPacking;
