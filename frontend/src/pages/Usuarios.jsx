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
  const [selectedUsers, setSelectedUsers] = useState([]);
  const { auth } = useAuth();
  const currentUserId = auth?.user?.id_usuario;

  // Obtener usuarios desde la API
  useEffect(() => {
    const fetchUsuarios = async () => {
      try {
        const res = await axios.get("http://localhost:3001/api/usuarios");
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
          fecha_baja: u.fecha_baja,
          rol: u.rol,
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
      const res = await axios.get(`http://localhost:3001/api/usuarios/${user.id}`, {
        headers: {
          "x-user-id": currentUserId
        }
      });
      setSelectedUser(res.data.usuario);
    } catch (error) {
      console.error("Error al cargar usuario:", error);
      // Muestra error al usuario
      Swal.fire({
        title: "Error",
        text: "No se pudieron cargar los datos del usuario",
        icon: "error"
      });
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

      const headers = {
        headers: {
          "x-user-id": currentUserId,
        },
      };

      // Si existe ID, es edición
      if (data.id) {
        await axios.put(
          `http://localhost:3001/api/usuarios/${data.id}`,
          data,
          headers
        );
      }

      // Recarga de usuarios después de crear o editar
      const res = await axios.get("http://localhost:3001/api/usuarios");
      const usuariosFormateados = res.data.usuarios.map((u) => ({
        id: u.id_usuario,
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

  const handleDelete = async (id) => {
    const confirmResult = await Swal.fire({
      title: "¿Estás seguro que deseas eliminar este usuario?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      reverseButtons: true,
    });
    if (!confirmResult.isConfirmed) return;
    try {
      // Llamada al backend para eliminar el usuario
      await axios.delete(`http://localhost:3001/api/usuarios/${id}`, {
        headers: {
          "x-user-id": auth.user.id_usuario,
        },
      });

      // Actualizar el listado tras eliminar
      const res = await axios.get("http://localhost:3001/api/usuarios");
      const usuariosFormateados = res.data.usuarios.map((u) => ({
        id: u.id_usuario,
        ...u,
      }));
      setUsuarios(usuariosFormateados);
      //Swal.fire("Eliminado", "El usuario fue eliminado correctamente.", "success");
    } catch (error) {
      if (
        error.response?.status === 400 &&
        error.response.data.error === "No se puede eliminar al usuario DIRECTOR"
      ) {
        Swal.fire({
          title: "Operación no permitida",
          text: "No se puede eliminar al usuario DIRECTOR",
          icon: "error",
          confirmButtonText: "Entendido",
        });
      } else {
        Swal.fire({
          title: "Error",
          text: "Hubo un error al intentar eliminar el usuario.",
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
      renderCell: (params) => (
        <>
          <IconButton
            color={
              selectedUsers.includes(params.row.id) ? "success" : "default"
            }
            sx={{
              color: selectedUsers.includes(params.row.id)
                ? "#4caf50"
                : "rgba(0, 0, 0, 0.54)",
              "&:hover": {
                color: selectedUsers.includes(params.row.id)
                  ? "#388e3c"
                  : "rgba(0, 0, 0, 0.74)",
              },
            }}
            onClick={() => {
              const userId = params.row.id;
              setSelectedUsers((prev) =>
                prev.includes(userId)
                  ? prev.filter((id) => id !== userId)
                  : [...prev, userId]
              );
            }}
          >
            <CheckCircleIcon />
          </IconButton>
          <IconButton color="primary" onClick={() => handleOpen(params.row)}>
            <EditIcon />
          </IconButton>
          <IconButton color="error" onClick={() => handleDelete(params.row.id)}>
            <DeleteIcon />
          </IconButton>
        </>
      ),
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
