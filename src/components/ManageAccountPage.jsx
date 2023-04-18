import React,{ useState } from 'react';
import {useNavigate} from "react-router-dom";

function ManageAccountPage(props){
    
    const navigate = useNavigate();

    const [username, setUsername] = useState('');
    const [newusername, setNewusername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    // handle form submission here

    navigate('/login');
  };

  const handleCancel = (e)=>{
    e.preventDefault();

    navigate('/login');
  }


  return (
    <div>
      <h1>Manage Your Account</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="username">User Name:</label>
          <input
            type="username"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="newusername">New User Name:</label>
          <input
            type="newusername"
            id="newusername"
            value={newusername}
            onChange={(e) => setNewusername(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="confirmPassword">Confirm Password:</label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>
        <button type="submit">Confirm</button>
        <button onClick={handleCancel}>Cancel</button>
      </form>
    </div>
  );
}

export default ManageAccountPage;