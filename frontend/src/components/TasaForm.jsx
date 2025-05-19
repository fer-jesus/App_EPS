import { useState, useEffect } from "react";
import {
  TextField,
  Button,
  Box,
  Typography,
  Stack,
  MenuItem,
} from "@mui/material";

const TasaForm = ({ onSubmit, onClose, initialData }) => {
  const [formData, setFormData] = useState({
    fechaRegistro: "",
    dpi: "",
    direccionExacta: "",
    nombrePropietario: "",
    tipoConstruccion: "",
    cuentaNoAlineacion: "",
    anotaciones: "",
    areaConstruccion: "",
    cantDemoMovi: "",
    valorPorcentaje: "",
    presupuestObra: "",
    cantidadCancelar: "",
  });

  const [errors, setErrors] = useState({});

  // Inicializar formulario con datos existentes si estamos editando
  useEffect(() => {
    if (initialData) {
      setFormData({
        nombrePropietario: initialData.nombrePropietario || "",
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Limpiar error cuando el usuario escribe
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: false }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Validar campos requeridos
    const newErrors = {};
    let hasErrors = false;

    Object.keys(formData).forEach((key) => {
      if (!formData[key] && key !== "anotaciones" && key !== "cantDemoMovi") {
        newErrors[key] = true;
        hasErrors = true;
      }
    });

    setErrors(newErrors);

    if (!hasErrors) {
      onSubmit(formData);
    }
  };

  const getLabel = (name, label) =>
    errors[name] ? "Rellena este campo" : label;

  return (
    <Box sx={{ p: 2 }}>
      <Stack spacing={2}>
        <Typography variant="h6" textAlign="center" fontWeight="bold">
          {initialData ? "Editar Tasa" : "Crear Nueva Tasa"}
        </Typography>

        <TextField
          type="date"
          name="fechaRegistro"
          label={getLabel("fechaRegistro", "FECHA")}
          value={formData.fechaRegistro}
          onChange={handleChange}
          fullWidth
          required
          InputLabelProps={{ shrink: true }}
          error={Boolean(errors.fechaRegistro)}
        />
         <TextField
          name="dpi"
          label={getLabel("dpi", "DPI")}
          value={formData.dpi}
          onChange={handleChange}
          fullWidth
          required
          error={Boolean(errors.dpi)}
        />
        <TextField
          name="direccionExacta"
          label={getLabel("direccionExacta", "DIRECCION EXACTA")}
          value={formData.direccionExacta}
          onChange={handleChange}
          fullWidth
          required
          error={Boolean(errors.direccionExacta)}
        />
        <TextField
          name="nombrePropietario"
          label={getLabel("nombrePropietario", "NOMBRE DEL PROPIETARIO")}
          value={formData.nombrePropietario}
          onChange={handleChange}
          fullWidth
          required
          error={Boolean(errors.nombrePropietario)}
        />
        <TextField
          name="tipoConstruccion"
          label={getLabel(
            "tipoConstruccion",
            "TIPO DE CONSTRUCCIÓN SEGÚN REGLAMENTO"
          )}
          value={formData.tipoConstruccion}
          onChange={handleChange}
          fullWidth
          required
          error={Boolean(errors.tipoConstruccion)}
        />
        <TextField
          select
          name="cuentaNoAlineacion"
          label={getLabel(
            "cuentaNoAlineacion",
            "CUENTA O NO CON ALINEACIÓN URBANANISTICA"
          )}
          value={formData.cuentaNoAlineacion}
          onChange={handleChange}
          fullWidth
          required
          error={Boolean(errors.cuentaNoAlineacion)}
        >
          <MenuItem value="si">
            SI CUENTA CON ALINEACIÓN MUNICIPAL
          </MenuItem>
          <MenuItem value="no">
            NO CUENTA CON ALINEACIÓN MUNICIPAL
          </MenuItem>
        </TextField>
        <TextField
          name="anotaciones"
          label={getLabel(
            "anotaciones",
            "RECOMENDACIÓN O ANOTACIONES GENERALES"
          )}
          value={formData.anotaciones}
          onChange={handleChange}
          fullWidth
        />
        <TextField
          name="areaConstruccion"
          label={getLabel("areaConstruccion", "AREA DE LA CONSTRUCCION")}
          value={formData.areaConstruccion}
          onChange={handleChange}
          fullWidth
          required
          error={Boolean(errors.areaConstruccion)}
        />
        <TextField
          name="cantDemoMovi"
          label={getLabel(
            "cantDemoMovi",
            "CANTIDAD EN M² DE DEMOLICIÓN, MOVIMIENTO DE TIERRA"
          )}
          value={formData.cantDemoMovi}
          onChange={handleChange}
          fullWidth
        />
        <TextField
          name="valorPorcentaje"
          label={getLabel(
            "valorPorcentaje",
            "VALOR DE M²  Y PORCENTAJE APLICADO"
          )}
          value={formData.valorPorcentaje}
          onChange={handleChange}
          fullWidth
          required
          error={Boolean(errors.valorPorcentaje)}
        />
        <TextField
          name="presupuestObra"
          label={getLabel("presupuestObra", "PRESUPUESTO DE LA OBRA")}
          value={formData.presupuestObra}
          onChange={handleChange}
          fullWidth
          required
          error={Boolean(errors.presupuestObra)}
        />
        <TextField
          name="cantidadCancelar"
          label={getLabel(
            "cantidadCancelar",
            "CANTIDAD A CANCELAR POR LICENCIA DE CONSTRUCCIÓN"
          )}
          value={formData.cantidadCancelar}
          onChange={handleChange}
          fullWidth
          required
          error={Boolean(errors.cantidadCancelar)}
        />

        <Stack direction="row" spacing={2} justifyContent="center">
          <Button onClick={onClose} variant="outlined">
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            sx={{
              backgroundColor: "#006930",
              "&:hover": { backgroundColor: "#008C3A" },
            }}
          >
            Guardar
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
};

export default TasaForm;
