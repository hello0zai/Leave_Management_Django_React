import React, { useContext, useEffect, useState } from "react";
import {
  LaptopOutlined,
  HomeOutlined,
  UnorderedListOutlined,
} from "@ant-design/icons";
import { Layout, Menu, message, Modal } from "antd";
import { AuthContext } from "../../Context/AuthProvider";
import { FaUserCircle } from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";
import MainRoute from "../../Route/Route";
import AppButton from "../Generic/AppButton";

const { Header, Content, Sider } = Layout;

const Layouts = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logoutUser, role } = useContext(AuthContext) ?? {};
  const [isLoading, setIsLoading] = useState(false);
  const [isLogoutModalVisible, setIsLogoutModalVisible] = useState(false);

  const showLogoutModal = () => {
    setIsLogoutModalVisible(true);
  };

  const handleLogoutConfirm = () => {
    setIsLogoutModalVisible(false);
    logoutUser();
    message.success("You have been logged out.");
  };

  const handleLogoutCancel = () => {
    setIsLogoutModalVisible(false);
  };

  useEffect(() => {
    setIsLoading(false);
  }, []);

  const getSelectedKey = () => {
    if (location.pathname === "/my-leaves") {
      return "1";
    } else if (location.pathname === "/Leve-Request") {
      return "2";
    } else if (location.pathname === "/list") {
      return "3";
    } else if (location.pathname === "/register") {
      return "4";
    } else {
      return "1";
    }
  };

  if (isLoading) return "Loading...";

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Header
        style={{
          position: "fixed",
          width: "100%",
          zIndex: 1,
          display: "flex",
          alignItems: "center",
          backgroundColor: "skyblue",
        }}
      >
        <div className="logo">Leave Management</div>
        {user && (
          <>
            <div className="Userposition  ms-auto">
              <FaUserCircle />
            </div>
            &nbsp;
            <div className="username">{user?.first_name}</div>
          </>
        )}
        &nbsp;
        {user && (
          <AppButton
            label="Logout"
            onClick={showLogoutModal}
            className="btn btn-danger mt-1 pt-1"
          />
        )}
      </Header>
      <Layout style={{ marginTop: 64 }}>
        {user && (
          <Sider
            style={{
              height: "100vh",
              position: "fixed",
              left: 0,
              top: 64,
              width: "100%",
            }}
          >
            <div className="logo" />
            <Menu
              theme="dark"
              selectedKeys={[getSelectedKey()]}
              mode="inline"
              style={{ backgroundColor: "rgb(50, 50, 63)", height: "100%" }}
            >
              {role === 2 && (
                <Menu.Item
                  key={1}
                  icon={<HomeOutlined />}
                  onClick={() => navigate("/my-leaves")}
                >
                  Home
                </Menu.Item>
              )}
              {role === 2 && (
                <Menu.Item
                  key={2}
                  icon={<LaptopOutlined />}
                  onClick={() => navigate("/Leve-Request")}
                >
                  Register Your Leave
                </Menu.Item>
              )}
              {role === 1 && (
                <Menu.Item
                  key={3}
                  icon={<HomeOutlined />}
                  onClick={() => navigate("/list")}
                >
                  Leave List
                </Menu.Item>
              )}
              {role === 1 && (
                <Menu.Item
                  key={4}
                  icon={<UnorderedListOutlined />}
                  onClick={() => navigate("/register")}
                >
                  Register Employee
                </Menu.Item>
              )}
            </Menu>
          </Sider>
        )}
        <Layout style={{ marginLeft: user ? 200 : 0, padding: "0 10px 10px" }}>
          <Content>
            <MainRoute />
            <Modal
              title="Confirm Logout"
              visible={isLogoutModalVisible}
              onOk={handleLogoutConfirm}
              onCancel={handleLogoutCancel}
              okText="Logout"
              cancelText="Cancel"
              maskClosable={false}
              destroyOnClose
            >
              <p>Are you sure you want to log out?</p>
            </Modal>
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
};

export default Layouts;
