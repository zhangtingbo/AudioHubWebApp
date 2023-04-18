import React, { useState } from 'react';

import FileUpload from './AudioUploader';

function AudioManager(props){
    const [loading,setLoading] = useState(false);
    
    return (
        <div>
            Audio manager
            <FileUpload />
        </div>
    )
}

export default AudioManager;