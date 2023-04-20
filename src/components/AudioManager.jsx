import React, { useState, useEffect } from 'react';
import axios from 'axios';

import { useSelector} from "react-redux";
import {getUserAccount} from '../redux/userLoginSlice';
import AudiofilesContext from '../hooks/AudiofilesContext';

import FileUpload from './AudioUploader';
import AudioListComp from './AudioListComp';
import {formatAudioFiles,filterByUserid} from '../common/util';
import {serverUrl} from '../common/variables';

function AudioManager(props){
    const [loading,setLoading] = useState(false);
    const [originalFiles, setOriginalFile] = useState([]);
    const [audioFiles,setAudioFiles] = useState({ rows: [], columns: []});
    const [updateAudioList,setUpdateAudioList] = useState(0);

    let user = useSelector(getUserAccount);

    useEffect(()=>{
        // update Audio File here
        getAudioFiles();
    },[]);

    const getAudioFiles = async ()=>{
        console.log("Getting Audio files from service...")
        try{
            await axios.get(serverUrl+"/api/audio")
            .then(res => {
              const filesData = res.data.files;

              // but need to filter by userid
              try{
                let filteredFiles = filterByUserid({filesData,userid:user.userid});
                setOriginalFile(filteredFiles);
                // format files list to feed Material-table
                let formatedList = formatAudioFiles(filteredFiles);
                setAudioFiles(formatedList);
              }
              catch(e){
                console.log("Files filtering failed!")
              }
            })
          }
          catch(err){
            console.log(err)
          }
    }

    const onDeleteAudio=async (toBeDelete, newRows)=>{
        console.log(toBeDelete, newRows)
        try{
            await axios.delete(serverUrl+"/api/audio/"+toBeDelete._id)
            .then(res => {
              // but need to filter by userid
              try{
                console.log("Delete audio successed!",res)
                try{
                    let filteredFiles = filterByUserid({filesData:res.data.files,userid:user.userid});
                    let formatedList = formatAudioFiles(filteredFiles);
                    setAudioFiles(formatedList);
                  }
                  catch(e){
                    console.log("Files filtering failed!")
                  }
              }
              catch(e){
                console.log("Delete audio failed!")
              }
            })
          }
          catch(err){
            console.log(err)
          }
    }

    const toDownload=(row)=>{
        console.log("toDownload:",row)
        // const formData = new FormData();

        // formData.append('id', row._id);
        // formData.append('filename', user.filename);
        // formData.append('contentType', user.contentType);

        const params = new URLSearchParams();
        params.append('id', row._id);
        params.append('filename', row.filename);
        params.append('contentType', row.contentType);

        try{
            axios.get(serverUrl+"/api/loadaudio?"+params.toString())
                .then(res => {
                    const fileUrl = res.data.fileUrl;
                    const id = res.data.id;
                    // update audio list here
                    setOriginalFile(prev=>{
                      prev.forEach(each=>{
                        if(each._id === id){
                          each.metadata.url = fileUrl;
                        }
                      });
                      return prev;
                    })
                    let formatedList = formatAudioFiles(originalFiles);
                    setAudioFiles(formatedList);

                    setUpdateAudioList(prev=>{
                      return (prev+1)%10;
                    })
                })
          }
          catch(err){
            console.log(err)
          }
    }


    
    return (
        <div className={"audio-hub"}>
            {/* <h1>Audio Hub</h1> */}
            <AudiofilesContext.Provider value={{ audioFiles,setAudioFiles }}>
                <h3>{user.username}</h3>
                <FileUpload />
                <AudioListComp deleteFile={onDeleteAudio} downloadFile={toDownload} toUpdate={updateAudioList}/>
                
            </AudiofilesContext.Provider>
        </div>
    )
}

export default AudioManager;