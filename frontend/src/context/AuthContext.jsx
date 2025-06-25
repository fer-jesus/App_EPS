import { createContext, useContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({
    isAuthenticated: false,
    user: null, 
  });

  // Cargar usuario desde localStorage (si ya inició sesión antes)
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) {
      setAuth({ isAuthenticated: true, user });
    }
  }, []);

  const login = (userData) => {
    //console.log("Datos del usuario al hacer login:", userData);
    if (!userData?.id_usuario) {
      console.error("Datos de usuario incompletos en login:", userData);
      return;
    }

    console.log("Datos del usuario al hacer login:", userData);
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", userData.token); //Guarda el token
    setAuth({ isAuthenticated: true, user: userData });
  };

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token"); //Limpia el token
    setAuth({ isAuthenticated: false, user: null });
  };

  return (
    <AuthContext.Provider value={{ auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook personalizado
export const useAuth = () => useContext(AuthContext);
