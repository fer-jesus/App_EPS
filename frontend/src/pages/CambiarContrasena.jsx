import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { TextField, Button, Typography, Box, Alert } from "@mui/material";
import { useAuth } from "../context/AuthContext";

const CambiarContrasena = () => {
  const { usuario, updateUsuario } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nueva: "",
    confirmar: "",
  });

  const [error, setError] = useState("");
  const [exito, setExito] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
    setExito("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { nueva, confirmar } = formData;

    if (!nueva || !confirmar) {
      return setError("Por favor, completa todos los campos.");
    }

    if (nueva !== confirmar) {
      return setError("La nueva contraseña y la confirmación no coinciden.");
    }

    try {
      const res = await fetch(
        "https://backdot.dotmunijalapa.org/api/auth/actualizar-contrasena",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            nueva_contrasena: nueva,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.mensaje || "Error al cambiar la contraseña.");
      }

      // Actualiza el contexto si era temporal
      if (usuario?.es_contrasena_temporal) {
        updateUsuario({ ...usuario, es_contrasena_temporal: false });
      }

      setExito("Contraseña actualizada correctamente.");
      setTimeout(() => navigate("/"), 2000); // Redirigir tras éxito
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        backgroundColor: "#f5f5f5",
        overflow: "hidden",
        padding: 2,
        position: "fixed", 
        inset: 0,
      }}
    >
      <Box
        sx={{
          width: "100%",
          maxWidth: 400,
          padding: 3,
          boxShadow: 3,
          borderRadius: 2,
          backgroundColor: "white",
        }}
      >
        <Typography
          variant="h5"
          align="center"
          sx={{ mb: 2, fontWeight: "bold" }}
        >
          Cambiar contraseña
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {exito && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {exito}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <TextField
            label="Nueva contraseña"
            type="password"
            name="nueva"
            value={formData.nueva}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />

          <TextField
            label="Confirmar nueva contraseña"
            type="password"
            name="confirmar"
            value={formData.confirmar}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
          <Box display="flex" justifyContent="center" mt={2}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              size="small"
              sx={{ px: 3, py: 1 }}
            >
              Guardar
            </Button>
          </Box>
        </form>
      </Box>
    </Box>
  );
};

export default CambiarContrasena;
