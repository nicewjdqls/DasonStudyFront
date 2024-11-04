import { CCarousel, CCarouselItem, CImage } from '@coreui/react';
import image1 from './Common_1.png';
import image2 from './Common_2.png';
import image3 from './Common_3.png';
import image4 from './Common_4.png';
import image5 from './Private_1.png';
import image6 from './Private_2.png';
import image7 from './Private_3.png';
import image8 from './Private_4.png';
import image9 from './Private_1.png';


function GalleryPage() {
    return (
        <main className="gallery-page">
            <p className="sub-title">Gallery</p>
            <h1 className="main-title">갤러리</h1>
            
            <div className="carousel-container">
                <h2 className="carousel-title">1인실</h2>
                <h2 className="carousel-sub-title">Common Sit</h2>
                <CCarousel interval={600} controls transition="crossfade">
                    <CCarouselItem>
                        <CImage className="d-block w-100" src={image1} alt="slide 1" />
                    </CCarouselItem>
                    <CCarouselItem>
                        <CImage className="d-block w-100" src={image2} alt="slide 2" />
                    </CCarouselItem>
                    <CCarouselItem>
                        <CImage className="d-block w-100" src={image3} alt="slide 3" />
                    </CCarouselItem>
                    <CCarouselItem>
                        <CImage className="d-block w-100" src={image4} alt="slide 4" />
                    </CCarouselItem>
                </CCarousel>
            </div>

            <div className="carousel-container">
                <h2 className="carousel-title">1인실</h2>
                <h2 className="carousel-sub-title">Private Sit</h2>
                <CCarousel interval={600} controls transition="crossfade">
                    <CCarouselItem>
                        <CImage className="d-block w-100" src={image5} alt="slide 5" />
                    </CCarouselItem>
                    <CCarouselItem>
                        <CImage className="d-block w-100" src={image6} alt="slide 6" />
                    </CCarouselItem>
                    <CCarouselItem>
                        <CImage className="d-block w-100" src={image7} alt="slide 7" />
                    </CCarouselItem>
                    <CCarouselItem>
                        <CImage className="d-block w-100" src={image8} alt="slide 8" />
                    </CCarouselItem>
                </CCarousel>
            </div>
            <div className="carousel-container">
                <h2 className="carousel-title">다인실</h2>
                <h2 className="carousel-sub-title">Study Room</h2>
                <CImage className="d-block w-100" src={image9} alt="slide 9" />
            </div>
        </main>
    );
}

export default GalleryPage;