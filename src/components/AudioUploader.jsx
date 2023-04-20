import React, { useState,useContext } from 'react';
import axios from 'axios';
import {useNavigate} from "react-router-dom";
import { useSelector,useDispatch} from "react-redux";

import {getUserAccount,updateUserAccount} from '../redux/userLoginSlice';
import AudiofilesContext from '../hooks/AudiofilesContext';
import {formatAudioFiles,filterByUserid} from '../common/util';
import {serverUrl,delay} from '../common/variables';

const FileUpload = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [message, setMessage] = useState('');

  // const [file, setFile] = useState(null);
  const [filename, setFilename] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [newFilename, setNewFilename] = useState('');

  const navigate = useNavigate();
  const user = useSelector(getUserAccount);
  const dispatch = useDispatch();
  const {setAudioFiles} = useContext(AudiofilesContext);

  const handleFileInput = (event) => {
    setMessage('');
    setSelectedFile(event.target.files[0]);
  };

  const handleFileChange = (event) => {
    setMessage('');

    const selectedFile = event.target.files[0];
    setSelectedFile(selectedFile);
    // setFile(selectedFile);
    setFilename(selectedFile.name);
    // Set the new filename to the current filename by default
    setNewFilename(selectedFile.name);
  };

  const handleFilenameChange = (event) => {
    setNewFilename(event.target.value);
  };

  const handleUpload = () => {

    if(!user.userid){
      console.log("Invalid User! Please logout and login again!");
      return;
    }

    const formData = new FormData();

    formData.append('username', user.username);
    formData.append('userid', user.userid);
    formData.append('category', category);
    formData.append('description', description);
    formData.append('newFilename', newFilename);
    formData.append('file', selectedFile);

    const config = {
      headers: { 'content-type': 'multipart/form-data' }
    }

    try {
      axios.post(serverUrl+'/api/audio', formData, config).then(res=>{

        setMessage('upload success！');
        setTimeout(()=>{setMessage("")},delay)

        
        setSelectedFile("");

        // update Audio Table here
        try{
          let filteredFiles = filterByUserid({filesData:res.data.files, userid:user.userid});
          let formated = formatAudioFiles(filteredFiles);
          setAudioFiles(formated);
        }
        catch(e){
          console.log(e);
        }

      }).catch(err=>{
        console.error("upload fail:",err);
        setMessage('upload fail！');
        setTimeout(()=>{setMessage("")},delay)
      });

      
    } catch (err) {
      console.error("upload fail:",err);
      setMessage('upload fail！');
      setTimeout(()=>{setMessage("")},delay)
    }
  };

  const handleLogout = ()=>{
    axios.post(serverUrl+"/api/logout",{
    }).then(res=>{
      console.log("Logout successful!",res);
      // reset User Accout Redux Store here, to clear it
      dispatch(updateUserAccount({username:'',token:'',userid:''}));

      navigate('/login');
    }).catch(err=>{
      console.log("Internal server error!",err);
    });
  }

  const handleCategoryChange = (event) => {
    setCategory(event.target.value);
  };

  const handleDescriptionChange = (event) => {
    setDescription(event.target.value);
  };

  const handleManageAccount = (event)=>{
    navigate('/manageaccount');
  }

  return (
    <div>
      {/* <h2>Audio Uploader</h2> */}
      <div>
        <label htmlFor="file">Select file:</label>
        <input type="file" onChange={handleFileChange} />
      </div>
      <div>
        <label htmlFor="filename">Filename:</label>
        <input type="text" id="filename" value={newFilename} onChange={handleFilenameChange} />
      </div>
      <div>
        <label htmlFor="category">Category:</label>
        <select id="category" value={category} onChange={handleCategoryChange}>
          <option value="">--Select category--</option>
          <option value="music">Music</option>
          <option value="podcast">Podcast</option>
          <option value="audiobook">Audiobook</option>
        </select>
      </div>
      <div>
        <label htmlFor="description">Description:</label>
        <textarea id="description" value={description} onChange={handleDescriptionChange} />
      </div>
      <div>
        <button disabled={!selectedFile} onClick={handleUpload}>Upload</button>
        <p>{message}</p>
      </div>

      <button onClick={handleLogout}>Logout</button>
      <button onClick={handleManageAccount}>Manage Account</button>
    </div>
  );
};

export default FileUpload;