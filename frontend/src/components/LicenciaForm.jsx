import { useState } from "react";
import {
  TextField,
  Button,
  Box,
  Typography,
  MenuItem,
  Stack,
} from "@mui/material";
import PropTypes from "prop-types";

const LicenciaForm = ({ initialData, onClose }) => {
  const [form, setForm] = useState({
    fechaEmision: "",
    registroGeneral: "",
    fechaVencimiento: "",
    solicitante: "",
    direccionConstruccion: "",
    cantidad: "",
    presupuestoObra: "",
    rotulo: "",
    areaConstruccion: "",
    ...initialData,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Guardando licencia:", form);
    // Aquí irá la lógica de guardado
    onClose(); // cerrar modal después de guardar
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
        inputProps={{ style: { textTransform: "uppercase" } }}
      />
      <TextField
        label="FECHA DE VENCIMIENTO"
        name="fechaVencimiento"
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
        inputProps={{ style: { textTransform: "uppercase" } }}
      />
      <TextField
        label="DIRECCION DE LA CONSTRUCCION"
        name="direccionConstruccion"
        value={form.direccionConstruccion}
        onChange={handleChange}
        fullWidth
        inputProps={{ style: { textTransform: "uppercase" } }}
      />
      <TextField
        label="CANCELA LA CANTIDAD DE"
        name="cantidad"
        value={form.cantidad}
        onChange={handleChange}
        fullWidth
      />
      <TextField
        label="PRESUPUESTO DE LA OBRA"
        name="presupuestoObra"
        value={form.presupuestoObra}
        onChange={handleChange}
        fullWidth
      />
      <TextField
        select
        label="ROTULO"
        name="rotulo"
        value={form.rotulo}
        onChange={handleChange}
        fullWidth
      >
        <MenuItem value="50">50</MenuItem>
        <MenuItem value="100">100</MenuItem>
        <MenuItem value="RAZONADO">RAZONADO</MenuItem>
      </TextField>
      <TextField
        label="AREA DE LA CONSTRUCCION"
        name="areaConstruccion"
        value={form.areaConstruccion}
        onChange={handleChange}
        fullWidth
      />

      <Stack direction="row" spacing={2} justifyContent="center">
        <Button
          onClick={handleSubmit}
          variant="contained"
          sx={{
            backgroundColor: "#006930",
            "&:hover": { backgroundColor: "#008C3A" },
          }}
        >
          GUARDAR
        </Button>
        <Button onClick={onClose} variant="outlined">
          CANCELAR
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
