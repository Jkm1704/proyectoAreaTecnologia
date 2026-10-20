import { useState, useEffect } from "react";
import FormularioPrestamo from "./FormularioPrestamo";
import FormularioEquipo from "./FormularioEquipo";
import { API_URL } from "./config"; // 👈 1. Importamos la variable global de entorno

// 👈 2. Construimos el endpoint dinámico según estemos en Local o en Render
const API_ENDPOINT = `${API_URL}/api/prestamos-data`;

function PrestamoEquiposView() {
  const [vistaActual, setVistaActual] = useState("lista");
  const [equipos, setEquipos] = useState([]);
  const [prestamos, setPrestamos] = useState([]);
  const [cargando, setCargando] = useState(true);

  // 1. Cargar datos del servidor al montar el componente
  useEffect(() => {
    let montado = true;

    const cargarDatos = async () => {
      try {
        const res = await fetch(API_ENDPOINT);
        const data = await res.json();
        if (montado) {
          setEquipos(data.equipos || []);
          setPrestamos(data.prestamos || []);
        }
      } catch (error) {
        console.error("Error al cargar datos desde el servidor:", error);
      } finally {
        if (montado) {
          setCargando(false);
        }
      }
    };

    cargarDatos();

    return () => {
      montado = false;
    };
  }, []);

  // 2. Función helper para guardar vía backend
  const persistirDatos = async (nuevosEquipos, nuevosPrestamos) => {
    try {
      await fetch(API_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          equipos: nuevosEquipos,
          prestamos: nuevosPrestamos,
        }),
      });
    } catch (error) {
      console.error("Error al guardar en el servidor:", error);
    }
  };

  // Guardar un nuevo equipo
  const handleGuardarEquipo = (nuevoEquipo) => {
    const nuevosEquipos = [
      ...equipos,
      { ...nuevoEquipo, id: Date.now(), estado: "Disponible" },
    ];
    setEquipos(nuevosEquipos);
    persistirDatos(nuevosEquipos, prestamos);
    setVistaActual("equipos");
  };

  // Registrar un préstamo
  const handleGuardarPrestamo = (nuevoPrestamo) => {
    const nuevosPrestamos = [
      { ...nuevoPrestamo, id: Date.now(), estado: "Prestado" },
      ...prestamos,
    ];
    const nuevosEquipos = equipos.map((eq) =>
      eq.id === Number(nuevoPrestamo.equipoId)
        ? { ...eq, estado: "En Préstamo" }
        : eq
    );

    setPrestamos(nuevosPrestamos);
    setEquipos(nuevosEquipos);
    persistirDatos(nuevosEquipos, nuevosPrestamos);
    setVistaActual("lista");
  };

  // Registrar devolución
  const handleMarcarDevuelto = (idPrestamo, equipoId) => {
    const nuevosPrestamos = prestamos.map((item) =>
      item.id === idPrestamo ? { ...item, estado: "Devuelto" } : item
    );
    const nuevosEquipos = equipos.map((eq) =>
      eq.id === Number(equipoId) ? { ...eq, estado: "Disponible" } : eq
    );

    setPrestamos(nuevosPrestamos);
    setEquipos(nuevosEquipos);
    persistirDatos(nuevosEquipos, nuevosPrestamos);
  };

  if (cargando) {
    return (
      <p style={{ color: "#64ffda", textAlign: "center", padding: "20px" }}>
        Cargando datos de préstamos...
      </p>
    );
  }

  return (
    <div style={{ padding: "10px" }}>
      {/* BARRA SUPERIOR DE NAVEGACIÓN */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
          backgroundColor: "#0a192f",
          padding: "15px 20px",
          borderRadius: "8px",
          border: "1px solid #233554",
          flexWrap: "wrap",
          gap: "10px",
        }}
      >
        <div>
          <h2 style={{ color: "#64ffda", margin: 0, fontSize: "1.3rem" }}>
            Módulo de Préstamo de Equipos
          </h2>
          <p
            style={{
              color: "#8892b0",
              margin: "4px 0 0 0",
              fontSize: "0.85rem",
            }}
          >
            Persistencia vía Node Backend / Prisma
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <button
            onClick={() => setVistaActual("lista")}
            style={{
              padding: "8px 16px",
              backgroundColor: vistaActual === "lista" ? "#64ffda" : "#112240",
              color: vistaActual === "lista" ? "#0a192f" : "#a8b2d1",
              border: "1px solid #64ffda",
              borderRadius: "4px",
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            Historial Préstamos ({prestamos.length})
          </button>

          <button
            onClick={() => setVistaActual("nuevo_prestamo")}
            style={{
              padding: "8px 16px",
              backgroundColor:
                vistaActual === "nuevo_prestamo" ? "#64ffda" : "#112240",
              color: vistaActual === "nuevo_prestamo" ? "#0a192f" : "#a8b2d1",
              border: "1px solid #64ffda",
              borderRadius: "4px",
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            Registrar Préstamo
          </button>

          <button
            onClick={() => setVistaActual("equipos")}
            style={{
              padding: "8px 16px",
              backgroundColor:
                vistaActual === "equipos" || vistaActual === "nuevo_equipo"
                  ? "#64ffda"
                  : "#112240",
              color:
                vistaActual === "equipos" || vistaActual === "nuevo_equipo"
                  ? "#0a192f"
                  : "#a8b2d1",
              border: "1px solid #64ffda",
              borderRadius: "4px",
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            Inventario Equipos ({equipos.length})
          </button>
        </div>
      </div>

      {/* VISTAS */}
      {vistaActual === "nuevo_prestamo" && (
        <FormularioPrestamo
          equipos={equipos.filter((e) => e.estado === "Disponible")}
          onGuardar={handleGuardarPrestamo}
          onCancelar={() => setVistaActual("lista")}
        />
      )}

      {vistaActual === "nuevo_equipo" && (
        <FormularioEquipo
          onGuardar={handleGuardarEquipo}
          onCancelar={() => setVistaActual("equipos")}
        />
      )}

      {vistaActual === "equipos" && (
        <div
          style={{
            backgroundColor: "#0a192f",
            padding: "20px",
            borderRadius: "8px",
            border: "1px solid #233554",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "15px",
            }}
          >
            <h3 style={{ color: "#ccd6f6", margin: 0 }}>
              Catálogo de Equipos Registrados
            </h3>
            <button
              onClick={() => setVistaActual("nuevo_equipo")}
              style={{
                padding: "6px 14px",
                backgroundColor: "#84cc16",
                color: "#0a192f",
                border: "none",
                borderRadius: "4px",
                fontWeight: "bold",
                cursor: "pointer",
              }}
            >
              + Agregar Nuevo Equipo
            </button>
          </div>

          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              color: "#a8b2d1",
              fontSize: "0.9rem",
            }}
          >
            <thead>
              <tr
                style={{ borderBottom: "2px solid #233554", textAlign: "left" }}
              >
                <th style={{ padding: "10px" }}>Equipo</th>
                <th style={{ padding: "10px" }}>Número Serial / Placa</th>
                <th style={{ padding: "10px" }}>Estado</th>
              </tr>
            </thead>
            <tbody>
              {equipos.map((eq) => (
                <tr key={eq.id} style={{ borderBottom: "1px solid #112240" }}>
                  <td
                    style={{
                      padding: "10px",
                      color: "#e6f1ff",
                      fontWeight: "bold",
                    }}
                  >
                    {eq.nombre}
                  </td>
                  <td style={{ padding: "10px" }}>{eq.serial}</td>
                  <td style={{ padding: "10px" }}>
                    <span
                      style={{
                        padding: "3px 8px",
                        borderRadius: "4px",
                        fontSize: "0.75rem",
                        fontWeight: "bold",
                        backgroundColor:
                          eq.estado === "Disponible" ? "#0d3320" : "#3b2d03",
                        color:
                          eq.estado === "Disponible" ? "#64ffda" : "#f7b801",
                        border:
                          eq.estado === "Disponible"
                            ? "1px solid #64ffda"
                            : "1px solid #f7b801",
                      }}
                    >
                      {eq.estado}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {vistaActual === "lista" && (
        <div
          style={{
            backgroundColor: "#0a192f",
            padding: "20px",
            borderRadius: "8px",
            border: "1px solid #233554",
          }}
        >
          <h3 style={{ color: "#ccd6f6", marginTop: 0 }}>
            Historial de Préstamos
          </h3>

          {prestamos.length === 0 ? (
            <p
              style={{ color: "#8892b0", textAlign: "center", padding: "20px" }}
            >
              No hay préstamos registrados actualmente. Haz clic en "Registrar
              Préstamo" para realizar uno.
            </p>
          ) : (
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                color: "#a8b2d1",
                fontSize: "0.9rem",
              }}
            >
              <thead>
                <tr
                  style={{
                    borderBottom: "2px solid #233554",
                    textAlign: "left",
                  }}
                >
                  <th style={{ padding: "10px" }}>Solicitante / Área</th>
                  <th style={{ padding: "10px" }}>Equipo / Serial</th>
                  <th style={{ padding: "10px" }}>Fecha Préstamo</th>
                  <th style={{ padding: "10px" }}>Devolución Estimada</th>
                  <th style={{ padding: "10px" }}>Estado</th>
                  <th style={{ padding: "10px", textAlign: "center" }}>
                    Acción
                  </th>
                </tr>
              </thead>
              <tbody>
                {prestamos.map((item) => (
                  <tr
                    key={item.id}
                    style={{ borderBottom: "1px solid #112240" }}
                  >
                    <td style={{ padding: "12px 10px" }}>
                      <strong style={{ color: "#e6f1ff" }}>
                        {item.solicitante}
                      </strong>
                      <br />
                      <span style={{ fontSize: "0.8rem", color: "#8892b0" }}>
                        {item.area}
                      </span>
                    </td>
                    <td style={{ padding: "12px 10px" }}>
                      <span style={{ color: "#e6f1ff" }}>
                        {item.equipoNombre}
                      </span>
                      <br />
                      <span style={{ fontSize: "0.8rem", color: "#8892b0" }}>
                        Serial: {item.equipoSerial}
                      </span>
                    </td>
                    <td style={{ padding: "12px 10px" }}>
                      {item.fechaPrestamo}
                    </td>
                    <td style={{ padding: "12px 10px" }}>
                      {item.fechaDevolucionProbable}
                    </td>
                    <td style={{ padding: "12px 10px" }}>
                      <span
                        style={{
                          padding: "4px 8px",
                          borderRadius: "4px",
                          fontSize: "0.75rem",
                          fontWeight: "bold",
                          backgroundColor:
                            item.estado === "Prestado" ? "#3b2d03" : "#0d3320",
                          color:
                            item.estado === "Prestado" ? "#f7b801" : "#64ffda",
                          border:
                            item.estado === "Prestado"
                              ? "1px solid #f7b801"
                              : "1px solid #64ffda",
                        }}
                      >
                        {item.estado}
                      </span>
                    </td>
                    <td style={{ padding: "12px 10px", textAlign: "center" }}>
                      {item.estado === "Prestado" && (
                        <button
                          onClick={() =>
                            handleMarcarDevuelto(item.id, item.equipoId)
                          }
                          style={{
                            padding: "6px 12px",
                            backgroundColor: "#112240",
                            color: "#64ffda",
                            border: "1px solid #64ffda",
                            borderRadius: "4px",
                            fontSize: "0.8rem",
                            cursor: "pointer",
                          }}
                        >
                          Marcar Devuelto
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

export default PrestamoEquiposView;