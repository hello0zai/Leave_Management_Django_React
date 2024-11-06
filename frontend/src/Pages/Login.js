import React, { useContext, useState } from "react";
import axios from "axios";
import { AuthContext } from "../Context/AuthProvider";
import { useNavigate } from "react-router-dom";
import { Form, Button, Alert, Card } from "antd";
import "../Style/Organization.css"; 
import AppTextbox from "../components/Generic/AppTextbox";

const Login = () => {

  const { setUser, setToken, setIsAuth, setRole } = useContext(AuthContext);
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState("");


  const handleSubmit = async (values) => {
    try {
      const response = await axios.post(
        "http://localhost:8000/auth/login/",
        values
      );
      const { access } = response.data;
      const tokenPayload = JSON.parse(atob(access.split(".")[1]));

      setUser(tokenPayload);
      setToken(access);
      setIsAuth(true);
      setRole(tokenPayload.role);

      localStorage.setItem("authTokens", access);
      localStorage.setItem("userDetails", JSON.stringify(tokenPayload));
      localStorage.setItem("userId", tokenPayload.user_id);

      if (tokenPayload.role === 1) {
        navigate('/list', { replace: true });
      } else {
        navigate('/my-leaves', { replace: true });
      }
    } catch (error) {
      setErrorMessage("Wrong username or password. Please try again.");
      console.error("Error during login:", error);
    }
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", height: "55vh" }}>
      <Card className="login-card">
        <Form onFinish={handleSubmit} layout="vertical">
          <h3 style={{ textAlign: "center", marginBottom: "24px" }}>Login</h3>
          {errorMessage && (
            <Alert message={errorMessage} type="error" showIcon style={{ marginBottom: "24px" }} />
          )}
          <AppTextbox
          label="Username"
          name="username"
          rules={[{ required: true, message: "Please input your username!" }]}
          placeholder="Enter Your user name"
          type="text"
          />
          <AppTextbox
          label="Password"
          name="password"
          rules={[{ required: true, message: "Please input your password!" }]}
          placeholder="Enter Your Password Here"
          type = 'password' 
          />
          <Form.Item>
            <Button type="primary" htmlType="submit" style={{ width: "100%" }}>
              Login
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default Login;
