import React, { useState, useEffect, useRef } from "react";
import * as d3 from 'd3';
import { styled, Button } from '@mui/material';

const ToggleButtonsContainer = styled('div')({
  display: 'flex',
  gap: '1rem',
});

const ToggleButton = styled(Button)(({ theme, active }) => ({
  backgroundColor: active ? theme.palette.primary.main : "transparent",
  color: active ? '#000':'#ccc',
  border: `1px solid ${theme.palette.primary.main}`,
  borderRadius: '4px',
  padding: theme.spacing(1),
  position: 'relative',
  '& .line-indicator': {
    position: 'absolute',
    top: '50%',
    left: 'calc(100% + 8px)', // Adjust the distance between text and dash
    width: '8px',
    height: '2px',
    backgroundColor: active ? '#000' : theme.palette.primary.main,
    content: '""',
  },
  '& .total-line': {
    backgroundColor: 'steelblue', // Add your desired color for Total line indicator
  },
  '& .ratio-line': {
    backgroundColor: 'red', // Add your desired color for Ratio line indicator
  },
  '& .filter-line': {
    backgroundColor: 'green', // Add your desired color for Filter line indicator
  },
  '& .remove-line': {
    backgroundColor: 'yellow', // Add your desired color for Remove line indicator
  },
}));

const CloseButton = styled(Button)({
  backgroundColor: "red", // Change the background color to your desired color
  color: "#fff", // Change the text color to white for better visibility
  "&:hover": {
    backgroundColor: "#f00", // Change the hover background color if desired
  },
});

const margin = { top: 10, right: 30, bottom: 30, left: 20 };

const LineGraph = ({ asn }) => {
  const svgRef = useRef(null);
  const formatDate = d3.timeFormat("%m-%d-%Y");
  const formatNumber = d3.format(".2f");
  const isMouseOutsideChart = useRef(false);

  const [data, setData] = useState([]);
  const [showTotalLine, setShowTotalLine] = useState(true);
  const [showRatioLine, setShowRatioLine] = useState(true);
  const [showFilterLine, setShowFilterLine] = useState(true);
  const [showRemoveLine, setShowRemoveLine] = useState(true);

  const graphRef = useRef(null);

  const tooltipRef = useRef(null);

  useEffect(() => {
    // Fetch data for the selected ASN from the server when asn prop changes
    if (asn) {
      fetchDataForASN(asn);
    }
  }, [asn]);

  // Function to fetch data for the selected ASN from the server
  const fetchDataForASN = (asn) => {
    fetch(`/api/asndata/${asn}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }
        return response.json();
      })
      .then((jsonData) => {
        const processedData = jsonData.map((d) => ({
          ...d,
          date: new Date(d.date),
          total: +d.total,
          ratio: +d.ratio,
          filter: +d.filter,
          remove: +d.remove,
        }));
        setData(processedData);
      })
      .catch((error) => {
        console.error(error);
        setData([]); 
      });
  };
  
  useEffect(() => {
    if (data.length > 0) {
      createGraph();
      graphRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [data, showTotalLine, showRatioLine, showFilterLine, showRemoveLine]);

  useEffect(() => {
    if (svgRef.current) {
      d3.select(svgRef.current).selectAll("*").remove(); // Clear the SVG before re-rendering
      if (data.length > 0) {
        createGraph();
      }
    }
  }, [data]);

  if (!asn) {
    // Return null if asn is not provided
    return null;
  }

  const createGraph = () => {
    const width = 1200 - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current)
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .style('background', "#fff")
      .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

    const xScale = d3.scaleTime()
      .domain(d3.extent(data, d => d.date))
      .range([0, width]);

    const yTotalScale = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.total)])
      .range([height, 0]);

    const yRatioScale = d3.scaleLinear()
      .domain([0, 1])
      .range([height, 0]);

    const totalLine = d3.line()
      .x(d => xScale(d.date))
      .y(d => yTotalScale(d.total));

    const ratioLine = d3.line()
      .x(d => xScale(d.date))
      .y(d => yRatioScale(d.ratio));

    const filterLine = d3.line()
      .x(d => xScale(d.date))
      .y(d => yTotalScale(d.filter));

    const removeLine = d3.line()
      .x(d => xScale(d.date))
      .y(d => yTotalScale(d.remove));

    const dotRadius = 4;
    const dotBoundaryRadius = 6;
    const dotBoundaryColor = "#ccc";

    const totalDots = svg.selectAll(".total-dot")
      .data(data)
      .join("circle")
      .attr("class", "dot total-dot")
      .attr("cx", d => xScale(d.date))
      .attr("cy", d => yTotalScale(d.total))
      .attr("r", dotRadius)
      .style("fill", "steelblue")
      .style("stroke", dotBoundaryColor)
      .style("stroke-width", 1)
      .style("opacity", 0)
      .style("filter", "drop-shadow(2px 2px 2px rgba(0, 0, 0, 0.4))");

    const ratioDots = svg.selectAll(".ratio-dot")
      .data(data)
      .join("circle")
      .attr("class", "dot ratio-dot")
      .attr("cx", d => xScale(d.date))
      .attr("cy", d => yRatioScale(d.ratio))
      .attr("r", dotRadius)
      .style("fill", "red")
      .style("stroke", dotBoundaryColor)
      .style("stroke-width", 1)
      .style("opacity", 0)
      .style("filter", "drop-shadow(2px 2px 2px rgba(0, 0, 0, 0.4))");

    const filterDots = svg.selectAll(".filter-dot")
      .data(data)
      .join("circle")
      .attr("class", "dot filter-dot")
      .attr("cx", d => xScale(d.date))
      .attr("cy", d => yRatioScale(d.filter))
      .attr("r", dotRadius)
      .style("fill", "green")
      .style("stroke", dotBoundaryColor)
      .style("stroke-width", 1)
      .style("opacity", 0)
      .style("filter", "drop-shadow(2px 2px 2px rgba(0, 0, 0, 0.4))");

    const removeDots = svg.selectAll(".remove-dot")
      .data(data)
      .join("circle")
      .attr("class", "dot remove-dot")
      .attr("cx", d => xScale(d.date))
      .attr("cy", d => yTotalScale(d.remove))
      .attr("r", dotRadius)
      .style("fill", "yellow")
      .style("stroke", dotBoundaryColor)
      .style("stroke-width", 1)
      .style("opacity", 0)
      .style("filter", "drop-shadow(2px 2px 2px rgba(0, 0, 0, 0.4))");

    const dots = svg.selectAll(".dot");

    if (showTotalLine) {
      svg.append("path")
        .datum(data)
        .attr("class", "line total-line")
        .attr("d", totalLine)
        .attr("fill", "none")
        .attr("stroke", "steelblue");
    }

    if (showRatioLine) {
      svg.append("path")
        .datum(data)
        .attr("class", "line ratio-line")
        .attr("d", ratioLine)
        .attr("stroke", "red")
        .attr("fill", "none");
    }

    if (showFilterLine) {
      svg.append("path")
        .datum(data)
        .attr("class", "line filter-line")
        .attr("d", filterLine)
        .attr("fill", "none")
        .attr("stroke", "green");
    }

    if (showRemoveLine) {
      svg.append("path")
        .datum(data)
        .attr("class", "line remove-line")
        .attr("d", removeLine)
        .attr("fill", "none")
        .attr("stroke", "yellow");
    }

    svg.append("g")
      .attr("transform", `translate(0, ${height})`)
      .call(d3.axisBottom(xScale));

    svg.append("g")
      .call(d3.axisLeft(yTotalScale));

    const yAxis = d3.axisRight(yRatioScale)
      .ticks(4);

    svg.append("g")
      .attr("transform", `translate(${width}, 0)`)
      .call(yAxis);

    const hoverLine = svg.append("line")
      .attr("class", "hover-line")
      .attr("y1", 0)
      .attr("y2", height)
      .attr("stroke", "gray")
      .attr("stroke-dasharray", "4 4")
      .attr("opacity", 0);

    const tooltip = d3.select(tooltipRef.current).style("position", "absolute").style("opacity", 0);

    const handleMouseOver = (event) => {
      if (!isMouseOutsideChart.current) {
        dots.style("opacity", 0);
        const xMouse = event.clientX - svgRef.current.getBoundingClientRect().left - margin.left;
        const yMouse = event.clientY - svgRef.current.getBoundingClientRect().top - margin.top;

        hoverLine.attr("x1", xMouse).attr("x2", xMouse).attr("opacity", 1);

        const x0 = xScale.invert(xMouse);
        const bisectDate = d3.bisector((d) => d.date).left;
        const index = bisectDate(data, x0, 1);
        const d0 = data[index - 1];
        const d1 = data[index];
        
        if (d0 && d1) {
          const closestDataPoint = x0 - d0.date > d1.date - x0 ? d1 : d0;

          tooltip
          .html(
            `<div>Date: ${formatDate(closestDataPoint.date)}</div>` +
            `<div>Total: ${formatNumber(closestDataPoint.total)}</div>` +
            `<div>Ratio: ${formatNumber(closestDataPoint.ratio)}</div>` +
            `<div>Filter: ${formatNumber(closestDataPoint.filter)}</div>` +
            `<div>Remove: ${formatNumber(closestDataPoint.remove)}</div>`
          )
          .style("left", `${xScale(closestDataPoint.date) + margin.left + 10}px`)
          .style("top", `${yTotalScale(closestDataPoint.total) + margin.top + 10}px`)
          .style("opacity", 1);

          if (showTotalLine) {
            const totalDot = svg.select(".total-dot");
            totalDot.style("opacity", 1);
            totalDot.attr("cx", xScale(closestDataPoint.date)).attr("cy", yTotalScale(closestDataPoint.total));
          }

          if (showRatioLine) {
            const ratioDot = svg.select(".ratio-dot");
            ratioDot.style("opacity", 1);
            ratioDot.attr("cx", xScale(closestDataPoint.date)).attr("cy", yRatioScale(closestDataPoint.ratio));
          }

          if (showFilterLine) {
            const filterDot = svg.select(".filter-dot");
            filterDot.style("opacity", 1);
            filterDot.attr("cx", xScale(closestDataPoint.date)).attr("cy", yTotalScale(closestDataPoint.filter));
          }

          if (showRemoveLine) {
            const removeDot = svg.select(".remove-dot");
            removeDot.style("opacity", 1);
            removeDot.attr("cx", xScale(closestDataPoint.date)).attr("cy", yTotalScale(closestDataPoint.remove));
          }
        }
      }
    };

    const handleMouseOut = () => {
      dots.style("opacity", 0);
      hoverLine.attr("opacity", 0);
      isMouseOutsideChart.current = false;
      tooltip.style("opacity", 0);
    };

    svgRef.current.addEventListener("mousemove", handleMouseOver);
    svgRef.current.addEventListener("mouseout", handleMouseOut);
  };

  const toggleTotalLine = () => {
    setShowTotalLine(prevState => !prevState);
  };

  const toggleRatioLine = () => {
    setShowRatioLine(prevState => !prevState);
  };

  const toggleFilterLine = () => {
    setShowFilterLine(prevState => !prevState);
  };

  const toggleRemoveLine = () => {
    setShowRemoveLine(prevState => !prevState);
  };

  return (
    <div ref={graphRef} className="line-graph-container">
      <div className="line-graph-text">
        <ToggleButtonsContainer>
          <ToggleButton active={showTotalLine} onClick={toggleTotalLine}>
            Total <span className="line-indicator total-line"></span>
          </ToggleButton>
          <ToggleButton active={showRatioLine} onClick={toggleRatioLine}>
            Ratio <span className="line-indicator ratio-line"></span>
          </ToggleButton>
          <ToggleButton active={showFilterLine} onClick={toggleFilterLine}>
            Filter <span className="line-indicator filter-line"></span>
          </ToggleButton>
          <ToggleButton active={showRemoveLine} onClick={toggleRemoveLine}>
            Remove <span className="line-indicator remove-line"></span>
          </ToggleButton>
        </ToggleButtonsContainer>
      </div>

      <div ref={tooltipRef}></div>

      <svg ref={svgRef}></svg>

    </div>
  );
};

export default LineGraph;
