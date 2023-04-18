import React, { useState } from 'react';
import axios from 'axios';

const FileUpload = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [message, setMessage] = useState('');

  const handleFileInput = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleDownload = async ()=>{
    try{
      await axios.get("http://localhost:5000/audiofiles")
      .then(res => {
        const persons = res.data;
        console.log("get files from DB")
        // this.setState({ persons });
      })
    }
    catch(err){
      console.log(err)
    }
  }

  const handleUpload = async () => {
    const formData = new FormData();
    console.log("selectedFile:",selectedFile)
    
    formData.append('file', selectedFile);

    const config = {
      headers: { 'content-type': 'multipart/form-data' }
    }

    try {
      await axios.post('http://localhost:5000/uploadaudio', formData, config);

      setMessage('upload success！');
    } catch (err) {
      console.error("upload fail:",err);
      setMessage('upload fail！');
    }
  };

  return (
    <div>
      <input type="file" onChange={handleFileInput} />
      <button onClick={handleUpload}>Upload</button>
      <button onClick={handleDownload}>Download</button>
      <p>{message}</p>
    </div>
  );
};

export default FileUpload;