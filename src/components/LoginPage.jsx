import React, { useState } from 'react';
import {useNavigate} from "react-router-dom";
import { useSelector,useDispatch } from "react-redux";
import Axios from 'axios';
import {updateUserAccount} from '../redux/userLoginSlice';
import InputWithDebounce from '../components/InputWithDebounce';
import {serverUrl,delay} from '../common/variables';
import {validatePassword, validateUsername} from '../common/util';

function LoginPage(props) {
  const [username, setUsername] = useState('tester');
  const [password, setPassword] = useState('password');
  const [confirmPassword, setConfirmPassword] = useState('');

  const navigate = useNavigate();
  const dispatch = useDispatch();


  const [message,setMessage] = useState("");
  const [usernameValidMessage,setUsernameValidMessage] = useState(true);
  const [passwordValidMessage,setPasswordValidMessage] = useState('');

  const handleUsernameChange = (value)=>{
    // setMessage("");
    // setPasswordValidMessage("");
    // setUsernameValidMessage("");
    setUsername(value);
    // let length = value.split('').length;
    // if(length<=2 && length>0){
    //   setUsernameValidMessage("Username is too short (minimum is 2 characters).");
    // }
  }

  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
  };

  const handleLoginSubmit = (event)=>{
    event.preventDefault();
    
    Axios.post(serverUrl+"/api/login",{
      username: username,
      password:password
    }).then(res=>{
      console.log("Login done!",res);
      dispatch(updateUserAccount({username:res.data.username,token:res.data.token,userid:res.data.userid}))
      navigate('/');
    }).catch(err=>{
      console.log("Login failed!",err);
      setMessage("Login failed!");
      setTimeout(()=>{setMessage('')},delay);
      dispatch(updateUserAccount({username:'',token:'',userid:''}))
    });
  }

  const [loginPageStatus,setLoginPageStatus] = useState(true);  // true:login  false:sign up
  const handleSignUp = (value)=>{
    setLoginPageStatus(value);
    setPassword('');
  }

  const handleSignupSubmit = (event)=>{
    console.log("handleSignupSubmit:",event)
    if(!username || !password || !confirmPassword){
      setMessage("Password or Username can't be empty!");
      setTimeout(()=>{setMessage("");},delay)
    }
    else if(password !== confirmPassword){
      setMessage("Password was set inconsistently!");
      setTimeout(()=>{setMessage("");},delay)
    }
    else if(!validatePassword(password)){
      setPasswordValidMessage(password.length<8?"Minimum length is 8 characters.":"Must includes 1 Uppercase character, 1 Lowercase character and 1 number");
      setTimeout(()=>{
        setMessage("");
        setPasswordValidMessage("");
      },delay)
    }
    else{
      if(validateUsername(username)){
        Axios.get(serverUrl+"/api/checkusername/"+username).then(res=>{
          if(res.data.existingUser){
            setUsernameValidMessage("Username is already taken.");
          }
          else{
            setUsernameValidMessage("");
            Axios.post(serverUrl+"/api/signup",{
              username:username,
              password:password
            }).then(res=>{
              setMessage("Sign Up successful!");
              setTimeout(()=>{setMessage("");},delay)
              
            }).catch(err=>{
              setMessage("Sign Up failed!");
              setTimeout(()=>{setMessage("");},delay)
            });

            // 
          }
        }).catch(e=>{
          console.log(e)
        })
        
        
      }
      else{
        setMessage("Please input valid username!");
        setTimeout(()=>{setMessage("");},delay);
      }
    }
  }

  return (
    <div>
      {
      loginPageStatus?
      <div>
        <h2>Sign In to AudioHub</h2>
        <form onSubmit={handleLoginSubmit}>
          <div>
            <label htmlFor="username">Username or Email:</label>
            <InputWithDebounce 
              type="text"
              id="username"
              value={username}
              onChange={handleUsernameChange} 
              delay={500}/>
          </div>
          <div>
            <label htmlFor="password">Password:</label>
            <input
              type="password"
              id="password"
              autocomplete="off"
              value={password}
              onChange={handlePasswordChange}
            />
          </div>
          <button onClick={()=>handleSignUp(false)}>New to AudioHub? Sign Up</button>
          <button type="submit">Login</button>
          <p>{message}</p>
        </form>
      </div>
    :
      <div>
        <h1>Sign Up</h1>
        <div>
          <div>
            <label htmlFor="username">User Name:</label>
            <InputWithDebounce 
              type="text"
              id="username"
              value={username}
              onChange={handleUsernameChange} 
              delay={500}/>
          </div>
          <p>{usernameValidMessage}</p>
          <div>
            <label htmlFor="password">Password:</label>
            <input
              type="password"
              id="password"
              autocomplete="off"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <p>{passwordValidMessage}</p>
          <div>
            <label htmlFor="confirmPassword">Confirm Password:</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
          <p>{message}</p>
          <button onClick={handleSignupSubmit}>Sign Up</button>
          <button onClick={()=>handleSignUp(true)}>Back to Login</button>
        </div>
      </div>
    }
      </div>
      
      
  );
}

export default LoginPage;