import { Container, Typography } from "@mui/material";
import AppNavbar from "../components/AppNavBar";

const NomenclaturaHistorial = () => {
  return (
    <>
      <AppNavbar />
      <Container sx={{ mt: 4 }}>
        <Typography variant="h5" textAlign="center" fontWeight="bold" mb={3}>
          Historial de Nomenclaturas
        </Typography>
      </Container>
    </>
  );
};

export default NomenclaturaHistorial;