import React, { useState, useEffect, useContext } from 'react';
import { Table, Button, message, Space } from 'antd';
import moment from 'moment';
import { AuthContext } from '../../Context/AuthProvider';
import { fetchLeaveRequests, fetchLeaveTypesAPI, cancelLeaveRequestAPI } from '../../Services/Services';
import '../../Style/Organization.css';
import { useDispatch } from 'react-redux';
import { setUserLeaveRequests } from '../../Redux/leaveRequestsSlice';

const LeaveRequestList = () => {

    const dispatch = useDispatch();
    const { user } = useContext(AuthContext);
    const [leaveRequests, setLeaveRequests] = useState([]);
    const [leaveTypes, setLeaveTypes] = useState([]);
    const [loading, setLoading] = useState(false);

    const columns = [
      {
          title: 'Leave Type',
          dataIndex: 'leave_type',
          key: 'leave_type',
          render: (leave_type) => getLeaveTypeName(leave_type),
      },
      {
          title: 'Reason',
          dataIndex: 'reason',
          key: 'reason',
      },
      {
          title: 'Start Date',
          dataIndex: 'start_date',
          key: 'start_date',
          render: (date) => moment(date).format('YYYY-MM-DD'),
      },
      {
          title: 'End Date',
          dataIndex: 'end_date',
          key: 'end_date',
          render: (date) => moment(date).format('YYYY-MM-DD'),
      },
      {
          title: 'Date of Request',
          dataIndex: 'date_of_request',
          key: 'date_of_request',
          render: (date) => moment(date).format('YYYY-MM-DD'),
      },
      {
          title: 'Status',
          dataIndex: 'status',
          key: 'status',
          render: (status, record) => {
              const today = moment();
              const start = moment(record.start_date);
              const daysDiff = start.diff(today, 'days');

              if (status === 'Pending' && daysDiff >= 3) {
                  return (
                      <Space>
                          <Button type="danger" onClick={() => handleCancel(record.id, record.start_date)}>
                              Cancel Leave
                          </Button>
                      </Space>
                  );
              }

              return status;
          },
      },
  ];

    useEffect(() => {
        fetchData();
    }, []);



    const fetchData = async () => {
        setLoading(true);
        try {
            const leaveRequestsData = await fetchLeaveRequests(user.user_id);
            setLeaveRequests(leaveRequestsData); 
            dispatch(setUserLeaveRequests(leaveRequestsData));


            const leaveTypesData = await fetchLeaveTypesAPI();
            setLeaveTypes(leaveTypesData); 
        } catch (error) {
            console.error('Error fetching data:', error);
            message.error('Failed to fetch data.');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async (id, startDate) => {
        try {
            const today = moment();
            const start = moment(startDate);
            const daysDiff = start.diff(today, 'days');

            if (daysDiff >= 3) {
                await cancelLeaveRequestAPI(id);
                setLeaveRequests(leaveRequests.filter((request) => request.id !== id));
                message.success('Leave request canceled successfully!');
            } else {
                message.error('You can only cancel leave requests 3 days or more before the start date.');
            }
        } catch (error) {
            console.error('Error canceling leave request:', error);
            message.error('Failed to cancel leave request. Please try again.');
        }
    };

    const getLeaveTypeName = (leaveTypeId) => {
        const leaveType = leaveTypes.find(type => type.id === leaveTypeId);
        return leaveType ? leaveType.name : 'Unknown';
    };

    return (
        <>
            <Table
                dataSource={leaveRequests}
                columns={columns}
                rowKey="id"
                rowClassName={(record) => {
                    if (record.status === 'Approved') return 'approved';
                    if (record.status === 'Rejected') return 'rejected';
                    return '';
                }}
                pagination={false}
                loading={loading}
                style={{ background: 'transparent' }}
            />
        </>
    );
};

export default LeaveRequestList;