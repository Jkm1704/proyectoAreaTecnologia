import { useState } from "react";

export default function ServiciosInformaticosView() {
  const [subModulo, setSubModulo] = useState("tickets");

  return (
    <div
      style={{
        backgroundColor: "#112240",
        padding: "30px",
        borderRadius: "12px",
        border: "1px solid #233554",
        boxShadow: "0 10px 30px -15px rgba(2,12,27,0.7)",
      }}
    >
      {/* Título Principal */}
      <div style={{ marginBottom: "20px" }}>
        <h2 style={{ color: "#64ffda", margin: 0 }}>
          🖥️ Servicios Informáticos
        </h2>
        <p style={{ color: "#8892b0", fontSize: "14px", marginTop: "5px" }}>
          Gestión de soporte técnico, mantenimiento de infraestructura y licencias de software.
        </p>
      </div>

      {/* Navegación interna del módulo */}
      <div
        style={{
          display: "flex",
          gap: "15px",
          borderBottom: "1px solid #233554",
          paddingBottom: "15px",
          marginBottom: "25px",
        }}
      >
        <button
          onClick={() => setSubModulo("tickets")}
          style={{
            padding: "8px 16px",
            borderRadius: "6px",
            border: "none",
            cursor: "pointer",
            fontWeight: "bold",
            backgroundColor: subModulo === "tickets" ? "#64ffda" : "transparent",
            color: subModulo === "tickets" ? "#0a192f" : "#8892b0",
            transition: "all 0.2s",
          }}
        >
          🎫 Tickets de Soporte
        </button>

        <button
          onClick={() => setSubModulo("mantenimiento")}
          style={{
            padding: "8px 16px",
            borderRadius: "6px",
            border: "none",
            cursor: "pointer",
            fontWeight: "bold",
            backgroundColor: subModulo === "mantenimiento" ? "#64ffda" : "transparent",
            color: subModulo === "mantenimiento" ? "#0a192f" : "#8892b0",
            transition: "all 0.2s",
          }}
        >
          🛠️ Mantenimiento Técnico
        </button>

        <button
          onClick={() => setSubModulo("licencias")}
          style={{
            padding: "8px 16px",
            borderRadius: "6px",
            border: "none",
            cursor: "pointer",
            fontWeight: "bold",
            backgroundColor: subModulo === "licencias" ? "#64ffda" : "transparent",
            color: subModulo === "licencias" ? "#0a192f" : "#8892b0",
            transition: "all 0.2s",
          }}
        >
          🔑 Licencias & Software
        </button>
      </div>

      {/* Vistas según la pestaña seleccionada */}
      {subModulo === "tickets" && (
        <div style={{ backgroundColor: "#0a192f", padding: "20px", borderRadius: "8px", border: "1px solid #233554" }}>
          <h3 style={{ color: "#ccd6f6", marginTop: 0 }}>Gestión de Tickets de Soporte</h3>
          <p style={{ color: "#8892b0", fontSize: "14px" }}>
            Módulo para registrar y dar seguimiento a solicitudes de usuarios, fallos de red o problemas de equipo.
          </p>
        </div>
      )}

      {subModulo === "mantenimiento" && (
        <div style={{ backgroundColor: "#0a192f", padding: "20px", borderRadius: "8px", border: "1px solid #233554" }}>
          <h3 style={{ color: "#ccd6f6", marginTop: 0 }}>Mantenimiento Preventivo y Correctivo</h3>
          <p style={{ color: "#8892b0", fontSize: "14px" }}>
            Registro de intervenciones técnicas a servidores, equipos de cómputo y dispositivos de red.
          </p>
        </div>
      )}

      {subModulo === "licencias" && (
        <div style={{ backgroundColor: "#0a192f", padding: "20px", borderRadius: "8px", border: "1px solid #233554" }}>
          <h3 style={{ color: "#ccd6f6", marginTop: 0 }}>Control de Licencias y Software</h3>
          <p style={{ color: "#8892b0", fontSize: "14px" }}>
            Administración de credenciales, vencimientos de licencias corporativas y suscripciones informáticas.
          </p>
        </div>
      )}
    </div>
  );
}