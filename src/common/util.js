

export const formatAudioFiles=(filesData)=>{
    let filteredData = filesData;

        if (filteredData.length > 0) {
            let rows = [];
            
            filteredData.forEach((item, idx) => {
                    // if (!lookup_channel[channel])
                    //     lookup_channel[channel] = channel;
                rows.push({...item,
                    category:item.metadata.category,
                    description:item.metadata.description,
                    filename:item.metadata.newFilename,
                    URL:item.metadata.url,
                    player: <audio crossOrigin="anonymous" id={item._id}
                            src={item.metadata.url} 
                            controls controlsList="noplaybackrate"
                            style={{ height: '20px'}} />,
                });
                    // rows.push({
                    //     Channel: channel,
                    //     Start: moment.unix(startTimestampOffset).utc(displayWithLocalTime).format("DD/MM/YY HH:mm:ss"),
                    //     URL: audiofilelocation, //audioList[idx%3].url,  // hardcode for testing
                    //     Transcribed: messageintext,
                    //     Duration: messageduration,
                    //     'Audio Filename': audiofilename,
                    //     player: <audio crossOrigin="anonymous" id={audiofilename + '_' + timestamp}
                    //         src={audiofilelocation} controls controlsList="noplaybackrate"
                    //         style={{ height: '20px', backgroundColor: theme.palette.primary.main }} />,
                    //     startTimestampOffset: startTimestampOffset,
                    //     playing: playing,

                    // })
            });
            

            let columns = [];
            let fontSize = '12px';
            if (rows.length > 0) {
                for (let item of Object.keys(rows[0])) {
                    // common properties
                    let column = {
                        title: item,
                        field: item,
                        cellStyle: { fontSize: fontSize },
                    }

                    if(item === 'category'||item === 'description'||item==='uploadDate'||item==='filename') {
                        columns.push(column);
                    }
                    if(item === '_id'){
                        column.hidden = true;
                        columns.push(column);
                    }
                    // if (item === 'Transcribed' || item === 'Duration' || item === 'Start') {
                    //     column.filtering = false;
                    //     column.hidden = false;
                    //     columns.push(column);
                    // }
                    // if (item === 'Audio Filename') {
                    //     column.filtering = false;
                    //     column.hidden = true;
                    //     column.hiddenByColumnsButton = true;
                    //     columns.push(column);
                    // }
                    if (item === 'URL') {
                        column.filtering = false;
                        column.hidden = false;
                        column.render = rowData => {
                            let player = rowData.player;
                            return player;
                        }
                        columns.push(column);
                    }
                }
            }
                
            return { rows: rows, columns: columns};
        }
        else
            return { rows: [], columns: []};
}

export const filterByUserid = (options)=>{
    const {filesData,userid} = options;
    console.log("Before filter by userid: ",userid,filesData);
    let filtered = filesData?.filter(file=>file.metadata.userid===userid);
    console.log("After filter by userid: ",filtered);
    return filtered;
}

export const validatePassword = (password)=>{
    // check length
    if (password.length < 8) {
      return false;
    }
  
    var uppercase = false;
    var lowercase = false;
    var number = false;
    for (var i = 0; i < password.length; i++) {
      var c = password.charAt(i);
      if (c >= 'A' && c <= 'Z') {
        uppercase = true;
      } else if (c >= 'a' && c <= 'z') {
        lowercase = true;
      } else if (c >= '0' && c <= '9') {
        number = true;
      }
    }
    return uppercase && lowercase && number;
}

export const validateUsername=(username)=> {
    // Username must be started with Character, only includes character, number and "_"
    // the length  >= 6 and <=20
    const regex = /^[a-zA-Z][a-zA-Z0-9_]{5,19}$/;
    return regex.test(username);
}

  

