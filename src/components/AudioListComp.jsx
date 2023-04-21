import React, { useState, useEffect,useContext } from 'react';
import MaterialTable from "material-table";
import shouldUpdate from "recompose/shouldUpdate";

// import AudiofilesContext from '../hooks/AudiofilesContext';
import { tableIcons } from '../common/variables';

function AudioList(props) {
    const { useState } = React;
    const [selectedRow, setSelectedRow] = useState(null);
    // const { audioFiles,setAudioFiles } = useContext(AudiofilesContext);
    const audioFiles = props.audioFiles;

    const [rows,setRows] = useState([]);
    const [columns,setColumns] = useState([]);
    useEffect(()=>{
        setRows(audioFiles.rows);
        setColumns(audioFiles.columns);
    },[audioFiles,props.toUpdate])
    
    const toDownload=async (_,row)=>{
        props.downloadFile(row);
    }

    return (
        <MaterialTable
            title=""
            columns={columns}
            data={rows}
            icons={tableIcons}
            onRowClick={((evt, selectedRow) => setSelectedRow(selectedRow.tableData.id))}
            options={{
                rowStyle: rowData => ({
                    backgroundColor: (selectedRow === rowData.tableData.id) ? '#EEE' : '#FFF'
                }),
                actionsColumnIndex: -1
            }}
            actions={
                [
                rowData => ({
                    icon: tableIcons.Download,
                    tooltip: 'Download',
                    onClick: (event,rowData) =>toDownload(event,rowData)
                })
                ]
            }
            editable={{
                onRowDelete: oldData =>
                    new Promise((resolve) => {
                        setTimeout(() => {
                            const newRows = audioFiles.rows;
                            let idx = audioFiles.rows.findIndex(each => oldData._id === each._id);
                            if (idx > -1) {
                                newRows.splice(idx, 1);
                                props.deleteFile(oldData, newRows);
                            }

                            resolve();
                        }, 1000)
                    })
            }}
        />

    )
}

const shouldUpdateTable = (props, nextProps) => {
    // return (props.toUpdate!==nextProps.toUpdate);
    return true;
}
const AudioListComp = shouldUpdate(shouldUpdateTable)(AudioList);

export default AudioListComp;