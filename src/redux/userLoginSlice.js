import { createSlice } from "@reduxjs/toolkit";

export const userLoginSlice = createSlice({
    name:'userLoginStore',
    initialState:{
        userAccount:{
            userid:'',
            username:'',
            token:''
        }
    },
    reducers:{
        updateUserAccount:(state,action)=>{
            state.userAccount = action.payload;
        }
    }
});

export const getUserAccount=(state)=>(state.userLoginStore.userAccount);

export const {updateUserAccount} = userLoginSlice.actions;

export default userLoginSlice.reducer;