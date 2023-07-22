import React, { useEffect, useRef, useState } from 'react';
import { styled } from '@mui/material/styles';
import { Container, Grid, Paper, Typography } from '@mui/material';
import * as d3 from 'd3';
import { geoNaturalEarth1, geoPath } from 'd3-geo';
import worldData from './data/GeoChart.world.geo.json';
import overview from './data/new_overview.csv';

// Add the CSS styles
const MapContainer = styled(Grid)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(1),
}));

const MapSvg = styled('svg')(({ theme }) => ({
  maxWidth: '100%',
  maxHeight: 400,
}));

const TextContainer = styled(Grid)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  [theme.breakpoints.down('xs')]: {
    marginTop: theme.spacing(2),
    textAlign: 'center',
  },
}));

// Add the CSS classes for collapsed state
const CollapsedMapSvg = styled(MapSvg)({
  opacity: 0.6,
});


const WorldMap = ({ onCountryClick, selectedCountry}) => {
  const svgRef = useRef(null);
  const regionMap = useRef(new Map());
  const legendRef = useRef(null);

  // New state variable to track whether the map is expanded or collapsed
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const width = 500;
    const height = 500;

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    const projection = geoNaturalEarth1()
      .scale(100)
      .translate([width / 2, height / 2]);

    const path = geoPath().projection(projection);

    d3.csv(overview).then(data => {
      data.forEach(d => {
        regionMap.current.set(d.country_iso, d.region);
      });

      const getCountryColor = (country_iso) => {
        const region = regionMap.current.get(country_iso);
        //console.log(region); // Log the region value to verify it is correct
  
        if (region === 'APNIC') return '#1f77b4';
        if (region === 'ARIN') return '#ff7f0e';
        if (region === 'RIPE NCC') return '#2ca02c';
        if (region === 'LACNIC') return '#d62728';
        if (region === 'AFRINIC') return '#9467bd';
        return '#ccc';
      };
      
      const handleMouseOver = (event, d) => {
        d3.select(event.currentTarget).attr('fill', '#6B6766');
      };
  
      const handleMouseOut = (event, d) => {
        d3.select(event.currentTarget).attr('fill', d => getCountryColor(d.properties.iso_a2));
      };
  
      const handleClick = (event, d) => {
        const countryIso = d.properties.iso_a2;
        const region = regionMap.current.get(countryIso);
  
        //console.log(region);

        const countriesInSameRegion = Array.from(regionMap.current.entries())
          .filter(([iso, r]) => r === region && iso !== countryIso)
          .map(([iso]) => ({
            iso,
            name: worldData.features.find(feature => feature.properties.iso_a2 === iso)?.properties.name || '',
            region,
          }));

        onCountryClick({ iso: countryIso, region, countriesInSameRegion });
      
      };

      svg.selectAll('path')
        .data(worldData.features)
        .join('path')
        .attr('d', path)
        .attr('stroke', '#333')
        .attr('fill', d => getCountryColor(d.properties.iso_a2))
        .attr('opacity', 0.8)
        .on('mouseover', handleMouseOver)
        .on('mouseout', handleMouseOut)
        .on('click', handleClick);

      const legendSvg = d3.select(legendRef.current)
        .attr('width', 200)
        .attr('height', 200);

      const legendData = [
        { color: '#1f77b4', region: 'APNIC' },
        { color: '#ff7f0e', region: 'ARIN' },
        { color: '#2ca02c', region: 'RIPE NCC' },
        { color: '#d62728', region: 'LACNIC' },
        { color: '#9467bd', region: 'AFRINIC' },
        { color: '#ccc', region: 'Other' }
      ];

      const legendItemHeight = 30;
      const legendItemWidth = 150;

      const legend = legendSvg.selectAll('.legend-item')
        .data(legendData)
        .enter()
        .append('g')
        .attr('class', 'legend-item')
        .attr('transform', (d, i) => `translate(10, ${i * legendItemHeight})`);

      legend.append('rect')
        .attr('width', 20)
        .attr('height', 20)
        .attr('fill', d => d.color);

      legend.append('text')
        .attr('x', 30)
        .attr('y', 15)
        .text(d => d.region);
    });
  }, []);

  // Add useEffect to reset the collapsed state when the selectedCountry changes
  useEffect(() => {
    setCollapsed(false);
  }, [selectedCountry]);

  return (
    <Container maxWidth="lg">
      <Grid container spacing={4} alignItems="center">
        <Grid item xs={12} sm={6}>
          <TextContainer onClick={() => setCollapsed(!collapsed)}>
            <Typography variant="h3" component="h2" style={{ fontSize: 40, fontWeight: 'bold', color: '#000' }}>
              World Map colored according to RIR regions
            </Typography>
          </TextContainer>
          <TextContainer>
            <Typography variant="body1" style={{ fontSize: 14, color: '#666', marginTop: 10 }}>
              Click on a country to view more information about ASes in that region.
            </Typography>
          </TextContainer>
        </Grid>
        
        <Grid item xs={12} sm={6}>
          {/* Render the collapsed map */}
          <MapContainer>
            {collapsed ? (
              <CollapsedMapSvg ref={svgRef} className="map-svg"></CollapsedMapSvg>
            ) : (
              <MapSvg ref={svgRef} className="map-svg"></MapSvg>
            )}
          </MapContainer>
        </Grid>
      </Grid>
    </Container>
  );

};

export default WorldMap;
