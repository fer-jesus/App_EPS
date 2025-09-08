import { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  DialogContent,
  Dialog,
  DialogTitle,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import IconButton from "@mui/material/IconButton";
import AssignmentIcon from "@mui/icons-material/Assignment";
import CloseIcon from "@mui/icons-material/Close";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import MapaLeaflet from "../components/MapaLeaflet";
import AppNavbar from "../components/AppNavBar";
import Swal from "sweetalert2";
import TasaForm from "../components/TasaForm";
import EditTasaForm from "../components/EditTasaForm";
import LicenciaForm from "../components/LicenciaForm";
import axios from "axios";

const Registros = () => {
  const [tasas, setTasas] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedTasa, setSelectedTasa] = useState(null);
  const [editDialog, setEditDialog] = useState(false);
  const [openLicenciaDialog, setOpenLicenciaDialog] = useState(false);
  const [selectedLicencia, setSelectedLicencia] = useState(null);
  const [openMapa, setOpenMapa] = useState(false);
  const [coordenadasSeleccionadas, setCoordenadasSeleccionadas] =
    useState(null);
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
        latitud: tasa.latitud || null,
        longitud: tasa.longitud || null,
        direccion_propiedad: tasa.direccion_propiedad || "",
      }));
      setTasas(datos);
    } catch (error) {
      console.error("Error al cargar tasas:", error);
    }
  };

  useEffect(() => {
    fetchTasas();
  }, []);

  const handleOpen = (tasa = null) => {
    setSelectedTasa(tasa);
    setOpenDialog(true);
  };

  const handleOpenEdit = (tasa) => {
    setSelectedTasa(tasa);
    setEditDialog(true);
  };

  const handleSaveTasa = async () => {
    await fetchTasas();
    setOpenDialog(false);
    setEditDialog(false);
  };

  const handleClose = () => {
    setSelectedTasa(null);
    setOpenDialog(false);
    setEditDialog(false);
  };

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
      console.log("Datos de la tasa para licencia:", response.data);

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

  const handleEditTasa = async (row) => {
    try {
      const response = await axios.get(
        `http://localhost:3001/api/tasas/edicion/${row.id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const datosTasa = response.data;
      console.log("Datos de la tasa en el Register:", datosTasa);

      //const primerTC = datosTasa.tipoConstruccion?.[0] || {};

      // Si viene la tarifaCambioUso desde backend:
      const tarifaCambioUsoObj = datosTasa.tarifaCambioUso
        ? {
            id_nombreTarifa: datosTasa.tarifaCambioUso.id_nombreTarifa,
            nombre_tarifa: datosTasa.tarifaCambioUso.nombre_tarifa,
          }
        : null;

      handleOpenEdit({
        id_tasa: datosTasa.id_tasa || null,
        direccionExacta: datosTasa.direccionExacta || "",
        nombrePropietario: datosTasa.nombrePropietario || "",
        dpi: datosTasa.dpi || "",
        //tipoConstruccion: datosTasa.tipoConstruccion || [],
        tipoConstruccion:
          datosTasa.tipoConstruccion.map((tc) => ({
            TARIFA_id_nombreTarifa: tc.TARIFA_id_nombreTarifa || "",
            nombre_tarifa: tc.nombre_tarifa || "",
            dimension_construccion: tc.dimension_construccion || "",
            formula: tc.formula || "",
            valor: tc.valor || "",
            niveles: tc.niveles || [],
            tipoConstruccionTarifa: tc.tipoConstruccionTarifa || null,
            tarifaCostoDimension: tc.tarifaCostoDimension || null,
            tarifaCostoProyecto: tc.tarifaCostoProyecto || null,
          })) || [],
        tarifaCambioUso: tarifaCambioUsoObj,
        cuentaNoAlineacion: datosTasa.cuentaNoAlineacion ?? false,
        anotaciones: datosTasa.anotaciones || "",
        areaConstruccion: datosTasa.areaConstruccion || "",
        valor50Porc: datosTasa.valor50Porc || "",
        nivelesConstruccion: datosTasa.nivelesConstruccion || "",
        cantDemoMovi: datosTasa.cantDemoMovi || "",
        valorPorcentaje: datosTasa.valorPorcentaje || 0,
        presupuestObra: datosTasa.presupuestObra || "0",
        cantidadCancelar: datosTasa.cantidadCancelar || "0",
        latitud: datosTasa.latitud || "",
        longitud: datosTasa.longitud || "",
        LICENCIAS_id_licencia_original:
          datosTasa.LICENCIAS_id_licencia_original,
        LICENCIAS_fecha_emisionL_original:
          datosTasa.LICENCIAS_fecha_emisionL_original,
      });
    } catch (error) {
      console.error("Error al obtener de editar:", error);
    }
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
      handleOpen({
        direccionExacta: datosTasa.direccionExacta || "",
        nombrePropietario: datosTasa.nombrePropietario || "",
        dpi: datosTasa.dpi || "",
        fechaRegistro: new Date().toISOString().split("T")[0],
        esAmpliacion: true,
        latitud: datosTasa.latitud || "",
        longitud: datosTasa.longitud || "",
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

  const coordenadasValidas = (latitud, longitud) => {
    if (
      latitud === null ||
      longitud === null ||
      latitud === "" ||
      longitud === ""
    ) {
      return false;
    }

    // Eliminar espacios en blanco antes y después
    const latStr = latitud.toString().trim();
    const lngStr = longitud.toString().trim();

    const lat = Number(latStr);
    const lng = Number(lngStr);

    return Number.isFinite(lat) && Number.isFinite(lng);
  };

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

  const handleAbrirPDFLicencia = async (row) => {
    const token = localStorage.getItem("token");

    if (row.registro_general === "En proceso") {
      Swal.fire({
        icon: "info",
        title: "Aún no existe la licencia",
        text: "No puedes visualizar la licencia hasta que se haya generado.",
        confirmButtonText: "Entendido",
      });
      return;
    }

    try {
      const response2 = await axios.get(
        `http://localhost:3001/api/licencias/por-tasa/${row.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const licenciaDatos = response2.data;

      console.log("Datos de la tasa para PDF:", licenciaDatos);
      console.log(
        "fecha_emisionL:",
        licenciaDatos.fecha_emisionL,
        "id_licencia:",
        licenciaDatos.id_licencia
      );

      const fechaNormalizada = licenciaDatos.fecha_emisionL;
      const idLicencia = licenciaDatos.id_licencia;
      const response = await fetch(
        `http://localhost:3001/api/licencia-documento/pdf/${idLicencia}/${fechaNormalizada}`,
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
      alert("Error al abrir PDF de licencia.", error);
    }
  };

  // Función render para la celda "tasa"
  const renderCellTasa = (params) => {
    const row = params.row;
    const yaAmpliada = row.registro_general?.startsWith("AMP-");
    const tieneCoordenadas = coordenadasValidas(row.latitud, row.longitud);

    return (
      <Box display="flex" gap={1}>
        {row.registro_general === "En proceso" && (
          <IconButton
            size="small"
            onClick={() => handleEditTasa(row)} // abre el modal con los datos de esa tasa
            sx={{ color: "#1e6b3d" }}
          >
            <EditIcon fontSize="small" />
          </IconButton>
        )}
        <IconButton
          size="small"
          onClick={() => handleAmpliacionClick(row)}
          disabled={yaAmpliada}
          sx={{
            color: yaAmpliada ? "inherit" : "#4187b3ff",
          }}
        >
          <AssignmentIcon fontSize="small" />
        </IconButton>
        <IconButton
          size="small"
          onClick={() => handleAbrirPDFTasa(row.id)}
          sx={{ color: "#2b4f6b" }}
        >
          <VisibilityIcon fontSize="small" />
        </IconButton>
        {tieneCoordenadas && (
          <IconButton
            size="small"
            onClick={() => {
              console.log("Coordenadas y dirección:", {
                latitud: Number(row.latitud.toString().trim()),
                longitud: Number(row.longitud.toString().trim()),
                direccion_propiedad: row.direccion_propiedad || "",
                nombre_propietario: row.nombrePropietario || "Desconocido",
              });
              setCoordenadasSeleccionadas({
                latitud: Number(row.latitud.toString().trim()),
                longitud: Number(row.longitud.toString().trim()),
                direccion_propiedad: row.direccion_propiedad || "",
                nombre_propietario: row.nombrePropietario || "Desconocido",
              });
              setOpenMapa(true);
            }}
          >
            <LocationOnIcon fontSize="small" sx={{ color: "#a83248" }} />
          </IconButton>
        )}
      </Box>
    );
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
      renderCell: renderCellTasa,
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
              onClick={() => handleOpenLicencia(params.row)}
              disabled={yaAmpliada}
              sx={{
                color: yaAmpliada ? "inherit" : "#1e6b3d", // verde elegante
              }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => {
                //console.log("params.row completo:", params.row);
                //console.log("Fecha emisión desde row:", params.row.fecha_emisionL);
                handleAbrirPDFLicencia(params.row);
              }}
            >
              <VisibilityIcon fontSize="small" sx={{ color: "#2b4f6b" }} />
            </IconButton>
          </Box>
        );
      },
    },
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
            gap: 2,
          }}
        >
          <TextField
            label="Buscar"
            variant="outlined"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{
              width: { xs: "50%", sm: 300 },
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
                // esAmpliacion: false,
                // LICENCIAS_id_licencia_original: null,
                // LICENCIAS_fecha_emisionL_original: null,
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

        <Dialog
          open={openDialog}
          onClose={handleClose}
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
            <TasaForm
              onSubmit={handleSaveTasa}
              onClose={handleClose}
              initialData={selectedTasa}
            />
          </DialogContent>
        </Dialog>

        <Dialog
          open={editDialog}
          onClose={handleClose}
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
            <EditTasaForm
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

        <Dialog
          open={openMapa}
          onClose={() => setOpenMapa(false)}
          maxWidth="xl"
          fullWidth
        >
          <DialogTitle
            sx={{
              m: 0,
              p: 2,
              textAlign: "center",
              fontWeight: "bold",
              position: "relative",
            }}
          >
            Geolocalización
            <IconButton
              aria-label="cerrar"
              onClick={() => setOpenMapa(false)}
              sx={{
                position: "absolute",
                right: 8,
                top: 8,
                color: (theme) => theme.palette.grey[500],
              }}
              size="large"
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            {coordenadasSeleccionadas && (
              <MapaLeaflet
                initialPosition={[
                  coordenadasSeleccionadas.latitud,
                  coordenadasSeleccionadas.longitud,
                ]}
                direccion={coordenadasSeleccionadas.direccion_propiedad}
                nombrePropietario={coordenadasSeleccionadas.nombre_propietario}
              />
            )}
          </DialogContent>
        </Dialog>
      </Container>
    </>
  );
};

export default Registros;
