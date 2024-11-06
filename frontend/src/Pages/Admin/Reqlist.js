import React, { useState, useEffect, useContext } from 'react';
import { Table, Button, message, Space, Select, Row, Col } from 'antd';
import moment from 'moment';
import { AuthContext } from '../../Context/AuthProvider';
import { fetchLeaveRequestsAPI, fetchLeaveTypesAPI, approveLeaveRequestAPI, rejectLeaveRequestAPI, userdataAPI } from '../../Services/Services';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import '../../Style/Organization.css';
const { Option } = Select;

const LeaveRequestList = () => {

    const { user } = useContext(AuthContext);
    const [leaveRequests, setLeaveRequests] = useState([]);
    const [leaveTypes, setLeaveTypes] = useState([]);
    const [employeeFilter, setEmployeeFilter] = useState(null);
    const [leaveTypeFilter, setLeaveTypeFilter] = useState(null);
    const [loading, setLoading] = useState(false);
    const [userData, setUserData] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [total, setTotal] = useState(0);

    const initialColumns = [
        {
            title: 'Employee Name',
            dataIndex: 'username', 
            key: 'username',
        },
        {
            title: 'Leave Type',
            dataIndex: 'leave_type',
            key: 'leave_type',
            render: (leave_type) => leave_type ? leaveTypes.find(type => type.id === leave_type)?.name : 'Unknown',
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
                if (status === 'Pending' && user.role === 1) {
                    return (
                        <Space>
                            <Button type="primary" onClick={() => handleApprove(record.id)} style={{ marginRight: 8 }}>
                                Approve
                            </Button>
                            <Button type="danger" onClick={() => handleReject(record.id)} style={{ background: 'red', borderColor: 'red' }}>
                                Reject
                            </Button>
                        </Space>
                    );
                }
                return status;
            },
        },
    ];

    useEffect(() => {
        fetchLeaveRequests();
        fetchLeaveTypes();
        fetchUserData();
    }, []);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchLeaveRequests();
        }, 1000);

        return () => clearTimeout(delayDebounceFn);
    }, [employeeFilter, leaveTypeFilter, currentPage, pageSize]);

    const fetchUserData = async () => {
        try {
            const response = await userdataAPI();
            setUserData(response); 
        } catch (error) {
            console.error('Error fetching user data:', error);
            message.error('Failed to fetch user data.');
        }
    };

    const fetchLeaveRequests = async () => {
        setLoading(true);
        try {
            const { requests, total } = await fetchLeaveRequestsAPI(user, employeeFilter, leaveTypeFilter, currentPage, pageSize);
            setLeaveRequests(requests);
            setTotal(total);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching leave requests:', error);
            message.error('Failed to fetch leave requests.');
            setLoading(false);
        }
    };

    const fetchLeaveTypes = async () => {
        try {
            const leaveTypesData = await fetchLeaveTypesAPI();
            setLeaveTypes(leaveTypesData);
        } catch (error) {
            console.error('Error fetching leave types:', error);
            message.error('Failed to fetch leave types.');
        }
    };

    const handleApprove = async (id) => {
        try {
            await approveLeaveRequestAPI(id);
            fetchLeaveRequests(); 
            message.success('Leave request approved successfully!');
        } catch (error) {
            console.error('Error approving leave request:', error);
            message.error('Failed to approve leave request. Please try again.');
        }
    };

    const handleReject = async (id) => {
        try {
            await rejectLeaveRequestAPI(id);
            fetchLeaveRequests();
            message.success('Leave request rejected successfully!');
        } catch (error) {
            console.error('Error rejecting leave request:', error);
            message.error('Failed to reject leave request. Please try again.');
        }
    };

    const getLeaveTypeName = (leaveTypeId) => {
        const leaveType = leaveTypes.find(type => type.id === leaveTypeId);
        return leaveType ? leaveType.name : 'Unknown';
    };

    const handleEmployeeFilterChange = (value) => {
        setEmployeeFilter(value);
    };

    const handleLeaveTypeFilterChange = (value) => {
        setLeaveTypeFilter(value);
    };

    const handleTableChange = (pagination) => {
        setCurrentPage(pagination.current);
        setPageSize(pagination.pageSize);
    };

    const handleExport = () => {
        const exportData = leaveRequests.map(request => ({
            'Employee Name': request.username,
            'Leave Type': getLeaveTypeName(request.leave_type),
            'Reason': request.reason,
            'Start Date': moment(request.start_date).format('YYYY-MM-DD'),
            'End Date': moment(request.end_date).format('YYYY-MM-DD'),
            'Date of Request': moment(request.date_of_request).format('YYYY-MM-DD'),
            'Status': request.status,
        }));

        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Leave Requests');

        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });

        saveAs(blob, 'leave_requests.xlsx');
    };

    return (
        <>
            <Row align='middle'>
                <Col xl={5} lg={5} md={5} sm={5} xs={5}>
                    <Select
                        placeholder="Select employee"
                        allowClear
                        style={{ width: 200 }}
                        onChange={handleEmployeeFilterChange}
                    >
                        {userData.map((user, index) => (
                            <Option key={`${user.user_id}-${index}`} value={user.username}>
                                {user.username}
                            </Option>
                        ))}
                    </Select>
                </Col>
                <Col xl={5} lg={5} md={5} sm={5} xs={5}>
                    <Select
                        placeholder="Select leave type"
                        allowClear
                        style={{ width: 200 }}
                        onChange={handleLeaveTypeFilterChange}
                    >
                        {leaveTypes.map((leaveType, index) => (
                            <Option key={`${leaveType.id}-${index}`} value={leaveType.id}>
                                {leaveType.name}
                            </Option>
                        ))}
                    </Select>
                </Col>
                <Col xl={14} lg={14} md={14} sm={14} xs={14} style={{ textAlign: 'end' }}>
                    <div className="Export-button">
                        <Button type="primary" onClick={handleExport}>Export to Excel</Button>
                    </div>
                </Col>
            </Row>
            <br/>
            <Table
                dataSource={leaveRequests}
                columns={initialColumns}
                rowKey="id"
                loading={loading}
                pagination={{
                    current: currentPage,
                    pageSize: pageSize,
                    total: total,
                    showSizeChanger: true,
                }}
                onChange={handleTableChange}
                rowClassName={(record) => {
                    if (record.status === 'Approved') return 'approved';
                    if (record.status === 'Rejected') return 'rejected';
                    return '';
                }}
                style={{
                    background: 'transparent',
                }}
            />
        </>
    );
};

export default LeaveRequestList;
