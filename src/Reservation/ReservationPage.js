import { 
    CContainer, 
    CRow, 
    CCol, 
    CDropdown, 
    CDropdownToggle, 
    CDropdownMenu, 
    CDropdownItem, 
    CButton, 
    CForm,
    CFormInput,
    COffcanvas,
    COffcanvasBody,
} from '@coreui/react'
import React, { useState, useEffect, useRef, useCallback } from "react";
import DatePicker from 'react-datepicker';
import { ko } from "date-fns/locale/ko";
import api from '../api/api';
import image1 from './Frame117.png';
// import { setHours, setMinutes } from 'date-fns';

function ReservationPage() {
    const hours = Array.from({ length: 12 }, (_, index) => index + 1);
    const minutes = Array.from({ length: 6 }, (_, index) => index * 10);
    const credits = Array.from([2, 4, 7, 12, 30, 50, 100]);
    const price = {
        "common": {
            2: "3,000",
            4: "5,000",
            7: "7,000",
            12: "10,000",
            30: "40,000",
            50: "60,000",
            100: "80,000",
        },
        "private": {
            2: "12,000",
            4: "21,000",
            7: "35,000",
            12: "54,000",
            30: "120,000",
            50: "180,000",
            100: "300,000",
        },
        "fixed": "140,000"
    };

    const isLoggedIn = localStorage.getItem("isLoggedIn");
    const userId = localStorage.getItem("id");
    const [visible, setVisible] = useState(false);

    //선택 시간 정보
    const [selectTime, setSelectTime] = useState({
        amPm: null,
        hour: null,
        minute: null,
        credit: null,
    })

    //예약 정보
    const [form, setForm] = useState({
        userId: userId,
        reserveDate: null,
        expireDate: null,
        startTime: null,        
        chargeTime: null,
        sitNum: '',
    });

    //좌석타입 별 개수
    const sitCount = {
        "common": 20,
        "private": 17,
        "fixed": 11,
    };

    //예약권 선택 - 시간 이용권 | 고정석 기간권
    const [ticketType, setTicketType] = useState('');
    const [ticketMenu, setTicketMenu] = useState('');
    //좌석 선택 - 1인실 (Common) | 1인실 (Private) | 고정석
    const [sitType, setSitType] = useState('');
    const [sitMenu, setsitMenu] = useState('');
    const [sitNum, setSitNum] = useState([]);

    const sitList = (type, num) => {
        var list = [];
        let i = 1;
        let count = 0;
        if (type === 'common') {
            i = 1;
            count = num + 1;
        }
        else if (type === 'fixed') {
            i = sitCount.common + 1;
            count = i + num;
        }
        else if (type === 'private') {
            i = sitCount.common + sitCount.fixed + 1;
            count = i + num;
        }
        for(i ; i < count ; i++) {
            list.push(
            <CDropdownItem 
            key={i} 
            id={i} 
            as="button"
            onClick={(e) => {
                setVisible(false); 
                setForm({...form, sitNum: e.target.id})
            }}>{i+'번'}
            </CDropdownItem>);
        }
        setSitNum(list);
    }

    const checkForm = () => {
        ticketMenu === '' ? alert('예약권을 선택해주세요')
        : sitMenu === '' ? alert('좌석을 선택해주세요')
        : form.sitNum === '' ? alert('좌석 번호를 선택해주세요')
        : form.reserveDate === null ? alert('예약일을 선택해주세요')
        : ((sitType !== "fixed") && (selectTime.hour === null || selectTime.minute === null || selectTime.amPm === null)) ? alert('시간을 선택해주세요')
        : (sitType !== "fixed" && selectTime.credit === null) ? alert('충전 시간을 선택해주세요')
        : initializePayment()
    }

    const initializePayment = () => {
        if (sitType === "common" || sitType === "private") {
            const hourFix = selectTime.amPm === 'AM' 
                            ? (parseInt(selectTime.hour, 10) === 12 ? 0 : parseInt(selectTime.hour, 10)) 
                            : (parseInt(selectTime.hour, 10) + 12);
            const dateFix = new Date(new Date(form.reserveDate).setHours(hourFix, parseInt(selectTime.minute, 10)));
            const dateAfter = new Date(dateFix.getTime());
            dateAfter.setHours(dateAfter.getHours() + selectTime.credit);
            setForm(form => ({
                ...form,
                reserveDate: dateFix,
                expireDate: dateAfter
            }));  
        }
        else if (sitType === "fixed") {
            const dateFix = new Date(new Date(form.reserveDate).setHours(0, 0));
            // const dateAfter = new Date(dateFix.setDate(dateFix.getDate() + 35));
            const dateAfter = new Date(dateFix.getTime());
            dateAfter.setDate(dateFix.getDate() + 35);
            setForm(form => ({
                ...form,
                reserveDate: dateFix,
                expireDate: dateAfter
            }));  
        }
        else return       
        setVisible(true) 
    }

    useEffect(() => {
      }, [form.reserveDate, form.expireDate]);

    const reqReservation = (data) => api.post('reservation', data)
    .then(res => {
        //회원가입 성공했을 때
        if(res.data.success) {
            alert('예약되었습니다')       
        }
        //실패했을 때
        else {
            alert('예약에 실패했습니다.');
        }
        console.log(res, data);
        
    }).catch(err => {
        alert(err.response.data.message);
        console.log(err.config.data);
    })

    //좌석 배치도 클릭 이벤트
    const preventUnexpectedEffects = useCallback((e) => {
        e.preventDefault()
        e.stopPropagation()
    }, []);
    const galleryRef = useRef();
    const [isDragging, setDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);

    const handleMouseDown = (e) => {
        preventUnexpectedEffects(e)
        setDragging(true);
        setStartX(e.clientX); // 시작 위치
        setScrollLeft(galleryRef.current.scrollLeft); // 현재 스크롤 위치
        galleryRef.current.style.cursor = 'grabbing'; // 드래그 중 커서 변경
    };

    const handleMouseMove = (e) => {
        if (!isDragging) return;
        // e.preventDefault();
        preventUnexpectedEffects(e)
        const x = e.clientX; // 현재 마우스 위치
        const distance = x - startX; // 드래그한 거리
        galleryRef.current.scrollLeft = scrollLeft - distance; // 현재 스크롤 위치에서 드래그 거리만큼 빼기
    };

    const handleMouseUp = () => {
        setDragging(false);
        galleryRef.current.style.cursor = 'grab'; // 드래그 종료 시 커서 변경
    };

    const handleMouseLeave = () => {
        setDragging(false);
        galleryRef.current.style.cursor = 'grab'; // 마우스가 요소를 떠날 때 커서 변경
    };

    // 터치 이벤트 핸들러
    const handleTouchStart = (e) => {
        // preventUnexpectedEffects(e);
        setDragging(true);
        setStartX(e.touches[0].clientX); // 시작 위치
        setScrollLeft(galleryRef.current.scrollLeft); // 현재 스크롤 위치
        galleryRef.current.style.cursor = 'grabbing'; // 드래그 중 커서 변경
    };

    const handleTouchMove = (e) => {
        if (!isDragging) return;
        e.preventDefault();
        // preventUnexpectedEffects(e)
        const x = e.touches[0].clientX; // 현재 터치 위치
        const distance = x - startX; // 드래그한 거리
        galleryRef.current.scrollLeft = scrollLeft - distance; // 현재 스크롤 위치에서 드래그 거리만큼 빼기
    };

    const handleTouchEnd = () => {
        setDragging(false);
        galleryRef.current.style.cursor = 'grab'; // 드래그 종료 시 커서 변경
    };

    return (
        <main className="resercation-page">
            {isLoggedIn === "1" && 
            <div>
                <p className="sub-title">Reservation</p>
                <h1 className="main-title">예약하기</h1>
                <div>
                    <CContainer className="reservation-form">
                        <CRow lg={{ cols: 2, gutter: 3}}>
                            {/* 예약 화면 */}
                            <CCol lg={5}>
                                <div>
                                    <p>예약일 선택</p>
                                    <span style={{marginRight: '2%'}}>
                                    <DatePicker
                                        showIcon
                                        locale={ko}
                                        className="reserve-form"
                                        dateFormat='yyyy년 MM월 dd일' // 날짜 형태
                                        shouldCloseOnSelect // 날짜를 선택하면 datepicker가 자동으로 닫힘
                                        minDate={new Date()}    //오늘 날짜 이후로만 선택 가능
                                        // maxDate={new Date()} // maxDate 이후 날짜 선택 불가
                                        selected={form.reserveDate}
                                        onChange={(date) => {
                                            setForm({...form, reserveDate: date})
                                            setVisible(false)
                                        }}
                                        showYearDropdown
                                        showMonthDropdown
                                        yearDropdownItemNumber={100}
                                        scrollableYearDropdown
                                        popperProps={{
                                            strategy: "fixed"
                                        }}
                                    />
                                    </span>
                                    
                                    {
                                    (sitType === "fixed" && form.reserveDate !== null)
                                    && 
                                        <DatePicker
                                        showIcon
                                        locale={ko}
                                        className="reserve-form"
                                        dateFormat='yyyy년 MM월 dd일' // 날짜 형태
                                        disabled
                                        selected={form.reserveDate !== null && new Date(new Date(form.reserveDate).setDate(new Date(form.reserveDate).getDate() + 35))}                                        
                                        popperProps={{
                                            strategy: "fixed"
                                        }}
                                    />
                                }
                                </div>
                                <hr/>
                                <div>
                                    <p>예약권 선택</p>
                                    <CDropdown className="reserve-form">
                                        <CDropdownToggle>{ticketMenu === '' ? '예약권 선택' : ticketMenu}</CDropdownToggle>
                                        <CDropdownMenu>
                                            <CDropdownItem 
                                                as="button" 
                                                onClick={(e) => {
                                                    setTicketType('time')
                                                    setTicketMenu('시간 이용권')                                                    
                                                    setSitType('')
                                                    setsitMenu('')
                                                    setForm({...form, sitNum: ''})
                                                    setVisible(false)
                                                }}>시간 이용권
                                            </CDropdownItem>
                                            <CDropdownItem 
                                                as="button"
                                                onClick={(e) => {
                                                    setTicketType('term')
                                                    setTicketMenu('고정석 기간권')                                                    
                                                    setSitType('')
                                                    setsitMenu('')
                                                    setForm({...form, sitNum: ''})
                                                    setVisible(false)
                                                }}>고정석 기간권
                                            </CDropdownItem>
                                        </CDropdownMenu>
                                    </CDropdown>
                                </div>
                                <hr/>
                                <div>
                                    <p>좌석 선택</p>
                                    <CDropdown className="reserve-form">
                                        <CDropdownToggle>{sitMenu === '' ? '좌석 선택' : sitMenu}</CDropdownToggle>
                                        {/* 시간 이용권 드롭메뉴 */}
                                        {ticketType === 'time' &&
                                            <div>
                                                <CDropdownMenu>                                            
                                                    <CDropdownItem 
                                                        as="button" 
                                                        onClick={(e) => {
                                                            setForm({...form, sitNum: ''})
                                                            setSitType('common')
                                                            setsitMenu('1인실 (Common)')
                                                            sitList('common', sitCount.common)
                                                            setVisible(false)
                                                        }}>1인실 (Common)</CDropdownItem>
                                                    <CDropdownItem 
                                                        as="button" 
                                                        onClick={(e) => {
                                                            setForm({...form, sitNum: ''})
                                                            setSitType('private')
                                                            setsitMenu('1인실 (Private)')
                                                            sitList('private', sitCount.private)
                                                            setVisible(false)
                                                        }}>1인실 (Private)</CDropdownItem>
                                                </CDropdownMenu>                                                                       
                                            </div>                     
                                        }                                        
                                        {/* 고정석 기간권 드롭메뉴 */}
                                        {ticketType === 'term' && 
                                            <div>
                                                <CDropdownMenu>                                            
                                                    <CDropdownItem 
                                                        as="button"
                                                        onClick={(e) => {
                                                            setForm({...form, sitNum: ''})
                                                            setSitType('fixed')
                                                            setsitMenu('고정석')
                                                            sitList('fixed', sitCount.fixed)
                                                            setVisible(false)
                                                        }}>고정석</CDropdownItem>
                                                </CDropdownMenu>
                                            </div>            
                                        }                                           
                                    </CDropdown>
                                    {/* 좌석 번호 드롭메뉴 */}
                                    <CDropdown className="reserve-form">
                                        <CDropdownToggle>{form.sitNum === '' ? '좌석 번호' : form.sitNum+'번'}</CDropdownToggle>
                                        <CDropdownMenu style={{maxHeight: '200px', overflowX: 'auto'}}>
                                            {sitType === 'common' ? <>{sitNum}</>
                                            : sitType === 'private' ? <>{sitNum}</>
                                            : sitType === 'fixed' ? <>{sitNum}</>
                                            : <></>
                                            }
                                        </CDropdownMenu>
                                    </CDropdown> 
                                </div>
                                <hr/>  
                                
                                {
                                    (sitType === "common" || sitType === "private")
                                    && <div>
                                    <p>사용 시작 시간 선택</p>                                
                                    <CDropdown className="reserve-form" autoClose='outside'>
                                        <CDropdownToggle>
                                            {`${(selectTime.hour === null) ? '' : selectTime.hour}
                                            : ${(selectTime.minute === null) ? '' : selectTime.minute}
                                                 ${(selectTime.amPm === null) ? '' : selectTime.amPm}`}
                                        </CDropdownToggle>
                                        <CDropdownMenu style={{ maxHeight: '250px', position: 'absolute', zIndex: 1000}}>
                                        <CRow lg={{ cols: 3, gutter: 1}}>
                                            <CCol className="scrollable" style={{ maxHeight: '200px'}}>
                                                {hours.map((number) => (
                                                    <CDropdownItem
                                                        key={number}
                                                        onClick={() => setSelectTime({ ...selectTime, hour: number })}
                                                        active={number === selectTime.hour} //선택된 시간만 활성화
                                                    >
                                                        {number}
                                                    </CDropdownItem>
                                                ))}
                                            </CCol>
                                            <CCol style={{ maxHeight: '200px' }}>
                                                {minutes.map((number) => (
                                                    <CDropdownItem
                                                        key={number}
                                                        onClick={() => 
                                                            setSelectTime({ 
                                                                ...selectTime, 
                                                                minute: (number < 10 ) ? `0${number}` : number })}
                                                        active={
                                                            (number < 10) 
                                                            ? `0${number}` === selectTime.minute
                                                            : number === selectTime.minute} //선택된 시간만 활성화
                                                    >
                                                        {number < 10 ? `0${number}` : number}
                                                    </CDropdownItem>
                                                ))}
                                            </CCol>
                                            <CCol style={{ maxHeight: '200px' }}>
                                                <CDropdownItem 
                                                    as="button"
                                                    onClick={() => setSelectTime({ ...selectTime, amPm: 'AM' })}
                                                    active={selectTime.amPm === 'AM'} // AM 선택 시 활성화
                                                >
                                                    AM
                                                </CDropdownItem>
                                                <CDropdownItem 
                                                    as="button"
                                                    onClick={() => setSelectTime({ ...selectTime, amPm: 'PM' })}
                                                    active={selectTime.amPm === 'PM'} // PM 선택 시 활성화
                                                >
                                                    PM
                                                </CDropdownItem>
                                            </CCol>                                          
                                        </CRow>
                                        </CDropdownMenu>
                                    </CDropdown>
                                    
                                    <CDropdown className="reserve-form">
                                        <CDropdownToggle>{selectTime.credit === null ? '충전 시간' : selectTime.credit+'시간'}</CDropdownToggle>
                                        <CDropdownMenu>
                                            {credits.map((number) => (
                                                <CDropdownItem                                                
                                                    key={number}
                                                    onClick={() => 
                                                        setSelectTime({ 
                                                            ...selectTime, 
                                                            credit: number })}
                                                    active={
                                                        number === selectTime.credit} //선택된 시간만 활성화
                                                >
                                                    {number+'시간'}
                                                </CDropdownItem>
                                            ))
                                            }
                                        </CDropdownMenu>
                                    </CDropdown>
                                    <hr/>
                                </div>
                                }                               
                                
                                <div>
                                    <CButton 
                                        className="p-button"
                                        onClick={(event) => {
                                            event.preventDefault()
                                            checkForm()
                                            // setVisible(!visible)
                                        }}>
                                        예약진행
                                    </CButton>
                                </div>
                            </CCol>

                            {/* 좌석배치도 화면 */}
                            <CCol lg={7}>                            
                            <div 
                                className="seating-chart" 
                                ref={galleryRef} 
                                onMouseDown={handleMouseDown}
                                onMouseMove={handleMouseMove}
                                onMouseUp={handleMouseUp}
                                onMouseLeave={handleMouseLeave}
                                onTouchStart={handleTouchStart}
                                onTouchMove={handleTouchMove}
                                onTouchEnd={handleTouchEnd}
                                style={{ 
                                    display: 'flex', 
                                    overflowX: 'scroll',
                                    width: '100%', 
                                    height: '60%',
                                    touchAction: 'none',
                                    alignItems: 'center',
                                    cursor: 'grab',
                                    scrollbarWidth: 'none',
                                }}
                            >
                                <img 
                                    src={image1} 
                                    style={{ 
                                        display: 'block', 
                                        cursor: 'pointer', 
                                        objectFit: 'contain',
                                        height: '100%',
                                        width: 'auto',
                                        objectFit: 'contain'
                                    }}
                                    alt="좌석 배치도"                                     
                                />
                            </div>                                 
                            </CCol>
                        </CRow>                                           
                    </CContainer>

                    {/* 결제 정보 화면 */}
                    {visible === true &&
                        <COffcanvas className="payment-info" placement="bottom" visible={visible} onHide={() => setVisible(false)} style={{ height : '50%' }}>
                            <COffcanvasBody>
                                <h2 className="main-title">결제 정보</h2>
                                <div style={{flexDirection: 'column', alignItems: 'center', justifyContent: 'center', display: 'flex'}}>
                                    <CForm style={{width:'45%'}}>
                                        <div className="m-1" style={{display: 'flex'}}>
                                            <span>이용권 정보</span>
                                            <CFormInput type="text" placeholder={ticketMenu !== '' ? ticketMenu : null} readOnly/>
                                        </div>

                                        <div className="m-1" style={{display: 'flex'}}>
                                        <span>이용 예정 날짜</span>
                                        <CFormInput 
                                            type="text" 
                                            placeholder={
                                                (sitType === "fixed")
                                                ? (form.reserveDate !== null
                                                    ? `${form.reserveDate.getFullYear()}년 ${String(form.reserveDate.getMonth() + 1).padStart(2, '0')}월 ${String(form.reserveDate.getDate()).padStart(2, '0')}일`
                                                    +' - '
                                                    + `${form.expireDate.getFullYear()}년 ${String(form.expireDate.getMonth() + 1).padStart(2, '0')}월 ${String(form.expireDate.getDate()).padStart(2, '0')}일`
                                                    + ' (35일)'
                                                    : null)
                                                : (form.reserveDate !== null
                                                    ? `${form.reserveDate.getFullYear()}년 ${String(form.reserveDate.getMonth() + 1).padStart(2, '0')}월 ${String(form.reserveDate.getDate()).padStart(2, '0')}일`
                                                    +' - '
                                                    + `${form.expireDate.getFullYear()}년 ${String(form.expireDate.getMonth() + 1).padStart(2, '0')}월 ${String(form.expireDate.getDate()).padStart(2, '0')}일`
                                                    : null)                                  
                                            }
                                            readOnly
                                        />
                                        </div>

                                        {
                                            (sitType === "common" || sitType === "private")
                                            && <div div className="m-1" style={{display: 'flex'}}>
                                            <span>이용 예정 시간</span>
                                            <CFormInput 
                                                type="text" 
                                                placeholder={
                                                    `${String(form.reserveDate.getHours()).padStart(2, '0')}:${String(form.reserveDate.getMinutes()).padStart(2, '0')}`
                                                    +' ~ '
                                                    +`${String(form.expireDate.getHours()).padStart(2, '0')}:${String(form.expireDate.getMinutes()).padStart(2, '0')}`       
                                                    +` (${selectTime.credit}시간) ` 
                                                }
                                                readOnly
                                            />        
                                            </div>
                                        }
                                          

                                        <div className="m-1" style={{display: 'flex'}}>
                                        <span>좌석 정보</span>
                                        <CFormInput type="text" placeholder={form.sitNum !== '' ? form.sitNum + "번 | " + sitMenu : null} readOnly/>
                                        </div>

                                        <div className="m-1" style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                                        <h2 className="sub-title">결제 금액</h2>
                                        <h2 className="sub-title" style={{textAlign: 'right', marginRight: '1%'}}>
                                            {
                                                (sitType === "common") ? price.common[selectTime.credit]
                                                : (sitType === "private") ? price.private[selectTime.credit]
                                                : price.fixed
                                            }
                                        </h2>
                                        </div>

                                        <div style={{display: 'flex'}}>
                                        <CButton 
                                            className="s-button mt-3 m-1"
                                            onClick={(e) => {
                                                e.preventDefault()
                                                setVisible(false)
                                            }}
                                            >취소
                                        </CButton>
                                        <CButton 
                                            className="p-button mt-3 m-1"
                                            onClick={(event) => {
                                                event.preventDefault()
                                                //서버로 보낼 예약 데이터
                                                const data = {
                                                    "userId": form.userId,
                                                    "sitNum": form.sitNum,
                                                    "reserveDate": new Date(form.reserveDate.getTime() + 9 * 60 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' '),
                                                    "chargeTime": (sitType === 'fixed') ? null : selectTime.credit
                                                };
                                                reqReservation(data)
                                            }}
                                        >결제 진행</CButton>  
                                        </div>                                                                                            
                                    </CForm>
                                </div>                                                
                            </COffcanvasBody>
                        </COffcanvas>
                    } 
                </div>
            </div>
            }
        </main>
    )
}

export default ReservationPage;