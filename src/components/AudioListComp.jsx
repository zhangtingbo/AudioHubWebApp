import React, { useState, useEffect,useContext } from 'react';
import MaterialTable from "material-table";
import shouldUpdate from "recompose/shouldUpdate";

import { tableIcons } from '../common/variables';

function AudioList(props) {
    const { useState } = React;
    const [selectedRow, setSelectedRow] = useState(null);

    // const [rows,setRows] = useState([]);
    // const [columns,setColumns] = useState([]);
    // useEffect(()=>{
    //     setRows(props.audioFiles.rows);
    //     setColumns(props.audioFiles.columns);
    // },[props.audioFiles,props.toUpdate])
    
    const toDownload=async (_,row)=>{
        props.downloadFile(row);
    }

    return (
        <MaterialTable
            title=""
            columns={props.audioFiles.columns}
            data={props.audioFiles.rows}
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
                    tooltip: 'Load Audio',
                    onClick: (event,rowData) =>toDownload(event,rowData)
                })
                ]
            }
            editable={{
                onRowDelete: oldData =>
                    new Promise((resolve) => {
                        setTimeout(() => {
                            const newRows = props.audioFiles.rows;
                            let idx = props.audioFiles.rows.findIndex(each => oldData._id === each._id);
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