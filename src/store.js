import {configureStore} from '@reduxjs/toolkit';
import userLoginReducer from './redux/userLoginSlice';

export default configureStore({
    reducer:{
        userLoginStore:userLoginReducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware(),
    devTools:true
})