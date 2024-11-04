import { useEffect, useRef } from 'react';
import React from 'react';
import image1 from './Frame39.jpg';

// MyComponent 컴포넌트
const MyComponent = () => {
    return (
        <div className="image-container">
            <img src={image1} alt="Description of image" />
        </div>
    );
}

// MapPage 컴포넌트
function MapPage() {
    const mapContainerRef = useRef(null);
    const mapRef = useRef(null);

    useEffect(() => {
        const initializeMap = () => {
            const container = mapContainerRef.current;
            const options = {
                center: new window.kakao.maps.LatLng(37.57098624524391, 126.99255730597434),
                level: 3,
            };

            // Kakao Map 초기화
            const map = new window.kakao.maps.Map(container, options);
            mapRef.current = map;

            // 마커 추가
            const markerPosition = new window.kakao.maps.LatLng(37.57098624524391, 126.99255730597434);
            const marker = new window.kakao.maps.Marker({
                position: markerPosition,
                map: map,
            });

            // 커스텀 오버레이 추가
            const customOverlay = new window.kakao.maps.CustomOverlay({
                position: markerPosition,
                content: '<div class="customoverlay">다솜 - 스터디카페</div>',
                yAnchor: 2,
            });
            customOverlay.setMap(map);

            // 클린업: 컴포넌트 언마운트 시 클린업 작업
            return () => {
                marker.setMap(null);
                customOverlay.setMap(null);
            };
        };

        // Kakao Maps 스크립트 로드
        if (!window.kakao) {
            const script = document.createElement('script');
            script.src = "https://dapi.kakao.com/v2/maps/sdk.js?appkey=YOUR_APP_KEY";
            script.onload = initializeMap;
            document.head.appendChild(script);
        } else {
            initializeMap();
        }
    }, []);

    useEffect(() => {
        const resizeObserver = new ResizeObserver(() => {
            if (mapRef.current) {
                mapRef.current.relayout(); // 사이즈 변경 알림
                mapRef.current.setCenter(new window.kakao.maps.LatLng(37.57098624524391, 126.99255730597434));
                mapRef.current.setLevel(3); // 레벨 재설정
            }
        });

        if (mapContainerRef.current) {
            resizeObserver.observe(mapContainerRef.current);
        }

        // 클린업: ResizeObserver 해제
        return () => {
            if (mapContainerRef.current) {
                resizeObserver.unobserve(mapContainerRef.current);
            }
        };
    }, [mapContainerRef]);

    return (
        <main className="map-page">
            <p className="sub-title">Locations</p>
            <h1 className="main-title">오시는 길</h1>
            <div className="content-container">
                <div
                    ref={mapContainerRef}
                    style={{
                        width: '60%',
                        height: '60%',
                        aspectRatio: '16 / 9'
                    }}
                ></div>
                <MyComponent />
            </div>
        </main>
    );
}

export default MapPage;
