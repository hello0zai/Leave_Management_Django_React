import React, { useState, useEffect } from "react";
import { Form, Row, Col, Typography, message } from "antd";
import { MinusCircleOutlined } from '@ant-design/icons';
import { departmentData, leavetypeData } from "../../constant";
import { fetchDesignations, leaveRequestPost } from "../../Services/Services";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AppButton from '../../components/Generic/AppButton';
import AppDropdown from '../../components/Generic/AppDropdown';
import AppTextbox from '../../components/Generic/AppTextbox'; 

const { Title } = Typography;

const Register = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const [leaveBalances, setLeaveBalances] = useState([{ leavetype: "", balance: "" }]);
  const [designations, setDesignations] = useState([]);
  const [departmentSelected, setDepartmentSelected] = useState(false);

  useEffect(() => {
    fetchDesignationsData();
  }, []);

  const fetchDesignationsData = async (departmentId) => {
    try {
      const designationsData = await fetchDesignations(departmentId);
      setDesignations(designationsData);
    } catch (error) {
      console.error("There was an error fetching the designations!", error);
    }
  };

  const handleFieldsChange = (changedFields) => {
    const departmentField = changedFields.find(field => field.name[0] === 'department');
    if (departmentField) {
      const departmentValue = departmentField.value;
      setDepartmentSelected(!!departmentValue);
      if (departmentValue) {
        fetchDesignationsData(departmentValue);
      }
    }
  };

  const handleLeaveBalanceChange = (index, name, value) => {
    setLeaveBalances(prevLeaveBalances => {
      const newLeaveBalances = [...prevLeaveBalances];
      newLeaveBalances[index][name] = value;
      return newLeaveBalances;
    });
  };

  const addLeaveBalance = () => {
    if (leaveBalances.length < 3) {
      setLeaveBalances([...leaveBalances, { leavetype: "", balance: "" }]);
    }
  };

  const removeLeaveBalance = (index) => {
    setLeaveBalances(prevLeaveBalances => {
      const newLeaveBalances = prevLeaveBalances.filter((_, i) => i !== index);
      return newLeaveBalances;
    });
  };

  const handleSubmit = async (values) => {
    const { username, first_name, last_name, email, department, designation, contact_no, password } = values;

    const leaveTypeIds = leaveBalances.map(lb => lb.leavetype);
    const hasDuplicates = new Set(leaveTypeIds).size !== leaveTypeIds.length;

    if (hasDuplicates) {
      message.error("Selected leave types are the same. Please choose different leave types.");
      return;
    }

    try {
      debugger
      const userRes = await axios.post("http://localhost:8000/auth/register/", {
        username, first_name, last_name, email, department, designation, contact_no, password,
      });
      const userId = userRes.data.id;
      await leaveRequestPost(userId, leaveBalances);

      message.success("Registration Successful");
      navigate('/list');
    } catch (error) {
      console.error("There was an error!", error);
      message.error("Registration failed. Please try again.");
    }
  };

  return (
    <Row justify="center" align="middle" style={{ minHeight: "100vh" }}>
      <Col span={12}>
        <Title level={3} className="text-center">Registration Form</Title>
        <Form form={form} layout="vertical" onFinish={handleSubmit} onFieldsChange={handleFieldsChange}>
          <AppTextbox
            label="User Name"
            name="username"
            type = "text"
            rules={[{ required: true, message: "Please input your username!" }]}
            placeholder="Enter your username"
          />
          <AppTextbox
            label="First Name"
            name="first_name"
            type = "text"
            rules={[{ required: true, message: "Please input your first name!" }]}
            placeholder="Enter your first name"
          />
          <AppTextbox
            label="Last Name"
            name="last_name"
            type = "text"
            rules={[{ required: true, message: "Please input your last name!" }]}
            placeholder="Enter your last name"
          />
          <AppTextbox
            label="Email"
            name="email"
            type = "text"
            rules={[{ required: true, type: "email", message: "Please input a valid email!" }]}
            placeholder="Enter your email"
          />
          <AppTextbox
            label="Password"
            name="password"
            rules={[{ required: true, message: "Please input your password!" }]}
            placeholder="Enter your password"
            type="password"
          />
          <AppDropdown
            label="Department"
            name="department"
            rules={[{ required: true, message: "Please select a department!" }]}
            placeholder="Select Department"
            options={departmentData}
            onChange={(value) => form.setFieldsValue({ department: value })}
          />
          <AppDropdown
            label="Designation"
            name="designation"
            rules={[{ required: true, message: "Please select a designation!" }]}
            placeholder="Select Designation"
            options={designations}
            onChange={(value) => form.setFieldsValue({ designation: value })}
          />
          <AppTextbox
            label="Contact Number"
            name="contact_no"
            type="text"
            rules={[
              { required: true, message: "Please input your contact number!" },
              { pattern: /^\d{10}$/, message: "Contact number must be 10 digits!" }
            ]}
            placeholder="Enter your contact number"
          />
          <Title level={4}>Leave Balances</Title>
          {leaveBalances.map((lb, index) => (
            <Row key={index} gutter={16} align="middle" style={{ marginBottom: 16 }}>
              <Col span={10}>
                <AppDropdown
                  label="Leave Type"
                  name={`leave_type_${index}`}
                  rules={[{ required: true, message: "Please select a leave type!" }]}
                  placeholder='Select Leave Type'
                  options={leavetypeData}
                  onChange={(value) => handleLeaveBalanceChange(index, "leavetype", value)}
                />
              </Col>
              <Col span={10}>
                <AppTextbox
                  label="Balance"
                  name={`balance_${index}`}
                  rules={[
                    { required: true, message: "Please input the leave balance!" },
                    { validator: (_, value) => value > 0 ? Promise.resolve() : Promise.reject('Balance must be greater than 0!') }
                  ]}
                  placeholder="Enter the leave balance"
                  type="number"
                  onChange={(e) => handleLeaveBalanceChange(index, "balance", e.target.value)}
                />
              </Col>
              <Col span={4}>
                <MinusCircleOutlined onClick={() => removeLeaveBalance(index)} style={{ fontSize: '24px', color: 'red', cursor: 'pointer' }} />
              </Col>
            </Row>
          ))}
          <Form.Item>
            <AppButton label='Add Another Leave Type' type="dashed" onClick={addLeaveBalance} disabled={leaveBalances.length >= 3}>Add Another Leave Type</AppButton>
          </Form.Item>
          <Form.Item>
            <AppButton label='Register' type="primary" htmlType="submit" />
          </Form.Item>
        </Form>
      </Col>
    </Row>
  );
};

export default Register;
