import { useState } from "react";
import TableroTareasView from "./TableroTareasView";
import InformeFotovoltaicoView from "./InformeFotovoltaicoView";
import FormularioFotovoltaico from "./FormularioFotovoltaico";
import PrestamoEquiposView from "./PrestamoEquiposView";
import AutomatizacionesView from "./AutomatizacionesView";
import ServiciosInformaticosView from "./ServiciosInformaticosView";

function App() {
  const [moduloActivo, setModuloActivo] = useState("tareas");
  const [subModuloFotovoltaico, setSubModuloFotovoltaico] =
    useState("realizar");
  const [informeGenerado, setInformeGenerado] = useState(null);

  // Estado para abrir/cerrar el desplegable de notificaciones
  const [mostrarNotificaciones, setMostrarNotificaciones] = useState(false);
  const [hoveredNav, setHoveredNav] = useState(null);

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#0a192f",
        color: "#ccd6f6",
        fontFamily: "sans-serif",
        margin: 0,
        padding: 0,
      }}
    >
      {/* HEADER DIVIDIDO EN DOS FRANJAS */}
      <header style={{ width: "100%", marginBottom: "20px" }}>
        {/* 1. FRANJA SUPERIOR (AZUL OSCURO) */}
        <div
          style={{
            backgroundColor: "#0a192f",
            color: "#ffffff",
            padding: "12px 0",
            borderBottom: "1px solid #233554",
          }}
        >
          <div
            style={{
              maxWidth: "1600px",
              margin: "0 auto",
              padding: "0 40px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            {/* LADO IZQUIERDO: LOGO / AT */}
            <span
              style={{ fontSize: "22px", fontWeight: "bold", color: "#64ffda" }}
            >
              AT
            </span>

            {/* LADO DERECHO: AREA TECNOLOGIA + CAMPANITA */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "15px",
                position: "relative",
              }}
            >
              <div
                style={{
                  backgroundColor: "#112240",
                  color: "#64ffda",
                  padding: "6px 14px",
                  borderRadius: "20px",
                  fontWeight: "bold",
                  fontSize: "12px",
                  border: "1px solid #233554",
                }}
              >
                AREA TECNOLOGIA
              </div>

              {/* BOTÓN DE NOTIFICACIONES */}
              <div style={{ position: "relative" }}>
                <button
                  onClick={() =>
                    setMostrarNotificaciones(!mostrarNotificaciones)
                  }
                  style={{
                    backgroundColor: "#112240",
                    border: "1px solid #233554",
                    borderRadius: "50%",
                    width: "38px",
                    height: "38px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    fontSize: "16px",
                    color: "#ffffff",
                    transition: "all 0.2s",
                  }}
                  title="Alertas y Pendientes"
                >
                  🔔
                  <span
                    style={{
                      position: "absolute",
                      top: "-2px",
                      right: "-2px",
                      backgroundColor: "#ef4444",
                      color: "white",
                      borderRadius: "50%",
                      padding: "2px 6px",
                      fontSize: "10px",
                      fontWeight: "bold",
                      border: "2px solid #0a192f",
                    }}
                  >
                    2
                  </span>
                </button>

                {/* MENÚ DESPLEGABLE DE NOTIFICACIONES */}
                {mostrarNotificaciones && (
                  <div
                    style={{
                      position: "absolute",
                      right: 0,
                      top: "48px",
                      width: "320px",
                      backgroundColor: "#ffffff",
                      borderRadius: "10px",
                      boxShadow: "0 10px 25px rgba(0,0,0,0.3)",
                      border: "1px solid #e5e7eb",
                      zIndex: 1000,
                      padding: "15px",
                      color: "#1f2937",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        borderBottom: "1px solid #e5e7eb",
                        paddingBottom: "10px",
                        marginBottom: "10px",
                      }}
                    >
                      <h4
                        style={{
                          margin: 0,
                          fontSize: "14px",
                          color: "#111827",
                        }}
                      >
                        🔔 Alertas y Pendientes
                      </h4>
                      <span
                        style={{
                          fontSize: "11px",
                          backgroundColor: "#fee2e2",
                          color: "#991b1b",
                          padding: "2px 8px",
                          borderRadius: "12px",
                          fontWeight: "bold",
                        }}
                      >
                        2 nuevas
                      </span>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "10px",
                      }}
                    >
                      <div
                        style={{
                          padding: "10px",
                          backgroundColor: "#f9fafb",
                          borderRadius: "6px",
                          borderLeft: "4px solid #ef4444",
                        }}
                      >
                        <p
                          style={{
                            margin: 0,
                            fontSize: "12px",
                            fontWeight: "bold",
                            color: "#1f2937",
                          }}
                        >
                          ⚠️ Préstamo Vencido
                        </p>
                        <p
                          style={{
                            margin: "4px 0 0 0",
                            fontSize: "11px",
                            color: "#6b7280",
                          }}
                        >
                          El multímetro digital debía devolverse hoy.
                        </p>
                      </div>

                      <div
                        style={{
                          padding: "10px",
                          backgroundColor: "#f9fafb",
                          borderRadius: "6px",
                          borderLeft: "4px solid #f59e0b",
                        }}
                      >
                        <p
                          style={{
                            margin: 0,
                            fontSize: "12px",
                            fontWeight: "bold",
                            color: "#1f2937",
                          }}
                        >
                          📋 Tarea Pendiente
                        </p>
                        <p
                          style={{
                            margin: "4px 0 0 0",
                            fontSize: "11px",
                            color: "#6b7280",
                          }}
                        >
                          Revisar informe fotovoltaico de la Sede Norte.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 2. FRANJA INFERIOR (BLANCA) CON NAVEGACIÓN */}
        <div
          style={{
            backgroundColor: "#ffffff",
            padding: "25px 30px",
            borderBottom: "1px solid #e5e7eb",
            boxShadow: "0 2px 4px rgba(0,0,0,0.03)",
          }}
        >
          <div
            style={{ maxWidth: "1600px", margin: "0 auto", padding: "0 40px" }}
          >
            <nav style={{ display: "flex", gap: "25px", flexWrap: "wrap" }}>
              {[
                { id: "tareas", label: "TABLERO TAREAS" },
                { id: "proyectos", label: "PROYECTOS" },
                { id: "fotovoltaico", label: "INFORME FOTOVOLTAICO" },
                { id: "prestamos", label: "PRÉSTAMO DE EQUIPOS" },
                { id: "automatizaciones", label: "AUTOMATIZACIONES" },
                { id: "servicios", label: "SERVICIOS INFORMÁTICOS" },
              ].map((item) => {
                const isSelected = moduloActivo === item.id;
                const isHovered = hoveredNav === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => setModuloActivo(item.id)}
                    onMouseEnter={() => setHoveredNav(item.id)}
                    onMouseLeave={() => setHoveredNav(null)}
                    style={{
                      padding: "16px 4px",
                      backgroundColor: "transparent",
                      border: "none",
                      borderBottom:
                        isSelected || isHovered
                          ? "3px solid #0a192f"
                          : "3px solid transparent",
                      color: isSelected || isHovered ? "#0a192f" : "#4b5563",
                      cursor: "pointer",
                      fontWeight: isSelected ? "bold" : "600",
                      fontSize: "13px",
                      letterSpacing: "0.5px",
                      transition: "all 0.2s ease",
                      outline: "none",
                    }}
                  >
                    {item.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      </header>

      {/* MÓDULO 1: TRELLO / TAREAS */}
      {moduloActivo === "tareas" && <TableroTareasView />}

      {/* MÓDULO 2: PROYECTOS */}
      {moduloActivo === "proyectos" && (
        <main
          style={{ maxWidth: "600px", margin: "0 auto", textAlign: "center" }}
        >
          <div
            style={{
              backgroundColor: "#112240",
              padding: "40px",
              borderRadius: "12px",
            }}
          >
            <h2>Módulo de Proyectos</h2>
            <p style={{ color: "#8892b0" }}>
              Próximamente podrás gestionar tus proyectos aquí.
            </p>
          </div>
        </main>
      )}

      {/* MÓDULO 3: INFORME FOTOVOLTAICO */}
      {moduloActivo === "fotovoltaico" && (
        <main
          style={{ maxWidth: "1600px", margin: "0 auto", padding: "0 40px" }}
        >
          <div
            style={{
              backgroundColor: "#112240",
              padding: "30px",
              borderRadius: "12px",
              border: "1px solid #233554",
              boxShadow: "0 10px 30px -15px rgba(2,12,27,0.7)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                marginBottom: "20px",
              }}
            >
              <h2 style={{ color: "#64ffda", margin: 0 }}>
                Sistema Fotovoltaico
              </h2>
            </div>

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
                onClick={() => setSubModuloFotovoltaico("realizar")}
                style={{
                  padding: "8px 16px",
                  borderRadius: "6px",
                  border: "none",
                  cursor: "pointer",
                  fontWeight: "bold",
                  backgroundColor:
                    subModuloFotovoltaico === "realizar"
                      ? "#64ffda"
                      : "transparent",
                  color:
                    subModuloFotovoltaico === "realizar"
                      ? "#0a192f"
                      : "#8892b0",
                  transition: "all 0.2s",
                }}
              >
                Realizar Informe
              </button>

              <button
                onClick={() => setSubModuloFotovoltaico("historial")}
                style={{
                  padding: "8px 16px",
                  borderRadius: "6px",
                  border: "none",
                  cursor: "pointer",
                  fontWeight: "bold",
                  backgroundColor:
                    subModuloFotovoltaico === "historial"
                      ? "#64ffda"
                      : "transparent",
                  color:
                    subModuloFotovoltaico === "historial"
                      ? "#0a192f"
                      : "#8892b0",
                  transition: "all 0.2s",
                }}
              >
                Historial de Informes
              </button>
            </div>

            {subModuloFotovoltaico === "realizar" && (
              <div>
                {!informeGenerado ? (
                  <FormularioFotovoltaico
                    onGenerarInforme={(datos) => setInformeGenerado(datos)}
                  />
                ) : (
                  <div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "20px",
                        backgroundColor: "#0a192f",
                        padding: "15px",
                        borderRadius: "8px",
                      }}
                    >
                      <button
                        onClick={() => setInformeGenerado(null)}
                        style={{
                          padding: "8px 12px",
                          cursor: "pointer",
                          backgroundColor: "#334155",
                          color: "#fff",
                          border: "none",
                          borderRadius: "6px",
                        }}
                      >
                        Volver a editar datos
                      </button>

                      <div style={{ display: "flex", gap: "10px" }}>
                        <button
                          onClick={() => window.print()}
                          style={{
                            padding: "10px 18px",
                            backgroundColor: "#7bb13c",
                            color: "#fff",
                            border: "none",
                            borderRadius: "6px",
                            fontWeight: "bold",
                            cursor: "pointer",
                          }}
                        >
                          Exportar a PDF
                        </button>

                        <button
                          onClick={() => {
                            alert(
                              "Informe guardado exitosamente en el historial",
                            );
                          }}
                          style={{
                            padding: "10px 18px",
                            backgroundColor: "#2563eb",
                            color: "#fff",
                            border: "none",
                            borderRadius: "6px",
                            fontWeight: "bold",
                            cursor: "pointer",
                          }}
                        >
                          Guardar en Historial
                        </button>
                      </div>
                    </div>

                    <InformeFotovoltaicoView datos={informeGenerado} />
                  </div>
                )}
              </div>
            )}

            {subModuloFotovoltaico === "historial" && (
              <div>
                <h3 style={{ color: "#ccd6f6", marginTop: 0 }}>
                  Historial de Informes Generados
                </h3>
                <p style={{ color: "#8892b0", fontSize: "14px" }}>
                  Aquí podrás consultar, descargar o eliminar reportes creados
                  previamente.
                </p>

                <div
                  style={{
                    marginTop: "20px",
                    padding: "20px",
                    backgroundColor: "#0a192f",
                    borderRadius: "8px",
                    border: "1px solid #233554",
                    textAlign: "center",
                    color: "#8892b0",
                  }}
                >
                  📁 Aún no hay informes guardados en el historial.
                </div>
              </div>
            )}
          </div>
        </main>
      )}

      {/* MÓDULO 4: PRÉSTAMO DE EQUIPOS */}
      {moduloActivo === "prestamos" && (
        <main
          style={{ maxWidth: "1600px", margin: "0 auto", padding: "0 40px" }}
        >
          <PrestamoEquiposView />
        </main>
      )}

      {/* MÓDULO 5: AUTOMATIZACIONES */}
      {moduloActivo === "automatizaciones" && (
        <main style={{ padding: "0 40px" }}>
          <AutomatizacionesView />
        </main>
      )}

      {/* MÓDULO 6: SERVICIOS INFORMÁTICOS */}
      {moduloActivo === "servicios" && (
        <main
          style={{ maxWidth: "1600px", margin: "0 auto", padding: "0 40px" }}
        >
          <ServiciosInformaticosView />
        </main>
      )}
    </div>
  );
}

export default App;
