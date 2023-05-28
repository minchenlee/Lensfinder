

// check password format
function check_pass_word(password) {
  let count = 0;
  if (/[A-Z]+/.test(password)) { count++; };
  if (/[a-z]+/.test(password)) { count++; };
  if (/[0-9]+/.test(password)) { count++; };
  if (/[~`!@#$%^&*()_\-+={}\[\]:;"'<,>.?\/]+/.test(password)) { count++; };
  return count;
}

  
// check userName, email, password format
function check_info_valid(email, password){

  // chack email whether has right format.
  if (/^[^\s@~`!#$%^&*()\-+={}[\]]+@[^\s@]+\.[^\s@]+$/.test(email)){
      // console.log('Email is valid!');
  } else {
      return [true, '信箱格式不符'];
  };

  // check password is contain atleast three diff. type of characters.
  if (check_pass_word(password) >= 3){
      // console.log('Password is valid!');
  } else {
      return [true, '密碼格式不符'];
  };
  
  return [false, '所有格式正確！']
}
  
  
// 格式檢查主函式，不符合會 return true 和錯誤訊息。
function UserInfovalidCheck(email, password){
  // 格式正確回傳訊息
  let message = 'All good!';
  
  // 檢查格式是否正確
  const format_valid = check_info_valid(email, password);
  const isNotValid = format_valid[0];
  const validMessage  = format_valid[1];

  if (isNotValid){
    message = `Bad Request: ${validMessage}`;
    return [true, message];
  };

  return [false, message];
};

module.exports = {
  UserInfovalidCheck: UserInfovalidCheck
}
