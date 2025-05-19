import { useState } from "react";
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  DialogContent,
  Dialog,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import AppNavbar from "../components/AppNavBar";
import TasaForm from "../components/TasaForm";

const Registros = () => {
  // datos hardcore
  const [tasas, setTasas] = useState([
    { id: 1, nombrePropietario: "Tasa A" },
    { id: 2, nombrePropietario: "Tasa B" },
  ]);

  const [openDialog, setOpenDialog] = useState(false);
  const [selectedTasa, setSelectedTasa] = useState(null);
  const [search, setSearch] = useState("");

  // Función para abrir el modal
  const handleOpen = (tasa = null) => {
    setSelectedTasa(tasa);
    setOpenDialog(true);
  };

  // Función para crear la tasa
  const handleSaveTasa = (data) => {
     const newTasa = {
    id: Date.now(),
    nombrePropietario: data.nombrePropietario // Solo guarda este campo
  };
  setTasas(prev => [...prev, newTasa]);
  setOpenDialog(false);
  };

 
  // Función para cerrar el modal
  const handleClose = () => {
    setSelectedTasa(null);
    setOpenDialog(false);
  };

  const columns = [
    { field: "id", headerName: "REGISTRO. G", flex: 0.8 },
    { field: "nombrePropietario", headerName: "NOMBRE DEL PROPIETARIO", flex: 2.5 },
    { field: "tasa", headerName: "TASA", flex: 1 },
    { field: "licencia", headerName: "LICENCIA", flex: 1 },
    { field: "nomenclatura", headerName: "NOMENCLATURA", flex: 1 },

    
  ];

  // Filtro
  const filteredRows = tasas.filter((row) =>
    row.nombrePropietario?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <AppNavbar />
      <Container sx={{ mt: 4 }}>
        <Typography
          variant="h5"
          sx={{
            fontWeight: 600,
            mb: 2,
            fontFamily: "Poppins, sans-serif",
            textAlign: "center",
          }}
        >
          Registros
        </Typography>

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
            flexDirection: { xs: "column", sm: "row" },
            // flexWrap: "wrap",
            gap: 2,
          }}
        >
          <TextField
            label="Buscar"
            variant="outlined"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{
              width: { xs: "50%", sm: 300 }, // Ancho completo en móviles, 300px en desktop
              backgroundColor: "#fff",
            }}
          />

          <Button
            variant="contained"
            sx={{
              backgroundColor: "#F2C037",
              fontWeight: "bold",
              "&:hover": { backgroundColor: "#d9aa2e" },
              width: { xs: "50%", sm: "auto" },
            }}
            onClick={() => handleOpen()} // Reemplazar con navegación o modal
          >
            Crear Tasa
          </Button>
        </Box>

        <Box
          sx={{
            height: 400,
            width: "100%",
            overflow: "auto", // Permite scroll horizontal en móviles
          }}
        >
          <DataGrid
            rows={filteredRows}
            columns={columns}
            pageSize={5}
            rowsPerPageOptions={[5, 10]}
            disableSelectionOnClick
            density="standard" //("compact" | "standard" | "comfortable")
            sx={{
              "& .MuiDataGrid-columnHeader": {
                backgroundColor: "#D0D3D4", // Fondo distintivo para headers
                "& .MuiDataGrid-columnHeaderTitle": {
                  fontWeight: "bold",
                  fontSize: { xs: "0.9rem", sm: "1rem" },
                },
              },
              "& .MuiDataGrid-cell": {
                fontSize: { xs: "0.9rem", sm: "1rem" },
                whiteSpace: "normal", // Permite múltiples líneas en celdas
                padding: "8px",
              },
            }}
          />
        </Box>

        <Dialog
          open={openDialog}
          onClose={handleClose}
          fullWidth
          maxWidth="sm"
          PaperProps={{
            sx: {
              mx: { xs: 2, sm: "auto" },
              width: {
                xs: "100%", // 100% en pantallas pequeñas
                sm: "90%", // un poco de margen en tablets
                md: "70%", // más compacto en pantallas medianas
                lg: "600px", // ancho fijo en pantallas grandes },
              },
            },
          }}
        >
          <DialogContent>
            <TasaForm
              onSubmit={handleSaveTasa}
              onClose={handleClose}
              initialData={selectedTasa}
            />
          </DialogContent>
        </Dialog>
      </Container>
    </>
  );
};

export default Registros;
