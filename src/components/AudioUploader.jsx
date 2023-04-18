import React, { useState } from 'react';
// import axios from 'axios';

const FileUpload = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [message, setMessage] = useState('');

  const handleFileInput = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    // const formData = new FormData();
    // formData.append('file', selectedFile);

    // try {
    //   await axios.post('/upload', formData);
    //   setMessage('upload success！');
    // } catch (err) {
    //   console.error(err);
    //   setMessage('upload fail！');
    // }
  };

  return (
    <div>
      <input type="file" onChange={handleFileInput} />
      <button onClick={handleUpload}>Upload</button>
      <p>{message}</p>
    </div>
  );
};

export default FileUpload;