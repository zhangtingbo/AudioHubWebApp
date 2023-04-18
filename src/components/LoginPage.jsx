import React, { useState } from 'react';
import {useNavigate} from "react-router-dom";
import Axios from 'axios';

function LoginPage(props) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  let [error, setError] = React.useState(null);

  const navigate = useNavigate();

  const handleUsernameChange = (event) => {
    setUsername(event.target.value);
  };

  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
  };

  const submitForm =(target)=>{

    

    return {}
  }

  async function handleSubmit(event) {
    event.preventDefault();
    
    Axios.post("http://localhost:5000/api/addNewUser",{
      username: username, 
      email:'',
      password:password
    }).then(res=>{
      console.log(res)
    }).catch(err=>console.log(err));

    navigate('/');

    // if (response.error)  {
    //   setError(response.error);
    // } else {
    //   navigate('/');
    // }
  }

  const handleSignUp = (event)=>{
    navigate('/signup');
  }

  const handleManageAccount = (event)=>{
    navigate('/manageaccount');
  }

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="username">Username:</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={handleUsernameChange}
          />
        </div>
        <div>
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={handlePasswordChange}
          />
        </div>
        <button onClick={handleSignUp}>Sign Up</button>
        <button type="submit">Login</button>
        <button onClick={handleManageAccount}>Manage Account</button>
      </form>
    </div>
  );
}

export default LoginPage;