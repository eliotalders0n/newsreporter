
import React from 'react';
import { Container, Image } from 'react-bootstrap';

const Header  = () => {
    return (
        <Container fluid className='fixed-top d-flex justify-content-center' style={{backgroundColor: 'rgb(13,85,12)',}}>
           <Image
            style={logo} 
            src='assets/logo.png'
            />
        </Container>
    )
}  


const logo = {
        width: "20vh",
        resizeMode: 'contain',
        // margin: "1px 20%"
    }

export default Header;