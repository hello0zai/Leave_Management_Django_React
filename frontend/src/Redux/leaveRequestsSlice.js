import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  userLeaveRequests: null
};

export const leaveRequestsSlice = createSlice({
  name: 'leaveRequestData',
  initialState,
  reducers: {
    setUserLeaveRequests: (state, action) => {
      state.userLeaveRequests = action.payload;
    },
  },
});

export const { setUserLeaveRequests } = leaveRequestsSlice.actions;
export default leaveRequestsSlice.reducer;