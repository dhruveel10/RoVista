import React, { useRef } from 'react';
import { Link as RouterLink, NavLink as RouterNavLink, useLocation } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button } from '@mui/material';
import { styled } from '@mui/material/styles';

const AppBarWrapper = styled(AppBar)(({ theme }) => ({
  backgroundColor: '#000',
  color: '#fff',
  boxShadow: 'none',
}));

const LogoLink = styled(RouterLink)(({ theme }) => ({
  flexGrow: 1,
  textDecoration: 'none',
  color: '#fff',
  fontWeight: 'bold',
  fontSize: '1.5rem',
}));

const NavLinkWrapper = styled('div')(({ theme }) => ({
  backgroundColor: '#fff',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(1),
  borderRadius: '50px', // Create an oval shape
  border: '2px solid #000', // Add a black border
}));

const StyledLink = styled(RouterNavLink)(({ theme }) => ({
  marginLeft: theme.spacing(2),
  textDecoration: 'none',
  color: '#000',
  borderRadius: '30px',
  padding: theme.spacing(1, 2),
  '&.active': {
    backgroundColor: '#000',
    color: '#fff',
  },
}));

const Header = () => {
  const location = useLocation();
  const aboutUsRef = useRef(null);
  const contactUsRef = useRef(null);

  const scrollToSection = (ref) => {
    if (ref.current) {
      const elementPosition = ref.current.offsetTop;
      window.scrollTo({
        top: elementPosition - 60, // Adjust this value to offset the AppBar height
        behavior: 'smooth',
      });
    }
  };

  return (
    <AppBarWrapper position="static">
      <Toolbar>
        <LogoLink to="/">RoVista</LogoLink>
        <NavLinkWrapper>
          <StyledLink to="/">Home</StyledLink>
          <StyledLink to="/results">Results</StyledLink>
          <StyledLink to="/download">Download Data</StyledLink>
        </NavLinkWrapper>
      </Toolbar>
    </AppBarWrapper>
  );
};

export default Header;
