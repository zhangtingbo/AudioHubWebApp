import React,{ useState } from 'react';
import {useNavigate} from "react-router-dom";
import Axios from 'axios';
import { useSelector,useDispatch} from "react-redux";
import { makeStyles } from '@material-ui/core/styles';
import { Paper } from '@material-ui/core';

import {getUserAccount,updateUserAccount} from '../redux/userLoginSlice';
import {serverUrl,delay} from '../common/variables';
import {validatePassword, validateUsername,checkPasswordStrength} from '../common/util';
import InputWithDebounce from '../components/InputWithDebounce';

const useStyles = makeStyles((theme) => ({
  root: {
      height: '380px',
      width: '400px',
      margin: '20px auto',
      backgroundColor: theme.palette.primary.bg,
      color: theme.palette.primary.contrastText,
      boxShadow: '5px 5px 5px 0 rgba(0, 0, 0, 0.4)',
  },
  container:{
    width:'240px',
    margin: '0 auto',
    padding:'20px'
  },
  h2:{
    display:'block',
    height:'40px',
    fontSize:'2em'
  },
  h3:{
    display:'block',
    fontSize:'1.5em'
  },
  h4:{
    display:'block',
    fontSize:'1em'
  },
  message:{
    fontSize:'1em',
    color:theme.palette.primary.warning
  },
  infomessage:{
    fontSize:'0.8em',
    color:theme.palette.primary.lightText
  },
  input:{
      width:'100%'
  },
  button: {
      marginTop:'20px'
  },
  inputGrp: {
    display:'flex',
    flexDirection: 'column',
    alignItems:'baseline'
  },
  withButton:{
    display:'flex',
    flexDirection:'row',
    height:'25px'
  },
  buttonGrp:{
    display:'flex',
    flexDirection:'row',
    justifyContent:'space-around',
    margin:'20px auto'
  }
}));

function ManageAccountPage(props){
  const classes = useStyles();
  const navigate = useNavigate();

  const user = useSelector(getUserAccount);
  const dispatch = useDispatch();

  const [newusername, setNewusername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [message,setMessage] = useState('');
  const [strength,setStrenth] = useState("");

  const handleUsernameUpdate = async ()=>{
    if(validateUsername(newusername)){
      const params = new URLSearchParams();
      params.append('oldusername', user.username);
      params.append('newusername', newusername); //

      await Axios.get(serverUrl+"/api/checkusername/"+newusername)
      .then(async res=>{
        if(res.data.existingUser){
          setMessage("Username is already taken.");
          setTimeout(()=>{setMessage("");},delay)
        }
        else{
          await Axios.get(serverUrl+"/api/updateusername?"+params.toString())
          .then(res=>{
            setMessage("Username is updated! Please Login again");
            dispatch(updateUserAccount({...user,username:newusername,token:res.data.token}));

            setTimeout(()=>{
              setMessage("");
              Logout();
            },2000)
            
          }).catch(e=>{
            console.log(e)
          })
        }
      }).catch(e=>{
        console.log(e)
      })
    }
    else{
      setMessage("Please input valid username!");
      setTimeout(()=>{
        setMessage("");
      },delay);
    }
  }

  const handlePasswordChange = (value)=>{
    // have to check passowrd streanth here
    let strength = checkPasswordStrength(value);
    setStrenth(strength);

    setPassword(value);
  }

  const handleNewUsernameChange = (value)=>{
    setNewusername(value);
  }

  const handlePasswordUpdate=()=>{
    if(!password || !confirmPassword){
      setMessage("Password or Username can't be empty!");
    }
    else if(password !== confirmPassword){
      setMessage("Password was set inconsistently!");
    }
    else if(!validatePassword(password)){
      setMessage(password.length<8?"Minimum length is 8 characters.":"Must includes 1 Uppercase character, 1 Lowercase character and 1 number");
    }
    else{
      const params = new URLSearchParams();
      params.append('username', user.username);
      params.append('password', password);

      Axios.get(serverUrl+"/api/updatepassword?"+params.toString())
      .then(res=>{
        setMessage("Password is updated! Please Login again");
        
        setTimeout(()=>{
          setMessage("");
          Logout();
        },2000);

      }).catch(e=>{
        console.log(e)
      })
    }

    setTimeout(()=>{setMessage("");},delay)
  }

  const handleCancel = (e)=>{
    navigate('/audiohub');
  }

  const handleDeleteAccount = (e)=>{
    // setShowDialog(true);
    try{
      
      if(user.username === "administrator")
      {
        setMessage("Can't delete administrator");
      }
      else{
        Axios.delete(serverUrl+"/api/deleteaccount/"+user.userid)
          .then(res=>{
            Logout();
          }).catch(err=>{
            setMessage(err.response.data.message);
            setTimeout(()=>{
              setMessage("");
            },5000);
          })
      }
      
    }
    catch(e){

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
  
        navigate('/');
      }).catch(err=>{
        console.log("Logout failed!",err);
      });
    }
    catch(e){

    }
    
  }

  return (
    <Paper className={classes.root}>
      <label className={classes.h2}>Manage Your Account</label>
      <label className={classes.h3}>Current User：{user.username}</label>
      <div className={classes.container}>
        <div className={classes.inputGrp}>
          <label htmlFor="newusername">Update New User Name:</label>
          <div className={classes.withButton}>
            {/* <input
              type="text"
              id="newusername"
              value={newusername}
              onChange={(e) => setNewusername(e.target.value)}
            /> */}
            <InputWithDebounce 
              className={classes.input}
              type="text"
              id="newusername"
              value={newusername}
              onChange={handleNewUsernameChange}
              delay={500}
            />
            <button onClick={handleUsernameUpdate}>Confirm</button>
          </div>
          <label className={classes.infomessage}>Must be 6 to 24 alphanumeric characters</label>
        </div> 
        <div style={{marginTop:'10px'}}>
          <div className={classes.inputGrp}>
            <label htmlFor="password">New Password:</label>
            <InputWithDebounce 
              className={classes.input}
              type="password"
              id="password"
              value={password}
              onChange={handlePasswordChange}
              delay={500}
            />
            <label className={`password-strength ${strength}`}></label>
          </div>
          <div className={classes.inputGrp}>
            <label htmlFor="confirmPassword">Confirm New Password:</label>
            <div className={classes.withButton}>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <button onClick={handlePasswordUpdate}>Confirm</button>
            </div>
          </div>
        </div>
        {/* <button type="submit">Confirm</button> */}
        
        <label className={classes.message}>{message}</label>

        <div className={classes.buttonGrp}>
          <button onClick={handleDeleteAccount}>Delete Account</button>
          <button onClick={handleCancel}>Cancel</button>
        </div>

      </div>
    </Paper>
  );
}

export default ManageAccountPage;