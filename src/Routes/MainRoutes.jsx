import React from "react";
import Home from "../pages/Home.jsx";
import User from "../pages/User.jsx";
import { Routes, Route } from "react-router-dom";

const MainRoutes = () => {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="user/:id" element={<User />} />
      </Routes>
    </>
  );
};

export default MainRoutes;
