import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Select,
  MenuItem,
  Grid,
  Collapse,
  styled,
  Button,
  Pagination,
  Table as MuiTable, // Rename Mui Table to avoid conflict
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from '@mui/material';
import StyledTypography from './StyledTopography';
import LineGraph from './LineGraph';

const TableContainer = styled('div')({
  width: '100%',
  marginBottom: '2rem',
});

const SearchInput = styled('input')({
  padding: '0.5rem',
  border: '1px solid #ccc',
  borderRadius: '10px',
  borderColor: '#000',
  marginBottom: '1rem',
});

const StyledTable = styled(MuiTable)({ // Use StyledTable instead of Table
  width: '100%',
  borderCollapse: 'collapse',
});

const Th = styled('th')({
  padding: '0.5rem',
  cursor: 'pointer',
});

const Td = styled('td')({
  padding: '0.5rem',
});

const PaginationButton = styled(Button)(({ theme }) => ({
  margin: theme.spacing(0.5),
  minWidth: 'auto',
  padding: theme.spacing(1),
  '&.Mui-disabled': {
    backgroundColor: theme.palette.grey[200],
    color: theme.palette.text.primary,
  },
  '&.active-page': {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.common.black,
  },
}));

const StyledAsnButton = styled(Button)({
  backgroundColor: '#535353', // Change the background color to your desired color
  color: '#fff', // Change the text color to white for better visibility
  '&:hover': {
    backgroundColor: '#000', // Change the hover background color if desired
  },
});

const StickyTableHeader = styled(TableHead)({
  position: 'sticky',
  top: 0,
  zIndex: 1,
  backgroundColor: '#CCC',
});

const Asn_table = ({ data, page, itemsPerPage, onPageChange, totalItems, selectedCountry}) => {
  const startIndex = (page - 1) * itemsPerPage;

  const [searchQuery, setSearchQuery] = useState('');
  const [filteredData, setFilteredData] = useState([]);
  const [totalVisibleItems, setTotalVisibleItems] = useState(totalItems);

  const [searchPlaceholder, setSearchPlaceholder] = useState('');

  const [sortOrder, setSortOrder] = useState({ column: null, direction: 'asc' });

  const [perPage, setPerPage] = useState(itemsPerPage);

  const [selectedAsn, setSelectedAsn] = useState(null);
  const [showLineGraph, setShowLineGraph] = useState(false);

  useEffect(() => {
    setPerPage(itemsPerPage);
  }, [itemsPerPage]);

  useEffect(() => {
    const filteredData = data.filter((rowData) => {
      const values = Object.values(rowData);
      return values.some((value) =>
        String(value).toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
    setFilteredData(filteredData);
    setTotalVisibleItems(filteredData.length);
  }, [data, searchQuery, page]);

  useEffect(() => {
    if (selectedCountry && selectedCountry.region) {
      setSearchQuery(selectedCountry.region);
    } else {
      setSearchQuery('');
    }
  }, [selectedCountry]);

  useEffect(() => {
    if (searchQuery === '') {
      if (selectedCountry && selectedCountry.region) {
        setSearchPlaceholder(`Search in ${selectedCountry.region}...`);
      } else {
        setSearchPlaceholder('Search in all regions...');
      }
    } else {
      setSearchPlaceholder('');
    }
  }, [searchQuery, selectedCountry]);

  const visibleData = filteredData.length
    ? filteredData.slice(startIndex, startIndex + itemsPerPage)
    : data.slice(startIndex, startIndex + itemsPerPage);
  const totalPages = Math.ceil(totalVisibleItems / itemsPerPage);

  const handlePageChange = (newPage, newPerPage) => {
    let lastPage = totalPages;
    setPerPage(newPerPage);

    if (searchQuery) {
      lastPage = Math.ceil(filteredData.length / newPerPage);
    } else {
      lastPage = Math.ceil(totalItems / newPerPage);
    }
    if (newPage >= 1 && newPage <= lastPage) {
      onPageChange(newPage, newPerPage);
    }
  };

  const handleColumnClick = (columnName) => {
    if (sortOrder.column === columnName) {
      // Same column clicked, toggle the direction
      setSortOrder((prevSortOrder) => ({
        column: columnName,
        direction: prevSortOrder.direction === 'asc' ? 'desc' : 'asc',
      }));
    } else {
      // Different column clicked, set the direction to ascending
      setSortOrder({ column: columnName, direction: 'asc' });
    }
  };

  const sortData = (column, direction) => {
    const sortedData = [...visibleData].sort((a, b) => {
      const valueA = a[column];
      const valueB = b[column];

      if (direction === 'asc') {
        if (valueA < valueB) return -1;
        if (valueA > valueB) return 1;
      } else if (direction === 'desc') {
        if (valueA > valueB) return -1;
        if (valueA < valueB) return 1;
      }

      return 0;
    });

    return sortedData;
  };

  const sortedData = sortOrder.column ? sortData(sortOrder.column, sortOrder.direction) : visibleData;

  const handleAsnClick = (asn) => {
    setSelectedAsn(asn);
    setShowLineGraph(true);
  };
  
  return (
    <TableContainer>
      <StyledTypography variant="h2" component="h2" className="mt-4 mb-2">
        Overview of ROV Filtering Ratio
      </StyledTypography>

      <SearchInput
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder={searchPlaceholder}
      />

      <StyledTable stickyHeader>
        <StickyTableHeader>
          <TableRow>
            <Th onClick={() => handleColumnClick('rank')}>
              Rank
              {sortOrder.column === 'rank' && <span>{sortOrder.direction === 'asc' ? ' ↑' : ' ↓'}</span>}
            </Th>
            <Th onClick={() => handleColumnClick('asn')}>
              ASN
              {sortOrder.column === 'asn' && <span>{sortOrder.direction === 'asc' ? ' ↑' : ' ↓'}</span>}
            </Th>
            <Th onClick={() => handleColumnClick('organization')}>
              Organization
              {sortOrder.column === 'organization' && <span>{sortOrder.direction === 'asc' ? ' ↑' : ' ↓'}</span>}
            </Th>
            <Th onClick={() => handleColumnClick('country')}>
              Country
              {sortOrder.column === 'country' && <span>{sortOrder.direction === 'asc' ? ' ↑' : ' ↓'}</span>}
            </Th>
            <Th onClick={() => handleColumnClick('ratio')}>
              ROV-Ratio
              {sortOrder.column === 'ratio' && <span>{sortOrder.direction === 'asc' ? ' ↑' : ' ↓'}</span>}
            </Th>
          </TableRow>
        </StickyTableHeader>
        <TableBody>
          {sortedData.map((rowData, index) => (
            <TableRow key={index}>
              <TableCell>{rowData.rank}</TableCell>
              <TableCell>
                <StyledAsnButton className="asn-button" onClick={() => handleAsnClick(rowData.asn)}>
                  {rowData.asn}
                </StyledAsnButton>
              </TableCell>
              <TableCell>{rowData.organization}</TableCell>
              <TableCell>{rowData.country}</TableCell>
              <TableCell>{rowData.ratio}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </StyledTable>

      <div style={{ marginTop: '1rem' }}>
        <Pagination
          count={totalPages} // Set the total number of pages
          page={page} // Current page
          onChange={(event, newPage) => handlePageChange(newPage, perPage)} // Handle page change
        />
      </div>
                      
      {showLineGraph && selectedAsn && (
        <Grid item xs={12} sm={6}>
          <StyledTypography variant="h2" component="h2" className="mt-4 mb-2">
            AS-SPECIFIC ROV FILTERING RATIO
          </StyledTypography>
          <LineGraph asn={selectedAsn}/>
        </Grid>
      )}  

    </TableContainer>
  );
};

export default Asn_table;
