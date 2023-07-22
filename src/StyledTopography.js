import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

const StyledTypography = styled(Typography)(({ theme }) => ({
    backgroundColor: '#000',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing(1),
    borderRadius: '50px',
    border: '2px solid #000',
    fontSize:'20px',
    marginTop:'1rem',
    marginBottom:'1rem',
    color:'#fff',
  }));
  
  export default StyledTypography;
  