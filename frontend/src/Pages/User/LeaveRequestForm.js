import React, { useState, useEffect, useContext } from 'react';
import { Form, DatePicker, message, Spin } from 'antd';
import { AuthContext } from '../../Context/AuthProvider';
import { leavetypeandbalanceAPI, submitLeaveRequestAPI } from '../../Services/Services';
import { useNavigate } from "react-router-dom";
import { useSelector } from 'react-redux';
import moment from 'moment';
import AppButton from '../../components/Generic/AppButton';
import AppDropdown from '../../components/Generic/AppDropdown';
import AppTextbox from '../../components/Generic/AppTextbox';

const LeaveRequestForm = () => {

    const navigate = useNavigate();
    const [form] = Form.useForm();
    const { userLeaveRequests } = useSelector(state => state?.leaveRequestData)??{};
    const [leaveTypes, setLeaveTypes] = useState([]);
    const [loading, setLoading] = useState(false);
    const { user } = useContext(AuthContext);

    useEffect(() => {
        const fetchLeaveBalance = async () => {
            setLoading(true);
            try {
                const leaveBalanceData = await leavetypeandbalanceAPI(user.user_id);
                setLeaveTypes(leaveBalanceData);

            } catch (error) {
                console.error('Error fetching leave types and balances:', error);
                message.error('Failed to fetch leave types and balances. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchLeaveBalance();
    }, [user.user_id]);

    const handleSubmit = async (values) => {
        try {
            const { start_date, end_date, leave_type } = values;
            if (end_date < start_date) {
                message.error('End date must be after the start date.');
                return;
            }

            const leaveDuration = Math.ceil((end_date - start_date) / (1000 * 60 * 60 * 24)) + 1;

            const selectedLeaveType = leaveTypes.find(type => type.leavetype === leave_type);
            if (!selectedLeaveType) {
                message.error('Invalid leave type selected.');
                return;
            }

            const availableBalance = parseInt(selectedLeaveType.balance, 10);
            if (!availableBalance || availableBalance < leaveDuration) {
                message.error('You do not have sufficient leave balance.');
                return;
            }

            const leaveRequest = {
                ...values,
                user: user.user_id,
                start_date: start_date.format('YYYY-MM-DD'),
                end_date: end_date.format('YYYY-MM-DD'),
                date_of_request: new Date().toISOString(),
                status: 'Pending',
            };
            await submitLeaveRequestAPI(leaveRequest);
            message.success('Leave request submitted successfully!');
            form.resetFields();
            navigate("/my-leaves")
        } catch (error) {
            console.error('Error submitting leave request:', error);
            message.error('Failed to submit leave request. Please try again.');
        }
    };


    const disabledDate = (current) => {
        return current && (
            current < moment().startOf('day') ||
            userLeaveRequests.some(request =>
                request.status !== 'Rejected' && 
                current >= moment(request.start_date) && current <= moment(request.end_date)
            )
        );
    };

    if (loading) {
        return <Spin size="large" />;
    }

    return (
        <Form form={form} onFinish={handleSubmit} layout="vertical">
            <AppDropdown
                label="Leave Type"
                name="leave_type"
                rules={[{ required: true , message: 'Please select leave type!'}]}
                placeholder="Please select leave type"
                options={leaveTypes.filter(type => parseInt(type.balance, 10) > 0)}
                labelKey="leavetypename"
                valueKey="leavetype"
            />
            <Form.Item 
                label="Start Date" 
                name="start_date" 
                rules={[{ required: true, message: 'Please select start date!' }]}
            >
                <DatePicker disabledDate={disabledDate} />
            </Form.Item>
            <Form.Item 
                label="End Date" 
                name="end_date" 
                rules={[
                    { required: true, message: 'Please select end date!' },
                    ({ getFieldValue }) => ({
                        validator(_, value) {
                            if (!value || getFieldValue('start_date') <= value) {
                                return Promise.resolve();
                            }
                            return Promise.reject(new Error('End date must be after the start date.'));
                        },
                    }),
                ]}
            >
                <DatePicker disabledDate={disabledDate} />
            </Form.Item>
            <AppTextbox
            label="Reason" 
            name="reason" 
            rules={[{ required: true, message: 'Please provide reason for leave!' }]}
            placeholder='Enter Reason For your leave!'
            type="textarea"
            rows = '4'
            >
            </AppTextbox>
            <Form.Item>
                <AppButton label='Submit Request' type="primary" htmlType="submit"/>
            </Form.Item>
        </Form>
    );
};

export default LeaveRequestForm;
