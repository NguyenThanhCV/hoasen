import routes from "../../routes";
import HeaderLayout from "../DefaultLayout";
import React, { useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import { useNavigate } from "react-router-dom";
const DefaultComponentToPage = () => {
  const navigate = useNavigate();
  useEffect(() => {}, [navigate]);

  const showContentMenu = (routes) => {
    let result = null;
    if (routes) {
      result = routes.map((item, index) => {
        return (
          <Route key={index} path={item.path} element={item.component()} />
        );
      });
    }
    return result;
  };
  return (
    <div>
      <HeaderLayout>
        <Routes>{showContentMenu(routes)}</Routes>
      </HeaderLayout>
    </div>
  );
};

export default DefaultComponentToPage;
