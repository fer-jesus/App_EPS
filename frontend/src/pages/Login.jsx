import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  Container,
  Box,
  TextField,
  Button,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Avatar,
} from "@mui/material";
import MuiAlert from "@mui/material/Alert";
import AccountCircle from "@mui/icons-material/AccountCircle";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/login.css";
import Swal from "sweetalert2";

const Login = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState(false);
  const [userError, setUserError] = useState(false);
  const [passError, setPassError] = useState(false);
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Reset errores previos
    setUserError(false);
    setPassError(false);

    let hasError = false;

    if (!user.trim()) {
      setUserError(true);
      hasError = true;
    }

    if (!pass.trim()) {
      setPassError(true);
      hasError = true;
    }

    if (hasError) {
      return; // No continúa si hay errores
    }

    try {
      // Llamada a la API para autenticar al usuario
      const res = await axios.post("http://localhost:3001/api/login", {
        username: user,
        password: pass,
      });
      // // Verificar la respuesta de la API
      // if (res.data.success) {
      //   // Si la autenticación es exitosa, redirigir al menú
      //   navigate("/menu");
      // } else {
      //   // Si la autenticación falla, mostrar un mensaje de error
      //   setShowErrorAlert(true);
      // }
      if (res.data.success) {
        const usuario = res.data.usuario;

        if (usuario.fecha_de_baja === null) {
          login({
            id_usuario: usuario.id_usuario,
            nombre: usuario.nombre,
            rol: usuario.rol,
            correo: usuario.correo, // u otros campos si lo necesitas
          });

          navigate("/menu");
        } else {
          setUser("");
          setPass("");
          Swal.fire({
            icon: "error",
            title: "Cuenta inactiva",
            text: "Tu cuenta ha sido desactivada. Por favor, contacta al administrador.",
          });
        }
      } else {
        setShowErrorAlert(true);
      }
    } catch (error) {
      console.error("Error:", error.response?.data || error.message);
      setShowErrorAlert(true);
    }
  };

  return (
    <Container
      maxWidth="md"
      sx={{
        mt: { xs: 2, sm: 8 },
        px: { xs: 1, sm: 0 }, // Padding horizontal adaptable
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        //minHeight: "100vh",
        justifyContent: "center",
      }}
    >
      <Box
        sx={{
          textAlign: "center",
          mb: 4,
          px: 1,
        }}
      >
        <Box
          component="div"
          sx={{
            fontFamily: "Poppins, sans-serif",
            fontWeight: 800,
            fontSize: { xs: "1.1rem", sm: "1.5rem" },
            lineHeight: 1.3,
            whiteSpace: "normal",
            wordWrap: "break-word",
          }}
        >
          DIRECCIÓN DE ORDENAMIENTO TERRITORIAL Y DESARROLLO MUNICIPAL
        </Box>
        <Box
          component="div"
          sx={{
            fontFamily: "Poppins, sans-serif",
            fontWeight: 600,
            fontSize: { xs: "1rem", sm: "1.2rem" },
          }}
        >
          MUNICIPALIDAD DE JALAPA
        </Box>
      </Box>
      <Paper
        elevation={3}
        sx={{
          p: { xs: 2, sm: 4 },
          mx: { xs: 1, sm: 0 },
          width: "100%",
          maxWidth: 300,
          //background: "linear-gradient(135deg, #36454F 0%, rgba(115,147,179,0.1) 100%)",
          alignItems: "center",
          backgroundColor: "#ffffffcc", // Blanco con transparencia
          borderRadius: 2,
          boxShadow: "0px 8px 20px rgba(0, 0, 0, 0.2)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)", // Soporte para Safari
        }}
      >
        <Avatar sx={{ bgcolor: "#922B21", margin: "0 auto", mb: 2 }}>
          <AccountCircle />
        </Avatar>
        <form className="login-form" autoComplete="on" onSubmit={handleSubmit}>
          <TextField
            id="username"
            name="username"
            label="Usuario"
            autoComplete="username"
            required
            fullWidth
            margin="normal"
            value={user}
            onChange={(e) => setUser(e.target.value)}
            error={userError}
            helperText={userError ? "Campo requerido" : ""}
            sx={{ backgroundColor: "white" }}
          />
          <TextField
            id="password"
            name="password"
            label="Contraseña"
            type="password"
            required
            fullWidth
            margin="normal"
            autoComplete="current-password"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            error={passError}
            helperText={passError ? "Campo requerido" : ""}
            sx={{ backgroundColor: "white" }}
          />
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mt: 1,
            }}
          >
            <Box
              className="login-options"
              sx={{ fontFamily: "serif, Courier, monospace" }}
            >
              <div className="recover-link" onClick={() => setOpenModal(true)}>
                ¿Olvidaste tu contraseña?
              </div>
            </Box>
          </Box>

          <Button
            variant="contained"
            //color="primary"
            //fullWidth
            type="submit"
            sx={{
              margin: "0 auto",
              display: "block",
              mt: 4,
              backgroundColor: "#006930",
              "&:hover": {
                backgroundColor: "#008C3A",
              },
            }}
          >
            Iniciar Sesión
          </Button>
        </form>
        <Dialog
          open={openModal}
          onClose={() => {
            setOpenModal(false);
            setEmail("");
            setEmailError(false);
          }}
          className="recover-modal"
        >
          <DialogTitle>Recuperar contraseña</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              required
              margin="dense"
              label="Ingresa tu correo electrónico"
              type="email"
              fullWidth
              variant="standard"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setEmailError(false);
              }}
              error={emailError}
              helperText={
                emailError && !email
                  ? "Este campo no puede estar vacío"
                  : emailError && !email.includes("@")
                  ? "El correo debe contener @"
                  : ""
              }
            />
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => {
                setOpenModal(false);
                setEmail("");
                setEmailError(false);
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={() => {
                if (!email || !email.includes("@")) {
                  setEmailError(true);
                  return;
                }
                // llamada al backend
                alert(`Correo de recuperación enviado a: ${email}`);
                setOpenModal(false);
                setEmail("");
                setEmailError(false);
              }}
            >
              Enviar
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
      <Snackbar
        open={showErrorAlert}
        autoHideDuration={4000}
        onClose={() => {
          setShowErrorAlert(false);
          setUser(""); // Limpiar campos
          setPass("");
        }}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <MuiAlert
          elevation={6}
          variant="filled"
          severity="error"
          onClose={() => {
            setShowErrorAlert(false);
            setUser("");
            setPass("");
          }}
          sx={{ width: "100%" }}
        >
          Usuario o contraseña incorrectos
        </MuiAlert>
      </Snackbar>
    </Container>
  );
};

export default Login;
