import { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  TextField,
  IconButton,
  Button,
  Dialog,
  DialogContent,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import AppNavbar from "../components/AppNavBar";
import NomenclaturaForm from "../components/NomenclaturaForm";
//import axios from "axios";

const Nomenclaturas = () => {
  const [search, setSearch] = useState("");
  const [nomenclaturas, setNomenclaturas] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedNomenclatura, setSelectedNomenclatura] = useState(null);
  const [editar, setEditar] = useState(false);

  const token = localStorage.getItem("token");

  const fetchNomenclaturas = async () => {
    try {
      const response = await fetch("http://localhost:3001/api/nomenclaturas", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();

      const datos = data.map((item) => ({
        id: item.id_nomenclatura,
        registroGeneral: item.registro_generalN,
        solicitante: item.propietario?.nombre_propietario || "",
        cui: item.PROPIETARIOS_cui || "",
        fechaEmision: item.fecha_emisionN || "",
        fechaVencimiento: item.fecha_vencimientoN || "",
        direccion: item.direccion_solici || "",
        tipoNomenclatura: item.TIPO_NOMENCLATURA_id_tipoNomenclatura || "",
      }));

      setNomenclaturas(datos);
    } catch (error) {
      console.error("Error al cargar nomenclaturas:", error);
    }
  };

  useEffect(() => {
    fetchNomenclaturas();
  }, []);

  const handleOpen = (nomenclatura = null, editar = false) => {
    setSelectedNomenclatura(nomenclatura);
    setEditar(editar);
    setOpenDialog(true);
  };

  const handleClose = () => {
    setSelectedNomenclatura(null);
    setOpenDialog(false);
  };

  const handleSaveNomenclatura = async () => {
    await fetchNomenclaturas();
    setOpenDialog(false);
  };

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

  const filteredRows = nomenclaturas.filter((row) => {
    const searchLower = search.toLowerCase();
    return (
      row.solicitante?.toLowerCase().includes(searchLower) ||
      row.registroGeneral?.toLowerCase().includes(searchLower)
    );
  });

  const columns = [
    {
      field: "registroGeneral",
      headerName: "REGISTRO. G",
      flex: 0.8,
      minWidth: 150,
    },
    {
      field: "solicitante",
      headerName: "NOMBRE DEL PROPIETARIO",
      flex: 2.5,
      minWidth: 200,
    },
    {
      field: "acciones",
      headerName: "ACCIONES",
      flex: 1,
      minWidth: 150,
      renderCell: (params) => (
        <Box display="flex" gap={1}>
          <IconButton
            size="small"
            onClick={(event) => {
              event.stopPropagation(); // <-- Evita que el DataGrid seleccione la fila
              handleAbrirPDFNomenclatura(params.row.id);
            }}
            // onClick={() => handleAbrirPDFNomenclatura(params.row.id)}
            sx={{ color: "#2b4f6b" }}
          >
            <VisibilityIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            onClick={(event) => {
              event.stopPropagation(); 
              handleOpen(params.row, true); 
            }}
            //onClick={() => handleOpen(params.row, true)}
            sx={{
              color: "#1e6b3d",
            }}
          >
            <EditIcon fontSize="small" />
          </IconButton>
        </Box>
      ),
    },
  ];

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
          Nomenclaturas
        </Typography>

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
            flexDirection: { xs: "column", sm: "row" },
            gap: 2,
          }}
        >
          <TextField
            label="Buscar"
            variant="outlined"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{
              width: { xs: "50%", sm: 250 },
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
            onClick={() => handleOpen()}
          >
            Crear nomenclatura
          </Button>
        </Box>

        <Box
          sx={{
            height: 400,
            width: "100%",
            overflow: "auto",
          }}
        >
          <DataGrid
            rows={filteredRows}
            columns={columns}
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
        <Dialog open={openDialog} onClose={handleClose} fullWidth maxWidth="sm">
          <DialogContent>
            <NomenclaturaForm
              initialData={selectedNomenclatura}
              onClose={handleClose}
              onSubmit={handleSaveNomenclatura}
              editar={editar}
            />
          </DialogContent>
        </Dialog>
      </Container>
    </>
  );
};

export default Nomenclaturas;
