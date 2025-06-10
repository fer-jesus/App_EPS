import { useState, useEffect } from "react";
import {
  Container,
  Typography,
  IconButton,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
  TextField,
  Stack,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import EditIcon from "@mui/icons-material/Edit";
import AppNavbar from "../components/AppNavBar";

const AdminTarifas = () => {
  const [tarifas, setTarifas] = useState([]);

  useEffect(() => {
    const fetchTarifas = async () => {
      try {
        const response = await fetch("http://localhost:3001/api/tarifas");
        const data = await response.json();

        const tarifasConId = data.map((t) => ({
          ...t,
          id: t.id_nombreTarifa,
          tipo: t.TipoConstruccionTarifa?.tipo_construccion || "", // según tu join en backend
          nombre: t.nombre_tarifa,
          costo: t.TarifaCostoDimension?.costo_tarifa || "", // ajustar según estructura
          porcentaje: t.TarifaCostoDimension?.porcentaje || "",
        }));

        setTarifas(tarifasConId);
      } catch (error) {
        console.error("Error al cargar tarifas:", error);
      }
    };

    fetchTarifas();
  }, []);

  const [openDialog, setOpenDialog] = useState(false);
  const [tarifaEditando, setTarifaEditando] = useState(null);
  const [costoEditado, setCostoEditado] = useState("");
  const [tipoEditado, setTipoEditado] = useState("");
  const [nombreEditado, setNombreEditado] = useState("");
  const [search, setSearch] = useState("");

  const handleOpenDialog = (tarifa) => {
    setTarifaEditando(tarifa);
    setCostoEditado(tarifa.costo);
    setTipoEditado(tarifa.tipo);
    setNombreEditado(tarifa.nombre);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setTarifaEditando(null);
    setTipoEditado("");
    setNombreEditado("");
    setCostoEditado("");
  };

  const handleGuardarCambios = () => {
    if (tarifaEditando) {
      setTarifas(
        tarifas.map((t) =>
          t.id === tarifaEditando.id
            ? {
                ...t,
                costo: costoEditado,
                tipo: tipoEditado,
                nombre: nombreEditado,
              }
            : t
        )
      );
    }
    handleCloseDialog();
  };

  const columns = [
    { field: "tipo", headerName: "Tipo", flex: 4 },
    { field: "nombre", headerName: "Nombre", flex: 4 },
    { field: "costo", headerName: "Costo", flex: 1 },
    { field: "porcentaje", headerName: "Porcentaje", flex: 1 },
    {
      field: "accion",
      headerName: "Acción",
      flex: 0.7,
      renderCell: (params) => (
        <>
          <IconButton
            color="primary"
            onClick={() => handleOpenDialog(params.row)}
          >
            <EditIcon />
          </IconButton>
        </>
      ),
      width: 160,
    },
  ];

  const filteredRows = Array.isArray(tarifas)
    ? tarifas.filter((row) =>
        row.nombre?.toLowerCase().includes(search.toLowerCase())
      )
    : [];

  return (
    <>
      <AppNavbar />
      <Container sx={{ mt: 4 }}>
        <Typography variant="h5" textAlign="center" fontWeight="bold" mb={3}>
          Administración de Tarifas
        </Typography>

        <TextField
          label="Buscar"
          variant="outlined"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{
            width: { xs: "50%", sm: 300 }, // Ancho completo en móviles, 300px en desktop
            backgroundColor: "#fff",
            mb: 2,
          }}
        />
        <Box
          sx={{
            height: 400,
            width: "100%",
            overflow: { xs: "auto", sm: "hidden" },
          }} // Permite scroll horizontal en móviles
        >
          <DataGrid
            rows={filteredRows}
            columns={columns}
            pageSize={5}
            density="standard"
            sx={{
              //minWidth: 600,
              //    "& .MuiDataGrid-root": {
              //   minWidth: 600, // Ancho mínimo para evitar compresión excesiva
              // },

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
        {/* Diálogo de edición */}
        <Box sx={{ p: 1 }}>
          <Dialog open={openDialog} onClose={handleCloseDialog}>
            <DialogTitle textAlign="center" fontWeight="bold">
              Editar Tarifa
            </DialogTitle>
            <DialogContent sx={{ pb: 1 }}>
              <Box sx={{ minWidth: 300, mt: 1 }}>
                <TextField
                  label="Tipo"
                  value={tipoEditado}
                  onChange={(e) => setTipoEditado(e.target.value)}
                  fullWidth
                  sx={{ mb: 2 }}
                />
                <TextField
                  label="Nombre"
                  value={nombreEditado}
                  onChange={(e) => setNombreEditado(e.target.value)}
                  fullWidth
                  sx={{ mb: 2 }}
                />
                <TextField
                  label="Costo"
                  value={costoEditado}
                  onChange={(e) => setCostoEditado(e.target.value)}
                  fullWidth
                  sx={{ mb: 2 }}
                />
                <Typography variant="body2" color="textSecondary">
                  Editando: {tarifaEditando?.nombre}
                </Typography>
              </Box>
            </DialogContent>

            <Stack
              direction="row"
              spacing={2}
              justifyContent="center"
              sx={{
                pb: 2, // Padding inferior para el contenedor
                px: 2, // Padding horizontal para alinear con el contenido
              }}
            >
              <Button onClick={handleCloseDialog} variant="outlined">
                Cancelar
              </Button>
              <Button
                onClick={handleGuardarCambios}
                variant="contained"
                sx={{
                  backgroundColor: "#006930",
                  "&:hover": { backgroundColor: "#008C3A" },
                }}
              >
                Guardar
              </Button>
            </Stack>
          </Dialog>
        </Box>
      </Container>
    </>
  );
};

export default AdminTarifas;
