import { Container, Typography } from "@mui/material";
import AppNavbar from "../components/AppNavBar";

const LicenciaHistorial = () => {
  return (
    <>
      <AppNavbar />
      <Container sx={{ mt: 4 }}>
        <Typography variant="h5" textAlign="center" fontWeight="bold" mb={3}>
          Historial de Licencias
        </Typography>
      </Container>
    </>
  );
};

export default LicenciaHistorial;