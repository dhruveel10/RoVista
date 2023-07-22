import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import ASes_100 from './data/sorted_graph1.csv';
import StyledTypography from './StyledTopography';

const ASes_100_rov = () => {
  const svgRef = useRef(null);
  const tooltipRef = useRef(null);
  let x, formattedData;

  useEffect(() => {
    const margin = { top: 20, right: 20, bottom: 30, left: 50 };
    const width = 1000 - margin.left - margin.right + 100;
    const height = 400 - margin.top - margin.bottom;

    const svg = d3
      .select(svgRef.current)
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Load and parse the CSV data
    d3.csv(ASes_100).then((data) => {
      const parseDate = d3.timeParse('%m/%d/%Y');

      // Format data
      formattedData = data.map((d) => ({
        date: parseDate(d.date),
        ases100rov: +d.ases_with_rov_ratio_100,
      }));

      x = d3
        .scaleTime()
        .domain(d3.extent(formattedData, (d) => d.date))
        .range([0, width]);

      const y = d3
        .scaleLinear()
        .domain([0, d3.max(formattedData, (d) => d.ases100rov)])
        .range([height, 0]);

      const xAxis = d3.axisBottom(x)
        .ticks(d3.timeMonth) // Set the tick interval to monthly
        .tickSizeOuter(0) // Remove the outer ticks
        .tickPadding(10); // Increase the padding between ticks

      const yAxis = d3.axisLeft(y);

      svg.append('g')
        .attr('transform', `translate(0,${height})`)
        .call(xAxis);

      svg.append('g').call(yAxis);

      svg.append('path')
        .datum(formattedData)
        .attr('fill', 'none')
        .attr('stroke', 'steelblue')
        .attr('stroke-width', 1)
        .attr(
          'd',
          d3
            .line()
            .x((d) => x(d.date))
            .y((d) => y(d.ases100rov))
        );
    });
  }, []);

  return (
    <div className="Ases_100_rov_container">
      <StyledTypography variant="h2" component="h2" className="mt-4 mb-2">
        GRAPH BELOW REPRESENTS ASES WITH 100% ROV
      </StyledTypography>
      <div className="chart-container">
        <svg ref={svgRef}></svg>
      </div>
    </div>
  );
};

export default ASes_100_rov;
