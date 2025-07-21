import { useAuth } from "../context/AuthContext";
import { Navigate, useLocation } from "react-router-dom";
import ModalCambioContrasena from "../components/ModalCambioContrasena";

const ProtectedRoute = ({ children }) => {
  const { auth } = useAuth();
  const location = useLocation();

  // Si el usuario no está autenticado, redirige al login
  if (!auth.isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // Mostrar modal solo si la contraseña es temporal y no estás en la ruta de cambio
  const mostrarModal =
    auth.user?.es_contrasena_temporal &&
    location.pathname !== "/actualizar-contrasena";

   return (
    <>
      {children}
      {mostrarModal && <ModalCambioContrasena />}
    </>
  );
};

export default ProtectedRoute;
