import { Outlet } from "react-router-dom";
import Header from "./Header";
import { Container } from '@mui/material';

const Layout = () => {
    return ( 
        <main>
            <Header/>        
            <Outlet/>
        </main>
     );
}
 
export default Layout;