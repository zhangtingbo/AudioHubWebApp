import React,{ useState } from 'react';
import {useNavigate} from "react-router-dom";
import Axios from 'axios';
import { useSelector,useDispatch} from "react-redux";
import { makeStyles } from '@material-ui/core/styles';
import { Paper } from '@material-ui/core';

import {getUserAccount,updateUserAccount} from '../redux/userLoginSlice';
import {serverUrl,delay} from '../common/variables';
import {validatePassword, validateUsername} from '../common/util';

const useStyles = makeStyles((theme) => ({
  root: {
      height: '420px',
      width: '400px',
      margin: '20px auto',
      backgroundColor: theme.palette.primary.bg,
      color: theme.palette.primary.contrastText,
      boxShadow: '5px 5px 5px 0 rgba(0, 0, 0, 0.4)',
  },
  container:{
    width:'240px',
    margin: '0 auto'
  },
  h2:{
    display:'block',
    height:'60px',
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
    fontSize:'0.8em'
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

function PasswordDialog(props) {
  const classes = useStyles();

  const [password, setPassword] = useState('');
  const [message,setMessage] = useState('fdf');

  const handleInputChange = (event) => {
    setPassword(event.target.value);
  };

  const handleConfirmClick = async () => {
    console.log("Make a request to ask if password is correct");
    const params = new URLSearchParams();
    params.append('password', password);
    params.append('username', props.user.username); //

    try{
      await Axios.get(serverUrl+"/api/checkpassword?"+params.toString())
      .then(async res => {
        setMessage("Check password successed! Deleting your account...");

        const deleteParams = new URLSearchParams();
        deleteParams.append('userid',props.user.userid)
        await Axios.delete(serverUrl+"/api/deleteaccount?"+deleteParams.toString())
        .then(res=>{
          props.onConfirm(password);
        }).catch(err=>{
          setMessage("Delete Account failed! ");
          setTimeout(()=>{
            setMessage("");
            props.onCancel();
          },5000);
        })
      }).catch(err=>{
        setMessage("Check password failed! ");
        setTimeout(()=>{
          setMessage("");
          props.onCancel();
        },5000);
      })
    }
    catch(err){
      console.log(err)
      setTimeout(()=>{
        setMessage("");
        props.onCancel();
      },5000);
    }

  };

  const handleCancelClick = () => {
    props.onCancel();
  };

  return (
    <div className={classes.container}>
      <div className={classes.inputGrp}>
        <label >Please input Password：</label>
        
        <div className={classes.withButton}>
        <input type="password" value={password} onChange={handleInputChange} />
        <button onClick={handleConfirmClick}>Confirm</button>
          <button onClick={handleCancelClick}>Cancel</button>
        </div>
      </div>

      <p>{message}</p>
    </div>
  );
}

function ManageAccountPage(props){
  const classes = useStyles();
  const navigate = useNavigate();

  const user = useSelector(getUserAccount);
  const dispatch = useDispatch();

  const [newusername, setNewusername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showDialog, setShowDialog] = useState(true);
  const [message,setMessage] = useState('');
  // const [passwordValidMessage,setPasswordValidMessage] = useState('');

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
            },delay)
            
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
      setTimeout(()=>{setMessage("");},delay);
    }
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
        },delay);

      }).catch(e=>{
        console.log(e)
      })
    }

    setTimeout(()=>{setMessage("");},delay)
  }

  const handleCancel = (e)=>{
    e.preventDefault();
    navigate('/audiohub');
  }

  const handleDeleteAccount = (e)=>{
    setShowDialog(true);
    // 
  }

  const handleConfirmPassword = (password) => {
    // setPassword(password);
    setShowDialog(false);
    Logout();
  };

  const handleCancelPassword = () => {
    setShowDialog(false);
  };

  const handleOpenDialog = () => {
    setShowDialog(true);
  };

  const Logout = ()=>{
    Axios.post(serverUrl+"/api/logout",{
    }).then(res=>{
      console.log("Logout successful!",res);
      // reset User Accout Redux Store here, to clear it
      dispatch(updateUserAccount({username:'',token:'',userid:''}));

      navigate('/');
    }).catch(err=>{
      console.log("Internal server error!",err);
    });
  }

  return (
    <Paper className={classes.root}>
      <label className={classes.h2}>Manage Your Account</label>
      <label className={classes.h3}>Current User：{user.username}</label>
      <div className={classes.container}>
        <div className={classes.inputGrp}>
          <label htmlFor="newusername">Update New User Name:</label>
          <div className={classes.withButton}>
            <input
              type="text"
              id="newusername"
              value={newusername}
              onChange={(e) => setNewusername(e.target.value)}
            />
            <button onClick={handleUsernameUpdate}>Confirm</button>
          </div>
        </div>
        <div style={{marginTop:'10px'}}>
          <div className={classes.inputGrp}>
            <label htmlFor="password">New Password:</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
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

        {showDialog && (
          <PasswordDialog onConfirm={handleConfirmPassword} onCancel={handleCancelPassword} 
            user={user}/>
        )}
      </div>
    </Paper>
  );
}

export default ManageAccountPage;