import { useState, useEffect } from 'react';
import api from '../api/api';

import Button from 'react-bootstrap/Button';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { ko } from "date-fns/locale/ko";
import { 
    CButton, CForm, CFormFloating, CFormInput, CFormLabel, 
} from '@coreui/bootstrap-react'
import SuccessModal from '../Modal/SuccessModal';
import { FcApproval } from "react-icons/fc";

function SignUpPage(props) {
    const [validMessage, setValidMessage] = useState('');    
    const [checkedId, setCheckedId] = useState(false);
    const [checkedPhone, setCheckedPhone] = useState(false);
    const [verificationCodes, setVerificationCodes] = useState(null);

    const [valid, setValid] = useState({
        pw: false,
        pwCheck: false,
        phone: false,
    });

    const [form, setForm] = useState({
        id: '',
        pw: '',
        pwCheck: '',
        name: '',
        phone: '',
        selectedDate: null,
    });

    //Modal 데이터
    const [show, setShow] = useState(false);
    const [msg, setMsg] = useState('');

    const handleClose = () => setShow(false);
    // const handleShow = () => setShow(true);

    //서버로 보낼 회원가입 데이터
    const data = {
        "userId": form.id,
        "userPw": form.pw,
        "userName": form.name,
        "userPhone": form.phone,
        "userBirthDate": (form.selectedDate !== null) ? `${form.selectedDate.getFullYear()}-${String(form.selectedDate.getMonth() + 1).padStart(2, '0')}-${String(form.selectedDate.getDate()).padStart(2, '0')}` : form.selectedDate
    };

    useEffect(() => {
        setCheckedId(false);
        // 필요시 클린업 함수 반환
        return () => {
        };
    }, [form.id]);

    useEffect(() => {
        setCheckedPhone(false);
        // 필요시 클린업 함수 반환
        return () => {
        };
    }, [form.phone]);

    //회원가입 데이터 전송 함수(axios post)
    const reqSignUp = () => api.post('signUp', data)
    .then(res => {
        //회원가입 성공했을 때
        if(res.data.success) {
            // setMsg('회원가입 되었습니다.');
            // handleShow();
            alert('회원가입 되었습니다.');
            props.onChangePage("login");
        }
        //실패했을 때
        else {
            alert('회원가입에 실패했습니다.');
        }
        console.log(res, data);
        
    }).catch(err => {
        alert(err.response.data.message);
        console.log(err);
    })

    //유효성 검증 함수
    const checkValidation = () => {
        const validCheck = Object.values(valid).filter(value => value === true).length > 0;
        if (validCheck === true) {
            alert('양식을 확인해주세요');
        }
        else if (checkedId === false) {
            alert('아이디 중복체크를 해주세요');
        }
        else if (checkedPhone === false) {
            alert('휴대폰 인증을 해주세요')
        }
        else {
            reqSignUp();
        }        
    };

    //아이디 중복체크 전송 함수(axios get)
    const checkId = () => api.get(`signUp/checkId/${form.id}`)
    .then(res => {
        //사용 가능 아이디일 때
        if(res.data.success) {
            alert("사용 가능한 아이디입니다.");
            setCheckedId(true);
        }
        //사용 불가능한 아이디일 때
        else {
            alert("사용 불가능한 아이디입니다.");
        }
    }).catch(err => {
        console.log(err);
    })

    const handleNumericInput = (e) => {
        const allowedKeys = ["Backspace", "ArrowLeft", "ArrowRight", "Delete", "Tab"];
        if (!/^[0-9]$/.test(e.key) && !allowedKeys.includes(e.key)) {
          e.preventDefault();
        }
    };

    const validPassword = (e) => {
        const value = e.target.value;
        // 각 조건을 변수로 저장
        const hasLetter = /[a-zA-Z]/.test(value); // 문자가 포함되어 있는지
        const hasNumber = /\d/.test(value); // 숫자가 포함되어 있는지
        const hasSpecialChar = /[$@$!%*#?&]/.test(value); // 특수문자가 포함되어 있는지

        // 전체 유효성 검사
        const validatePattern = hasLetter && hasNumber && hasSpecialChar && value.length >= 8 && value.length <= 20;
        (validatePattern) ? setValid({...valid, pw: false}) : setValid({...valid, pw: true});

        (!hasLetter && !hasNumber && !hasSpecialChar) ? setValidMessage('문자, 숫자, 특수문자를 포함해주세요')
        : (!hasLetter && !hasNumber) ? setValidMessage('문자와 숫자를 포함해주세요')
        : (!hasLetter && !hasSpecialChar) ? setValidMessage('문자와 특수문자를 포함해주세요')
        : (!hasNumber && !hasSpecialChar) ? setValidMessage('숫자와 특수문자를 포함해주세요')
        : (!hasLetter) ? setValidMessage('문자를 포함해주세요')
        : (!hasNumber) ? setValidMessage('숫자를 포함해주세요')
        : (!hasSpecialChar) ? setValidMessage('특수문자를 포함해주세요')
        : (value.length < 8 || value.length > 20) ? setValidMessage('8~20자여야 합니다')
        : setValidMessage('');
    };

    const validPasswordCheck = (e) =>{
        form.pw === e.target.value ? setValid({...valid, pwCheck: false}) : setValid({...valid, pwCheck: true});
    };

    const validPhone = (e) => {
        e.target.value.length === 11 ? setValid({...valid, phone: false}) : setValid({...valid, phone: true});
    }

    //문자인증번호 요청 함수
    const requestSMSCode = () => api.post('signUp/sendSMSCode', {"userPhone": form.phone})
    .then (res => {
        if(res.data.success) {
            alert('인증번호가 발송되었습니다');
            setForm(prevForm => ({ ...prevForm, verificationSent: true })); // 인증 번호 전송 후 상태 업데이트
            setVerificationCodes(res.data.code);
        } else {
            alert("인증 번호 전송 실패" + res.data.message);
        }
    }).catch(err => {
        console.log(err);
    })

    //인증번호 확인 함수
    function verifyCode() {
        console.log(verificationCodes, form.verificationCode)
        if(verificationCodes === form.verificationCode){
            //setVerificationSuccess(true);
            alert("인증이 완료되었습니다");
            setCheckedPhone(true);
            setForm(prevForm => ({ ...prevForm, verificationSent: false }));
        }   
        else {
            alert("인증 번호가 일치하지 않습니다");
        }
    }
    // const verifyCode = () => api.post('signUp/verifyCode', {userPhone: form.phone, code: form.verificationCode})
    // .then (res => {
    //     if(res.data.success){
    //         if(verificationCodes === form.verificationCode){
    //             //setVerificationSuccess(true);
    //         alert("인증이 완료되었습니다");
    //         setCheckedPhone(true);
    //         setForm(prevForm => ({ ...prevForm, verificationSent: false }));
    //         }            
    //     } else {
    //         alert("인증 번호가 일치하지 않습니다");
    //     }
    // }).catch(err => {
    //     console.log(err);
    // })


    return (
        <main className="signup-page">
            <div className="login-logo"></div>

            <CForm className="signup-form mb-3">

                {/* 아이디 입력 */}
                <CFormFloating className="mb-3">
                    <CFormInput 
                        type="id" 
                        id="floatingId" 
                        value={form.id} 
                        onChange={e => setForm({...form, id: e.target.value})} 
                        placeholder="abcd1234" />
                    <CFormLabel htmlFor="floatingId">아이디입력 (6 - 20자)</CFormLabel>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <CButton 
                            onClick={checkId} 
                            className="p-button-sm mt-2 me-2" 
                            type="button">중복 확인</CButton>      
                        {checkedId === true 
                        && <FcApproval/>                    
                        } 
                    </div>
                    
                    
                </CFormFloating>

                {/* 비밀번호 입력*/}
                <CFormFloating className="mb-3">
                    <CFormInput 
                        type="password" 
                        id="floatingPassword" 
                        value={form.pw} 
                        onChange={(e) => {
                            setForm({...form, pw: e.target.value});
                            validPassword(e);                        
                            }
                        }
                        invalid = {valid.pw}
                        placeholder="password"/>
                    <CFormLabel htmlFor="floatingPassword">비밀번호 입력(문자,숫자,특수문자 포함 8-20자)</CFormLabel>
                    <p style={{color: "yellow", fontSize: "13px"}}>{validMessage}</p>
                </CFormFloating>

                {/* 비밀번호 재입력*/}
                <CFormFloating className="mb-3">
                    <CFormInput 
                        type="password" 
                        id="floatingPassword" 
                        value={form.pwCheck} 
                        onChange={(e) => {
                            setForm({...form, pwCheck: e.target.value});
                            validPasswordCheck(e);
                        }}
                        invalid = {valid.pwCheck}
                        placeholder="password"/>
                    <CFormLabel htmlFor="floatingPassword">비밀번호 재입력</CFormLabel>
                </CFormFloating>

                {/* 이름 입력*/}
                <CFormFloating className="mb-3">
                    <CFormInput 
                        type="name" 
                        id="floatingPassword" 
                        value={form.name} 
                        onChange={e => setForm({...form, name: e.target.value})} 
                        placeholder="password"/>
                    <CFormLabel htmlFor="floatingPassword">이름 입력</CFormLabel>
                </CFormFloating>

                {/* 휴대폰번호 입력*/}
                <CFormFloating className="mb-3">
                    <CFormInput 
                        type="name" 
                        id="floatingPassword" 
                        value={form.phone} 
                        onChange={(e) => {
                            setForm({...form, phone: e.target.value});
                            validPhone(e);
                        }} 
                        onKeyDown={handleNumericInput}
                        invalid = {valid.phone}
                        placeholder="password"/>
                    <CFormLabel htmlFor="floatingPassword">휴대폰 번호 입력 (“-” 제외 11자리 입력)</CFormLabel>
                    <CButton 
                        onClick={requestSMSCode} 
                        className="p-button-sm mt-2 me-2" 
                        type="button">인증하기
                    </CButton>
                    {checkedPhone === true 
                        && <FcApproval/>                    
                        } 
                </CFormFloating>

               {/* 인증 번호 입력 */}
               {form.verificationSent && (
                    <CFormFloating className="mb-3">
                        <CFormInput 
                            type="text" 
                            id="floatingVerificationCode" 
                            value={form.verificationCode} 
                            onKeyDown={handleNumericInput}
                            onChange={e => setForm({ ...form, verificationCode: e.target.value })} 
                            placeholder="인증 번호" />
                        <CFormLabel htmlFor="floatingVerificationCode">인증 번호 입력</CFormLabel>
                        <CButton 
                            onClick={verifyCode} 
                            className="p-button-sm mt-2" 
                            type="button">확인</CButton>
                    </CFormFloating>
                )}


                {/* 생년월일 입력 */}
                <CFormFloating className="date-form">
                <DatePicker
                    locale={ko}
                    className="date-picker"
                    dateFormat='yyyy년 MM월 dd일' // 날짜 형태
                    placeholderText="생년월일 입력"
                    shouldCloseOnSelect // 날짜를 선택하면 datepicker가 자동으로 닫힘
                    minDate={new Date('1900-01-01')}
                    maxDate={new Date()} // maxDate 이후 날짜 선택 불가
                    selected={form.selectedDate}
                    onChange={(date) => setForm({...form, selectedDate: date})}
                    showYearDropdown
                    showMonthDropdown
                    yearDropdownItemNumber={100}
                    scrollableYearDropdown
                    popperProps={{
                        strategy: "fixed"
                      }}
                />
                </CFormFloating>

            </CForm>

            {/* 버튼 */}
            <Button 
                onClick={checkValidation} 
                variant="mb-3 p-1 px-3" 
                size="" className="s-button" >
                회원가입
            </Button>
            <Button onClick={(e) => {
                e.preventDefault();
                props.onChangePage("login");
            }} 
                variant="mb-3 p-1 px-3" 
                size="" 
                className="p-button" >
                이미 계정이 있으신가요? 로그인
            </Button>
        
            {/* 회원가입 성공 알림창 */}
            <SuccessModal show={show} handleClose={handleClose} text={msg}/>
        </main>
    )
}

export default SignUpPage;
