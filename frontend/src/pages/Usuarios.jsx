import { useState } from "react";
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
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import AppNavbar from "../components/AppNavBar";
import UserForm from "../components/UserForm";

const AdminUsuarios = () => {
  const [usuarios, setUsuarios] = useState([
    { id: 1, nombre: "Jhon Wick", rol: "Director" },
    { id: 2, nombre: "El Principito", rol: "Coordinador" },
  ]);

  const [openDialog, setOpenDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedUsers, setSelectedUsers] = useState([]);

  const handleOpen = (user = null) => {
    setSelectedUser(user);
    setOpenDialog(true);
  };

  const handleClose = () => {
    setSelectedUser(null);
    setOpenDialog(false);
  };

  const handleSaveUser = (data) => {
    if (selectedUser) {
      setUsuarios((prev) =>
        prev.map((u) => (u.id === selectedUser.id ? { ...u, ...data } : u))
      );
    } else {
      const newUser = { id: Date.now(), ...data };
      setUsuarios((prev) => [...prev, newUser]);
    }
    handleClose();
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

  const handleDelete = (id) => {
    setUsuarios((prev) => prev.filter((u) => u.id !== id));
  };

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
              onSubmit={handleSaveUser}
              onClose={handleClose}
              initialData={selectedUser}
            />
          </DialogContent>
        </Dialog>
      </Container>
    </>
  );
};

export default AdminUsuarios;
