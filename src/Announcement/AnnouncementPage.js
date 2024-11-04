import React from 'react';
import image1 from './Group35.jpg';


// MyComponent 컴포넌트
const MyComponent = () => {
    return (
        <div className="image-container">
            <img src={image1} alt="Description of image" />
        </div>
    );
}


function AnnouncementPage() {
    return (
        <main className="announcement-page">
            <p className="sub-title">Announcement</p>
            <h1 className="main-title">공지사항</h1>
            <MyComponent/>
        </main>
    )
}

export default AnnouncementPage;
