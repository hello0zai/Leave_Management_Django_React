import axios from 'axios';

// export const API_HOST = 'http://localhost:2050';

const BASE_URL = 'http://localhost:8000/leave';
const AUTH_URL = 'http://127.0.0.1:8000/auth';

export const fetchLeaveRequestsAPI = async (user, employeeNameFilter, leaveTypeFilter) => {
    let url = `${BASE_URL}/leave-request/`;
    if (user.role === 1 && employeeNameFilter) {
        url += `?employee_name=${employeeNameFilter}`;
    }
    if (user.role === 1 && leaveTypeFilter) {
        url += `leave_type/${leaveTypeFilter}/`;
    }
    if (user.role === 1 && employeeNameFilter && leaveTypeFilter) {
        const userData = await userdataAPI();
        const userMatch = userData.find(userId => userId.first_name === employeeNameFilter);
        url = `http://localhost:8000/leave/leave-request/user/${userMatch.id}/type/${leaveTypeFilter}/`;
    }
    const response = await axios.get(url);
    const requestsWithData = await Promise.all(response.data.map(async (item) => {
        try {
            const userResponse = await axios.get(`${AUTH_URL}/Users/${item.user}/`);
            return { ...item, username: userResponse.data.username };
        } catch (error) {
            console.error('Error fetching user data:', error);
            return item;
        }
    }));
    return {
        requests: requestsWithData,
        total: response.data.count
    };
};

export const fetchLeaveTypesAPI = async () => {
    const response = await axios.get(`${BASE_URL}/Leave-Type/`);
    return response.data;
};

export const cancelLeaveRequestAPI = async (id) => {
    await axios.delete(`${BASE_URL}/leave-request/${id}/`);
};

export const submitLeaveRequestAPI = async (leaveRequest) => {
    await axios.post(`${BASE_URL}/leave-request/`, leaveRequest);
};

export const approveLeaveRequestAPI = async (id) => {
    await axios.put(`${BASE_URL}/leave-request/${id}/approve/`);
};

export const rejectLeaveRequestAPI = async (id) => {
    await axios.put(`${BASE_URL}/leave-request/${id}/reject/`);
};

export const userdataAPI = async () => {
    const response = await axios.get(`${AUTH_URL}/Users/`);
    return response.data;
};

export const leavetypeandbalanceAPI = async (user_id) => {
    const response = await axios.get(`${BASE_URL}/Leave-Balance/user/${user_id}/`);
    return response.data;
};

export const fetchLeaveRequests = async (user_id) => {
    const response = await axios.get(`http://localhost:8000/leave/leave-request/user/${user_id}/`);
    return response.data;
};


// register page Api

// export const fetchDepartments = async () => {
//     const response = await axios.get(`${AUTH_URL}/department/`);
//     return response.data;
// };

export const fetchDesignations = async (departmentId) => {
    const response = await axios.get(`${AUTH_URL}/designations/department/${departmentId}/`);
    return response.data;
};

export const leaveRequestPost = async (userId, leaveBalances) => {
    await axios.post(`${AUTH_URL}/register/leave_balance/`, {
        user_id: userId,
        leave_balances: leaveBalances
    });
};
