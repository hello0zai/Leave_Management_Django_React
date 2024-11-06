import React, { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { AuthContext } from "../Context/AuthProvider";

const PrivateRoute = ({ children }) => {
  const { isAuth } = useContext(AuthContext);

  if (!isAuth) return <Navigate to="/Login" />;
  return children ? children : <Outlet />;
};

export default PrivateRoute;