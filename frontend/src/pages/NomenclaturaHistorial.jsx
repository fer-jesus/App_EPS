import { useState, useEffect } from "react";
import { Container, Typography, TextField, Box } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import IconButton from "@mui/material/IconButton";
import AppNavbar from "../components/AppNavBar";
import axios from "axios";

const NomenclaturaHistorial = () => {
  const [search, setSearch] = useState("");
  const [nomenclaturas, setNomenclaturas] = useState([]);
  const token = localStorage.getItem("token");

  const fetchNomenclaturas = async () => {
    try {
      const response = await axios.get(
        "http://localhost:3001/api/nomenclaturas",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const datos = response.data.map((nom) => ({
        ...nom,
        id: nom.id || nom.id_nomenclatura,
        registroGeneral: nom.registro_generalN || "En proceso",
        fechaEmision: nom.fecha_emisionN,
        solicitante: nom.propietario?.nombre_propietario || "Desconocido",
      }));

      setNomenclaturas(datos);
    } catch (error) {
      console.error("Error al cargar tasas:", error);
    }
  };

  useEffect(() => {
    fetchNomenclaturas();
  }, []);

  const handleAbrirPDFNomenclatura = async (idNomenclatura) => {
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(
        `http://localhost:3001/api/nomenclatura-documento/pdf/${idNomenclatura}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error("Error al obtener el PDF");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      window.open(url, "_blank");
    } catch (error) {
      console.error("Error al abrir PDF:", error);
    }
  };

  const renderCellNomenclatura = (params) => {
    const row = params.row;

    return (
      <Box display="flex" justifyContent="center" alignItems="center">
        <IconButton
          size="small"
          onClick={() => handleAbrirPDFNomenclatura(row.id)}
          sx={{ color: "#d32f2f" }}
        >
          <PictureAsPdfIcon fontSize="small" />
        </IconButton>
      </Box>
    );
  };

  const columns = [
    {
      field: "registroGeneral",
      headerName: "REGISTRO. G",
      flex: 1.5,
      minWidth: 150,
      align: "center",
    },
    {
      field: "solicitante",
      headerName: "NOMBRE DEL PROPIETARIO",
      flex: 2.5,
      minWidth: 200,
    },
    {
      field: "accion",
      headerName: "VER",
      flex: 1,
      minWidth: 150,
      renderCell: renderCellNomenclatura,
    },
  ];

  const filteredRows = nomenclaturas.filter((row) => {
    const searchLower = search.toLowerCase();
    return (
      row.solicitante?.toLowerCase().includes(searchLower) ||
      row.registroGeneral?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <>
      <AppNavbar />
      <Container sx={{ mt: 4 }}>
        <Typography variant="h5" textAlign="center" fontWeight="bold" mb={3}>
          Historial de Nomenclaturas
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

export default NomenclaturaHistorial;
