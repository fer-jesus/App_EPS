//import { useState } from "react";
import { Container, Typography } from "@mui/material";
import AppNavbar from "../components/AppNavBar";

const Reportes = () => {
  return (
    <>
      <AppNavbar />
      <Container sx={{ mt: 4 }}>
        <Typography variant="h5" textAlign="center" fontWeight="bold" mb={3}>
          Reportes
        </Typography>
      </Container>
    </>
  );
};

export default Reportes;
