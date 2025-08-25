import { useState, useEffect } from "react";
import { Container, Typography, TextField, Box } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import IconButton from "@mui/material/IconButton";
import AppNavbar from "../components/AppNavBar";
import axios from "axios";

const TasaHistorial = () => {
  const [search, setSearch] = useState("");
  const [tasas, setTasas] = useState([]);
  const token = localStorage.getItem("token");

  const fetchTasas = async () => {
    try {
      const response = await axios.get("http://localhost:3001/api/tasas", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const datos = response.data
        .map((tasa) => ({
          ...tasa,
          id: tasa.id || tasa.id_tasa,
          nombrePropietario: tasa.nombre_propietario || "Desconocido",
          fechaGenerada: tasa.fecha_emisionT || "Sin fecha",
        }))

        .sort((a, b) => {
          // Convertir fechas a objetos Date para comparar
          const fechaA =
            a.fechaGenerada !== "Sin fecha"
              ? new Date(a.fechaGenerada)
              : new Date(0);
          const fechaB =
            b.fechaGenerada !== "Sin fecha"
              ? new Date(b.fechaGenerada)
              : new Date(0);
          return fechaA - fechaB; // Ascendente: más antiguo primero
        });
      setTasas(datos);
    } catch (error) {
      console.error("Error al cargar tasas:", error);
    }
  };

  useEffect(() => {
    fetchTasas();
  }, []);

  const handleAbrirPDFTasa = async (idTasa) => {
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(
        `http://localhost:3001/api/tasa-documento/pdf/${idTasa}`,
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

  const renderCellTasa = (params) => {
    const row = params.row;

    return (
      <Box display="flex" justifyContent="center" alignItems="center">
        <IconButton
          size="small"
          onClick={(event) => {
            event.stopPropagation();
            handleAbrirPDFTasa(row.id);
          }}
          //onClick={() => handleAbrirPDFTasa(row.id)}
          sx={{ color: "#d32f2f" }}
        >
          <PictureAsPdfIcon fontSize="small" />
        </IconButton>
      </Box>
    );
  };

  const columns = [
    {
      field: "nombrePropietario",
      headerName: "NOMBRE DEL PROPIETARIO",
      flex: 2.5,
      minWidth: 200,
    },
    {
      field: "fechaGenerada",
      headerName: "FECHA GENERADA",
      flex: 1.5,
      minWidth: 150,
      align: "center",
    },
    {
      field: "tasa",
      headerName: "VER",
      flex: 1,
      minWidth: 150,
      renderCell: renderCellTasa,
    },
  ];

  const filteredRows = tasas.filter((row) => {
    const searchLower = search.toLowerCase();
    return (
      row.nombrePropietario?.toLowerCase().includes(searchLower) ||
      row.fecha_emisionT?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <>
      <AppNavbar />
      <Container sx={{ mt: 4 }}>
        <Typography variant="h5" textAlign="center" fontWeight="bold" mb={3}>
          Historial de Tasas
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

export default TasaHistorial;
