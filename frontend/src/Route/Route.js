import React, { useContext } from "react";
import { Routes, Route} from "react-router-dom";
import Login from "../Pages/Login";
import Register from "../Pages/Admin/Register";
import Reqlist from "../Pages/Admin/Reqlist";
import PrivateRoute from "./PrivetRoute";
import LeaveRequestForm from "../Pages/User/LeaveRequestForm";
import LeaveRequestList from "../Pages/User/LeaveRequestList";
import { AuthContext } from "../Context/AuthProvider";
import '../Style/Organization.css'; 

const MainRoute = () => {

  const { role, user } = useContext(AuthContext) ?? {};


  return (
    <div style={{ padding: '2%' }}>
      <Routes>
        {/* general route */}
        
        <Route path="/Login" element={!user && <Login />} />

        {/* User route */}
        {role ===2 && <Route path="/Leve-Request" element={<PrivateRoute><LeaveRequestForm/></PrivateRoute>} />}
        {role ===2 && <Route path="/my-leaves" element={<PrivateRoute><LeaveRequestList/></PrivateRoute>}/>}
        
       
       {/* admin route */}
        {role === 1 && <Route path="/list" element={<PrivateRoute><Reqlist /></PrivateRoute>} />}
        {role === 1 &&<Route path="/register" element={<PrivateRoute><Register /></PrivateRoute>} />} 
      </Routes>
    </div>
  );
};

export default MainRoute;
