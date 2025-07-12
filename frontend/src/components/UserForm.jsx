import { useEffect, useState } from "react";
import {
  Stack,
  TextField,
  MenuItem,
  Typography,
  Button,
  Box,
  //useMediaQuery,
} from "@mui/material";
import PropTypes from "prop-types";
import Swal from "sweetalert2";
import axios from "axios";
//import { useTheme } from "@mui/material/styles";
import dayjs from "dayjs";

const UserForm = ({ onSubmit, initialData = {}, onClose }) => {
  //const theme = useTheme();
  //const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  // Estado para manejar los datos del formulario
  const [formData, setFormData] = useState({
    nombre: "",
    titulo: "",
    fechaNacimiento: "",
    edad: "",
    sexo: "",
    ROL_id_rol: "",
    unidad: "",
    fechaRegistro: "",
    //fechaBaja: "",
    correo: "",
    contraseña: "",
    valContraseña: "",
  });

  const [errors, setErrors] = useState({});

  // Inicializar los datos del formulario si se proporcionan datos iniciales
  useEffect(() => {
    if (initialData) {
      setFormData({
        id: initialData.id_usuario,
        nombre: initialData.nombre || "",
        titulo: initialData.titulo || "",
        fechaNacimiento: initialData.fecha_nacimiento
          ? dayjs(initialData.fecha_nacimiento).format("YYYY-MM-DD")
          : "",
        sexo: initialData.sexo || "",
        ROL_id_rol: initialData.ROL_id_rol || "",
        unidad: initialData.unidad || "",
        fechaRegistro: initialData.fecha_registro
          ? dayjs(initialData.fecha_registro).format("YYYY-MM-DD")
          : "",
        // fechaBaja: initialData.fecha_de_baja
        //   ? dayjs(initialData.fecha_de_baja).format("YYYY-MM-DD")
        //   : "",
        correo: initialData.correo || "",
        contraseña: "",
        valContraseña: "",
        edad: "",
      });
    }
  }, [initialData]);

  // Calcular la edad cuando se cambia la fecha de nacimiento
  useEffect(() => {
    if (formData.fechaNacimiento) {
      const birthDate = dayjs(formData.fechaNacimiento);
      const today = dayjs();
      const edad = today.diff(birthDate, "year");
      setFormData((prev) => ({ ...prev, edad: edad.toString() }));
    }
  }, [formData.fechaNacimiento]);

  // Manejar cambios en los campos del formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setErrors((prev) => ({ ...prev, [name]: false }));
  };

  // Validar los campos del formulario
  const validate = () => {
    const newErrors = {};
    Object.entries(formData).forEach(([key, value]) => {
      if (!value && key !== "edad" && key !== "fechaBaja" && key !== "titulo") {
        // Aquí se validan también contraseña y valContraseña, incluso si están ocultos
        if (
          !initialData?.id_usuario ||
          (key !== "contraseña" && key !== "valContraseña")
        ) {
          newErrors[key] = true;
        }
      }
    });

    // Validación de correo
    if (formData.correo && !formData.correo.includes("@")) {
      newErrors.correo = "El correo debe contener @";
    }

    // Validación de contraseñas solo si estamos en modo creación
    if (
      !initialData?.id_usuario &&
      formData.contraseña &&
      formData.valContraseña &&
      formData.contraseña !== formData.valContraseña
    ) {
      newErrors.valContraseña = "Las contraseñas no coinciden";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  // Manejar el envío del formulario
  const handleSubmit = async () => {
    if (validate()) {
      try {
        // Obtener el token de localStorage y configuración de los headers
        const token = localStorage.getItem("token");
        const headers = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };

        const payload = {
          nombre: formData.nombre,
          titulo: formData.titulo || null,
          fecha_nacimiento: formData.fechaNacimiento,
          correo: formData.correo,
          contrasena: formData.contraseña,
          unidad: formData.unidad,
          sexo: formData.sexo,
          ROL_id_rol: formData.ROL_id_rol,
          fecha_registro: formData.fechaRegistro,
          // en_funciones: 1,
          //fecha_de_baja: formData.fechaBaja || null,
          // Solo incluir fecha_baja si tiene valor y estamos editando
          // ...(initialData?.id_usuario && {
          //   fecha_de_baja: formData.fechaBaja || null,
          // }),
        };

        if (initialData?.id_usuario) {
          //const userId = JSON.parse(localStorage.getItem("user"))?.id_usuario;
          // console.log("userId enviado:", userId);
          // console.log("Payload enviado:", payload);

          // Editar usuario existente
          const response = await axios.put(
            `http://localhost:3001/api/usuarios/${initialData.id_usuario}`,
            payload,
            headers
            // {
            //   headers: {
            //     "x-user-id": JSON.parse(localStorage.getItem("user"))
            //       ?.id_usuario,
            //   },
            // }
          );
          console.log("Código de estado:", response.status);
          onClose();
          await Swal.fire({
            icon: "success",
            title: "¡Actualizado!",
            text: "El usuario ha sido actualizado correctamente",
            timer: 2000,
            showConfirmButton: false,
          });

          // Actualiza la tabla con los nuevos datos
          onSubmit({
            ...initialData,
            ...payload,
            id_usuario: initialData.id_usuario,
          });
        } else {
          // const userId = JSON.parse(localStorage.getItem("user"))?.id_usuario;
          // console.log("userId enviado:", userId);
          // console.log("Payload enviado:", payload);

          // Crear nuevo usuario
          const response = await axios.post(
            "http://localhost:3001/api/crearusuarios",
            payload, headers
            // {
            //   headers: {
            //     "x-user-id": JSON.parse(localStorage.getItem("user"))
            //       ?.id_usuario,
            //   },
            // }
          );
          
          console.log("Usuario creado con ID:", response.data);
          payload.id_usuario = response.data.id;
          onSubmit(payload); // Llamada a onSubmit con el nuevo usuario
          console.log("Nuevo usuario enviado:", payload);
        }
      } catch (error) {
        console.error("Error al enviar datos:", error);
      }
    }
  };

  const getLabel = (name, label) =>
    errors[name] ? "Rellena este campo" : label;

  return (
    <Box sx={{ p: 2 }}>
      <Stack spacing={2}>
        <Typography variant="h6" textAlign="center" fontWeight="bold">
          {initialData?.id_usuario ? "Editar Usuario" : "Registrar Usuario"}
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
        {!initialData?.id_usuario && (
          <TextField
            label="Edad"
            name="edad"
            value={formData.edad}
            fullWidth
            disabled
          />
        )}
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
          <MenuItem value="M">M</MenuItem>
          <MenuItem value="F">F</MenuItem>
        </TextField>
        <TextField
          select
          label={getLabel("ROL_id_rol", "Rol")}
          name="ROL_id_rol"
          value={formData.ROL_id_rol}
          onChange={handleChange}
          fullWidth
          required
          error={Boolean(errors.ROL_id_rol)}
        >
          <MenuItem value={1}>DIRECTOR</MenuItem>
          <MenuItem value={2}>SUBDIRECTOR</MenuItem>
          <MenuItem value={3}>COORDINADOR</MenuItem>
          <MenuItem value={5}>DIRECTOR INTERINO</MenuItem>
          <MenuItem value={6}>SUBDIRECTOR INTERINO</MenuItem>
          <MenuItem value={4}>COORDINADOR INTERINO</MenuItem>
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
          <MenuItem value="DIRECCION DE ORDENAMIENTO TERRITORIAL Y DESARROLLO MUNICIPAL">
            DIRECCIÓN DE ORDENAMIENTO TERRITORIAL Y DESARROLLO MUNICIPAL
          </MenuItem>
          <MenuItem value="LICENCIAS DE CONSTRUCCION">
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
        {/* {initialData?.id_usuario && (
          <TextField
            type="date"
            name="fechaBaja"
            label="Fecha de baja"
            value={formData.fechaBaja || ""}
            onChange={handleChange}
            fullWidth
            InputLabelProps={{ shrink: true }}
          />
        )} */}
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
        {!initialData?.id_usuario && (
          <>
            <TextField
              type="password"
              name="contraseña"
              label={getLabel("contraseña", "Contraseña")}
              value={formData.contraseña || ""}
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
              value={formData.valContraseña || ""}
              onChange={handleChange}
              fullWidth
              required
              error={Boolean(errors.valContraseña)}
            />
          </>
        )}
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

UserForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  onClose: PropTypes.func,
  initialData: PropTypes.object,
};

export default UserForm;
