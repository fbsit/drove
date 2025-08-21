
import React, { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const ProfileRedirect = () => {
  const { user } = useAuth();
  const location = useLocation();

  console.log("=== ProfileRedirect Debug - DETALLADO ===");
  console.log("Usuario actual:", user);
  console.log("Tipo de usuario:", user?.user_type);
  console.log("Ruta actual:", location.pathname);
  console.log("User completo:", JSON.stringify(user, null, 2));
  console.log("¿Usuario es null o undefined?", !user);
  console.log("¿user_type existe?", user?.user_type);
  console.log("=== FIN DEBUG ProfileRedirect ===");

  useEffect(() => {
    console.log("ProfileRedirect useEffect - Usuario:", user?.user_type);
    console.log("ProfileRedirect useEffect - Usuario completo:", user);
  }, [user]);

  if (!user) {
    console.log("❌ No hay usuario, redirigiendo a login");
    return <Navigate to="/login" replace />;
  }

  console.log("✅ Usuario encontrado, procesando redirección...");
  console.log("💡 user_type detectado:", user.user_type);

  // Redirigir según el tipo de usuario
  switch (user.user_type) {
    case "admin":
      console.log("🔐 Redirigiendo admin a /admin/perfil");
      return <Navigate to="/admin/perfil" replace />;
    case "client":
      console.log("👤 Redirigiendo cliente a /cliente/perfil");
      return <Navigate to="/cliente/perfil" replace />;
    case "drover":
      console.log("🚗 Redirigiendo drover a /drover/perfil");
      return <Navigate to="/drover/perfil" replace />;
    case "traffic_manager":
      console.log("🚦 Redirigiendo traffic_manager a /trafico/perfil");
      return <Navigate to="/trafico/perfil" replace />;
    default:
      console.log("⚠️ Tipo de usuario no reconocido:", user.user_type, "- redirigiendo a /admin/perfil por defecto");
      console.log("⚠️ Valores posibles que debería tener user_type:", ["admin", "client", "drover", "traffic_manager"]);
      return <Navigate to="/admin/perfil" replace />;
  }
};

export default ProfileRedirect;
