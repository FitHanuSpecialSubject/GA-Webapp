import React, { useRef, useEffect } from "react";
import PropTypes from "prop-types";
import * as d3 from "d3";
import useSize from "../../context/WindowResize";

export default function BipartiteGraph({ appData }) {
  const svgRef = useRef();

  useEffect(() => {
    const matchesArray = appData.result.data.matches.matches;
    const inputIndividuals = appData.problem.individuals;

    // Extract nodes from inputIndividual
    const svg = d3.select(svgRef.current);
    const width = +svg.attr("width");
    const startX = width / 3;
    const startY = 50;
    let y1 = startY;
    const y2 = startY;

    const nodes = [];
    inputIndividuals.forEach((individual, index) => {
      if (individual.setType === 0) {
        nodes.push({
          id: index,
          group: individual.setType,
          name: individual.individualName,
          x: startX,
          y: y1,
        });
        y1 += 70;
      } else {
        nodes.push({
          id: index,
          group: individual.setType,
          name: individual.individualName,
          x: width - startX,
          y: y2,
        });
      }
    });

    // Extract links from matchesArray
    const links = [];
    matchesArray.forEach((matches, index) => {
      if (matches.length === 0) {
        // Handle case where there are no matches for an individual
        links.push({
          source: index,
          target: -1,
        });
      } else {
        // Add links for each match
        matches.forEach((match) => {
          links.push({ source: index, target: match });
        });
      }
    });

    const valLink = links.filter((link) => link.target === -1);

    const node2 = [];
    nodes.forEach((node) => {
      for (let i = 0; i < valLink.length; i++) {
        if (valLink[i].source === node.id) {
          node2.push(node);
        }
      }
    });

    svg.selectAll("circle").remove();
    svg.selectAll("line").remove();
    svg.selectAll("text").remove();

    const link = svg
      .selectAll(".link")
      .data(links.filter((link) => link.target !== -1))
      .enter()
      .append("line")
      .attr("class", "link")
      .style("stroke", "gray");

    link
      .attr("x1", (d) => nodes.find((node) => node.id === d.source).x)
      .attr("y1", (d) => nodes.find((node) => node.id === d.source).y)
      .attr("x2", (d) => nodes.find((node) => node.id === d.target).x)
      .attr("y2", (d) => nodes.find((node) => node.id === d.target).y);

    const node = svg
      .selectAll(".node")
      .data(nodes)
      .enter()
      .append("circle")
      .attr("class", "node")
      .attr("r", 20)
      .attr("fill", (d) =>
        node2.some((nod) => nod.id === d.id)
          ? "red"
          : (d = d.group === 0 ? "blue" : "green"),
      );

    node.attr("cx", (d) => d.x).attr("cy", (d) => d.y);
    node.append("title").text((d) => d.name);

    svg
      .selectAll("text")
      .data(nodes)
      .enter()
      .append("text")
      .attr("x", (d) => d.x - 23)
      .attr("y", (d) => d.y - 30)
      .text((d) => d.name);
  }, [appData]);

  const windowSize = useSize();
  return (
    <svg ref={svgRef} width={windowSize[0] / 1.5} height={windowSize[1]}></svg>
  );
}
BipartiteGraph.propTypes = {
  appData: PropTypes.shape({
    result: PropTypes.shape({
      data: PropTypes.shape({
        matches: PropTypes.shape({
          matches: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number)),
        }),
      }),
    }),
    problem: PropTypes.shape({
      individuals: PropTypes.arrayOf(
        PropTypes.shape({
          setType: PropTypes.number,
          individualName: PropTypes.string,
        }),
      ),
    }),
  }),
};
