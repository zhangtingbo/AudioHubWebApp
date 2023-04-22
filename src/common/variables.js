import React,{forwardRef} from "react";

import CheckIcon from '@material-ui/icons/Check';
import DeleteIcon from '@material-ui/icons/Delete';
import ViewColumnIcon from '@material-ui/icons/ViewColumn';
import PauseOutlinedIcon from "@material-ui/icons/PauseOutlined";
import PlayArrowIcon from "@material-ui/icons/PlayArrow";
import PlayCircleOutlineIcon from '@material-ui/icons/PlayCircleOutline';
import AddOutlined from '@material-ui/icons/AddOutlined';
import FilterIcon from '@material-ui/icons/FilterListOutlined';
import VisibilityIcon from '@material-ui/icons/Visibility';
import ClearIcon from "@material-ui/icons/Clear";
import EditIcon from "@material-ui/icons/Edit";
import ArrowDropDownIcon from "@material-ui/icons/ArrowDropDown";
import ArrowRight from '@material-ui/icons/ArrowRight';
import SearchIcon from '@material-ui/icons/Search';
import FirstPage from '@material-ui/icons/FirstPage';
import LastPage from '@material-ui/icons/LastPage';
import PreviousPage from '@material-ui/icons/ChevronLeft';
import NextPage from '@material-ui/icons/ChevronRight';
import CachedIcon from '@material-ui/icons/Cached';

export const serverUrl = "http://localhost:5010";

export const delay = 5000;

export const tableIcons = {
    Delete: forwardRef((props, ref) => <DeleteIcon {...props} ref={ref} />),
    DeleteDisable: forwardRef((props, ref) => <DeleteIcon {...props} ref={ref} style={{color: 'gray'}}/>),
    Show: forwardRef((props, ref) => <VisibilityIcon {...props} ref={ref} />),
    Edit: forwardRef((props, ref) => <EditIcon {...props} ref={ref}/>),
    EditDisable: forwardRef((props, ref) => <EditIcon {...props} ref={ref} style={{color: 'gray'}}/>),
    SortArrow: forwardRef((props, ref) => <ArrowDropDownIcon {...props} ref={ref} style={{fontSize: 20}}/>),
    Clear: forwardRef((props, ref) => <ClearIcon {...props} ref={ref} />),
    Check: forwardRef((props, ref) => <CheckIcon {...props} ref={ref} />),
    Filter: forwardRef((props, ref) => <FilterIcon {...props} ref={ref} />),
    Play: forwardRef((props, ref) => <PlayCircleOutlineIcon {...props} ref={ref} />),
    DetailPanel: forwardRef((props, ref) => <ArrowRight {...props} ref={ref} style={{color: 'white'}} />),
    Search: forwardRef((props, ref) => <SearchIcon {...props} ref={ref} />),
    ResetSearch: forwardRef((props, ref) => <ClearIcon {...props} ref={ref}  />),
    Add: forwardRef((props, ref) => <AddOutlined {...props} ref={ref}  />),
    ViewColumn:forwardRef((props, ref) => <ViewColumnIcon {...props} ref={ref}  />),
    FirstPage:forwardRef((props,ref)=><FirstPage {...props} ref={ref}/>),
    LastPage:forwardRef((props,ref)=><LastPage {...props} ref={ref}/>),
    PreviousPage:forwardRef((props,ref)=><PreviousPage {...props} ref={ref}/>),
    NextPage:forwardRef((props,ref)=><NextPage {...props} ref={ref}/>),
    Download:forwardRef((props,ref)=><CachedIcon {...props} ref={ref}/>)
};

