import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  MenuItem,
  Stack,
} from "@mui/material";
import PropTypes from "prop-types";
import axios from "axios";

const NomenclaturaForm = ({
  initialData = {},
  onClose,
  onSubmit,
  editar = false,
}) => {
  const [form, setForm] = useState({
    cui: initialData?.cui || "",
    fechaEmision:
      initialData?.fechaEmision || new Date().toISOString().split("T")[0],
    registroGeneral: initialData?.registroGeneral || "",
    fechaVencimiento: initialData?.fechaVencimiento || "",
    solicitante: initialData?.solicitante || "",
    direccion: initialData?.direccion || "",
    tipoNomenclatura: initialData?.tipoNomenclatura || "",
  });

  const [guardando, setGuardando] = useState(false);
  const [guardadoExitoso, setGuardadoExitoso] = useState(false);
  const [tipoOriginal, setTipoOriginal] = useState(
    initialData?.tipoNomenclatura || ""
  );
  const [tipoModificado, setTipoModificado] = useState(false);
  const camposDeshabilitados = editar;

  const token = localStorage.getItem("token");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (name === "tipoNomenclatura") {
      setTipoModificado(value !== tipoOriginal);
    }
  };

  const formatDate = (date) => {
    const d = new Date(date);
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${d.getFullYear()}-${month}-${day}`;
  };

  useEffect(() => {
    if (!form.fechaEmision) {
      const today = new Date();
      setForm((prev) => ({
        ...prev,
        fechaEmision: formatDate(today),
      }));
    }
  }, []);

  useEffect(() => {
    if (editar) {
      setTipoOriginal(initialData?.tipoNomenclatura || "");
    }
  }, [editar, initialData]);

  const mantenimientoPropietario = async () => {
    try {
      const response = await axios.get(
        `https://front_dot.dotmunijalapa.org/api/propietarios/${form.cui}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const nombreBD = response.data.nombre_propietario?.trim().toLowerCase();
      const nombreFormulario = form.solicitante?.trim().toLowerCase();

      if (nombreBD !== nombreFormulario) {
        await axios.put(
          `https://front_dot.dotmunijalapa.org/api/propietarios/${form.cui}`,
          {
            nombre_propietario: form.solicitante.trim(),
            direccion: form.direccion.trim(),
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      }
    } catch (err) {
      if (err.response?.status === 404) {
        await axios.post(
          `https://front_dot.dotmunijalapa.org/api/propietarios`,
          {
            cui: parseInt(form.cui),
            nombre_propietario: form.solicitante.trim(),
            direccion: form.direccion.trim(),
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      } else {
        console.error("Error al verificar/crear propietario:", err);
        throw err;
      }
    }
  };

  const buscarPropietario = async (cui) => {
    if (!cui) return;

    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `https://front_dot.dotmunijalapa.org/api/propietarios/${cui}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const propietario = response.data;
      if (propietario) {
        setForm((prev) => ({
          ...prev,
          solicitante: propietario.nombre_propietario || "",
          direccion: propietario.direccion || "",
        }));
      }
    } catch (error) {
      console.error("Error al buscar propietario:", error);
    
      setForm((prev) => ({
        ...prev,
        solicitante: "",
        direccion: "",
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGuardando(true);

    try {
      await mantenimientoPropietario();

      await axios.post(
        "https://front_dot.dotmunijalapa.org/api/nomenclaturas",
        {
          PROPIETARIOS_cui: form.cui,
          fecha_emisionN: form.fechaEmision,
          registro_general: form.registroGeneral,
          solicitante: form.solicitante,
          direccion_solici: form.direccion,
          TIPO_NOMENCLATURA_id_tipoNomenclatura: parseInt(
            form.tipoNomenclatura
          ),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Nomenclatura guardada correctamente");
      setGuardadoExitoso(true);
      if (onSubmit) onSubmit();
    } catch (error) {
      console.error("Error al guardar nomenclatura:", error);
      alert("Error al guardar nomenclatura");
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
        REGISTRO DE NOMENCLATURA
      </Typography>
      <TextField
        label="DPI"
        name="cui"
        value={form.cui || ""}
        onChange={handleChange}
        onBlur={(e) => buscarPropietario(e.target.value.trim())}
        InputLabelProps={{ shrink: true }}
        fullWidth
        required
        disabled={camposDeshabilitados}
      />
      <TextField
        label="FECHA DE EMISIÓN"
        name="fechaEmision"
        type="date"
        value={form.fechaEmision}
        onChange={handleChange}
        InputLabelProps={{ shrink: true }}
        fullWidth
        required
        disabled={camposDeshabilitados}
      />
      <TextField
        label="REGISTRO GENERAL"
        name="registroGeneral"
        value={form.registroGeneral}
        onChange={handleChange}
        fullWidth
        disabled
      />
      <TextField
        label="FECHA DE VENCIMIENTO"
        name="fechaVencimiento"
        type="date"
        value={form.fechaVencimiento}
        onChange={handleChange}
        InputLabelProps={{ shrink: true }}
        fullWidth
        required
        disabled
      />
      <TextField
        label="SOLICITANTE"
        name="solicitante"
        value={form.solicitante}
        onChange={handleChange}
        fullWidth
        multiline
        required
        disabled={camposDeshabilitados}
      />

      <TextField
        label="DIRECCIÓN"
        name="direccion"
        value={form.direccion}
        onChange={handleChange}
        fullWidth
        multiline
        required
        disabled={camposDeshabilitados}
      />
      <TextField
        select
        label="TIPO DE NOMENCLATURA"
        name="tipoNomenclatura"
        value={form.tipoNomenclatura}
        onChange={handleChange}
        fullWidth
        required
      >
        <MenuItem value={1}>NORMAL</MenuItem>
        <MenuItem value={2}>IUSI</MenuItem>
        <MenuItem value={3}>JALAPAGUA</MenuItem>
        <MenuItem value={4}>EMPRESA ELECTRICA</MenuItem>
      </TextField>

      <Stack direction="row" spacing={2} justifyContent="center">
        <Button
          type="submit"
          variant="contained"
          disabled={guardando || guardadoExitoso || (editar && !tipoModificado)}
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

NomenclaturaForm.propTypes = {
  initialData: PropTypes.object,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func,
  editar: PropTypes.bool,
};

export default NomenclaturaForm;
