import { useState } from "react";
import "./modal.css";


// 表單驗證套件
import { useForm } from "react-hook-form";

// sign In Up modal
function SignInUpModal() {
  return (
  <div className="modal fade" id="signInUpModal" tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
    <div className="modal-dialog modal-dialog-centered">
      <div className="signInUpModal">
        <div className="modal-body center-all">
          <div className="SIUM-modal-body">
            <p >Ready to save your result? <br/> Simply sign in or sign up!</p>
            <button className="btn btn-outline-light" data-bs-target="#signInModal" data-bs-toggle="modal">Sign in</button>
            <button className="btn btn-outline-light" data-bs-target="#signUpModal" data-bs-toggle="modal">Sign up</button>
          </div>
        </div>
      </div>
    </div>
  </div>
  )
}


function AccountModal({text, id}) {
  // 密碼顯示與隱藏
  const [passwordShown, setPasswordShown] = useState(false);
  function togglePassword() {
    setPasswordShown(passwordShown ? false : true);
  };

  // 表單驗證
  const { register, handleSubmit, formState: { errors }} = useForm({ mode: 'onChange' });
  const onSubmit = data => console.log(data);


  return (
    <div className="modal fade" id={id} tabIndex="-1" aria-labelledby="ModalLabel2" aria-hidden="true">
      <div className="modal-dialog modal-dialog-centered">
        <div className="signInUpModal">
          <div className="modal-body center-all">
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
                <div className='w-100 position-relative'>
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
                  {errors.password && 
                  <div className="error-message">
                    <p className="mb-0 ">{errors.password.message}</p>
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


function Modal() {
  return (
    <div>
      <SignInUpModal/>
      <AccountModal text={'Sign In'} id={"signInModal"}/>
      <AccountModal text={'Sign Up'} id={"signUpModal"}/>
    </div>
  )
}

export default Modal;
