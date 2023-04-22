import React, { useState } from 'react';
import {useNavigate} from "react-router-dom";
import { useSelector,useDispatch } from "react-redux";
import { makeStyles } from '@material-ui/core/styles';
import { Paper } from '@material-ui/core';
import Axios from 'axios';

import {updateUserAccount} from '../redux/userLoginSlice';
import InputWithDebounce from '../components/InputWithDebounce';
import {serverUrl,delay} from '../common/variables';
import {validatePassword, validateUsername} from '../common/util';



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
              setMessage("Sign Up successful! Please login");
              setTimeout(()=>{
                setMessage("");
                navigate('/');
              },delay-2000)
              
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
                autocomplete="off"
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
            <label htmlFor="username">User Name:</label>
            <InputWithDebounce 
              className={classes.input}
              type="text"
              id="username"
              value={username}
              onChange={handleUsernameChange} 
              delay={500}/>
          </div>
          <label className={classes.message} style={{margin:"5px auto"}}>{usernameValidMessage}</label>
          <div className={classes.inputGrp}>
            <label htmlFor="password">Password:</label>
            <input
              className={classes.input}
              type="password"
              id="password"
              autocomplete="off"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
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