

export const formatAudioFiles = (filesData, audioURL) => {

    let filteredData = filesData;
    console.log("formatAudioFiles: raw data:", filesData)
    console.log("with URL list:", audioURL)
    if (filteredData.length > 0) {
        let rows = [];
        filteredData.forEach((item, idx) => {
            rows.push({
                ...item,
                category: item.metadata.category,
                description: item.metadata.description,
                filename: item.metadata.newFilename,
                URL: audioURL[item._id]?audioURL[item._id]:item.metadata.url,
                player: <audio crossOrigin="anonymous" id={item._id}
                    src={audioURL[item._id]?audioURL[item._id]:item.metadata.url}
                    controls controlsList="noplaybackrate"
                    style={{ height: '20px' }} />,
            });
        });


        let columns = [];
        let fontSize = '12px';
        if (rows.length > 0) {
            for (let item of Object.keys(rows[0])) {
                // common properties
                let name = item;
                switch (item) {
                    case 'category':
                        name = "Category";
                        break;
                    case 'description':
                        name = "Description";
                        break;
                    case 'uploadDate':
                        name = 'Upload Date';
                        break;
                    case 'filename':
                        name = 'Filename';
                        break;
                    default:
                        break;
                }
                let column = {
                    title: name,
                    field: item,
                    cellStyle: { fontSize: fontSize },
                }

                if (item === 'category' || item === 'description' || item === 'uploadDate' || item === 'filename') {
                    columns.push(column);
                }
                if (item === '_id') {
                    column.hidden = true;
                    columns.push(column);
                }
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

        console.log("Audio list formated:", rows)

        return { rows: rows, columns: columns };
    }
    else
        return { rows: [], columns: [] };
}

export const filterByUserid = (options) => {
    const { filesData, userid } = options;
    console.log("Before filter by userid: ", userid, filesData);
    let filtered = filesData?.filter(file => file.metadata.userid === userid);
    console.log("After filter by userid: ", filtered);
    return filtered;
}

export const validatePassword = (password) => {
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

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/;
export const checkPasswordStrength = (password) => {
  if (passwordRegex.test(password)) {
    return 'strong';
  } else if (password.length > 0) {
    return 'weak';
  } else {
    return '';
  }
};

export const validateUsername = (username) => {
    // Username must be started with Character, only includes character, number and "_"
    // the length  >= 6 and <=20
    const regex = /^[a-zA-Z][a-zA-Z0-9_]{5,19}$/;
    return regex.test(username);
}



