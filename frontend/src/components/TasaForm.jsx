import { useState, useEffect } from "react";
import {
  TextField,
  Button,
  Box,
  Typography,
  Stack,
  MenuItem,
} from "@mui/material";
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

  // Cargar tarifas desde el backend
  useEffect(() => {
    const fetchTarifas = async () => {
      try {
        const res = await axios.get("http://localhost:3001/api/tarifas");
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
        if (!formData.tarifaCambioUso || !formData.tarifaCambioUso.TarifaCostoDimension) return;

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
          )}X25%=${subtotal2.toFixed(2).toLocaleString("es-GT")}X3.5%=${subtotal3
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
      presupuestObra: `Q. ${totalPresupuesto
        .toFixed(2)
        .toLocaleString("es-GT")}`,
      cantidadCancelar: `Q. ${totalCancelar
        .toFixed(2)
        .toLocaleString("es-GT")}`,
    }));
  }, [
    formData.tipoConstruccion,
    formData.areaConstruccion,
    formData.cantDemoMovi,
    formData.tarifaCambioUso,
  ]);


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
      if (!formData[key] && key !== "anotaciones" && key !== "cantDemoMovi") {
        newErrors[key] = true;
        hasErrors = true;
      }
    });

    setErrors(newErrors);

    if (!hasErrors) {
      console.log("Datos del formulario:", formData);
      onSubmit(formData);
    }
  };

  // const buscarPropietarioPorCUI = async (cui) => {
  //   try {
  //     const response = await axios.get(`http://localhost:3001/api/propietarios/${cui}`);
  //     if (response.data && response.data.nombre) {
  //       setFormData((prev) => ({
  //         ...prev,
  //         nombrePropietario: response.data.nombre,
  //       }));
  //     } else {
  //       setFormData((prev) => ({
  //         ...prev,
  //         nombrePropietario: "",
  //       }));
  //     }
  //   } catch (error) {
  //     console.error("Error al buscar propietario:", error);
  //     setFormData((prev) => ({
  //       ...prev,
  //       nombrePropietario: "",
  //     }));
  //   }
  // };

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
          fullWidth
          required
          error={Boolean(errors.dpi)}
        />
        {/* <TextField
          name="dpi"
          label={getLabel("dpi", "DPI")}
          value={formData.dpi}
          onChange={handleChange}
          onBlur={() => buscarPropietarioPorCUI(formData.dpi)} // 
          fullWidth
          required
          error={Boolean(errors.dpi)}
        /> */}
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

        {/* <TextField
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
        /> */}

        {/* <TextField
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
        /> */}
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
          required
          multiline
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
