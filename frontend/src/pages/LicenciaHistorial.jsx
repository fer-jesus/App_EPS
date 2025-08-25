import { useState, useEffect } from "react";
import { Container, Typography, TextField, Box } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import IconButton from "@mui/material/IconButton";
import AppNavbar from "../components/AppNavBar";
import axios from "axios";

const LicenciaHistorial = () => {
  const [search, setSearch] = useState("");
  const [licencias, setLicencias] = useState([]);
  const token = localStorage.getItem("token");

  const fetchLicencias = async () => {
    try {
      // Traer todas las tasas
      const responseTasas = await axios.get("https://backdot.dotmunijalapa.org/api/tasas", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const licenciasData = await Promise.all(
        responseTasas.data.map(async (tasa) => {
          try {
            const responseLic = await axios.get(
              `https://backdot.dotmunijalapa.org/api/licencias/por-tasa/${tasa.id}`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            const lic = responseLic.data;
            if (!lic.id_licencia) return null;

            return {
              id: lic.id_licencia,
              registro_general: lic.registro_general || "En proceso",
              fechaEmision: lic.fecha_emisionL,
              nombrePropietario: tasa.nombre_propietario || "Desconocido",
            };
          } catch {
            return null;
          }
        })
      );

      const licenciasFiltradas = licenciasData
        .filter((l) => l !== null)
        .sort((a, b) => new Date(a.fechaEmision) - new Date(b.fechaEmision));

      setLicencias(licenciasFiltradas);
    } catch (error) {
      console.error("Error al cargar licencias:", error);
    }
  };

  useEffect(() => {
    fetchLicencias();
  }, []);

  const handleAbrirPDFLicencia = async (idLicencia, fechaEmision) => {
    try {
      const response = await fetch(
        `https://backdot.dotmunijalapa.org/api/licencia-documento/pdf/${idLicencia}/${fechaEmision}`,
        { method: "GET", headers: { Authorization: `Bearer ${token}` } }
      );

      if (!response.ok) throw new Error("Error al obtener el PDF");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      window.open(url, "_blank");
    } catch (error) {
      console.error("Error al abrir PDF:", error);
    }
  };

  const renderCellPDF = (params) => (
    <Box display="flex" justifyContent="center" alignItems="center">
      <IconButton
        size="small"
        onClick={(event) => {
          event.stopPropagation();
          handleAbrirPDFLicencia(params.row.id);
        }}
        //onClick={() => handleAbrirPDFLicencia(params.row.id)}
        sx={{ color: "#d32f2f" }}
      >
        <PictureAsPdfIcon fontSize="small" />
      </IconButton>
    </Box>
  );

  const columns = [
    {
      field: "registro_general",
      headerName: "REGISTRO. G",
      flex: 1.5,
      minWidth: 150,
      align: "center",
    },
    {
      field: "nombrePropietario",
      headerName: "NOMBRE DEL PROPIETARIO",
      flex: 2.5,
      minWidth: 200,
    },

    {
      field: "tasa",
      headerName: "VER",
      flex: 1,
      minWidth: 150,
      renderCell: renderCellPDF,
    },
  ];

  const filteredRows = licencias.filter((row) => {
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
        <Typography variant="h5" textAlign="center" fontWeight="bold" mb={3}>
          Historial de Licencias
        </Typography>

        <TextField
          label="Buscar documento"
          variant="outlined"
          fullWidth
          sx={{ width: { xs: "50%", sm: 250 }, backgroundColor: "#fff", mb: 2 }}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <Box
          sx={{
            height: 400,
            width: { xs: "100%", sm: 800 },
            mx: "auto",
            overflowX: "auto",
          }}
        >
          <DataGrid
            rows={filteredRows}
            columns={columns.map((col) => ({
              ...col,
              headerAlign: "center",
              //align: "center",
            }))}
            pageSize={5}
            rowsPerPageOptions={[5, 10]}
            disableSelectionOnClick
            density="standard"
            sx={{
              "& .MuiDataGrid-columnHeader": {
                backgroundColor: "#D0D3D4",
                "& .MuiDataGrid-columnHeaderTitle": {
                  fontWeight: "bold",
                  fontSize: { xs: "0.9rem", sm: "1rem" },
                },
              },
              "& .MuiDataGrid-cell": {
                fontSize: { xs: "0.9rem", sm: "1rem" },
                whiteSpace: "normal",
                padding: "8px",
              },
            }}
          />
        </Box>
      </Container>
    </>
  );
};

export default LicenciaHistorial;
