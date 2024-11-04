import { 
    CRow, 
    CCol,
    CTabs,
    CTabList,
    CTab,
    CContainer,
    CButton,
    CForm,
    CFormFloating,
    CFormInput,
    CFormLabel,
} from '@coreui/react';
import React, { useEffect, useRef, useState } from 'react';
import { IoExitOutline } from "react-icons/io5";

import MyPageInfo from "./MyPageInfo";
import DeleteAccount from "./DeleteAccount";
import ReservationInfo from './ReservationInfo';

import api from '../api/api';

function MyPage(props) {
    //프로필 뱃지 설정 변수
    // const circleRef = useRef(null);
    const [fontSize, setFontSize] = useState(30);
    
    const [check, setCheck] = useState(false);
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    const [pw, setPw] = useState('');
    const userId = localStorage.getItem("id");
    // const [userName, setUserName] = useState(localStorage.getItem("name")[0]); // 초기값 설정
    const [userName, setUserName] = useState(localStorage.getItem("name") ? localStorage.getItem("name")[0] : '');
    const isSNSLoggedIn = localStorage.getItem("naver");


    //active 탭 설정 변수
    const [activeTab, setActiveTab] = useState(1);

    //로그아웃 호출 함수
    function onLogout() {
        props.onLogout();
    }

    const handleKeyDown = (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            conTest();
        }
    };

    //비밀번호 확인
    const conTest = () => {
        const data = { userId, userPw: pw };
        api.post('mypages/mypagePw', data)
            .then((res) => {
                if (res.data.success) {
                    setCheck(true);
                    updateFontSize();
                } else {
                    alert(res.data.message);
                }
            }).catch((err) => {
                alert(err.response.data.message);
                console.log(err);
            });
    };

    const updateFontSize = () => {
        const div = document.getElementById('profileCircle');
        if (div) {
            const size = div.offsetWidth;
            setFontSize(`${size * 0.7}px`);
        }
    };

    //프로필 뱃지 생성
    useEffect(() => {
        const name = userName;
        if (name) {
            setUserName(name[0]);
        }
    }, []);

    // useEffect(() => {
    //     if(isSNSLoggedIn === "1") {
    //         setCheck(true);
    //     }
    // })

    useEffect(() => {       

        // 조건에 관계없이 초기값 업데이트
        updateFontSize();
        window.addEventListener('resize', updateFontSize);

        return () => {
            window.removeEventListener('resize', updateFontSize);
        };
    }, [check]);   


    const handleTabClick = (tabKey) => {
        setActiveTab(tabKey);
    };

    const getTabStyle = (tabKey) => {
        return {
            width: '100%',
            backgroundColor: activeTab === tabKey ? 'black' : 'white',
            color: activeTab === tabKey ? 'white' : 'black',
            transition: 'background-color 0.2s, color 0.2s',
            borderRadius: '0',
        };
    };

    return (
        <main className="my-page">
            {(check === false && isLoggedIn) &&
            <div className="mypage-entry-form">
                <p className="sub-title">My page</p>
                <h1 className="main-title">마이페이지</h1>
                <CForm>
                    <CFormFloating className="mb-3">
                        <CFormInput
                            type="password"
                            id="floatingPassword"
                            value={pw}
                            onChange={e => setPw(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="password" />
                        <CFormLabel htmlFor="floatingPassword">비밀번호</CFormLabel>
                        { isSNSLoggedIn === "1" &&
                            <p>소셜 회원가입 회원의 초기 비밀번호는 휴대폰번호(11자리)입니다.</p>
                        }
                    </CFormFloating>

                    <CButton
                        onClick={conTest}
                        className="p-button"
                        variant="mb-3 p-1 px-3"
                        style={{ borderRadius: '13px', borderWidth: '2px' }}>
                        확인
                    </CButton>
                </CForm>
            </div>                
            }         
            {(check === true && isLoggedIn) &&
                <CContainer>
                <CRow>
                    <CCol xs={2} md={3} style={{ background: 'linear-gradient(180deg, #FFF 0%, #00AF50 100%)', display: 'flex', flexDirection: 'column', height: '100vh' }}>
                        <div 
                            id="profileCircle"
                            style={{
                                width: '60%',
                                aspectRatio: '1',
                                backgroundColor: '#28a745',
                                borderRadius: '50%',
                                fontSize: fontSize,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                margin: '30% auto',
                            }}
                        >
                            {localStorage.getItem("name")[0]}
                        </div>
                        <CTabs activeItemKey={activeTab} onActiveItemChange={setActiveTab}>
                            <CTabList variant="pills" style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', fontWeight: 'bold' }}>
                                <CTab 
                                    itemKey={1}
                                    style={getTabStyle(1)}                                 
                                    onClick={() => handleTabClick(1)}
                                >
                                    회원 정보
                                </CTab>
                                <CTab 
                                    itemKey={2}
                                    style={getTabStyle(2)}                                
                                    onClick={() => handleTabClick(2)}
                                >
                                    예약 정보
                                </CTab>
                            </CTabList>
                        </CTabs>

                        {   (activeTab === 1 && isSNSLoggedIn !== "1")
                            && <div className='mt-5' style={{ display: 'flex', justifyContent: 'center', marginTop: 'auto', padding: '20px', }}>
                                <CButton
                                    style={{display: 'flex', alignItems: 'center'}}
                                    onClick={() => {
                                        setActiveTab(null);
                                    }}                                
                                >
                                    <IoExitOutline style={{ transform: 'scaleX(-1)' }}/>
                                    <p style={{ marginLeft: '10px', margin: 0 }}>회원탈퇴</p>
                                </CButton>                                    
                            </div>                           
                        }                                             
                    </CCol>

                    <CCol xs={8} md={8} style={{ padding: '20px' }}>
                        { (activeTab === 1)
                            && <MyPageInfo />
                        }
                        { (activeTab === 2)
                            && <ReservationInfo />
                        }
                        { (activeTab === null)
                            && <DeleteAccount onLogout={onLogout}/>
                        }
                    </CCol>
                </CRow>
                
            </CContainer>            
            }   
                        
        </main>
    )
}

export default MyPage;