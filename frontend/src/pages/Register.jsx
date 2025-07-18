import { useState, useEffect } from "react";
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
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import IconButton from "@mui/material/IconButton";
import AssignmentIcon from "@mui/icons-material/Assignment";
import AppNavbar from "../components/AppNavBar";
import Swal from "sweetalert2";
import TasaForm from "../components/TasaForm";
import LicenciaForm from "../components/LicenciaForm";
import axios from "axios";

const Registros = () => {
  const [tasas, setTasas] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedTasa, setSelectedTasa] = useState(null);
  const [openLicenciaDialog, setOpenLicenciaDialog] = useState(false);
  const [selectedLicencia, setSelectedLicencia] = useState(null);
  const [search, setSearch] = useState("");
  const token = localStorage.getItem("token");

  const fetchTasas = async () => {
    try {
      const response = await axios.get("http://localhost:3001/api/tasas", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const datos = response.data.map((tasa) => ({
        ...tasa,
        id: tasa.id || tasa.id_tasa,
        nombrePropietario: tasa.nombre_propietario || "Desconocido",
        registro_general: tasa.registro_general || "En proceso",
        tasa: "",
        licencia: "",
        nomenclatura: "",
        // campos de ampliación:
        LICENCIAS_id_licencia_original:
          tasa.LICENCIAS_id_licencia_original || null,
        LICENCIAS_fecha_emisionL_original:
          tasa.LICENCIAS_fecha_emisionL_original || null,
      }));
      setTasas(datos);
    } catch (error) {
      console.error("Error al cargar tasas:", error);
    }
  };
  useEffect(() => {
    fetchTasas();
  }, []);

  // Función para abrir el modal
  const handleOpen = (tasa = null) => {
    setSelectedTasa(tasa);
    setOpenDialog(true);
  };

  // Función para crear la tasa
  const handleSaveTasa = async () => {
    await fetchTasas();
    setOpenDialog(false);
  };

  // Función para cerrar el modal
  const handleClose = () => {
    setSelectedTasa(null);
    setOpenDialog(false);
  };

  // Función para abrir el modal de licencia
  const handleOpenLicencia = async (tasa) => {
    try {
      const response = await axios.get(
        `http://localhost:3001/api/licencias/datos-tasa/${tasa.id}`,

        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("Datos licencia recibidos:", response.data);

      setSelectedLicencia({
        ...response.data,
        TASAS_id_tasa: tasa.id,

        LICENCIAS_id_licencia_ampliacion:
          tasa.LICENCIAS_id_licencia_original || null,
        LICENCIAS_fecha_emisionL_ampliacion:
          tasa.LICENCIAS_fecha_emisionL_original || null,
      });

      setOpenLicenciaDialog(true);
    } catch (error) {
      console.error("Error al cargar datos de la tasa:", error);
    }
  };

  const handleCloseLicencia = () => {
    setSelectedLicencia(null);
    setOpenLicenciaDialog(false);
  };

  const handleSaveLicencia = async () => {
    await fetchTasas();
    setOpenLicenciaDialog(false);
  };

  const handleAmpliacionClick = async (row) => {
    if (row.registro_general === "En proceso") {
      Swal.fire({
        icon: "info",
        title: "Aún no existe la licencia",
        text: "No puedes crear una ampliación hasta que se haya generado la licencia.",
        confirmButtonText: "Entendido",
      });
      return;
    }

    try {
      const response = await axios.get(
        `http://localhost:3001/api/tasas/ampliacion/${row.id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const datosTasa = response.data;
      console.log("Ampliación - datos recibidos:", datosTasa);
      console.log("Datos para ampliación:", {
        ...datosTasa,
        id_licencia: datosTasa.LICENCIAS_id_licencia_original,
        fecha_emisionL: datosTasa.LICENCIAS_fecha_emisionL_original,
      });
      handleOpen({
        direccionExacta: datosTasa.direccionExacta || "",
        nombrePropietario: datosTasa.nombrePropietario || "",
        dpi: datosTasa.dpi || "",
        fechaRegistro: new Date().toISOString().split("T")[0],
        esAmpliacion: true, // se usará dentro de TasaForm
        LICENCIAS_id_licencia_original:
          datosTasa.LICENCIAS_id_licencia_original,
        LICENCIAS_fecha_emisionL_original:
          datosTasa.LICENCIAS_fecha_emisionL_original,
      });
    } catch (error) {
      console.error("Error al obtener datos de ampliación:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo obtener los datos para la ampliación.",
      });
    }
  };

  const columns = [
    {
      field: "registro_general",
      headerName: "REGISTRO. G",
      flex: 1,
      minWidth: 150,
    },
    {
      field: "nombrePropietario",
      headerName: "NOMBRE DEL PROPIETARIO",
      flex: 2.5,
      minWidth: 200,
    },
    {
      field: "tasa",
      headerName: "TASA",
      flex: 1,
      minWidth: 150,

      renderCell: (params) => {
        const yaAmpliada = params.row.registro_general?.startsWith("AMP-");
        return (
          <Box display="flex" gap={1}>
            <IconButton
              size="small"
              color="primary"
              onClick={() => handleAmpliacionClick(params.row)}
              disabled={yaAmpliada}
            >
              <AssignmentIcon fontSize="small" />
            </IconButton>
            <IconButton size="small" disabled>
              <VisibilityIcon fontSize="small" color="disabled" />
            </IconButton>
          </Box>
        );
      },
    },

    {
      field: "licencia",
      headerName: "LICENCIA",
      flex: 1,
      minWidth: 130,
      renderCell: (params) => {
         const yaAmpliada = params.row.registro_general?.startsWith("AMP-");
         return (
        <Box display="flex" gap={1}>
          <IconButton
            size="small"
            color="primary"
            onClick={() => handleOpenLicencia(params.row)}
            disabled={yaAmpliada}
          >
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" disabled>
            <VisibilityIcon fontSize="small" color="disabled" />
          </IconButton>
        </Box>
      );
      }
    },

    // {
    //   field: "nomenclatura",
    //   headerName: "NOMENCLATURA",
    //   flex: 1,
    //   minWidth: 150,
    //   renderCell: (params) => (
    //     <Box display="flex" gap={1}>
    //       <IconButton
    //         size="small"
    //         color="primary"
    //         onClick={() => console.log("Editar NOMENCLATURA", params.row)}
    //       >
    //         <EditIcon fontSize="small" />
    //       </IconButton>
    //       <IconButton size="small" disabled>
    //         <VisibilityIcon fontSize="small" color="disabled" />
    //       </IconButton>
    //     </Box>
    //   ),
    // },
  ];

  // Filtrar filas según el término de búsqueda
  const filteredRows = tasas.filter((row) => {
  const searchLower = search.toLowerCase();
  return (
    row.nombrePropietario?.toLowerCase().includes(searchLower) ||
    row.registro_general?.toLowerCase().includes(searchLower)
  );
});

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
            onClick={() =>
              handleOpen({
                esAmpliacion: false,
                LICENCIAS_id_licencia_original: null,
                LICENCIAS_fecha_emisionL_original: null,
              })
            }
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

        <Dialog
          open={openLicenciaDialog}
          onClose={handleCloseLicencia}
          fullWidth
          maxWidth="sm"
          PaperProps={{
            sx: {
              mx: { xs: 2, sm: "auto" },
              width: {
                xs: "100%",
                sm: "90%",
                md: "70%",
                lg: "600px",
              },
            },
          }}
        >
          <DialogContent>
            <LicenciaForm
              initialData={selectedLicencia}
              onClose={handleCloseLicencia}
              onSubmit={handleSaveLicencia}
            />
          </DialogContent>
        </Dialog>
      </Container>
    </>
  );
};

export default Registros;
