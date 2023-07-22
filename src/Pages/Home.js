import React, { useRef, useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import { Typography, Link, Grid } from '@mui/material';
import styled, { keyframes } from 'styled-components';

const sampleImage1 = 'https://picsum.photos/800/600';
const sampleImage2 = 'https://picsum.photos/800/600';

const HomeBox = styled(Box)`
  height: 100vh;
  position: relative;
  background-color: #fff;
`;

const ContentContainer = styled('div')`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
    height: 100%;
    color: #000;
    overflow: hidden;
`;

const ImageContainer = styled('div')`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
`;

const Image = styled('img')`
  width: 400px;
  height: 300px;
  border-radius: 8px;
  margin: 20px;
`;

const SectionLink = styled(Link)`
  text-decoration: underline;
  cursor: pointer;
`;

const bounceAnimation = keyframes`
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-15px);
  }
`;

const ScrollIndicator = styled('div')`
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  width: 30px;
  height: 30px;
  border: 2px solid #fff;
  border-radius: 50%;
  cursor: pointer;
  animation: ${bounceAnimation} 1s infinite;
  background: #000;
  z-index: 2;
`;

const RestOfContent = styled('div')`
  padding-top: ${(props) => (props.isVisible ? '0' : '5vh')};
  transition: padding-top 0.5s ease;
`;

const Home = () => {
  const aboutUsRef = useRef(null);
  const contactUsRef = useRef(null);
  const homeContentRef = useRef(null);
  const [showScrollIndicator, setShowScrollIndicator] = useState(true);
  const [showRestOfContent, setShowRestOfContent] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const offset = 200;
      const scrolled = window.pageYOffset > offset;
      setShowScrollIndicator(!scrolled);
      setShowRestOfContent(scrolled);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const scrollToNextSection = () => {
    const nextSection = homeContentRef.current || aboutUsRef.current || contactUsRef.current;
    if (nextSection) {
      window.scrollTo({
        top: nextSection.offsetTop,
        behavior: 'smooth',
      });
    }
  };

  return (
    <HomeBox>
      <ContentContainer>
        <Typography variant="h2" component="h1" gutterBottom>
          Welcome to RoVista
        </Typography>
        <Typography variant="body1" component="p" gutterBottom>
          RoVista measures the RoV filtering ratio of network operators. This ratio is derived from our measurement
          technique that uses (1) in-the-wild invalid BGP Prefixes and (2) IP-ID side-channel technique. The details will
          be published soon.
          <br />
          The table below shows the ROV filtering Ratio based on our most-recent snapshots. Please click the ASN to see
          its historical pattern of ROV Ratio.
          <br />
          An ROV-ratio of 1 means this network fully implements ROV as far as we can see, whereas an ROV-ratio of 0 means
          this network is NOT implementing ROV.
        </Typography>
      </ContentContainer>

        {showScrollIndicator && (
            <ScrollIndicator onClick={scrollToNextSection} />
        )}
        {!showRestOfContent && (
            <SectionLink onClick={scrollToNextSection}>Scroll Down</SectionLink>
        )}

      <RestOfContent isVisible={showRestOfContent}>
        
        <Grid container>
            <Grid item xs={12} md={6}>
                <ImageContainer ref={homeContentRef}>
                <Image src={sampleImage1} alt="Sample" />
                </ImageContainer>
            </Grid>
            <Grid item xs={12} md={6} style={{ display: 'flex', alignItems: 'center', paddingLeft: '20px' }}>
                <div>
                <Typography variant="h4" gutterBottom>
                    Image 1 Title
                </Typography>
                <Typography variant="body1">
                    This is the description for Image 1.
                </Typography>
                </div>
            </Grid>

            <Grid item xs={12} md={6} style={{ display: 'flex', alignItems: 'center', paddingLeft: '140px' }}>
                <div>
                <Typography variant="h4" gutterBottom>
                    Image 2 Title
                </Typography>
                <Typography variant="body1">
                    This is the description for Image 2.
                </Typography>
                </div>
            </Grid>
            <Grid item xs={12} md={6}>
                <ImageContainer>
                <Image src={sampleImage2} alt="Sample" />
                </ImageContainer>
            </Grid>
        </Grid>


        <div ref={aboutUsRef} id="about" style={{ background: '#000', padding: '50px', color: '#fff' }}>
          <Typography variant="h2" component="h2" gutterBottom>
            About Us
          </Typography>
          <Typography variant="body1" component="p" gutterBottom>
            This is the About Us section content.
          </Typography>
        </div>

        <div ref={contactUsRef} id="contact" style={{ background: '#475a28', padding: '50px' }}>
          <Typography variant="h2" component="h2" gutterBottom>
            Contact Us
          </Typography>
          <Typography variant="body1" component="p" gutterBottom>
            This is the Contact Us section content.
          </Typography>
        </div>
      </RestOfContent>
    </HomeBox>
  );
};

export default Home;
