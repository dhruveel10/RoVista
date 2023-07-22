import React, { useEffect, useState } from 'react';
import LineGraph from '../LineGraph';
import WorldMap from '../WorldMap';
import Asn_table from '../Asn_table';
import { csv } from 'd3';
import overview from '../data/new_overview.csv';
import ASes_100_rov from '../ASes_100_rov';
import Sync_ASes from '../Sync_ASes';
import { Container, Typography, Select, MenuItem, Grid, Collapse } from '@mui/material';
import StyledTypography from '../StyledTopography';

const Result = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [overviewData, setOverviewData] = useState([]);
  const [itemsPerPage, setItemsPerPage] = useState(15);
  const [selectedCountry, setSelectedCountry] = useState(null);

  // New state variable to track whether the components should be shown or hidden
  const [showComponents, setShowComponents] = useState(false);

  const [selectedAsn, setSelectedAsn] = useState(null);
  const [showLineGraph, setShowLineGraph] = useState(false);

  useEffect(() => {
    // Load and parse the CSV data
    csv(overview).then(data => {
      setOverviewData(data);
    });
  }, []);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (event) => {
    setItemsPerPage(Number(event.target.value));
    setCurrentPage(1); // Reset current page when changing items per page
  };

  const totalItems = overviewData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const pageNumbers = Array.from({ length: totalPages }, (_, index) => index + 1);

  const handleCountryClick = (country) => {
    setSelectedCountry(country);
    setShowComponents(true);
  };

  return (
    <Container maxWidth="lg">
      <Grid container spacing={4} alignItems="center">
        <Grid item xs={12}>
          <div className="map-container">
            <div className={`map-wrapper ${showComponents ? 'collapsed' : ''}`}>
              {/* Pass the collapsed state as a prop to WorldMap */}
              <WorldMap onCountryClick={handleCountryClick} selectedCountry={selectedCountry} collapsed={showComponents} />
            </div>
          </div>
        </Grid>
      </Grid>

      {/* Components below the map */}
      <div className="additional-components" style={{ width: '100%' }}>
        <Collapse in={showComponents} timeout={500}>
          <div>

            <div id="asn-table-section" className="table-container mt-4">
              <Asn_table
                data={overviewData}
                page={currentPage}
                itemsPerPage={itemsPerPage}
                onPageChange={handlePageChange}
                totalItems={totalItems}
                selectedCountry={selectedCountry}
              />
            </div>

            <ASes_100_rov />
            <Sync_ASes />
          </div>
        </Collapse>
      </div>
    </Container>
  );
};

export default Result;
