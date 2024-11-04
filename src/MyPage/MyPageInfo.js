import { useState, useEffect } from 'react';
import Button from 'react-bootstrap/Button';
import api from '../api/api'; // api.js에서 가져오기

function MyPage() {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    const userId = localStorage.getItem("id");
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showPasswordInput, setShowPasswordInput] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [showNewPasswordInput, setShowNewPasswordInput] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    // const isSNSLoggedIn = localStorage.getItem("naver");

    useEffect(() => {
        if (isLoggedIn) {
            api.get(`/mypages/${userId}`)
                .then(response => {
                    setUserData(response.data);
                    setLoading(false);
                })
                .catch(error => {
                    setError('데이터를 가져오는 데 문제가 발생했습니다.');
                    setLoading(false);
                });
        }
    }, [isLoggedIn, userId]);

    if (loading) {
        return <div>로딩 중...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    // 비밀번호 확인 함수


    // 서버와의 통신을 통해 비밀번호를 확인하는 함수
    const conTest = () => {
        const data = { userId, userPw: currentPassword }; // 현재 비밀번호 전달
        api.post('/mypages/mypagePw', data)
            .then((res) => {
                if (res.data.success) {
                    setShowNewPasswordInput(true); // 성공 시 새로운 비밀번호 입력창으로 이동
                } else {
                    alert(res.data.message); // 실패 메시지 출력
                }
            }).catch((err) => {
                alert(err.response?.data?.message || "서버와의 통신에 문제가 발생했습니다.");
                console.error(err);
            });
    };

    // 비밀번호 변경 함수
    const handlePasswordChange = () => {
        if (newPassword !== confirmPassword) {
            alert("새 비밀번호가 일치하지 않습니다.");
            return;
        }

        const passwordData = {
            userId: localStorage.getItem("id"),
            currentPw: currentPassword,
            newPw: newPassword
        };

        api.post('/pwchange', passwordData)
            .then(res => {
                if (res.data.success) {
                    alert("비밀번호가 변경되었습니다.");
                    setShowNewPasswordInput(false); // 비밀번호 변경 후 창 닫기
                    setShowPasswordInput(false);
                    setCurrentPassword('');
                    setNewPassword('');
                    setConfirmPassword('');
                } else {
                    alert(res.data.message);
                }
            })
            .catch(err => {
                alert("비밀번호 변경에 실패했습니다.");
                console.error(err);
            });
    };

    // 엔터 키가 눌리면 실행되는 함수
    const handleKeyDown = (event) => {
        if (event.key === 'Enter') {
            showNewPasswordInput ? handlePasswordChange() : conTest(); // 엔터 키가 눌리면 비밀번호 확인 또는 변경 실행
        }
    };

    return (
        <main className="my-page" style={{ flexDirection: 'column', padding: '20px' }}>
            {showNewPasswordInput ? (
                // 새로운 비밀번호 설정 창이 표시
                <div style={{ marginTop: '20px', textAlign: 'left', width: '300px' }}>
                    <p className="sub-title mb-3" style={{textAlign: 'left'}}>비밀번호 변경</p>
                    <div style={{ marginBottom: '15px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                        <label style={{ marginBottom: '10px', fontWeight: 'bold'}}>신규 비밀번호 입력</label>
                        <input
                            type="password"
                            value={newPassword}
                            onChange={e => setNewPassword(e.target.value)}
                            onKeyDown={handleKeyDown}  // 엔터 키 이벤트 추가
                            placeholder="변경하실 비밀번호를 입력해주세요"
                            style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ddd', color: 'black', fontWeight: 'bold' }}
                        />
                    </div>
                    <div style={{ marginBottom: '15px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                        <label style={{ marginBottom: '10px', fontWeight: 'bold',}}>비밀번호 재입력</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={e => setConfirmPassword(e.target.value)}
                            onKeyDown={handleKeyDown}  // 엔터 키 이벤트 추가
                            placeholder="변경하실 비밀번호를 재입력해주세요"
                            style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ddd', color: 'black', fontWeight: 'bold' }}
                        />
                    </div>
                    <Button
                        onClick={handlePasswordChange}
                        className="p-button"
                        style={{ 
                            width: '100%', 
                            backgroundColor: '#28a745', 
                            color: 'white', 
                            padding: '10px', 
                            fontSize: '18px', 
                            fontWeight: 'bold', 
                            borderRadius: '8px', 
                            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' 
                        }}
                    >
                        확인
                    </Button>
                </div>
            ) : showPasswordInput ? (
                // 현재 비밀번호 확인 창이 표시
                <div style={{ marginTop: '20px', textAlign: 'left', width: '300px' }}>
                    <p className="sub-title mb-3" style={{textAlign: 'left'}}>비밀번호 변경</p>
                    <div style={{ marginBottom: '15px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                        <label style={{ marginBottom: '10px', fontWeight: 'bold'}}>비밀번호 입력</label>
                        <input
                            type="password"
                            value={currentPassword}
                            onChange={e => setCurrentPassword(e.target.value)}
                            onKeyDown={handleKeyDown}  // 엔터 키 이벤트 추가
                            placeholder="현재 비밀번호를 입력해주세요"
                            style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ddd', color: 'black', fontWeight: 'bold' }}
                        />
                    </div>
                    <Button
                        onClick={conTest} // conTest1로 변경
                        className="p-button"
                        style={{ 
                            width: '100%', 
                            backgroundColor: '#28a745', 
                            color: 'white', 
                            padding: '10px', 
                            fontSize: '18px', 
                            fontWeight: 'bold', 
                            borderRadius: '8px', 
                            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' 
                        }}
                    >
                        확인
                    </Button>
                </div>
            ) : (
                // 회원 정보가 표시
                <div className="my-page-info">
                    <p className="sub-title" style={{textAlign: 'left'}}>회원 정보</p>
                    <hr />
                    <div>
                        {userData && (
                            <div>
                                <div style={{ marginBottom: '15px' }}>
                                    <label>이름</label>
                                    <input type="text" value={userData.name} disabled style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ddd' }} />
                                </div>
                                <div style={{ marginBottom: '15px' }}>
                                    <label>아이디</label>
                                    <input type="text" value={userData.userId} disabled style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ddd' }} />
                                </div>
                                <div style={{ marginBottom: '15px', }}>
                                    <label style={{ display: 'flex', alignItems: 'center', marginRight: '10px' }}>비밀번호</label>
                                    <input type="password" value="*****" disabled style={{ width: '80%', flex: 1, padding: '10px', borderRadius: '5px', border: '1px solid #ddd' }} />

                                    <Button
                                        variant="outline-success"
                                        size="sm"
                                        onClick={() => setShowPasswordInput(true)} // 클릭 시 비밀번호 변경 창이 표시됨
                                        style={{ marginLeft: '10px', width: '18%'}}
                                    >
                                        비밀번호 변경
                                    </Button>
                                    
                                </div>
                                <div style={{ marginBottom: '15px' }}>
                                    <label>전화번호</label>
                                    <input type="text" value={userData.phone.slice(0, 3) + '-' + userData.phone.slice(3, 7) + '-' + userData.phone.slice(7)} disabled style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ddd' }} />
                                </div>
                                <div style={{ marginBottom: '15px' }}>
                                    <label>생년월일</label>
                                    <input type="text" value={new Date(userData.birth).toLocaleDateString()} disabled style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ddd' }} />
                                </div>
                                <div style={{ marginBottom: '15px' }}>
                                    <label>가입일시</label>
                                    <input type="text" value={new Date(userData.created_at).toLocaleString()} disabled style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ddd' }} />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </main>
    );
}

export default MyPage;
