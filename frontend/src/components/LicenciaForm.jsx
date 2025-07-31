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

const LicenciaForm = ({ initialData, onClose, onSubmit }) => {
  const [form, setForm] = useState({
    boleta_pago: "",
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
    LICENCIAS_id_licencia_ampliacion: "",
    LICENCIAS_fecha_emisionL_ampliacion: "",
    ...initialData,
  });

  const token = localStorage.getItem("token");
  const [guardando, setGuardando] = useState(false);
  const [guardadoExitoso, setGuardadoExitoso] = useState(false);
  const [rotuloOriginal, setRotuloOriginal] = useState("");

  // Función para manejar los cambios en los campos del formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  // Función para formatear la fecha en formato YYYY-MM-DD
  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Función para obtener la licencia existente por TASAS_id_tasa
  const fetchLicencia = async (idTasa) => {
    try {
      const response = await axios.get(
        `https://front_dot.dotmunijalapa.org/api/licencias/por-tasa/${idTasa}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const licencia = response.data;

      // carga los datos de la licencia en el formulario
      setForm((prev) => ({
        ...prev,
        id_licencia: licencia.id_licencia,
        boleta_pago: licencia.boleta_pago || "",
        fechaEmision: licencia.fecha_emisionL,
        fechaVencimiento: licencia.fecha_vencimiento,
        rotulo: licencia.rotulo,
        registroGeneral: licencia.registro_general,
        TASAS_id_tasa: idTasa,
      }));

      setRotuloOriginal(licencia.rotulo || "");
      setGuardadoExitoso(true);
    } catch (error) {
      if (error.response?.status === 404) {
        console.log("No hay licencia registrada aún para esta tasa.");
      } else {
        console.error("Error al buscar licencia:", error);
      }
      setGuardadoExitoso(false); // permitir crear una nueva si no existe
    }
  };

  // Inicializar fechas de emisión y vencimiento
  useEffect(() => {
    if (!initialData?.fechaEmision) {
      const today = new Date();
      const vencimiento = new Date(today);
      vencimiento.setMonth(vencimiento.getMonth() + 12); // suma 18 meses

      setForm((prev) => ({
        ...prev,
        fechaEmision: formatDate(today),
        fechaVencimiento: formatDate(vencimiento),
      }));
    }
  }, [initialData]);

  // Efecto para cargar los datos iniciales del formulario
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
        LICENCIAS_id_licencia_ampliacion:
          initialData.LICENCIAS_id_licencia_ampliacion || "",
        LICENCIAS_fecha_emisionL_ampliacion:
          initialData.LICENCIAS_fecha_emisionL_ampliacion || "",
      }));

      // Guardar el rótulo original para comparar cambios
      setRotuloOriginal(initialData.rotulo || "");

      if (initialData.registroGeneral || initialData.id_licencia) {
        setGuardadoExitoso(true);
      } else {
        setGuardadoExitoso(false);
      }
    }
  }, [initialData]);

  // Efecto para cargar la licencia al montar el componente o cambiar TASAS_id_tasa
  useEffect(() => {
    if (initialData?.TASAS_id_tasa) {
      fetchLicencia(initialData.TASAS_id_tasa);
    }
  }, [initialData, token]);

  // Efecto para habilitar o deshabilitar el botón de guardar
  useEffect(() => {
    if (form.rotulo && form.rotulo !== rotuloOriginal) {
      setGuardadoExitoso(false); // se habilita el botón
    } else if (form.rotulo === rotuloOriginal && rotuloOriginal !== "") {
      setGuardadoExitoso(true); // deshabilita si no hay cambios
    }
  }, [form.rotulo, rotuloOriginal]);

  // Función para manejar el envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.rotulo) {
      alert("Debe seleccionar un valor para el campo RÓTULO.");
      return;
    }

    setGuardando(true);

    try {
      if (form.id_licencia && form.rotulo !== rotuloOriginal) {
        //Si existe, actualizar (rotulo)
        await axios.put(
          `https://front_dot.dotmunijalapa.org/api/licencias/${form.id_licencia}/${form.fechaEmision}`,
          { rotulo: form.rotulo },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        alert("Rótulo actualizado");
        await fetchLicencia(form.TASAS_id_tasa);
      } else {
        //Crear licencia

        // console.log("Enviando licencia:", {
        //   LICENCIAS_id_licencia_original: form.LICENCIAS_id_licencia_original,
        //   LICENCIAS_fecha_emisionL_original:
        //     form.LICENCIAS_fecha_emisionL_original,
        // });
        console.log("Datos que se enviarán al backend:", {
          fecha_emisionL: form.fechaEmision,
          fecha_vencimiento: form.fechaVencimiento,
          estado: "ACTIVO",
          rotulo: form.rotulo,
          TASAS_id_tasa: form.TASAS_id_tasa,
          LICENCIAS_id_licencia_ampliacion:
            form.LICENCIAS_id_licencia_ampliacion,
          LICENCIAS_fecha_emisionL_ampliacion:
            form.LICENCIAS_fecha_emisionL_ampliacion,
        });
        const response = await axios.post(
          "https://front_dot.dotmunijalapa.org/api/licencias",
          {
            boleta_pago: form.boleta_pago,
            fecha_emisionL: form.fechaEmision,
            fecha_vencimiento: form.fechaVencimiento,
            estado: "ACTIVO",
            rotulo: form.rotulo,
            TASAS_id_tasa: form.TASAS_id_tasa,
            LICENCIAS_id_licencia_ampliacion:
              form.LICENCIAS_id_licencia_ampliacion || null,
            LICENCIAS_fecha_emisionL_ampliacion:
              form.LICENCIAS_fecha_emisionL_ampliacion || null,
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
          id_licencia: licencia.id_licencia,
          registroGeneral,
        }));

        alert("Licencia guardada");
        await fetchLicencia(form.TASAS_id_tasa);
      }

      setGuardadoExitoso(true);
      setRotuloOriginal(form.rotulo);

      if (onSubmit) {
        onSubmit();
      }
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
        REGISTRO DE LICENCIA
      </Typography>
      <TextField
        label="BOLETA DE PAGO"
        name="boleta_pago"
        value={form.boleta_pago}
        onChange={handleChange}
        fullWidth
        disabled={!!form.id_licencia}
        inputProps={{ style: { textTransform: "uppercase" } }}
      />
      <TextField
        label="FECHA DE EMISION"
        name="fechaEmision"
        type="date"
        value={form.fechaEmision}
        onChange={handleChange}
        InputLabelProps={{ shrink: true }}
        fullWidth
        disabled={!!form.id_licencia}
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
        disabled={!!form.id_licencia}
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
  onSubmit: PropTypes.func,
};

export default LicenciaForm;
