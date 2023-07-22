import React, { useState, useEffect, useRef } from "react";
import ASes_list from './data/sync_ases.txt';
import * as d3 from 'd3';
import StyledTypography from "./StyledTopography";
import { Typography, Card, CardContent, Button, styled, Tooltip } from '@mui/material';
import ReactDOM from 'react-dom';
import * as d3Array from 'd3-array'; // Import d3-array for pairing adjacent elements

const StyledAsnButton = styled(Button)({
  backgroundColor: '#535353',
  color: '#fff',
  '&:hover': {
    backgroundColor: '#000',
  },
});

const Sync_ASes = () => {
  const [list, setList] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(15);
  const [totalPages, setTotalPages] = useState(0);

  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [graphWidth, setGraphWidth] = useState(800);
  const [graphHeight, setGraphHeight] = useState(400);
  const [parsedData, setParsedData] = useState(null);
  const graphContainerRef = useRef(null);
  const [tooltipContent, setTooltipContent] = useState(null);

  useEffect(() => {
    const fetchList = async () => {
      try {
        const response = await fetch(ASes_list);
        const text = await response.text();
        const values = text.split('\n').filter(Boolean);
        setList(values);
        setTotalPages(Math.ceil(values.length / (rowsPerPage * 15)));
      } catch (error) {
        console.error('Error fetching the list:', error);
      }
    };

    fetchList();
  }, [rowsPerPage]);

  useEffect(() => {
    if (parsedData) {
      drawGraph();

      graphContainerRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [parsedData]);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleButtonClick = async (buttonValue) => {
    try {
      const response = await fetch(`http://localhost:5000/parse-csv/${buttonValue}`);
      const data = await response.json();
      if (data.length === 0) {
        setParsedData(null);
      } else {
        setParsedData(data);
      }
    } catch (error) {
      console.error(error);
      // Handle error response
    }
  };

  const handleMouseEnter = (index) => {
    setHoveredIndex(index);
  };

  const handleMouseLeave = () => {
    setHoveredIndex(null);
  };

  const startIndex = (currentPage - 1) * (rowsPerPage * 15);
  const endIndex = startIndex + (rowsPerPage * 15);

  const cells = list.slice(startIndex, endIndex).map((value, index) => (
    <td
      key={index}
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
      }}
    >
      <StyledAsnButton
        className="cell-button"
        style={{
          border: 'none',
          outline: 'none',
          cursor: 'pointer',
          background: ''
        }}
        onMouseEnter={() => handleMouseEnter(index)}
        onMouseLeave={handleMouseLeave}
        onClick={() => handleButtonClick(value)}
      >
        {value}
      </StyledAsnButton>
    </td>
  ));

  const rows = [];
  for (let i = 0; i < rowsPerPage; i++) {
    const rowCells = cells.slice(i * 15, (i + 1) * 15);
    rows.push(<tr key={i}>{rowCells}</tr>);
  }

  const formatDate = (date) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(date).toLocaleDateString(undefined, options);
  };

  const drawGraph = () => {
    if (!graphContainerRef.current) return;

    if (!parsedData || parsedData.length === 0) {
      // Handle empty data scenario (e.g., display a message)
      return;
    }

    const data = parsedData.map((d) => ({
      date: new Date(d.date),
      ratio: +d.ratio,
    }));

    console.log(data)

    const ratioChangePoints = [];

    let prevRatio = null;
    let prevDate = null;

    data.forEach(({ date, ratio }) => {
        if (prevRatio !== null && prevDate.getTime() === date.getTime() && ((prevRatio === 0 && ratio === 1) || (prevRatio === 1 && ratio === 0))) {
        ratioChangePoints.push({ date, ratio });
        }

        prevRatio = ratio;
        prevDate = date;
    });

    const margin = { top: 20, right: 30, bottom: 30, left: 40 };
    const width = graphWidth - margin.left - margin.right;
    const height = graphHeight - margin.top - margin.bottom;

    d3.select(graphContainerRef.current).selectAll("*").remove();

    const svg = d3
      .select(graphContainerRef.current)
      .append("svg")
      .attr("width", graphWidth)
      .attr("height", graphHeight)
      .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

    const x = d3
      .scaleTime()
      .domain([new Date(data[0].date), new Date(data[data.length - 1].date)])
      .range([0, width]);

    const y = d3
      .scaleLinear()
      .domain([0, 1.2 * d3.max(data, (d) => d.ratio)])
      .range([height, 0]);

    const lineGenerator = d3.line().x((d) => x(d.date)).y((d) => y(d.ratio));

    svg
      .append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "#9C9C9C")
      .attr("stroke-width", 1.5)
      .attr("d", lineGenerator);

    // Add ratio change points to the graph
    svg
      .selectAll(".ratio-change-point")
      .data(ratioChangePoints)
      .enter()
      .append("circle")
      .attr("class", "ratio-change-point")
      .attr("cx", (d) => x(d.date))
      .attr("cy", (d) => y(d.ratio))
      .attr("r", 5)
      .attr("fill", "black")
      .on("mouseover", (d) => {
        setTooltipContent(`Date: ${formatDate(d.date)} Ratio: ${d.ratio}`);
      })
      .on("mouseout", () => {
        setTooltipContent(null);
      });

    svg
      .append("g")
      .attr("transform", `translate(0, ${height})`)
      .call(d3.axisBottom(x));

    svg.append("g").call(d3.axisLeft(y));

    // Add tooltip
    const tooltip = svg.append("g")
    .attr("class", "tooltip")
    .style("display", "none");

    tooltip.append("rect")
        .attr("width", 140)
        .attr("height", 40)
        .attr("rx", 10)
        .attr("ry", 10)
        .style("fill", "rgba(0, 0, 0, 0.8)");

    tooltip.append("text")
        .attr("x", 70)
        .attr("y", 20)
        .attr("text-anchor", "middle")
        .attr("alignment-baseline", "middle")
        .attr("font-size", "10px")
        .attr("font-weight", "light")
        .attr("fill", "#fff");

    // Add tooltip interaction
    svg.selectAll(".ratio-change-point").on("mouseover", (event, d) => {
        tooltip.select("text").text(`Date: ${formatDate(d.date)} Ratio: ${d.ratio}`);
        tooltip.style("display", "block");
    }).on("mousemove", (event) => {
        const [x, y] = d3.pointer(event);
        tooltip.attr("transform", `translate(${x - 60}, ${y - 50})`); // Position the tooltip above the point
    }).on("mouseout", () => {
        tooltip.style("display", "none");
    });
  };

  return (
    <div className="sync-ases-container">
      <StyledTypography variant="h2" component="h2" className="mt-4 mb-2">
        LIST OF ASES SHOWING A SYNCHRONOUS BEHAVIOR
      </StyledTypography>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <tbody>{rows}</tbody>
      </table>

      <div className="pagination" style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
        {Array.from({ length: totalPages }, (_, index) => (
          <button
            key={index}
            className={`pagination-btn ${currentPage === index + 1 ? 'active' : ''}`}
            style={{
              background: 'none',
              textDecoration: currentPage === index + 1 ? 'underline' : 'none',
              cursor: 'pointer',
              outline: 'none',
              border: 'none',
              padding: '0',
              margin: '0 5px',
              marginBottom: '20px'
            }}
            onClick={() => handlePageChange(index + 1)}
          >
            {index + 1}
          </button>
        ))}
      </div>

      <div
        className="graph-container"
        ref={graphContainerRef}
        style={{
          display: 'flex',
          justifyContent: 'center',
          marginTop: '20px',
          marginBottom: '20px',
        }}
      ></div>

    </div>
  );
};

export default Sync_ASes;
