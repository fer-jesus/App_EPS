import { useState, useEffect } from "react";
import {
  TextField,
  Button,
  Box,
  Typography,
  MenuItem,
  Stack,
} from "@mui/material";
import PropTypes from "prop-types";
import axios from "axios";

const LicenciaForm = ({ initialData, onClose }) => {
  const [form, setForm] = useState({
    fechaEmision: "",
    registroGeneral: "",
    fechaVencimiento: "",
    solicitante: "",
    direccionConstruccion: "",
    tiposConstruccion: "",
    cantidad: "",
    presupuestoObra: "",
    rotulo: "",
    areaConstruccion: "",
    ...initialData,
  });

  const token = localStorage.getItem("token");
  const [guardando, setGuardando] = useState(false);
  const [guardadoExitoso, setGuardadoExitoso] = useState(false);

  // Inicializar fechas de emisión y vencimiento
  useEffect(() => {
    if (!initialData?.fechaEmision) {
      const today = new Date();
      const vencimiento = new Date(today);
      vencimiento.setMonth(vencimiento.getMonth() + 18); // suma 18 meses

      const formatDate = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
      };

      setForm((prev) => ({
        ...prev,
        fechaEmision: formatDate(today),
        fechaVencimiento: formatDate(vencimiento),
      }));
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  useEffect(() => {
    if (initialData) {
      setForm((prev) => ({
        ...prev,
        ...initialData,
        fechaEmision: initialData.fecha_emisionL || prev.fechaEmision,
        fechaVencimiento:
          initialData.fecha_vencimiento || prev.fechaVencimiento,
        rotulo: initialData.rotulo || prev.rotulo,
        registroGeneral: initialData.registroGeneral || prev.registroGeneral,
      }));
      if (initialData.registroGeneral || initialData.id_licencia) {
        setGuardadoExitoso(true);
      } else {
        setGuardadoExitoso(false);
      }
    }
  }, [initialData]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.rotulo) {
      alert("Debe seleccionar un valor para el campo RÓTULO.");
      return;
    }

    setGuardando(true);

    try {
      // Envio de datos al backend
      console.log("Enviando TASAS_id_tasa:", initialData.TASAS_id_tasa);
      const response = await axios.post(
        "http://localhost:3001/api/licencias",
        {
          fecha_emisionL: form.fechaEmision,
          fecha_vencimiento: form.fechaVencimiento,
          estado: "ACTIVO",
          rotulo: form.rotulo,
          TASAS_id_tasa: initialData.TASAS_id_tasa,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const licencia = response.data;
      //Generación del registro general
      const idLicencia = String(licencia.id_licencia).padStart(4, "0");
      const [anio, mes, dia] = licencia.fecha_emisionL.split("-");
      const registroGeneral = `${idLicencia}${dia}${mes}${anio}`;

      // Mostrar el resultado actualizado en el formulario
      setForm((prev) => ({
        ...prev,
        registroGeneral,
      }));

      alert("Licencia guardada");
      setGuardadoExitoso(true);
    } catch (error) {
      console.error("Error al guardar licencia:", error);
      alert("Error al guardar la licencia");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{ display: "grid", gap: 2 }}
    >
      <Typography variant="h6" sx={{ textAlign: "center", fontWeight: "bold" }}>
        FORMULARIO DE LICENCIA
      </Typography>
      <TextField
        label="FECHA DE EMISION"
        name="fechaEmision"
        type="date"
        value={form.fechaEmision}
        onChange={handleChange}
        InputLabelProps={{ shrink: true }}
        fullWidth
      />
      <TextField
        label="REGISTRO GENERAL"
        name="registroGeneral"
        value={form.registroGeneral}
        onChange={handleChange}
        fullWidth
        disabled
        inputProps={{ style: { textTransform: "uppercase" } }}
      />
      <TextField
        label="FECHA DE VENCIMIENTO"
        name="fechaVencimiento"
        type="date"
        value={form.fechaVencimiento}
        onChange={handleChange}
        InputLabelProps={{ shrink: true }}
        fullWidth
      />
      <TextField
        label="SOLICITANTE"
        name="solicitante"
        value={form.solicitante}
        onChange={handleChange}
        fullWidth
        disabled
        inputProps={{ style: { textTransform: "uppercase" } }}
      />
      <TextField
        label="DIRECCION DE LA CONSTRUCCION"
        name="direccionConstruccion"
        value={form.direccionConstruccion}
        onChange={handleChange}
        fullWidth
        multiline
        disabled
        inputProps={{ style: { textTransform: "uppercase" } }}
      />
      <TextField
        label="TIPOS DE CONSTRUCCION"
        name="tiposConstruccion"
        value={form.tiposConstruccion}
        onChange={handleChange}
        fullWidth
        multiline
        disabled
        inputProps={{ style: { textTransform: "uppercase" } }}
      />
      <TextField
        label="CANCELA LA CANTIDAD DE"
        name="cantidad"
        value={form.cantidad}
        onChange={handleChange}
        fullWidth
        disabled
      />
      <TextField
        label="PRESUPUESTO DE LA OBRA"
        name="presupuestoObra"
        value={form.presupuestoObra}
        onChange={handleChange}
        fullWidth
        disabled
      />
      <TextField
        select
        label="ROTULO"
        name="rotulo"
        value={form.rotulo}
        onChange={handleChange}
        fullWidth
        required
      >
        <MenuItem value="50">50</MenuItem>
        <MenuItem value="100">100</MenuItem>
        <MenuItem value="Razonado">Razonado</MenuItem>
      </TextField>
      <TextField
        label="AREA DE LA CONSTRUCCION"
        name="areaConstruccion"
        value={form.areaConstruccion}
        onChange={handleChange}
        fullWidth
        disabled
      />

      <Stack direction="row" spacing={2} justifyContent="center">
        <Button
          type="submit"
          //onClick={handleSubmit}
          variant="contained"
          disabled={guardando || guardadoExitoso}
          sx={{
            backgroundColor: "#006930",
            "&:hover": { backgroundColor: "#008C3A" },
          }}
        >
          {guardando
            ? "GUARDANDO..."
            : guardadoExitoso
            ? "GUARDADO"
            : "GUARDAR"}
        </Button>
        <Button onClick={onClose} variant="outlined" disabled={guardando}>
          SALIR
        </Button>
      </Stack>
    </Box>
  );
};

LicenciaForm.propTypes = {
  initialData: PropTypes.object,
  onClose: PropTypes.func.isRequired,
};

export default LicenciaForm;
