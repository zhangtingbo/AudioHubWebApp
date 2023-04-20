import React,{ useState } from 'react';
import {useNavigate} from "react-router-dom";
import Axios from 'axios';
import { useSelector,useDispatch} from "react-redux";

import {getUserAccount,updateUserAccount} from '../redux/userLoginSlice';
import {serverUrl,delay} from '../common/variables';
import {validatePassword, validateUsername} from '../common/util';

function PasswordDialog(props) {
  const [password, setPassword] = useState('');
  const [message,setMessage] = useState('');

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
    <div className="password-dialog">
      <h2>Please input Password：</h2>
      <input type="password" value={password} onChange={handleInputChange} />
      <div className="button-group">
        <button onClick={handleConfirmClick}>Confirm</button>
        <button onClick={handleCancelClick}>Cancel</button>
      </div>
      <p>{message}</p>
    </div>
  );
}

function ManageAccountPage(props){
    
  const navigate = useNavigate();

  const user = useSelector(getUserAccount);
  const dispatch = useDispatch();

  const [newusername, setNewusername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showDialog, setShowDialog] = useState(false);
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
    navigate('/');
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

      navigate('/login');
    }).catch(err=>{
      console.log("Internal server error!",err);
    });
  }

  return (
    <div>
      <h1>Manage Your Account</h1>
      <h2>Current User：{user.username}</h2>
      <div>
        <div>
          <label htmlFor="newusername">Update New User Name:</label>
          <input
            type="text"
            id="newusername"
            value={newusername}
            onChange={(e) => setNewusername(e.target.value)}
          />
          <button onClick={handleUsernameUpdate}>Confirm Update</button>
        </div>
        <div>
          <label htmlFor="password">New Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="confirmPassword">Confirm New Password:</label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <button onClick={handlePasswordUpdate}>Confirm Update</button>
        </div>
        
        {/* <button type="submit">Confirm</button> */}
        <button onClick={handleCancel}>Cancel</button>
        <p>{message}</p>
        <button onClick={handleDeleteAccount}>Delete Account</button>

        {showDialog && (
          <PasswordDialog onConfirm={handleConfirmPassword} onCancel={handleCancelPassword} 
            user={user}/>
        )}
      </div>
    </div>
  );
}

export default ManageAccountPage;