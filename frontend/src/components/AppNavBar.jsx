import { useState, useContext } from "react";
import {
  AppBar,
  Toolbar,
  IconButton,
  Menu,
  MenuItem,
  Button,
  Box,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  Drawer,
  List,
  ListItem,
  ListItemText,
  useMediaQuery,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import AccountCircle from "@mui/icons-material/AccountCircle";
import ExpandMore from "@mui/icons-material/ExpandMore";
import ExpandLess from "@mui/icons-material/ExpandLess";
import PersonIcon from "@mui/icons-material/Person";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import logoMuni from "../assets/logoMuni.png";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@mui/material/styles";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

// import { AuthContext } from "../context/AuthContext"; //

const AppNavbar = () => {
  const [menuAnchorUser, setMenuAnchorUser] = useState(null);
  const [menuAnchorHistorial, setMenuAnchorHistorial] = useState(null);
  const [openHistorialDialog, setOpenHistorialDialog] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [configExpanded, setConfigExpanded] = useState(false);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { auth } = useContext(AuthContext);
  //console.log("Auth data:", auth);
  const rol = auth?.user?.rol.toUpperCase();
  const esAdmin = rol === "DIRECTOR" || rol === "SUBDIRECTOR";

  // const { logout } = useContext(AuthContext); //

  const handleMenuOpen = (setter) => (event) => setter(event.currentTarget);
  const handleMenuClose = (setter) => () => setter(null);

  // const handleOpenConfigDialog = () => {
  //   setOpenConfigDialog(true);
  //   setAnchorElUser(null);
  // };

  // const handleCloseConfigDialog = () => setOpenConfigDialog(false);

  const handleNavigate = (path) => {
    navigate(path);
    //setOpenConfigDialog(false);
    setDrawerOpen(false);
    setOpenHistorialDialog(false);
  };

  // const handleLogout = () => {
  //   // logout(); // función de cierre de sesión del AuthContext
  //   navigate("/");
  // };

  const drawerItems = (
    <List>
      <ListItem button onClick={() => handleNavigate("/registros")}>
        <ListItemText primary="Registros" />
      </ListItem>
      <ListItem button onClick={() => handleNavigate("/reportes")}>
        <ListItemText primary="Reportes" />
      </ListItem>
      <ListItem
        button
        onClick={() =>
          isMobile ? setOpenHistorialDialog(true) : handleNavigate("/historial")
        }
      >
        <ListItemText primary="Historial" />
      </ListItem>
      {esAdmin && (
        <>
          <ListItem button onClick={() => setConfigExpanded(!configExpanded)}>
            <ListItemText primary="Configuración" />
            {configExpanded ? <ExpandLess /> : <ExpandMore />}
          </ListItem>
          {configExpanded && (
            <>
              <ListItem
                button
                sx={{ pl: 4 }}
                onClick={() => handleNavigate("/usuarios")}
              >
                <PersonIcon sx={{ mr: 1 }} />
                <ListItemText primary="Usuarios" />
              </ListItem>
              <ListItem
                button
                sx={{ pl: 4 }}
                onClick={() => handleNavigate("/tarifas")}
              >
                <AttachMoneyIcon sx={{ mr: 1 }} />
                <ListItemText primary="Tarifas" />
              </ListItem>
            </>
          )}
        </>
      )}
    </List>
  );

  return (
    <>
      <AppBar position="static" sx={{ backgroundColor: "#006930" }}>
        <Toolbar sx={{ display: "flex", position: "relative" }}>
          <Box
            sx={{
              position: "absolute",
              left: "50%",
              transform: "translateX(-50%)",
              display: "flex",
              alignItems: "center",
              gap: 2,
            }}
          >
            <Link to="/menu">
              <img
                src={logoMuni}
                alt="Logo Municipalidad"
                style={{
                  width: "40px",
                  height: "40px",
                  marginRight: "16px",
                  cursor: "pointer",
                }}
              />
            </Link>
            {!isMobile && (
              <>
                <Button
                  color="inherit"
                  onClick={() => handleNavigate("/registros")}
                >
                  Registros
                </Button>
                <Button
                  color="inherit"
                  onClick={() => handleNavigate("/reportes")}
                >
                  Reportes
                </Button>
                <Button
                  color="inherit"
                  onClick={handleMenuOpen(setMenuAnchorHistorial)}
                >
                  Historial
                </Button>
                <Menu
                  anchorEl={menuAnchorHistorial}
                  open={Boolean(menuAnchorHistorial)}
                  onClose={handleMenuClose(setMenuAnchorHistorial)}
                >
                  <MenuItem onClick={() => handleNavigate("/historial-tasas")}>
                    Tasas
                  </MenuItem>
                  <MenuItem
                    onClick={() => handleNavigate("/historial-licencias")}
                  >
                    Licencias
                  </MenuItem>
                  <MenuItem
                    onClick={() => handleNavigate("/historial-nomenclaturas")}
                  >
                    Nomenclaturas
                  </MenuItem>
                </Menu>
              </>
            )}
          </Box>

          <Box
            sx={{ marginLeft: "auto", display: "flex", alignItems: "center" }}
          >
            {isMobile && (
              <IconButton
                onClick={() => setDrawerOpen(true)}
                sx={{
                  color: "#fff",
                  position: "absolute",
                  left: 8,
                  display: { xs: "flex", sm: "none" },
                }}
              >
                <MenuIcon />
              </IconButton>
            )}
            <Tooltip title="Opciones del usuario">
              <IconButton
                onClick={handleMenuOpen(setMenuAnchorUser)}
                sx={{ color: "#fff" }}
              >
                <AccountCircle />
              </IconButton>
            </Tooltip>
            <Menu
              anchorEl={menuAnchorUser}
              open={Boolean(menuAnchorUser)}
              onClose={handleMenuClose(setMenuAnchorUser)}
            >
              {esAdmin && (
                <>
                  <MenuItem onClick={() => setConfigExpanded((prev) => !prev)}>
                    Configuración{" "}
                    {configExpanded ? <ExpandLess /> : <ExpandMore />}
                  </MenuItem>

                  {configExpanded && (
                    <>
                      <MenuItem
                        sx={{ pl: 5 }}
                        onClick={() => {
                          handleNavigate("/usuarios");
                          setMenuAnchorUser(null);
                          setConfigExpanded(false);
                        }}
                      >
                        <PersonIcon fontSize="small" sx={{ mr: 1 }} />
                        Usuarios
                      </MenuItem>
                      <MenuItem
                        sx={{ pl: 5 }}
                        onClick={() => {
                          handleNavigate("/tarifas");
                          setMenuAnchorUser(null);
                          setConfigExpanded(false);
                        }}
                      >
                        <AttachMoneyIcon fontSize="small" sx={{ mr: 1 }} />
                        Tarifas
                      </MenuItem>
                    </>
                  )}
                </>
              )}

              <MenuItem
                onClick={() => {
                  setMenuAnchorUser(null);
                  navigate("/");
                }}
              >
                Cerrar sesión
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        {drawerItems}
      </Drawer>

      <Dialog
        open={openHistorialDialog}
        onClose={() => setOpenHistorialDialog(false)}
      >
        <DialogTitle sx={{ textAlign: "center", fontWeight: "bold" }}>
          Historial
        </DialogTitle>
        <DialogContent>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 2,
              mt: 1,
            }}
          >
            <Button
              variant="contained"
              sx={{ width: "85%" }}
              onClick={() => handleNavigate("/historial-tasas")}
            >
              Tasas
            </Button>
            <Button
              variant="contained"
              sx={{ width: "85%" }}
              onClick={() => handleNavigate("/historial-licencias")}
            >
              Licencias
            </Button>
            <Button
              variant="contained"
              sx={{ width: "85%" }}
              onClick={() => handleNavigate("/historial-nomenclaturas")}
            >
              Nomenclaturas
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AppNavbar;
