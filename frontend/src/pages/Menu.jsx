import { useState } from "react";
import AppNavbar from "../components/AppNavBar";
import logoDOT from "../assets/DOT.png";
import "../styles/menu.css";
import { Dialog, DialogContent, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import MapaLeaflet from "../components/MapaLeaflet";

const Menu = () => {
  const [openMapa, setOpenMapa] = useState(false);

  const posicionFija = [14.63495, -89.98135];

  return (
    <>
      <AppNavbar />
      <div className="menu-title">
        DIRECCIÓN DE ORDENAMIENTO TERRITORIAL Y DESARROLLO MUNICIPAL
      </div>
      <div className="menu-image-container">
        <img
          src={logoDOT}
          alt="Escudo Municipalidad"
          className="menu-image"
          style={{ cursor: "pointer" }}
          onClick={() => setOpenMapa(true)}
        />
      </div>
      <Dialog
        open={openMapa}
        onClose={() => setOpenMapa(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogContent style={{ position: "relative", padding: 0 }}>
          <IconButton
            onClick={() => setOpenMapa(false)}
            style={{ position: "absolute", top: 10, right: 10, zIndex: 1000 }}
          >
            <CloseIcon />
          </IconButton>

          <MapaLeaflet
            initialPosition={posicionFija}
            direccion="Municipalidad de Jalapa, Guatemala"
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Menu;

