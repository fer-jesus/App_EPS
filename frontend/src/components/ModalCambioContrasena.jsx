import { useAuth } from "../context/AuthContext";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

const ModalCambioContrasena = () => {
  const { auth } = useAuth();
  const navigate = useNavigate();

  return (
    <Dialog open={auth.isAuthenticated && auth.user?.es_contrasena_temporal === true} disableEscapeKeyDown>
      <DialogTitle>¡Atención!</DialogTitle>
      <DialogContent>
        Has iniciado sesión con una contraseña temporal. <br />
        <strong>¡Por seguridad, cámbiala ahora!</strong>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => navigate("/actualizar-contrasena")} variant="contained" color="warning">
          Cambiar contraseña
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ModalCambioContrasena;