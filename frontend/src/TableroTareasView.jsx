import { useState, useEffect } from "react";

function TableroTareasView() {
  const [tableros, setTableros] = useState([]);
  const [tableroActivoId, setTableroActivoId] = useState(null);

  // Input para crear un nuevo Tablero
  const [nuevoTituloTablero, setNuevoTituloTablero] = useState("");

  // Input para crear una nueva Tarjeta (Columna) dentro del tablero activo
  const [nuevoTituloTarjeta, setNuevoTituloTarjeta] = useState("");

  // Estados para controlar los inputs de creación de Tareas (por cada tarjeta)
  const [textoNuevaTarea, setTextoNuevaTarea] = useState({});
  const [etiquetaTarea, setEtiquetaTarea] = useState({});
  const [colorEtiqueta, setColorEtiqueta] = useState({});

  // Cargar Tableros desde Backend
  useEffect(() => {
    fetch("http://127.0.0.1:5000/api/tableros")
      .then((res) => res.json())
      .then((data) => {
        setTableros(data);
        if (data.length > 0) {
          // Usamos 'prev' para verificar el estado sin depender de la variable externa
          setTableroActivoId((prev) => (prev ? prev : data[0].id));
        }
      })
      .catch((err) => console.error("Error cargando tableros:", err));
  }, []);

  // Helper para guardar cambios en Backend
  const guardarEnBackend = (nuevosTableros) => {
    setTableros(nuevosTableros);
    fetch("http://127.0.0.1:5000/api/tableros", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(nuevosTableros),
    }).catch((err) => console.error("Error guardando:", err));
  };

  // -------------------------------------------------------------
  // 1. NIVEL 1: GESTIÓN DE TABLEROS
  // -------------------------------------------------------------
  const agregarTablero = (e) => {
    e.preventDefault();
    if (!nuevoTituloTablero.trim()) return;

    const nuevoTablero = {
      id: Date.now(),
      titulo: nuevoTituloTablero,
      tarjetas: [], // Cada tablero tiene sus propias tarjetas/columnas
    };

    const nuevos = [...tableros, nuevoTablero];
    guardarEnBackend(nuevos);
    setTableroActivoId(nuevoTablero.id);
    setNuevoTituloTablero("");
  };

  const eliminarTablero = (tableroId) => {
    const filtrados = tableros.filter((t) => t.id !== tableroId);
    guardarEnBackend(filtrados);

    if (tableroActivoId === tableroId) {
      setTableroActivoId(filtrados.length > 0 ? filtrados[0].id : null);
    }
  };

  // -------------------------------------------------------------
  // 2. NIVEL 2: GESTIÓN DE TARJETAS (COLUMNAS)
  // -------------------------------------------------------------
  const agregarTarjeta = (e) => {
    e.preventDefault();
    if (!nuevoTituloTarjeta.trim() || !tableroActivoId) return;

    const nuevosTableros = tableros.map((tablero) => {
      if (tablero.id === tableroActivoId) {
        return {
          ...tablero,
          tarjetas: [
            ...(tablero.tarjetas || []),
            {
              id: Date.now(),
              titulo: nuevoTituloTarjeta,
              tareas: [],
            },
          ],
        };
      }
      return tablero;
    });

    guardarEnBackend(nuevosTableros);
    setNuevoTituloTarjeta("");
  };

  const eliminarTarjeta = (tarjetaId) => {
    const nuevosTableros = tableros.map((tablero) => {
      if (tablero.id === tableroActivoId) {
        return {
          ...tablero,
          tarjetas: tablero.tarjetas.filter((tar) => tar.id !== tarjetaId),
        };
      }
      return tablero;
    });

    guardarEnBackend(nuevosTableros);
  };

  // -------------------------------------------------------------
  // 3. NIVEL 3: GESTIÓN DE TAREAS
  // -------------------------------------------------------------
  const agregarTarea = (tarjetaId) => {
    const texto = textoNuevaTarea[tarjetaId];
    if (!texto || !texto.trim() || !tableroActivoId) return;

    const nuevosTableros = tableros.map((tablero) => {
      if (tablero.id === tableroActivoId) {
        const tarjetasActualizadas = tablero.tarjetas.map((tarjeta) => {
          if (tarjeta.id === tarjetaId) {
            return {
              ...tarjeta,
              tareas: [
                ...tarjeta.tareas,
                {
                  id: Date.now(),
                  texto: texto,
                  etiqueta: etiquetaTarea[tarjetaId] || "General",
                  colorEtiqueta: colorEtiqueta[tarjetaId] || "#3b82f6",
                },
              ],
            };
          }
          return tarjeta;
        });

        return { ...tablero, tarjetas: tarjetasActualizadas };
      }
      return tablero;
    });

    guardarEnBackend(nuevosTableros);

    // Limpiar inputs específicos de la tarjeta
    setTextoNuevaTarea({ ...textoNuevaTarea, [tarjetaId]: "" });
    setEtiquetaTarea({ ...etiquetaTarea, [tarjetaId]: "" });
  };

  const eliminarTarea = (tarjetaId, tareaId) => {
    const nuevosTableros = tableros.map((tablero) => {
      if (tablero.id === tableroActivoId) {
        const tarjetasActualizadas = tablero.tarjetas.map((tarjeta) => {
          if (tarjeta.id === tarjetaId) {
            return {
              ...tarjeta,
              tareas: tarjeta.tareas.filter((t) => t.id !== tareaId),
            };
          }
          return tarjeta;
        });

        return { ...tablero, tarjetas: tarjetasActualizadas };
      }
      return tablero;
    });

    guardarEnBackend(nuevosTableros);
  };

  const tableroSeleccionado = tableros.find((t) => t.id === tableroActivoId);

  return (
    <main style={{ padding: "0 40px", overflowX: "auto" }}>
      {/* 🟢 BARRA SUPERIOR: CREAR TABLERO Y LISTA DE TABLEROS */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          backgroundColor: "#112240",
          padding: "16px 20px",
          borderRadius: "8px",
          marginBottom: "25px",
          border: "1px solid #233554",
          gap: "20px",
          flexWrap: "wrap",
        }}
      >
        {/* Selector / Pestañas de Tableros */}
        <div
          style={{
            display: "flex",
            gap: "10px",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <span
            style={{ fontWeight: "bold", color: "#8892b0", fontSize: "14px" }}
          >
            Tableros:
          </span>
          {tableros.map((tablero) => (
            <div
              key={tablero.id}
              style={{
                display: "flex",
                alignItems: "center",
                backgroundColor:
                  tablero.id === tableroActivoId ? "#64ffda" : "#0a192f",
                color: tablero.id === tableroActivoId ? "#0a192f" : "#ccd6f6",
                borderRadius: "6px",
                padding: "6px 12px",
                cursor: "pointer",
                fontWeight: "bold",
                fontSize: "13px",
                border: "1px solid #233554",
              }}
            >
              <span onClick={() => setTableroActivoId(tablero.id)}>
                {tablero.titulo}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  eliminarTablero(tablero.id);
                }}
                style={{
                  background: "none",
                  border: "none",
                  color: tablero.id === tableroActivoId ? "#0a192f" : "#ef4444",
                  marginLeft: "8px",
                  cursor: "pointer",
                  fontWeight: "bold",
                  fontSize: "12px",
                }}
                title="Eliminar Tablero"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        {/* Formulario Crear Tablero */}
        <form onSubmit={agregarTablero} style={{ display: "flex", gap: "8px" }}>
          <input
            type="text"
            value={nuevoTituloTablero}
            onChange={(e) => setNuevoTituloTablero(e.target.value)}
            placeholder="Nombre del nuevo tablero..."
            style={{
              padding: "8px 12px",
              borderRadius: "6px",
              border: "1px solid #233554",
              backgroundColor: "#0a192f",
              color: "#fff",
              fontSize: "13px",
              width: "220px",
            }}
          />
          <button
            type="submit"
            style={{
              backgroundColor: "#10b981",
              color: "white",
              border: "none",
              borderRadius: "6px",
              padding: "8px 14px",
              fontWeight: "bold",
              fontSize: "13px",
              cursor: "pointer",
            }}
          >
            + Crear Tablero
          </button>
        </form>
      </div>

      {/* 🔵 CONTENIDO DEL TABLERO SELECCIONADO */}
      {tableroSeleccionado ? (
        <div>
          {/* Formulario para agregar Tarjeta (Columna) dentro del tablero activo */}
          <form
            onSubmit={agregarTarjeta}
            style={{ marginBottom: "20px", display: "flex", gap: "10px" }}
          >
            <input
              type="text"
              value={nuevoTituloTarjeta}
              onChange={(e) => setNuevoTituloTarjeta(e.target.value)}
              placeholder={`Nueva tarjeta en "${tableroSeleccionado.titulo}"...`}
              style={{
                padding: "10px 14px",
                borderRadius: "6px",
                border: "1px solid #233554",
                backgroundColor: "#112240",
                color: "#fff",
                width: "280px",
              }}
            />
            <button
              type="submit"
              style={{
                backgroundColor: "#2563eb",
                color: "white",
                border: "none",
                borderRadius: "6px",
                padding: "10px 18px",
                fontWeight: "bold",
                cursor: "pointer",
              }}
            >
              + Crear Tarjeta
            </button>
          </form>

          {/* Renderizado de Tarjetas */}
          <div
            style={{
              display: "flex",
              gap: "20px",
              alignItems: "flex-start",
              overflowX: "auto",
              paddingBottom: "20px",
            }}
          >
            {tableroSeleccionado.tarjetas?.map((tarjeta) => (
              <div
                key={tarjeta.id}
                style={{
                  backgroundColor: "#112240",
                  minWidth: "300px",
                  maxWidth: "300px",
                  borderRadius: "10px",
                  padding: "16px",
                  border: "1px solid #233554",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.3)",
                }}
              >
                {/* Encabezado de la Tarjeta */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "15px",
                  }}
                >
                  <h3 style={{ margin: 0, color: "#64ffda", fontSize: "16px" }}>
                    {tarjeta.titulo}
                  </h3>
                  <button
                    onClick={() => eliminarTarjeta(tarjeta.id)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#ef4444",
                      cursor: "pointer",
                      fontSize: "16px",
                    }}
                    title="Eliminar Tarjeta"
                  >
                    ✕
                  </button>
                </div>

                {/* Formulario para agregar Tarea dentro de esta Tarjeta */}
                <div
                  style={{
                    marginBottom: "15px",
                    backgroundColor: "#0a192f",
                    padding: "10px",
                    borderRadius: "6px",
                  }}
                >
                  <input
                    type="text"
                    placeholder="Escribir tarea..."
                    value={textoNuevaTarea[tarjeta.id] || ""}
                    onChange={(e) =>
                      setTextoNuevaTarea({
                        ...textoNuevaTarea,
                        [tarjeta.id]: e.target.value,
                      })
                    }
                    style={{
                      width: "100%",
                      padding: "8px",
                      marginBottom: "8px",
                      borderRadius: "4px",
                      border: "none",
                      boxSizing: "border-box",
                    }}
                  />
                  <div
                    style={{
                      display: "flex",
                      gap: "5px",
                      marginBottom: "8px",
                    }}
                  >
                    <input
                      type="text"
                      placeholder="Etiqueta"
                      value={etiquetaTarea[tarjeta.id] || ""}
                      onChange={(e) =>
                        setEtiquetaTarea({
                          ...etiquetaTarea,
                          [tarjeta.id]: e.target.value,
                        })
                      }
                      style={{
                        flex: 1,
                        padding: "6px",
                        borderRadius: "4px",
                        border: "none",
                        fontSize: "12px",
                      }}
                    />
                    <select
                      onChange={(e) =>
                        setColorEtiqueta({
                          ...colorEtiqueta,
                          [tarjeta.id]: e.target.value,
                        })
                      }
                      style={{
                        padding: "6px",
                        borderRadius: "4px",
                        border: "none",
                        fontSize: "12px",
                      }}
                    >
                      <option value="#3b82f6">🟦 Azul</option>
                      <option value="#ef4444">🟥 Rojo</option>
                      <option value="#10b981">🟩 Verde</option>
                      <option value="#f59e0b">🟧 Naranja</option>
                    </select>
                  </div>
                  <button
                    onClick={() => agregarTarea(tarjeta.id)}
                    style={{
                      width: "100%",
                      padding: "6px",
                      backgroundColor: "#2563eb",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      fontWeight: "bold",
                      cursor: "pointer",
                      fontSize: "12px",
                    }}
                  >
                    + Añadir Tarea
                  </button>
                </div>

                {/* Lista de Tareas */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                  }}
                >
                  {tarjeta.tareas?.map((tarea) => (
                    <div
                      key={tarea.id}
                      style={{
                        backgroundColor: "#0a192f",
                        padding: "12px",
                        borderRadius: "6px",
                        borderLeft: `4px solid ${
                          tarea.colorEtiqueta || "#3b82f6"
                        }`,
                        position: "relative",
                      }}
                    >
                      {tarea.etiqueta && (
                        <span
                          style={{
                            backgroundColor: tarea.colorEtiqueta || "#3b82f6",
                            color: "white",
                            fontSize: "10px",
                            padding: "2px 6px",
                            borderRadius: "4px",
                            fontWeight: "bold",
                            textTransform: "uppercase",
                            display: "inline-block",
                            marginBottom: "6px",
                          }}
                        >
                          {tarea.etiqueta}
                        </span>
                      )}

                      <p
                        style={{
                          margin: 0,
                          fontSize: "14px",
                          color: "#ccd6f6",
                          paddingRight: "20px",
                        }}
                      >
                        {tarea.texto}
                      </p>

                      <button
                        onClick={() => eliminarTarea(tarjeta.id, tarea.id)}
                        style={{
                          position: "absolute",
                          top: "8px",
                          right: "8px",
                          background: "none",
                          border: "none",
                          color: "#8892b0",
                          cursor: "pointer",
                          fontSize: "12px",
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div
          style={{
            textAlign: "center",
            padding: "60px 20px",
            backgroundColor: "#112240",
            borderRadius: "10px",
            border: "1px solid #233554",
          }}
        >
          <h3 style={{ color: "#8892b0" }}>
            No hay ningún tablero seleccionado o creado.
          </h3>
          <p style={{ color: "#64ffda" }}>
            Crea un tablero arriba para comenzar a agregar tarjetas y tareas.
          </p>
        </div>
      )}
    </main>
  );
}

export default TableroTareasView;
