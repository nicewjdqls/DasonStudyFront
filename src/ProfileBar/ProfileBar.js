import { CPopover, CButton, CAvatar, } from '@coreui/react'

function ProfileBarPage(props) {

    return (
        <main className="profile-page">            

            <CPopover
                className="profile-bar"
                placement="bottom"
                trigger="focus"
                content = {
                    <div>
                        <CButton
                            className="p-button mb-3"
                            onClick={() => window.location.href = '/mypage'}
                        >마이페이지
                        </CButton>                        
                        <CButton  
                            className="s-button"
                            as="button" 
                            onClick={() => {
                                alert(`${localStorage.getItem("name")}님 로그아웃 되었습니다`)
                                props.onLogout();
                                // window.location.href = '/';
                            }}>로그아웃
                        </CButton>
                    </div>
                }                
            >
                
                <CButton shape="rounded-pill">
                    <CAvatar className="profile-badge" color="success" textColor="white">{localStorage.getItem("name")[0]}</CAvatar>
                </CButton>
            </CPopover>
        </main>
    )
}

export default ProfileBarPage;