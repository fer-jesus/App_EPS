import { useState, useEffect } from "react";
import {
  TextField,
  Button,
  Box,
  Typography,
  Stack,
  MenuItem,
} from "@mui/material";
import PropTypes from "prop-types";
import Autocomplete from "@mui/material/Autocomplete";
import axios from "axios";

const TasaForm = ({ onSubmit, onClose, initialData }) => {
  const [formData, setFormData] = useState({
    fechaRegistro: "",
    direccionExacta: "",
    dpi: "",
    nombrePropietario: "",
    tipoConstruccion: [],
    cuentaNoAlineacion: "",
    anotaciones: "",
    areaConstruccion: "",
    cantDemoMovi: "",
    valorPorcentaje: "",
    presupuestObra: "",
    cantidadCancelar: "",
    tarifaCambioUso: null,
  });

  const [tarifas, setTarifas] = useState([]);
  const [errors, setErrors] = useState({});
  const token = localStorage.getItem("token");

  const headers = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const formatoMonedaGT = (valor) => {
  const numero = Number(valor);
  if (isNaN(numero)) return "Q. 0.00";
  return `Q. ${numero.toLocaleString("es-GT", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};
  // Cargar tarifas desde el backend
  useEffect(() => {
    const fetchTarifas = async () => {
      try {
        const res = await axios.get(
          "http://localhost:3001/api/tarifas",
          headers
        );
        setTarifas(res.data);
      } catch (error) {
        console.error("Error al cargar tarifas:", error);
      }
    };
    fetchTarifas();
  }, []);

  // Cargar datos iniciales para editar
  useEffect(() => {
    let valorPorcentaje = "";
    let totalPresupuesto = 0;
    let totalCancelar = 0;

    const areaList = formData.areaConstruccion
      .split("\n")
      .map((a) => parseFloat(a.trim()))
      .filter((a) => !isNaN(a));

    const cantDemoMoviList = formData.cantDemoMovi
      .split("\n")
      .map((a) => parseFloat(a.trim()))
      .filter((a) => !isNaN(a));

    const areaListCopy = [...areaList];
    const cantDemoMoviListCopy = [...cantDemoMoviList];

    formData.tipoConstruccion.forEach((tipo) => {
      if (!tipo || !tipo.nombre_tarifa) return;

      const nombre = tipo.nombre_tarifa.toUpperCase();

      // Manejar CAMBIO DE USO de manera especial
      if (nombre === "CAMBIO DE USO O REMODELACIONES") {
        if (
          !formData.tarifaCambioUso ||
          !formData.tarifaCambioUso.TarifaCostoDimension
        )
          return;

        const baseCU = parseFloat(
          formData.tarifaCambioUso.TarifaCostoDimension?.costo_tarifa || 0
        );
        const areaCU = areaListCopy.shift();

        if (areaCU && baseCU) {
          const subtotal1 = areaCU * baseCU;
          const subtotal2 = subtotal1 * 0.25;
          const subtotal3 = subtotal2 * 0.035;

          valorPorcentaje += `${areaCU}X${baseCU}=${subtotal1.toLocaleString(
            "es-GT"
          )}X25%=${subtotal2
            .toFixed(2)
            .toLocaleString("es-GT")}X3.5%=${subtotal3
            .toFixed(2)
            .toLocaleString("es-GT")}\n`;

          //totalPresupuesto += subtotal1;
          totalPresupuesto += subtotal2;
          totalCancelar += subtotal3;
        }
        return;
      }

      // Manejar otros tipos de construcción
      if (!tipo.TarifaCostoDimension) return;

      const costo = parseFloat(tipo.TarifaCostoDimension?.costo_tarifa || 0);
      const porcentaje = parseFloat(tipo.TarifaCostoDimension?.porcentaje || 0);

      const isDemoMovi = ["DEMOLICIÓN", "MOVIMIENTO DE TIERRA"].includes(
        nombre
      );
      const area = isDemoMovi
        ? cantDemoMoviListCopy.shift()
        : areaListCopy.shift();

      if (area && costo && porcentaje) {
        const subtotal = area * costo;
        const subtotalPorcentaje = subtotal * (porcentaje / 100);
        totalPresupuesto += subtotal;
        totalCancelar += subtotalPorcentaje;

        valorPorcentaje += `${area}X${costo}=${subtotal.toLocaleString(
          "es-GT"
        )}X${porcentaje}%=${subtotalPorcentaje
          .toFixed(2)
          .toLocaleString("es-GT")}\n`;
      }
    });

    setFormData((prev) => ({
      ...prev,
      valorPorcentaje: valorPorcentaje.trim(),
      presupuestObra: totalPresupuesto.toFixed(2),
      cantidadCancelar: totalCancelar.toFixed(2),
    }));
  }, [
    formData.tipoConstruccion,
    formData.areaConstruccion,
    formData.cantDemoMovi,
    formData.tarifaCambioUso,
  ]);

  // Cargar datos iniciales si se está editando
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

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
      if (
        !formData[key] &&
        key !== "anotaciones" &&
        key !== "cantDemoMovi" &&
        key !== "tarifaCambioUso"
      ) {
        newErrors[key] = true;
        hasErrors = true;
      }
    });

    //Validar tarifaCambioUso solo si se selecciona ese tipo de construcción
    const incluyeCambioUso = formData.tipoConstruccion.some(
      (t) => t.nombre_tarifa?.toUpperCase() === "CAMBIO DE USO O REMODELACIONES"
    );

    if (incluyeCambioUso && !formData.tarifaCambioUso) {
      newErrors.tarifaCambioUso = true;
      hasErrors = true;
    }

    setErrors(newErrors);

    if (!hasErrors) {
      console.log("Datos del formulario:", formData);
      enviarTasa(formData);
    } else {
      console.warn("Errores encontrados: ", newErrors);
    }
  };

  const mantenimientoPropietario = async () => {
    try {
      //Verificar si el propietario ya existe

      const response = await axios.get(
        `http://localhost:3001/api/propietarios/${formData.dpi}`,
        headers
      );
      const nombreBD = response.data.nombre_propietario?.trim().toLowerCase();
      const nombreFormulario = formData.nombrePropietario?.trim().toLowerCase();

      //Si el nombre cambió, actualizar
      if (nombreBD !== nombreFormulario) {
        await axios.put(
          `http://localhost:3001/api/propietarios/${formData.dpi}`,
          {
            nombre_propietario: formData.nombrePropietario.trim(),
          },
          headers
        );
      }
    } catch (err) {
      if (err.response?.status === 404) {
        // No existe propietario, crear
        await axios.post(
          `http://localhost:3001/api/propietarios`,
          {
            cui: parseInt(formData.dpi),
            nombre_propietario: formData.nombrePropietario.trim(),
          },
          headers
        );
      } else {
        throw err;
      }
    }
  };

  //Función para buscar propietario por CUI
  const buscarPropietarioPorCUI = async (cui) => {
    if (!cui || cui.trim() === "") return;

    try {
      const response = await axios.get(
        `http://localhost:3001/api/propietarios/${cui}`,
        headers
      );
      if (response.data && response.data.nombre_propietario) {
        setFormData((prev) => ({
          ...prev,
          nombrePropietario: response.data.nombre_propietario,
        }));
      } else {
        setFormData((prev) => ({
          ...prev,
          nombrePropietario: "",
        }));
      }
    } catch (error) {
      if (error.response?.status === 404) {
        //console.error("Error al buscar propietario:", error);
        setFormData((prev) => ({
          ...prev,
          nombrePropietario: "",
        }));
      } else {
        console.error("Error al buscar propietario:", error);
      }
    }
  };

  const enviarTasa = async (form) => {
    try {
      console.log("Preparando datos para enviar al backend...");
      if (!form.dpi || !form.fechaRegistro || !form.direccionExacta) {
        throw new Error("Faltan datos requeridos");
      }
      await mantenimientoPropietario();

      const parseMonedaToFloat = (valor) => {
        if (!valor) return 0;
        return parseFloat(valor.replace(/[Q,\s]/g, ""));
      };

      //Datos para la tasa
      const tasaData = {
        fecha_emisionT: form.fechaRegistro,
        direccion_propiedad: form.direccionExacta,
        alineacion_urban: form.cuentaNoAlineacion === "si",
        anotaciones: form.anotaciones || null,
        cant_dem_movTierra: parseFloat(form.cantDemoMovi) || null,
        presupuesto_obra: parseMonedaToFloat(form.presupuestObra),
        cantidad_cancelar: parseMonedaToFloat(form.cantidadCancelar),
        documento: null,
        PROPIETARIOS_cui: parseInt(form.dpi),
        LICENCIAS_id_licencia_original: null,
        LICENCIAS_fecha_emisionL_original: null,
      };

      //Tarifas asociadas
      const tarifasData = [];

      const areaList = form.areaConstruccion
        .split("\n")
        .map((a) => parseFloat(a.trim()))
        .filter((a) => !isNaN(a));

      const cantDemoList = form.cantDemoMovi
        .split("\n")
        .map((a) => parseFloat(a.trim()))
        .filter((a) => !isNaN(a));

      const areaCopy = [...areaList];
      const cantCopy = [...cantDemoList];

      for (const tipo of form.tipoConstruccion) {
        const isCambioUso =
          tipo.nombre_tarifa?.toUpperCase() ===
          "CAMBIO DE USO O REMODELACIONES";

        if (isCambioUso) {
          const baseCU = parseFloat(
            form.tarifaCambioUso?.TarifaCostoDimension?.costo_tarifa || 0
          );
          const areaCU = areaCopy.shift();
          const subtotal1 = areaCU * baseCU;
          const subtotal2 = subtotal1 * 0.25;
          const subtotal3 = subtotal2 * 0.035;

          tarifasData.push({
            TARIFA_id_nombreTarifa: form.tarifaCambioUso.id_nombreTarifa,
            dimension_construccion: areaCU,
            formula: `${areaCU} x ${baseCU} x 25% x 3.5%`,
            valor: subtotal3,
          });
        } else if (tipo.TarifaCostoDimension) {
          const costo = parseFloat(tipo.TarifaCostoDimension.costo_tarifa);
          const porcentaje = parseFloat(tipo.TarifaCostoDimension.porcentaje);
          const nombre = tipo.nombre_tarifa?.toUpperCase();
          const isDemo = ["DEMOLICIÓN", "MOVIMIENTO DE TIERRA"].includes(
            nombre
          );

          const area = isDemo ? cantCopy.shift() : areaCopy.shift();
          const subtotal = area * costo;
          const valor = subtotal * (porcentaje / 100);

          tarifasData.push({
            TARIFA_id_nombreTarifa: tipo.id_nombreTarifa,
            dimension_construccion: area,
            formula: `${area} x ${costo} x ${porcentaje}%`,
            valor,
          });
        }
      }

      //Envio al backend
      const payload = { tasaData, tarifasData };
      console.log("Datos a enviar:", payload);

      const response = await axios.post(
        "http://localhost:3001/api/tasas",
        payload,
        headers
      );

      console.log("Respuesta del servidor:", response.data);
      alert("Tasa guardada con éxito");

      if (onSubmit) onSubmit();
    } catch (error) {
      console.error("Error al guardar tasa:", error);
      alert("Error al guardar la tasa");
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
          name="direccionExacta"
          label={getLabel("direccionExacta", "DIRECCION EXACTA")}
          value={formData.direccionExacta}
          onChange={handleChange}
          fullWidth
          required
          multiline
          error={Boolean(errors.direccionExacta)}
        />
        <TextField
          name="dpi"
          label={getLabel("dpi", "DPI")}
          value={formData.dpi}
          onChange={handleChange}
          onBlur={(e) => buscarPropietarioPorCUI(e.target.value)}
          fullWidth
          required
          error={Boolean(errors.dpi)}
        />

        <TextField
          name="nombrePropietario"
          label={getLabel("nombrePropietario", "NOMBRE DEL PROPIETARIO")}
          value={formData.nombrePropietario}
          onChange={handleChange}
          fullWidth
          required
          multiline
          error={Boolean(errors.nombrePropietario)}
        />

        <Autocomplete
          multiple
          options={tarifas}
          getOptionLabel={(option) => option.nombre_tarifa || ""}
          isOptionEqualToValue={() => false}
          filterSelectedOptions={false} // evita que se oculten opciones ya seleccionadas
          value={formData.tipoConstruccion}
          onChange={(event, newValue) => {
            setFormData((prev) => ({
              ...prev,
              tipoConstruccion: newValue,
            }));
            if (errors.tipoConstruccion) {
              setErrors((prev) => ({ ...prev, tipoConstruccion: false }));
            }
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label={getLabel(
                "tipoConstruccion",
                "TIPO DE CONSTRUCCIÓN SEGÚN REGLAMENTO"
              )}
              error={Boolean(errors.tipoConstruccion)}
              required
              fullWidth
            />
          )}
        />

        {formData.tipoConstruccion.some(
          (t) =>
            t.nombre_tarifa?.toUpperCase() === "CAMBIO DE USO O REMODELACIONES"
        ) && (
          <Autocomplete
            options={tarifas}
            getOptionLabel={(option) => option.nombre_tarifa || ""}
            isOptionEqualToValue={(option, value) =>
              option.id_nombreTarifa === value.id_nombreTarifa
            }
            value={formData.tarifaCambioUso || null}
            onChange={(event, newValue) => {
              setFormData((prev) => ({
                ...prev,
                tarifaCambioUso: newValue,
              }));
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="TARIFA BASE PARA CAMBIO DE USO O REMODELACIONES"
                required
                fullWidth
                error={Boolean(errors.tarifaCambioUso)}
              />
            )}
          />
        )}
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
          <MenuItem value="si">SI CUENTA CON ALINEACIÓN MUNICIPAL</MenuItem>
          <MenuItem value="no">NO CUENTA CON ALINEACIÓN MUNICIPAL</MenuItem>
        </TextField>
        <TextField
          name="anotaciones"
          label={getLabel(
            "anotaciones",
            "RECOMENDACIÓN O ANOTACIONES GENERALES"
          )}
          value={formData.anotaciones}
          onChange={handleChange}
          multiline
          fullWidth
        />
        <TextField
          name="areaConstruccion"
          label={getLabel("areaConstruccion", "AREA DE LA CONSTRUCCION")}
          value={formData.areaConstruccion}
          onChange={handleChange}
          fullWidth
          required
          multiline
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
          multiline
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
          disabled
          multiline
          error={Boolean(errors.valorPorcentaje)}
        />
        <TextField
          name="presupuestObra"
          label={getLabel("presupuestObra", "PRESUPUESTO DE LA OBRA")}
          value={formatoMonedaGT(formData.presupuestObra)}
          onChange={handleChange}
          fullWidth
          disabled
          error={Boolean(errors.presupuestObra)}
        />
        <TextField
          name="cantidadCancelar"
          label={getLabel(
            "cantidadCancelar",
            "CANTIDAD A CANCELAR POR LICENCIA DE CONSTRUCCIÓN"
          )}
          value={formatoMonedaGT(formData.cantidadCancelar)}
          onChange={handleChange}
          fullWidth
          disabled
          error={Boolean(errors.cantidadCancelar)}
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
            Guardar
          </Button>
          <Button onClick={onClose} variant="outlined">
            Cancelar
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
};

TasaForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  onClose: PropTypes.func,
  initialData: PropTypes.object,
};

export default TasaForm;
