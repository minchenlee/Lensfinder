import { useState, useEffect, useContext, useRef} from "react";
import { post, authorize_post, del } from '../../api'; // 引入 api.jsx
import "./modal.css";
import { AllPageContext } from "../../App.jsx";
import * as bootstrap from 'bootstrap'

import { analysisContext } from '../analysis_page/analysis_page.jsx';
import { profileContext } from '../profile_page/profile_page.jsx';

// 表單驗證套件
import { useForm } from "react-hook-form";


// sign In Up modal
function SignInUpModal({text, id}) {
  return (
  <div className="modal fade" id={id} tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
    <div className="modal-dialog modal-dialog-centered">
      <div className="signInUpModal">
        <div className="modal-body center-all">
          <div className="SIUM-modal-body">
            {text}
            <button className="btn btn-outline-light" data-bs-target="#signInModal" data-bs-toggle="modal">Sign in</button>
            <button className="btn btn-outline-light" data-bs-target="#signUpModal" data-bs-toggle="modal">Sign up</button>
          </div>
        </div>
      </div>
    </div>
  </div>
  )
}

// 登入/註冊成功提示視窗
function SucessModal(){
  return (
  <div className="modal fade" id="sucessModal" tabIndex="-1" aria-labelledby="ModalLabelSucess" aria-hidden="true">
    <div className="modal-dialog modal-dialog-centered">
      <div className="signInUpModal">
        <div className="modal-body center-all">
          <div className="SIUM-modal-body">
            <h5 >It's good to see you, enjoy!</h5>
          </div>
        </div>
      </div>
    </div>
  </div>
  )
}


function AccountModal({text, id, endpoint}) {
  // useRef
  const modalRef = useRef(null);
  const modalBodyRef = useRef(null);

  // 登入狀態
  const {isSignedIn, setIsSignedIn} = useContext(AllPageContext);

  // 密碼顯示與隱藏
  const [passwordShown, setPasswordShown] = useState(false);
  function togglePassword() {
    setPasswordShown(passwordShown ? false : true);
  };

  // 表單驗證
  const { register, handleSubmit, formState: { errors }} = useForm({ mode: 'onChange' });

  // 錯誤訊息狀態顯示
  const [resErrorMessage, setResErrorMessage] = useState('');

  // 表單送出，呼叫 api
  async function onSubmit(data){
    data.provider = 'native';
    const responseData = await post(endpoint, data);
    setResErrorMessage('');
    // console.log(responseData);

    // 出現錯誤的情況
    if (responseData.errorMessage !== undefined){
      // console.log(responseData.errorMessage);

      // sign in email 不存在的情況
      if (responseData.errorMessage === 'email does not exist') {
        setResErrorMessage('Email does not exist. Sign up?');
      }

      // sign in password 不正確的情況
      if (responseData.errorMessage === 'password incorrect') {
        setResErrorMessage('Password incorrect. Try again?');
      }

      // sign up email 已經存在的情況
      if (responseData.errorMessage === 'email already exists') {
        setResErrorMessage('Email already exists. Sign in?');
      }

      // 加入 head shake 動畫
      modalBodyRef.current.classList.add('animate__headShake');

      // 1000ms 後移除動畫
      setTimeout(() => {
        modalBodyRef.current.classList.remove('animate__headShake');
      }
      , 1000);
    }

    // 儲存回傳的 token
    localStorage.setItem('lensFinderToken', responseData.data.access_token);
    setIsSignedIn(true);

    // 關閉 modal
    const modal = bootstrap.Modal.getInstance(modalRef.current);
    modal.hide();
  }

  // const onSubmit = data => console.log(data);
  

  return (
    <div className="modal fade " id={id} tabIndex="-1" aria-labelledby="ModalLabel2" aria-hidden="true" ref={modalRef}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="signInUpModal animate__animated" ref={modalBodyRef}>
          <div className="modal-body center-all" >
            <div className="SIUM-modal-body">
              <p>{text}</p>
              <form className='center-all flex-column w-100' onSubmit={handleSubmit(onSubmit)}>
                <div className='w-100'>
                  <input 
                    id = 'email'
                    type='text' 
                    placeholder='email' 
                    {...register("email", { 
                      required: true,
                      pattern: {
                        value: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
                        message: "Invalid email address."
                      }}
                    )}
                  />
                  {errors.email && 
                  <div className="error-message">
                    <p className="mb-0 ">{errors.email.message}</p>
                  </div>
                  }
                </div>
                <div className='w-100'>
                  <div className="position-relative">
                    <input
                      id = 'password'
                      type={passwordShown ? "text" : "password"} 
                      placeholder='password'  
                      {...register("password", { 
                        required: true,
                        pattern: {
                          value: /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,20}$/,
                          message: "8-20 characters, mixing of uppercase, lowercase and number."
                        }}
                      )}
                    />
                    <button type='button' className='password-toggle' onClick={togglePassword}>
                      {passwordShown ? <i className="bi bi-eye"></i> : <i className="bi bi-eye-slash"></i>}
                    </button>
                  </div>
                  {errors.password && 
                  <div className="error-message">
                    <p className="mb-0 ">{errors.password.message}</p>
                  </div>
                  }
                  {resErrorMessage !== '' &&
                  <div className="error-message res-error-message">
                    <p className="mb-0 ">{resErrorMessage}</p>
                  </div>
                  }
                </div>
                <div className='w-100'>
                  <button type='submit' className='btn btn-outline-light'>{text}</button>
                </div>
              </form>
              <button className='back-button' data-bs-toggle="modal" data-bs-target="#signInUpModal"> <i className="bi bi-arrow-left"></i> Back </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


function SaveNamingModal() {
  let Context = profileContext;
  if (window.location.pathname === '/analysis') {
    Context = analysisContext;
  } 

  if (window.location.pathname === '/') {
    Context = AllPageContext;
  }

  const {imagesInfoDict, setIsSaved} = useContext(Context);
  const modalRef = useRef(null);

  // 表單驗證
  const { register, handleSubmit, formState: { errors }} = useForm({ mode: 'onChange' });
  
  async function handleSave(formInput) {
    
    // 從這邊加入 save api 的程式碼
    let data = imagesInfoDict;
    data.snapshotName = formInput.snapshotName;
    // console.log(data);

    const JWT = localStorage.getItem('lensFinderToken');
    const responseData = await authorize_post('snapshot', JWT, data);
    console.log(responseData);
    setIsSaved(true);

    // 關閉 modal
    const modal = bootstrap.Modal.getInstance(modalRef.current);
    modal.hide();
  }

  return (
    <div className="modal fade" id="saveNamingModal" tabIndex="-1" aria-labelledby="ModalLabelSave" aria-hidden="true" ref={modalRef}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="signInUpModal">
          <div className="modal-body center-all">
            <div className="SIUM-modal-body">
              <form className='center-all flex-column w-100' onSubmit={handleSubmit(handleSave)}>
                <p className='mb-2'>Naming you snapshot</p>
                <div className='w-100'>
                  <input
                    id = 'snapshotName'
                    type='text'
                    placeholder='Snapshot Name'
                    {...register("snapshotName", {
                      required: true,
                      // pattern: {
                      //   value: /^[a-zA-Z0-9\s]+$/,
                      //   message: "Only letters and numbers."
                      // }
                      maxLength: {
                        value: 20,
                        message: "Maximum 20 characters."
                      }}
                    )}
                  />
                  {errors.snapshotName &&
                  <div className="error-message">
                    <p className="mb-0 ">{errors.snapshotName.message}</p>
                  </div>
                  }
                </div>
                <div className='w-100'>
                  <button type='submit' className='btn btn-outline-light'>Save</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}



// 刪除確認 modal
function DeleteConfirmModal(){
  let Context = profileContext;
  if (window.location.pathname === '/analysis') {
    Context = analysisContext;
  } 

  if (window.location.pathname === '/') {
    Context = AllPageContext;
  }

  const {imagesInfoDict, deleteSnapshot} = useContext(Context);
  const deleteModalRef = useRef(null);

  // console.log(deleteSnapshot);
  

  async function handleYes(){
    const JWT = localStorage.getItem('lensFinderToken');
    const deleteSnapshotId = deleteSnapshot.id
    await del('snapshot', JWT, `?snapshot_id=${deleteSnapshotId}`)
    window.location.reload();
  }

  // 關閉 modal
  async function handleNo(){
    const modal = bootstrap.Modal.getInstance(deleteModalRef.current);
    modal.hide();
  }

  return (
  <div className="modal fade" id="deleteConfirmModal" tabIndex="-1" aria-labelledby="ModalLabelSucess" aria-hidden="true" ref={deleteModalRef}>
    <div className="modal-dialog modal-dialog-centered">
      <div className="signInUpModal">
        <div className="modal-body center-all">
          <div className="SIUM-modal-body">
            <h6 className="m-0">Delete this snapshot?</h6>
            {deleteSnapshot && 
              <p className="mt-2 mb-4">{deleteSnapshot.snapshot_name}</p>
            }
            <div className="row w-50">
              <div className="col-6">
                <button className="btn btn-outline-light w-100" onClick={handleYes}> Yes </button>
              </div>
              <div className="col-6">
                <button className="btn btn-outline-light w-100" onClick={handleNo}> No </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  )
}


function Modal() {
  return (
    <div>
      <SignInUpModal  text={<p >Ready to save your result? <br/> Simply sign in or sign up!</p>}
      id={"signInUpModalSave"}/>
      <SignInUpModal  
      text={
        <div>
          <h5>Welcome!</h5>
          <p> Sign in to access your account or  <br/> sign up to join.</p>
        </div>}
      id={"signInUpModal"}/>
      <AccountModal text={'Sign In'} id={"signInModal"} endpoint={'signIn'}/>
      <AccountModal text={'Sign Up'} id={"signUpModal"} endpoint={'signUp'}/>
      <SucessModal/>
      <SaveNamingModal/>
      <DeleteConfirmModal/>
    </div>
  )
}

export default Modal;
