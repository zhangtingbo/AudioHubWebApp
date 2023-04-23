import React, { useState } from 'react';
import {useNavigate} from "react-router-dom";
import { useSelector,useDispatch } from "react-redux";
import { makeStyles } from '@material-ui/core/styles';
import { Paper } from '@material-ui/core';
import Axios from 'axios';

import {updateUserAccount} from '../redux/userLoginSlice';
import InputWithDebounce from '../components/InputWithDebounce';
import {serverUrl,delay} from '../common/variables';
import {checkPasswordStrength, validateUsername} from '../common/util';



const useStyles = makeStyles((theme) => ({
  root: {
      height: '280px',
      width: '400px',
      margin: '20px auto',
      backgroundColor: theme.palette.primary.bg,
      color: theme.palette.primary.contrastText,
      boxShadow: '5px 5px 5px 0 rgba(0, 0, 0, 0.4)',
  },
  signuproot: {
    height: '320px',
    width: '400px',
    margin: '20px auto',
    backgroundColor: theme.palette.primary.bg,
    color: theme.palette.primary.contrastText,
    boxShadow: '5px 5px 5px 0 rgba(0, 0, 0, 0.4)',
},
  container:{
    width:'70%',
    margin: '0 auto'
  },
  h2:{
    display:'block',
    height:'60px',
    fontSize:'2em'
  },
  input:{
      width:'100%'
  },
  button: {
      marginTop:'20px'
  },
  message:{
    display:'block',
    fontSize:'0.8em',
    width:'300px',
    color:theme.palette.primary.warning
  },
  infomessage:{
    fontSize:'0.8em',
    color:theme.palette.primary.lightText
  },
  inputGrp: {
    display:'flex',
    flexDirection: 'column',
    alignItems:'baseline'
  },
  buttongrp:{
    height:'25x',
    display:'flex',
    flexDirection:'row',
    justifyContent:'space-around'
  },
  infoButton:{
    borderRadius: '50%',
    border: 'none',
    width:'25px',
    height:'25px',
    margin:'5px',
    color:theme.palette.primary.contrastText,
    backgroundColor:theme.palette.primary.lightbg
  },
}));


function LoginPage(props) {
  const classes = useStyles();
  
  const [username, setUsername] = useState('tester');
  const [password, setPassword] = useState('password');
  const [confirmPassword, setConfirmPassword] = useState('');

  const navigate = useNavigate();
  const dispatch = useDispatch();


  const [message,setMessage] = useState("");
  const [usernameValidMessage,setUsernameValidMessage] = useState("");
  const [passwordValidMessage,setPasswordValidMessage] = useState("");
  const [strength,setStrenth] = useState("");

  const [showTooltip, setShowTooltip] = useState(false);

  const handleUsernameChange = (value)=>{
    setUsername(value);
  }

  // handleUsernameChange

  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
  };

  const handleSignupPasswordChange = (value)=>{
    // have to check passowrd streanth here
    let strength = checkPasswordStrength(value);
    setStrenth(strength);

    setPassword(value);
  }

  const handleLoginSubmit = (event)=>{
    event.preventDefault();
    
    Axios.post(serverUrl+"/api/login",{
      username: username,
      password:password
    }).then(res=>{
      console.log("Login done!",res);
      dispatch(updateUserAccount({username:res.data.username,token:res.data.token,userid:res.data.userid}))
      setPassword("");
      setConfirmPassword("");
      setUsername("");
      navigate('/audiohub');
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
    setPassword("");
    setConfirmPassword("");
    setUsername("");
  }

  const handleSignupSubmit = (event)=>{

    if(!username || !password || !confirmPassword){
      setMessage("Password or Username can't be empty!");
      setTimeout(()=>{setMessage("");},delay)
    }
    else if(password !== confirmPassword){
      setMessage("Password was set inconsistently!");
      setTimeout(()=>{setMessage("");},delay)
    }
    else if(strength==='' || strength==='weak'){
      setStrenth("");
      setPasswordValidMessage("Minimum length is 8 characters, includes 1 Uppercase, 1 Lowercase and 1 number");
      setTimeout(()=>{
        setMessage("");
        setPasswordValidMessage("");
      },delay)
    }
    else{
      if(validateUsername(username)){
        Axios.get(serverUrl+"/api/checkusername/"+username).then(res=>{
          if(res.data.existingUser){
            setUsernameValidMessage("Username has already been taken.");
            setTimeout(()=>{setUsernameValidMessage("");;},delay)
          }
          else{
            setUsernameValidMessage("");
            Axios.post(serverUrl+"/api/signup",{
              username:username,
              password:password
            }).then(res=>{
              setMessage("Sign Up Successed!");
              setTimeout(()=>{setMessage("");},delay)

              Logout();
              
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

  const Logout = ()=>{
    console.log("Logout!")
    try{
      Axios.post(serverUrl+"/api/logout",{
      }).then(res=>{
        console.log("Logout successful!",res);
        // reset User Accout Redux Store here, to clear it
        dispatch(updateUserAccount({username:'',token:'',userid:''}));
  
        setLoginPageStatus(true);
        setPassword("");
        setConfirmPassword("");
      }).catch(err=>{
        console.log("Logout failed!",err);
      });
    }
    catch(e){

    }
    
  }

  const handleMouseOver = ()=>{
    setShowTooltip(true);
  }

  const handleMouseLeave = ()=>{
    setShowTooltip(false);
  }

  return (
    
    <div>
      {
      loginPageStatus?
      <Paper className={classes.root}>
        <label className={classes.h2}>Sign In to AudioHub</label>
        <form onSubmit={handleLoginSubmit}>
          <div className={classes.container}>
            <div className={classes.inputGrp}>
              <label htmlFor="username">Username or Email:</label>
              <InputWithDebounce 
                className={classes.input}
                type="text"
                id="username"
                value={username}
                onChange={handleUsernameChange} 
                delay={500}/>
            </div>
            <div className={classes.inputGrp}>
              <label htmlFor="password">Password:</label>
              <input
                className={classes.input}
                type="password"
                id="password"
                value={password}
                onChange={handlePasswordChange}
              />
            </div>

            <label className={classes.message}>{message}</label>
            <button className={classes.button} type="submit">Login</button>
          </div>
          
          
          <div style={{margin:"20px auto"}}>
            <label>New to AudioHub?  </label>
            <button onClick={()=>handleSignUp(false)}>Sign Up</button>
          </div>
        </form>
      </Paper>
    :
    <Paper className={classes.signuproot}>
        <label className={classes.h2}>Sign Up</label>
        <div className={classes.container}>
          <div className={classes.inputGrp}>
            <div>
              <label htmlFor="username">User Name:</label>
              <button className={classes.infoButton}
                  onMouseOver={handleMouseOver} 
                  onMouseLeave={handleMouseLeave}>
                ?
              </button>
            </div>
            
            <InputWithDebounce 
              className={classes.input}
              type="text"
              id="username"
              value={username}
              onChange={handleUsernameChange} 
              delay={500}/>
            {showTooltip && <label className={classes.infomessage}>Must be 6 to 24 alphanumeric characters</label>}
          </div>
          <label className={classes.message} style={{margin:"5px auto"}}>{usernameValidMessage}</label>
          <div className={classes.inputGrp}>
            <label htmlFor="password">Password:</label>
            <InputWithDebounce 
              className={classes.input}
              type="password"
              id="password"
              value={password}
              onChange={handleSignupPasswordChange}
              delay={500}
            />
            <label className={`password-strength ${strength}`}></label>
          </div>
          <label className={classes.message} style={{margin:"5px auto"}}>{passwordValidMessage}</label>
          <div className={classes.inputGrp}>
            <label htmlFor="confirmPassword">Confirm Password:</label>
            <input
              className={classes.input}
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
          
          <label className={classes.message} style={{margin:'10px auto'}}>{message}</label>

          <div className={classes.buttongrp}>
            <button onClick={handleSignupSubmit}>Sign Up</button>
            <button onClick={()=>handleSignUp(true)}>Back to Login</button>
          </div>

          
        </div>
      </Paper>
    }
      </div>
      
      
  );
}

export default LoginPage;