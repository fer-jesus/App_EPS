//import React from "react";
import AppNavbar from "../components/AppNavBar";
import logoDOT from "../assets/DOT.png";
import "../styles/menu.css";

const Menu = () => {
  return (
    <>
      <AppNavbar />
      <div className="menu-title">
        DIRECCIÓN DE ORDENAMIENTO TERRITORIAL Y DESARROLLO MUNICIPAL
      </div>
      <div className="menu-image-container">
        <img src={logoDOT} alt="Escudo Municipalidad" className="menu-image" />
      </div>
    </>
  );
};

export default Menu;
