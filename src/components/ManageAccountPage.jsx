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
      display:'flex',
      flexDirection:'column',
      width: '400px',
      color: theme.palette.primary.contrastText,
      margin:'10px auto'
  },
  container:{
    width: '100%',
    margin: '20px auto',
  },
  basecontainer:{
    width: '80%',
    backgroundColor: theme.palette.primary.bg,
    margin: '20px auto',
    boxShadow: '5px 5px 5px 0 rgba(0, 0, 0, 0.4)',
  },
  inputGrp: {
    display:'flex',
    flexDirection: 'column',
    margin:'10px'
  },
  inputGrpTitle:{display:'flex',margin:'0 auto',paddingButton:'10px'},
  h2:{
    display:'block',
    height:'40px',
    fontSize:'2em'
  },
  h3:{
    display:'block',
    fontSize:'1.1em',
    alignSelf:'center'
  },
  message:{
    fontSize:'1em',
    color:theme.palette.primary.warning
  },
  infomessage:{
    fontSize:'0.8em',
    color:theme.palette.primary.lightText
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
  input:{
      width:'100%'
  },
  button: {
    width:'100px',
    margin:'10px auto'
  },
  label:{
    alignSelf:'baseline'
  },
  buttonGrp:{
    display:'flex',
    flexDirection:'row',
    justifyContent:'space-around',
    margin:'5px auto',
    width:'200px'
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

  const [showTooltip, setShowTooltip] = useState(false);

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
        setMessage("Don't allow to delete administrator");
        handleOpenConfirm(false);
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

  const handleMouseOver = ()=>{
    setShowTooltip(true);
  }

  const handleMouseLeave = ()=>{
    setShowTooltip(false);
  }

  const [openconfirm, setOpenconfirm] = useState(false);

  const handleOpenConfirm = (value) => {
    setOpenconfirm(value);
  };


  return (
    <Paper className={classes.root}>
      {/* User info */}
      <div className={classes.container}>
        <label className={classes.h2}>Manage Your Account</label>
        <label className={classes.h3}>Current User：{user.username}</label>
      </div>

      <label className={classes.message}>{message}</label>

      {/* Change username */}
      <div className={classes.basecontainer}>
        <div className={classes.inputGrp}>
          <div className={classes.inputGrpTitle}>
            <label className={classes.h3} htmlFor="newusername">Update User Name:</label>
            <button className={classes.infoButton}
                onMouseOver={handleMouseOver} 
                onMouseLeave={handleMouseLeave}>
              ?
            </button>
          </div>
          
          <InputWithDebounce 
              type="text"
              id="newusername"
              value={newusername}
              onChange={handleNewUsernameChange}
              delay={500}
          />

          {showTooltip && <label className={classes.infomessage}>Must be 6 to 24 alphanumeric characters</label>}

          <button className={classes.button} onClick={handleUsernameUpdate}>Confirm</button>
          
        </div> 
      </div>

      {/* Change password */}
      <div className={classes.basecontainer}>
          <div className={classes.inputGrp}>

            <div className={classes.inputGrpTitle}>
              <label className={classes.h3} htmlFor="newpassword">Update Password:</label>
            </div>
            
            <label className={classes.label} htmlFor="password">New Password:</label>
            <InputWithDebounce 
              type="password"
              id="password"
              value={password}
              onChange={handlePasswordChange}
              delay={500}
            />
            <label className={`password-strength ${strength}`}></label>

            <label className={classes.label} htmlFor="confirmPassword">Confirm New Password:</label>
            <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          <button className={classes.button} onClick={handlePasswordUpdate}>Confirm</button>
      </div>

      {/* delete account */}
      <div className={classes.basecontainer}>
        <div className={classes.inputGrp}>
          <label className={classes.h3} htmlFor="deleteaccount">Delete Account:</label>
          <button className={classes.button} onClick={()=>handleOpenConfirm(true)}>Delete</button>
        </div>

        {openconfirm && (
          <div style={{margin:'10px'}}>
            <div>Are you sure you want to delete this account？</div>
            <div className={classes.buttonGrp}>
              <button className={classes.button} onClick={handleDeleteAccount}>Yes</button>
              <button className={classes.button} onClick={()=>handleOpenConfirm(false)}>Cancel</button>
            </div>
          </div>
        )}
      </div>

      {/* cancel */}
      <button className={classes.button} onClick={handleCancel}>Cancel</button>

    </Paper>
  );
}

export default ManageAccountPage;