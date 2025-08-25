import { useState, useEffect } from "react";
import axios from "axios";
import {
  Container,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
} from "@mui/material";
import AppNavbar from "../components/AppNavBar";
import BarChart from "../components/charts/BarChart";
import LineChart from "../components/charts/LineChart";
import DownloadIcon from "@mui/icons-material/Download";
import { exportChartsToPDFLicencias } from "../utils/exportPdfLicencias";

const ReportLicencias = () => {
  const [labels, setLabels] = useState([]);
  const [dataCantidad, setDataCantidad] = useState([]);
  const [dataMonto, setDataMonto] = useState([]);
  const token = localStorage.getItem("token");

  const [inicioMes, setInicioMes] = useState("");
  const [finMes, setFinMes] = useState("");
  const [inicioAnio, setInicioAnio] = useState("");
  const [finAnio, setFinAnio] = useState("");

  const meses = [
    "ENERO",
    "FEBRERO",
    "MARZO",
    "ABRIL",
    "MAYO",
    "JUNIO",
    "JULIO",
    "AGOSTO",
    "SEPTIEMBRE",
    "OCTUBRE",
    "NOVIEMBRE",
    "DICIEMBRE",
  ];

  // Obtener el año actual
  const currentYear = new Date().getFullYear();

  // Genera los próximos N años desde el actual
  const generarAnios = (cantidad = 16) => {
    return Array.from({ length: cantidad }, (_, i) => currentYear + i);
  };

  const anios = generarAnios(16);

  const fetchReporte = async () => {
    try {
      if (!inicioMes || !finMes || !inicioAnio || !finAnio) return;

      // Calcular fechas inicio y fin normalmente
      const lastDayOfMonth = new Date(finAnio, finMes, 0).getDate();

      const inicio = `${inicioAnio}-${String(inicioMes).padStart(2, "0")}-01`;
      const fin = `${finAnio}-${String(finMes).padStart(
        2,
        "0"
      )}-${lastDayOfMonth}`;

      const res = await axios.get(
        "https://backdot.dotmunijalapa.org/api/licencias/reporte-mensual",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: { inicio, fin },
        }
      );

      const reporte = res.data;

      // Transformar los datos para el chart
      const chartLabels = reporte.map((r) => `${meses[r.mes - 1]} ${r.anio}`);
      const chartDataCantidad = reporte.map((r) =>
        parseInt(r.cantidad_licencias)
      );
      const chartDataMonto = reporte.map((r) =>
        parseFloat(r.tasa?.monto_total || 0)
      );

      setLabels(chartLabels);
      setDataCantidad(chartDataCantidad);
      setDataMonto(chartDataMonto);
    } catch (error) {
      console.error("Error al obtener reporte:", error);
    }
  };

  useEffect(() => {
    fetchReporte();
  }, [inicioMes, finMes, inicioAnio, finAnio]);

  const handleDownload = () => {
    exportChartsToPDFLicencias("line-chart", "bar-chart");
  };

  return (
    <>
      <AppNavbar />
      <Container sx={{ mt: 4 }}>
        <Grid container spacing={2} justifyContent="center" mb={3}>
          <Grid item xs={12} md={2}></Grid>

          <Grid item xs={50} md={3}>
            <FormControl fullWidth sx={{ minWidth: 90 }}>
              <InputLabel>INICIO</InputLabel>
              <Select
                value={inicioMes}
                label="INICIO MES"
                onChange={(e) => setInicioMes(e.target.value)}
              >
                {meses.map((mes, i) => (
                  <MenuItem key={i} value={i + 1}>
                    {mes}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={3}>
            <FormControl fullWidth sx={{ minWidth: 90 }}>
              <InputLabel>INICIO</InputLabel>
              <Select
                value={inicioAnio}
                label="INICIO AÑO"
                onChange={(e) => setInicioAnio(e.target.value)}
              >
                {anios.map((anio) => (
                  <MenuItem key={anio} value={anio}>
                    {anio}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={3}>
            <FormControl fullWidth sx={{ minWidth: 90 }}>
              <InputLabel>HASTA</InputLabel>
              <Select
                value={finMes}
                label="HASTA MES"
                onChange={(e) => setFinMes(e.target.value)}
              >
                {meses.map((mes, i) => (
                  <MenuItem key={i} value={i + 1}>
                    {mes}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={3}>
            <FormControl fullWidth sx={{ minWidth: 90 }}>
              <InputLabel>HASTA</InputLabel>
              <Select
                value={finAnio}
                label="HASTA AÑO"
                onChange={(e) => setFinAnio(e.target.value)}
              >
                {anios.map((anio) => (
                  <MenuItem key={anio} value={anio}>
                    {anio}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        <Grid
          item
          xs={12}
          sm={12}
          md={12}
          textAlign={{ xs: "center", md: "right" }}
          sx={{ mt: 3 }}
        >
          <Button
            variant="contained"
            sx={{
              backgroundColor: "#F2C037",
              fontWeight: "bold",
              "&:hover": { backgroundColor: "#d9aa2e" },
              px: 1,
            }}
            startIcon={<DownloadIcon />}
            onClick={handleDownload}
          >
            Descargar
          </Button>
        </Grid>
        <div style={{ display: "grid", gap: "75px", marginTop: "50px" }}>
          <div id="line-chart" style={{ width: "100%", height: "50vh" }}>
            <LineChart labels={labels} dataMonto={dataMonto} />
          </div>

          <div
            id="bar-chart"
            style={{ width: "100%", height: "50vh", marginBottom: "75px" }}
          >
            <BarChart labels={labels} dataCantidad={dataCantidad} />
          </div>
        </div>
      </Container>
    </>
  );
};

export default ReportLicencias;
