import { 
    CForm, 
    CFormFloating, 
    CFormInput, 
    CFormLabel, 
    CCard,
    CCardBody,
    CCardText,
} from '@coreui/react';
import Button from 'react-bootstrap/Button';

import api from '../api/api';
import { useState } from 'react';

import titleImg from './Title1.png';
import textImg from './Text.png';

function DeleteAccount(props) {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    const [pw, setPw] = useState('');
    const userId = localStorage.getItem("id");
    const [isAgreed, setIsAgreed] = useState(false);
    const [visible, setVisible] = useState(false); // 빨간색 경고창을 제어하는 상태

    const handleAccountDelete = () => {
        if (!isAgreed) {
            alert("동의해주세요");
            return;
        }

        conTest();
    };

    const conTest = () => {
        const data = { userId, userPw: pw };
        api.post('mypages/mypagePw', data)
            .then((res) => {
                if (res.data.success) {
                    // alert('비밀번호 일치함!');
                    const deleteData = { userId };
                    api.post('http://localhost:5000/api/deleteAccount', deleteData)
                        .then(res => {
                            if (res.data.success) {
                                alert("회원 탈퇴가 완료되었습니다.");
                                props.onLogout();
                            } else {
                                alert(res.data.message);
                            }
                        })
                        .catch(err => {
                            console.error(err);
                            alert("회원 탈퇴를 실패했습니다.");
                        });
                } else {
                    alert(res.data.message);
                }
            }).catch((err) => {
                alert(err.response.data.message);
                console.log(err);
            });
    };

    const handleShowWarning = () => {
        // 회원 탈퇴 진행 버튼을 눌렀을 때 경고창을 보이게 함
        setVisible(true);
    };

    return (
        <main className="delete-account">
            {(isLoggedIn) &&
                <div>
                    <img src={titleImg} style={{ maxWidth: '20%', height: 'auto', marginBottom: '3%' }}/>
                    <img src={textImg} style={{ maxWidth: '70%', height: 'auto', marginBottom: '3%' }}/>

                    <CForm className="mypage-form mt-5" style={{width: '55%'}}>
                        <CFormFloating className="mb-3">
                            <CFormInput
                                type="password"
                                id="floatingPassword"
                                value={pw}
                                onChange={e => setPw(e.target.value)}
                                placeholder="password" />
                            <CFormLabel htmlFor="floatingPassword">현재 비밀번호를 입력해주세요</CFormLabel>
                        </CFormFloating>

                        {/* visible이 true일 때만 경고창 표시 */}
                        {visible && (
                            <CCard
                                color='danger'
                                textColor='white'
                                className={`mb-3 border-top-danger border-top-3`}
                                // style={{ maxWidth: '18rem' }}
                            >
                                <CCardBody>
                                    <CCardText>
                                        정말 탈퇴하시겠습니까? <br/>
                                        탈퇴 후 아이디 및 데이터를 복구할 수 없습니다. <br/>
                                        신중히 진행하시길 바랍니다.                                        
                                    </CCardText>
                                    <CCardText>
                                        <label className='mt-2'>    
                                            <b style={{marginRight: '5px'}}>                                     
                                            유의 사항을 모두 숙지하였고 동의합니다.
                                            </b>   
                                            <input
                                                type="checkbox"
                                                checked={isAgreed}
                                                onChange={() => setIsAgreed(!isAgreed)}
                                            />
                                        </label>
                                    </CCardText>
                                </CCardBody>
                            </CCard>
                        )}

                        <Button
                            onClick={visible ? handleAccountDelete : handleShowWarning} // visible에 따라 동작 변경
                            className="p-button"
                            variant="mb-3 p-2 px-3"
                            style={{ borderRadius: '7px', borderWidth: '2px' }}
                        >
                            {visible ? '회원 탈퇴 진행' : '회원 탈퇴 확인'} {/* 버튼 텍스트 변경 */}
                        </Button>
                    </CForm>

                </div>
            }            
        </main>
    );
}

export default DeleteAccount;
