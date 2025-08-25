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

const today = new Date().toISOString().split("T")[0];

const TasaForm = ({ onSubmit, onClose, initialData }) => {
  const [formData, setFormData] = useState({
    fechaRegistro: today,
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
    esAmpliacion: false,
    nivelesConstruccion: "",
    valor50Porc: "",
    latitud: "",
    longitud: "",
    LICENCIAS_id_licencia_original: null,
    LICENCIAS_fecha_emisionL_original: null,
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
          "https://backdot.dotmunijalapa.org/api/tarifas",
          headers
        );
        setTarifas(res.data);
      } catch (error) {
        console.error("Error al cargar tarifas:", error);
      }
    };
    fetchTarifas();
  }, []);

  // Calcular valores derivados al cambiar datos del formulario
  useEffect(() => {
    const { valorPorcentaje, valor50Porc, presupuestObra, cantidadCancelar } =
      calcularTasa(formData);

    setFormData((prev) => ({
      ...prev,
      valorPorcentaje,
      valor50Porc,
      presupuestObra,
      cantidadCancelar,
    }));
  }, [
    formData.tipoConstruccion,
    formData.areaConstruccion,
    formData.cantDemoMovi,
    formData.tarifaCambioUso,
    formData.nivelesConstruccion,
  ]);

  // Cargar datos iniciales si se está editando
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: false }));
    }
  };

  useEffect(() => {
    if (initialData) {
      console.log("initialData en TasaForm:", initialData);
      setFormData((prev) => ({
        ...prev,
        ...initialData,
        fechaRegistro: initialData.fechaRegistro || today,
        direccionExacta: initialData.direccionExacta || "",
        dpi: initialData.dpi || "",
        nombrePropietario: initialData.nombrePropietario || "",
        esAmpliacion: !!initialData.esAmpliacion,
        LICENCIAS_id_licencia_original:
          initialData.LICENCIAS_id_licencia_original ?? null,
        LICENCIAS_fecha_emisionL_original:
          initialData.LICENCIAS_fecha_emisionL_original ?? null,
      }));
    }
  }, [initialData]);

  console.log("esAmpliacion actual:", formData.esAmpliacion);
  const handleSubmit = (e) => {
    e.preventDefault();

    const newErrors = {};
    let hasErrors = false;

    //Validación de campos requeridos
    const incluyeCambioUso = formData.tipoConstruccion.some(
      (t) => t.nombre_tarifa?.toUpperCase() === "CAMBIO DE USO O REMODELACIONES"
    );

    const requiereCantDemo = formData.tipoConstruccion.some((t) =>
      ["DEMOLICIÓN", "MOVIMIENTO DE TIERRA"].includes(
        t.nombre_tarifa?.toUpperCase()
      )
    );

    Object.keys(formData).forEach((key) => {
      const excepciones = [
        "anotaciones",
        "tarifaCambioUso",
        "cantDemoMovi",
        "areaConstruccion",
        "esAmpliacion",
        "LICENCIAS_id_licencia_original",
        "LICENCIAS_fecha_emisionL_original",
        "nivelesConstruccion",
        "valor50Porc",
        "latitud",
        "longitud",
      ];

      const value = formData[key];
      const isEmpty = value === null || value === undefined || value === "";

      if (isEmpty && !excepciones.includes(key)) {
        console.log("Campo inválido:", key, "valor:", value);
        newErrors[key] = true;
        hasErrors = true;
      }
    });

    if (incluyeCambioUso && !formData.tarifaCambioUso) {
      newErrors.tarifaCambioUso = true;
      hasErrors = true;
    }

    if (requiereCantDemo && !formData.cantDemoMovi.trim()) {
      newErrors.cantDemoMovi = true;
      hasErrors = true;
    }

    // Validar campo de área de construcción si aplica
    const requiereAreaConstruccion = formData.tipoConstruccion.some((t) => {
      const nombre = t.nombre_tarifa?.toUpperCase();
      return ![
        "DEMOLICIÓN",
        "MOVIMIENTO DE TIERRA",
        "CAMBIO DE USO O REMODELACIONES",
      ].includes(nombre);
    });

    if (requiereAreaConstruccion && !formData.areaConstruccion.trim()) {
      newErrors.areaConstruccion = true;
      hasErrors = true;
    }

    //Validaciones si es ampliación
    if (formData.esAmpliacion) {
      if (
        !formData.LICENCIAS_id_licencia_original &&
        formData.LICENCIAS_id_licencia_original !== 0
      ) {
        newErrors.LICENCIAS_id_licencia_original = true;
        hasErrors = true;
      }
      if (!formData.LICENCIAS_fecha_emisionL_original) {
        newErrors.LICENCIAS_fecha_emisionL_original = true;
        hasErrors = true;
      }
    }

    console.log("formData", formData);

    setErrors(newErrors);

    if (!hasErrors) {
      console.log("Datos del formulario:", formData);
      enviarTasa(formData);
    } else {
      console.warn("Errores encontrados: ", newErrors);
    }
  };

  const calcularTasa = (form) => {
    let valorPorcentaje = "";
    let valor50Porc = "";
    let totalPresupuesto = 0;
    let totalCancelar = 0;
    const tarifasData = [];

    const areaList = form.areaConstruccion
      .split("\n")
      .map((a) => parseFloat(a.trim()))
      .filter((a) => !isNaN(a));

    const cantDemoList = form.cantDemoMovi
      .split("\n")
      .map((a) => parseFloat(a.trim()))
      .filter((a) => !isNaN(a));

    const nivelesList = (form.nivelesConstruccion || "")
      .split("\n")
      .map((a) => parseFloat(a.trim()))
      .filter((a) => !isNaN(a));

    const areaCopy = [...areaList];
    const cantCopy = [...cantDemoList];

    for (const tipo of form.tipoConstruccion) {
      if (!tipo || !tipo.nombre_tarifa) continue;

      const nombre = tipo.nombre_tarifa.toUpperCase();

      const isCambioUso = nombre === "CAMBIO DE USO O REMODELACIONES";

      if (isCambioUso) {
        const baseCU = parseFloat(
          form.tarifaCambioUso?.TarifaCostoDimension?.costo_tarifa || 0
        );
        const areaCU = areaCopy.shift();

        if (areaCU && baseCU) {
          const subtotal1 = areaCU * baseCU;
          const subtotal2 = subtotal1 * 0.25;
          const subtotal3 = subtotal2 * 0.035;

          totalPresupuesto += subtotal2;
          totalCancelar += subtotal3;

          valorPorcentaje += `${areaCU}X${baseCU}=${subtotal1.toLocaleString(
            "es-GT"
          )}X25%=${subtotal2
            .toFixed(2)
            .toLocaleString("es-GT")}X3.5%=${subtotal3
            .toFixed(2)
            .toLocaleString("es-GT")}\n`;

          tarifasData.push({
            TARIFA_id_nombreTarifa: 32, // 32 ó form.tarifaCambioUso.id_nombreTarifa,
            dimension_construccion: areaCU,
            //formula: `${areaCU} x ${baseCU} x 25% x 3.5%`,
            formula: `${areaCU}X${baseCU}=${subtotal1.toLocaleString("es-GT")}X25%=${subtotal2.toFixed(2).toLocaleString("es-GT")}X3.5%=${subtotal3.toFixed(2).toLocaleString("es-GT")}`,
            valor: subtotal3,
          });
        }

        continue;
      }

      if (!tipo.TarifaCostoDimension) continue;

      const costo = parseFloat(tipo.TarifaCostoDimension.costo_tarifa || 0);
      const porcentaje = parseFloat(tipo.TarifaCostoDimension.porcentaje || 0);

      const isDemo = ["DEMOLICIÓN", "MOVIMIENTO DE TIERRA"].includes(nombre);
      const area = isDemo ? cantCopy.shift() : areaCopy.shift();

      if (!isNaN(area)) {
        const subtotal = area * costo;
        const valor = subtotal * (porcentaje / 100);

        totalPresupuesto += subtotal;
        totalCancelar += valor;

        valorPorcentaje += `${area}X${costo}=${subtotal.toLocaleString(
          "es-GT"
        )}X${porcentaje}%=${valor.toFixed(2).toLocaleString("es-GT")}\n`;

        tarifasData.push({
          TARIFA_id_nombreTarifa: tipo.id_nombreTarifa,
          dimension_construccion: area,
          //formula: `${area} x ${costo} x ${porcentaje}%`,
          formula: `${area}X${costo}=${subtotal.toLocaleString("es-GT")}X${porcentaje}%=${valor.toFixed(2).toLocaleString("es-GT")}`,
          valor,
        });

        // Calcular niveles adicionales
        if (
          tipo.TIPO_CONSTRUCCION_TARIFA_id_tipoConstruccion === 2 ||
          tipo.TIPO_CONSTRUCCION_TARIFA_id_tipoConstruccion === 3
        ) {
          nivelesList.forEach((nivelArea) => {
            const subtotalNivel = nivelArea * costo;
            const porcNivel = subtotalNivel * (porcentaje / 100);
            const valorNivel = porcNivel * 0.5;

            totalPresupuesto += subtotalNivel;
            totalCancelar += valorNivel;

            valor50Porc += `${nivelArea}X${costo}=${subtotalNivel.toLocaleString(
              "es-GT"
            )}X${porcentaje}%=${porcNivel
              .toFixed(2)
              .toLocaleString("es-GT")}X50%=${valorNivel
              .toFixed(2)
              .toLocaleString("es-GT")}\n`;

            tarifasData.push({
              TARIFA_id_nombreTarifa: tipo.id_nombreTarifa,
              dimension_construccion: nivelArea,
              //formula: `${nivelArea} x ${costo} x ${porcentaje}% x 50%`,
              formula: `${nivelArea}X${costo}=${subtotalNivel.toLocaleString("es-GT")}X${porcentaje}%=${porcNivel.toFixed(2).toLocaleString("es-GT")}X50%=${valorNivel.toFixed(2).toLocaleString("es-GT")}`,
              valor: valorNivel,
            });
          });
        }
      }
    }

    return {
      valorPorcentaje: valorPorcentaje.trim(),
      valor50Porc: valor50Porc.trim(),
      presupuestObra: totalPresupuesto.toFixed(2),
      cantidadCancelar: totalCancelar.toFixed(2),
      tarifasData,
    };
  };

  const mantenimientoPropietario = async () => {
    try {
      //Verificar si el propietario ya existe

      const response = await axios.get(
        `https://backdot.dotmunijalapa.org/api/propietarios/${formData.dpi}`,
        headers
      );
      const nombreBD = response.data.nombre_propietario?.trim().toLowerCase();
      const nombreFormulario = formData.nombrePropietario?.trim().toLowerCase();

      //Si el nombre cambió, actualizar
      if (nombreBD !== nombreFormulario) {
        await axios.put(
          `https://backdot.dotmunijalapa.org/api/propietarios/${formData.dpi}`,
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
          `https://backdot.dotmunijalapa.org/api/propietarios`,
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
        `https://backdot.dotmunijalapa.org/api/propietarios/${cui}`,
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

      //const { tarifasData } = calcularTasa(form);

      const parseMonedaToFloat = (valor) => {
        if (!valor) return 0;
        return parseFloat(valor.replace(/[Q,\s]/g, ""));
      };

      // Obtener los cálculos desde calcularTasa
      const { presupuestObra, cantidadCancelar, tarifasData } =
        calcularTasa(form);

      const tasaData = {
        fecha_emisionT: form.fechaRegistro,
        direccion_propiedad: form.direccionExacta,
        alineacion_urban: form.cuentaNoAlineacion === "si",
        anotaciones: form.anotaciones || null,
        cant_dem_movTierra: parseFloat(form.cantDemoMovi) || null,
        presupuesto_obra: parseMonedaToFloat(presupuestObra),
        cantidad_cancelar: parseMonedaToFloat(cantidadCancelar),
        documento: null,
        latitud: form.latitud || null,
        longitud: form.longitud || null,
        PROPIETARIOS_cui: parseInt(form.dpi),
        LICENCIAS_id_licencia_original:
          form.LICENCIAS_id_licencia_original || null,
        LICENCIAS_fecha_emisionL_original:
          form.LICENCIAS_fecha_emisionL_original || null,
      };

      const payload = { tasaData, tarifasData };
      console.log("Datos a enviar:", payload);

      const response = await axios.post(
        "https://backdot.dotmunijalapa.org/api/tasas",
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
          {initialData?.esAmpliacion ? "Ampliación" : "Crear Nueva Tasa"}
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
          disabled={formData.esAmpliacion}
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
          disabled={formData.esAmpliacion}
          error={Boolean(errors.dpi)}
        />

        <TextField
          name="nombrePropietario"
          label={getLabel("nombrePropietario", "NOMBRE DEL PROPIETARIO")}
          value={formData.nombrePropietario}
          onChange={handleChange}
          fullWidth
          required
          disabled={formData.esAmpliacion}
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
        {formData.tipoConstruccion.some(
          (t) =>
            t.TIPO_CONSTRUCCION_TARIFA_id_tipoConstruccion === 2 ||
            t.TIPO_CONSTRUCCION_TARIFA_id_tipoConstruccion === 3
        ) && (
          <TextField
            label="ÁREA DE SEGUNDO NIVEL O MÁS"
            name="nivelesConstruccion"
            value={formData.nivelesConstruccion}
            onChange={handleChange}
            fullWidth
            multiline
            margin="normal"
            //placeholder="Ej: 80\n75\n60"
          />
        )}
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
        {formData.tipoConstruccion.some(
          (t) =>
            t.TIPO_CONSTRUCCION_TARIFA_id_tipoConstruccion === 2 ||
            t.TIPO_CONSTRUCCION_TARIFA_id_tipoConstruccion === 3
        ) && (
          <TextField
            label="50% DEL VALOR DE LA LICENCIA SEGÚN LOS PLANOS PRESENTADOS DEL SEGUNDO NIVEL O MÁS NIVELES"
            name="valor50Porc"
            value={formData.valor50Porc}
            fullWidth
            margin="normal"
            multiline
            disabled
            InputProps={{
              readOnly: true,
            }}
          />
        )}
        <TextField
          name="latitud"
          label={getLabel("latitud", "LATITUD (opcional)")}
          value={formData.latitud}
          onChange={handleChange}
          //disabled={formData.esAmpliacion}
        />

        <TextField
          name="longitud"
          label={getLabel("longitud", "  LONGITUD (opcional)")}
          value={formData.longitud}
          onChange={handleChange}
          //disabled={formData.esAmpliacion}
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
        <input
          type="hidden"
          name="LICENCIAS_id_licencia_original"
          value={formData.LICENCIAS_id_licencia_original || ""}
        />
        <input
          type="hidden"
          name="LICENCIAS_fecha_emisionL_original"
          value={formData.LICENCIAS_fecha_emisionL_original || ""}
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
