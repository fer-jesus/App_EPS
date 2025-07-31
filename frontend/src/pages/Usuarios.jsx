import { useState, useEffect } from "react";
import axios from "axios";
import {
  Container,
  Typography,
  Button,
  Dialog,
  DialogContent,
  IconButton,
  Box,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/PersonAdd";
import Swal from "sweetalert2";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import AppNavbar from "../components/AppNavBar";
import UserForm from "../components/UserForm";
import { useAuth } from "../context/AuthContext";


const AdminUsuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  //const [selectedUsers, setSelectedUsers] = useState([]);
  const { auth } = useAuth();
  const currentUserId = auth?.user?.id_usuario;
  const token = localStorage.getItem("token");

  const headers = {
  headers: {
    Authorization: `Bearer ${token}`,
  },
};

  // Obtener usuarios desde la API
  useEffect(() => {
    const fetchUsuarios = async () => {
      try {
        const res = await axios.get("https://front_dot.dotmunijalapa.org/api/usuarios", headers);
        const usuariosFormateados = res.data.usuarios.map((u) => ({
          id: u.id_usuario,
          nombre: u.nombre,
          titulo: u.titulo,
          fecha_nacimiento: u.fecha_nacimiento,
          correo: u.correo,
          unidad: u.unidad,
          sexo: u.sexo,
          ROL_id_rol: u.ROL_id_rol,
          fecha_registro: u.fecha_registro,
          fecha_de_baja: u.fecha_de_baja,
          en_funciones: u.en_funciones,
          rol: u.nombre_rol,
        }));
        setUsuarios(usuariosFormateados);
      } catch (error) {
        console.error("Error al obtener usuarios", error);
      }
    };

    fetchUsuarios();
  }, []);

  const handleOpen = async (user = null) => {
    if (user?.id) {
      try {
        const res = await axios.get(
          `https://front_dot.dotmunijalapa.org/api/usuarios/${user.id}`, headers
          // {
          //   headers: {
          //     "x-user-id": currentUserId,
          //   },
          // }
        );
        console.log(res.data.usuarios);
        // console.log("Respuesta completa de backend:", res.data);
        // console.log("en_funciones recibido:", res.data.usuario?.en_funciones);

        setSelectedUser(res.data.usuario);
      } catch (error) {
        console.error("Error al cargar usuario:", error);
        // Muestra error al usuario
        // Swal.fire({
        //   title: "Error",
        //   text: "No se pudieron cargar los datos del usuario",
        //   icon: "error",
        // });
        alert("Error al cargar usuario: " + error.message);
      }
    } else {
      setSelectedUser(null); // Para creación de nuevo usuario
    }
    setOpenDialog(true);
  };

  const handleClose = () => {
    setOpenDialog(false);
    setSelectedUser(null);
  };

  const handleSaveUser = async (data) => {
    try {
      if (!currentUserId) {
        console.warn("No hay usuario autenticado.");
        return;
      }

      // const headers = {
      //   headers: {
     
      //     "x-user-id": currentUserId,
      //   },
      // };

      // Si existe ID, es edición
      if (data.id_usuario) {
        await axios.put(
          `https://front_dot.dotmunijalapa.org/api/usuarios/${data.id_usuario}`,
          data,
          headers
        );
      }

      // Recarga de usuarios después de crear o editar
      const res = await axios.get("https://front_dot.dotmunijalapa.org/api/usuarios", headers);
      const usuariosFormateados = res.data.usuarios.map((u) => ({
        id: u.id_usuario,
        rol: u.nombre_rol,
        ...u,
      }));
      setUsuarios(usuariosFormateados);
      handleClose();
    } catch (error) {
      if (error.response?.status === 403) {
        console.error("Acceso denegado: este usuario no tiene permisos.");
      } else if (error.response?.status === 401) {
        console.error("No autenticado: sesión no válida.");
      } else {
        console.error("Error al guardar usuario", error);
      }
    }
  };

  const actualizarEstadoFuncion = async (id_usuario, nuevoEstado) => {
    try {
      const valorParaBackend = nuevoEstado ? 1 : 0;

      const response = await axios.put(
        `https://front_dot.dotmunijalapa.org/api/usuarios/${id_usuario}/en-funciones`,
        { en_funciones: valorParaBackend },
        // {
        //   headers: {
        //     "x-user-id": currentUserId,
        //   },
        // }
        headers
      );
      const estadoConfirmado = Boolean(response.data.en_funciones);
      // Actualizar el array de usuarios localmente
      // setUsuarios((prev) =>
      //   prev.map((u) =>
      //     u.id === id_usuario ? { ...u, en_funciones: estadoConfirmado } : u
      //   )
      // );
      const res = await axios.get("https://front_dot.dotmunijalapa.org/api/usuarios", headers);
      const usuariosFormateados = res.data.usuarios.map((u) => ({
        id: u.id_usuario,
        nombre: u.nombre,
        titulo: u.titulo,
        fecha_nacimiento: u.fecha_nacimiento,
        correo: u.correo,
        unidad: u.unidad,
        sexo: u.sexo,
        ROL_id_rol: u.ROL_id_rol,
        fecha_registro: u.fecha_registro,
        fecha_de_baja: u.fecha_de_baja,
        en_funciones: u.en_funciones ? 1 : 0,
        rol: u.nombre_rol,
      }));
      console.log("Usuarios actualizados:", usuariosFormateados);
      setUsuarios(usuariosFormateados);

      Swal.fire({
        icon: estadoConfirmado ? "success" : "info",
        title: estadoConfirmado
          ? "Usuario ACTIVADO en funciones"
          : "Usuario DESACTIVADO de funciones",
        showConfirmButton: false,
        timer: 2000,
        customClass: {
          icon: estadoConfirmado ? "swal-icon-success" : "swal-icon-info",
        },
      });
    } catch (error) {
      console.error("Error al actualizar en_funciones:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo actualizar el estado de funciones.",
      });
    }
  };

  const handleDelete = async (id) => {
    const confirmResult = await Swal.fire({
      title: "¿Estás seguro que quieres dar de BAJA a este usuario?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, dar de BAJA",
      cancelButtonText: "Cancelar",
      reverseButtons: true,
    });
    if (!confirmResult.isConfirmed) return;
    try {
      // Llamada al backend para eliminar el usuario
      await axios.delete(`https://front_dot.dotmunijalapa.org/api/usuarios/${id}`, headers
      //   {
      //   headers: {
      //     "x-user-id": auth.user.id_usuario,
      //   },
      // }
    );

      // Actualizar el listado tras eliminar
      const res = await axios.get("https://front_dot.dotmunijalapa.org/api/usuarios", headers);
      const usuariosFormateados = res.data.usuarios.map((u) => ({
        id: u.id_usuario,
        rol: u.nombre_rol,
        ...u,
      }));
      setUsuarios(usuariosFormateados);
    } catch (error) {
      const mensajeError = error.response?.data?.error;

      if (
        mensajeError?.startsWith("No se puede eliminar. Debe haber al menos un")
      ) {
        Swal.fire({
          title: "No se puede eliminar",
          text: mensajeError,
          icon: "error",
          confirmButtonText: "Entendido",
        });
      } else if (mensajeError === "Usuario no encontrado") {
        Swal.fire({
          title: "Usuario no encontrado",
          text: "El usuario que intenta dar de baja ya no existe.",
          icon: "warning",
          confirmButtonText: "Aceptar",
        });
      } else {
        Swal.fire({
          title: "Error",
          text:
            mensajeError || "Hubo un error al intentar dar de BAJA al usuario.",
          icon: "error",
          confirmButtonText: "Cerrar",
        });
      }
    }
  };

  const columns = [
    { field: "nombre", headerName: "Nombre", flex: 1 },
    { field: "rol", headerName: "Rol", flex: 1 },
    {
      field: "acciones",
      headerName: "Acciones",
      renderCell: (params) => {
        const enFunciones = Boolean(params.row.en_funciones);
        console.log("Estado en funciones:", enFunciones);
        //const rolUsuario = params.row.rol;
        return (
          <>
            <IconButton
              color={enFunciones ? "success" : "default"}
              sx={{
                color: enFunciones ? "#4caf50" : "rgba(0, 0, 0, 0.54)",
                "&:hover": {
                  color: enFunciones ? "#388e3c" : "rgba(0, 0, 0, 0.74)",
                },
              }}
              onClick={() => {
                const userId = params.row.id;
                //const nuevoEstado = !Boolean(params.row.en_funciones);
                actualizarEstadoFuncion(userId, !enFunciones);
              }}
            >
              <CheckCircleIcon />
            </IconButton>
            <IconButton color="primary" onClick={() => handleOpen(params.row)}>
              <EditIcon />
            </IconButton>
            {/* {(rolUsuario !== "DIRECTOR" && rolUsuario !== "SUBDIRECTOR" && rolUsuario !== "DIRECTORA" && rolUsuario !== "SUBDIRECTORA") && (
            )} */}
            {!(
              params.row.id === auth.user.id_usuario &&
              (auth.user.rol === "DIRECTOR" ||
                auth.user.rol === "DIRECTORA" ||
                auth.user.rol === "SUBDIRECTOR" ||
                auth.user.rol === "SUBDIRECTORA")
            ) && (
              <IconButton
                color="error"
                onClick={() => handleDelete(params.row.id)}
              >
                <DeleteIcon />
              </IconButton>
            )}
          </>
        );
      },
      width: 160,
    },
  ];

  return (
    <>
      <AppNavbar />
      <Container sx={{ mt: 4 }}>
        <Typography variant="h5" textAlign="center" fontWeight="bold" mb={3}>
          Administración de Usuarios
        </Typography>

        <Box display="flex" justifyContent="flex-end" mb={2}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            sx={{
              backgroundColor: "#F2C037",
              "&:hover": { backgroundColor: "#d9aa2e" },
              fontWeight: "bold",
            }}
            onClick={() => handleOpen()}
          >
            Crear Usuario
          </Button>
        </Box>

        <Box
          sx={{
            height: 400,
            width: "100%",
            overflow: "auto", // Permite scroll horizontal en móviles
          }}
        >
          <DataGrid
            rows={usuarios}
            columns={columns}
            pageSize={5}
            density="standard"
            sx={{
              "& .MuiDataGrid-columnHeader": {
                backgroundColor: "#D0D3D4", // Fondo distintivo para headers
                "& .MuiDataGrid-columnHeaderTitle": {
                  fontWeight: "bold",
                  fontSize: { xs: "0.9rem", sm: "1rem" },
                },
              },
              "& .MuiDataGrid-cell": {
                fontSize: { xs: "0.9rem", sm: "1rem" },
                whiteSpace: "normal", // Permite múltiples líneas en celdas
                padding: "8px",
              },
            }}
          />
        </Box>

        <Dialog
          open={openDialog}
          onClose={handleClose}
          fullWidth
          maxWidth="sm"
          PaperProps={{
            sx: {
              mx: { xs: 2, sm: "auto" },
              width: {
                xs: "100%", // 100% en pantallas pequeñas
                sm: "90%", // un poco de margen en tablets
                md: "70%", // más compacto en pantallas medianas
                lg: "500px", // ancho fijo en pantallas grandes },
              },
            },
          }}
        >
          <DialogContent>
            <UserForm
              initialData={selectedUser}
              onSubmit={handleSaveUser}
              onClose={handleClose}
            />
          </DialogContent>
        </Dialog>
      </Container>
    </>
  );
};

export default AdminUsuarios;
