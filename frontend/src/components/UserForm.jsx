import { useEffect, useState } from "react";
import {
  Stack,
  TextField,
  MenuItem,
  Typography,
  Button,
  Box,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import dayjs from "dayjs";

const UserForm = ({ onSubmit, initialData = {}, onClose }) => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const [formData, setFormData] = useState({
    nombre: "",
    titulo: "",
    fechaNacimiento: "",
    edad: "",
    sexo: "", 
    rol: "",
    unidad: "",
    fechaRegistro: "",
    fechaBaja: "",
    correo: "",
    contraseña: "",
    valContraseña: "",
    ...initialData,
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (formData.fechaNacimiento) {
      const birthDate = dayjs(formData.fechaNacimiento);
      const today = dayjs();
      const edad = today.diff(birthDate, "year");
      setFormData((prev) => ({ ...prev, edad: edad.toString() }));
    }
  }, [formData.fechaNacimiento]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setErrors((prev) => ({ ...prev, [name]: false }));
  };

  const validate = () => {
    const newErrors = {};
    Object.entries(formData).forEach(([key, value]) => {
      if (!value && key !== "edad" && key !== "fechaBaja") {
        newErrors[key] = true;
      }
    });

    // Validacion de correo
    if (formData.correo && !formData.correo.includes("@")) {
      newErrors.correo = "El correo debe contener @";
    }

    // Validacion de contraseña
    if (
      formData.contraseña &&
      formData.valContraseña &&
      formData.contraseña !== formData.valContraseña
    ) {
      newErrors.valContraseña = "Las contraseñas no coinciden";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      onSubmit(formData);
    }
  };

  const getLabel = (name, label) =>
    errors[name] ? "Rellena este campo" : label;

  return (
    <Box sx={{ p: 2 }}>
      <Stack spacing={2}>
        <Typography variant="h6" textAlign="center" fontWeight="bold">
          {initialData?.id ? "Editar Usuario" : "Registrar Usuario"}
        </Typography>

        <TextField
          label={getLabel("nombre", "Nombre completo")}
          name="nombre"
          value={formData.nombre}
          onChange={handleChange}
          fullWidth
          required
          error={Boolean(errors.nombre)}
        />
        <TextField
          label={getLabel("titulo", "Título")}
          name="titulo"
          value={formData.titulo}
          onChange={handleChange}
          fullWidth
          required
          error={Boolean(errors.titulo)}
        />
        <TextField
          type="date"
          name="fechaNacimiento"
          value={formData.fechaNacimiento}
          onChange={handleChange}
          fullWidth
          required
          InputLabelProps={{ shrink: true }}
          label={getLabel("fechaNacimiento", "Fecha de nacimiento")}
          error={Boolean(errors.fechaNacimiento)}
        />
        <TextField
          label="Edad"
          name="edad"
          value={formData.edad}
          fullWidth
          disabled
        />
        <TextField
          select
          label={getLabel("sexo", "Sexo")}
          name="sexo"
          value={formData.sexo}
          onChange={handleChange}
          fullWidth
          required
          error={Boolean(errors.sexo)}
        >
          <MenuItem value="masculino">M</MenuItem>
          <MenuItem value="femenino">F</MenuItem>
          <MenuItem value="indefinido">--</MenuItem>
        </TextField>
        <TextField
          select
          label={getLabel("rol", "Rol")}
          name="rol"
          value={formData.rol}
          onChange={handleChange}
          fullWidth
          required
          error={Boolean(errors.rol)}
        >
          <MenuItem value="director">DIRECTOR</MenuItem>
          <MenuItem value="subdirector">SUBDIRECTOR</MenuItem>
          <MenuItem value="coordinador">COORDINADOR</MenuItem>
          <MenuItem value="coordinador interino">COORDINADOR INTERINO</MenuItem>
        </TextField>
        <TextField
          select
          label={getLabel("unidad", "Unidad")}
          name="unidad"
          value={formData.unidad}
          onChange={handleChange}
          fullWidth
          required
          error={Boolean(errors.unidad)}
        >
          <MenuItem value="dirección">
            DIRECCIÓN DE ORDENAMIENTO TERRITORIAL Y DESARROLLO MUNICIPAL
          </MenuItem>
          <MenuItem value="coordinador">
            PROYECTOS URBANOS - LICENCIAS DE CONSTRUCCIÓN
          </MenuItem>
        </TextField>
        <TextField
          type="date"
          name="fechaRegistro"
          label={getLabel("fechaRegistro", "Fecha de registro")}
          value={formData.fechaRegistro}
          onChange={handleChange}
          fullWidth
          required
          InputLabelProps={{ shrink: true }}
          error={Boolean(errors.fechaRegistro)}
        />
        <TextField
          type="date"
          name="fechaBaja"
          label="Fecha de baja"
          value={formData.fechaBaja || ""}
          onChange={handleChange}
          fullWidth
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          type="email"
          name="correo"
          label={
            errors.correo === "El correo debe contener @"
              ? "El correo debe contener @"
              : getLabel("correo", "Correo electrónico")
          }
          value={formData.correo}
          onChange={handleChange}
          fullWidth
          required
          error={Boolean(errors.correo)}
        />
        <TextField
          type="password"
          name="contraseña"
          label={getLabel("contraseña", "Contraseña")}
          value={formData.contraseña}
          onChange={handleChange}
          fullWidth
          required
          error={Boolean(errors.contraseña)}
        />
        <TextField
          type="password"
          name="valContraseña"
          label={
            errors.valContraseña === "Las contraseñas no coinciden"
              ? "Las contraseñas no coinciden"
              : getLabel("valContraseña", "Valida la contraseña")
          }
          value={formData.valContraseña}
          onChange={handleChange}
          fullWidth
          required
          error={Boolean(errors.valContraseña)}
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

export default UserForm;
