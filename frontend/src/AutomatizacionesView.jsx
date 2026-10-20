import { useState } from "react";

function AutomatizacionesView() {
  const [ideas, setIdeas] = useState([
    {
      id: 1,
      titulo: "Notificaciones por WhatsApp para préstamos vencidos",
      descripcion: "Enviar un mensaje automático al usuario cuando un equipo prestado supere la fecha límite.",
      prioridad: "Alta",
      estado: "En Idea",
      votos: 5,
    },
    {
      id: 2,
      titulo: "Generación automática de PDF en informes",
      descripcion: "Convertir el informe fotovoltaico a PDF con un solo clic enviándolo directamente al correo del cliente.",
      prioridad: "Media",
      estado: "En Análisis",
      votos: 3,
    },
  ]);

  const [nuevoTitulo, setNuevoTitulo] = useState("");
  const [nuevaDescripcion, setNuevaDescripcion] = useState("");
  const [nuevaPrioridad, setNuevaPrioridad] = useState("Media");

  // Agregar una nueva idea
  const agregarIdea = (e) => {
    e.preventDefault();
    if (!nuevoTitulo.trim()) return;

    const nuevaIdea = {
      id: Date.now(),
      titulo: nuevoTitulo,
      descripcion: nuevaDescripcion,
      prioridad: nuevaPrioridad,
      estado: "En Idea",
      votos: 1,
    };

    setIdeas([nuevaIdea, ...ideas]);
    setNuevoTitulo("");
    setNuevaDescripcion("");
    setNuevaPrioridad("Media");
  };

  // Votar por una idea
  const votarIdea = (id) => {
    setIdeas(
      ideas.map((item) =>
        item.id === id ? { ...item, votos: item.votos + 1 } : item
      )
    );
  };

  // Eliminar idea
  const eliminarIdea = (id) => {
    setIdeas(ideas.filter((item) => item.id !== id));
  };

  const getPrioridadColor = (prioridad) => {
    switch (prioridad) {
      case "Alta": return "#ef4444";
      case "Media": return "#f59e0b";
      case "Baja": return "#10b981";
      default: return "#3b82f6";
    }
  };

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
      {/* CABECERA Y FORMULARIO */}
      <div
        style={{
          backgroundColor: "#112240",
          padding: "30px",
          borderRadius: "12px",
          border: "1px solid #233554",
          marginBottom: "30px",
        }}
      >
        <h2 style={{ color: "#64ffda", marginTop: 0, marginBottom: "10px" }}>
          Propuestas de Automatización
        </h2>
        <p style={{ color: "#8892b0", fontSize: "14px", marginBottom: "25px" }}>
          Registra y vota ideas para automatizar procesos repetitivos en la empresa.
        </p>

        <form onSubmit={agregarIdea} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          <div style={{ display: "flex", gap: "15px", flexWrap: "wrap" }}>
            <input
              type="text"
              placeholder="Título de la automatización (Ej: Backup automático semanal)..."
              value={nuevoTitulo}
              onChange={(e) => setNuevoTitulo(e.target.value)}
              style={{
                flex: 2,
                minWidth: "280px",
                padding: "10px 14px",
                borderRadius: "6px",
                border: "1px solid #233554",
                backgroundColor: "#0a192f",
                color: "#fff",
              }}
              required
            />

            <select
              value={nuevaPrioridad}
              onChange={(e) => setNuevaPrioridad(e.target.value)}
              style={{
                flex: 1,
                minWidth: "140px",
                padding: "10px 14px",
                borderRadius: "6px",
                border: "1px solid #233554",
                backgroundColor: "#0a192f",
                color: "#fff",
              }}
            >
              <option value="Alta">🔴 Prioridad Alta</option>
              <option value="Media">🟡 Prioridad Media</option>
              <option value="Baja">🟢 Prioridad Baja</option>
            </select>
          </div>

          <textarea
            placeholder="Describe brevemente qué proceso mejorará esta automatización..."
            value={nuevaDescripcion}
            onChange={(e) => setNuevaDescripcion(e.target.value)}
            rows={3}
            style={{
              padding: "10px 14px",
              borderRadius: "6px",
              border: "1px solid #233554",
              backgroundColor: "#0a192f",
              color: "#fff",
              resize: "vertical",
            }}
          />

          <button
            type="submit"
            style={{
              alignSelf: "flex-start",
              backgroundColor: "#64ffda",
              color: "#0a192f",
              border: "none",
              borderRadius: "6px",
              padding: "10px 20px",
              fontWeight: "bold",
              cursor: "pointer",
              transition: "opacity 0.2s",
            }}
          >
            + Proponer Idea
          </button>
        </form>
      </div>

      {/* TARJETAS DE IDEAS PROPUESTAS */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
          gap: "20px",
        }}
      >
        {ideas.map((item) => (
          <div
            key={item.id}
            style={{
              backgroundColor: "#112240",
              padding: "20px",
              borderRadius: "10px",
              border: "1px solid #233554",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              position: "relative",
            }}
          >
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                <span
                  style={{
                    backgroundColor: getPrioridadColor(item.prioridad),
                    color: "white",
                    fontSize: "11px",
                    fontWeight: "bold",
                    padding: "3px 8px",
                    borderRadius: "12px",
                  }}
                >
                  {item.prioridad}
                </span>

                <button
                  onClick={() => eliminarIdea(item.id)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#ef4444",
                    cursor: "pointer",
                    fontSize: "14px",
                  }}
                >
                  ✕
                </button>
              </div>

              <h3 style={{ margin: "0 0 10px 0", color: "#ccd6f6", fontSize: "16px" }}>
                {item.titulo}
              </h3>

              <p style={{ margin: 0, color: "#8892b0", fontSize: "13px", lineHeight: "1.5" }}>
                {item.descripcion || "Sin descripción adicional."}
              </p>
            </div>

            <div
              style={{
                marginTop: "20px",
                paddingTop: "15px",
                borderTop: "1px solid #233554",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span style={{ fontSize: "12px", color: "#64ffda", backgroundColor: "#0a192f", padding: "4px 8px", borderRadius: "4px" }}>
                📌 {item.estado}
              </span>

              <button
                onClick={() => votarIdea(item.id)}
                style={{
                  backgroundColor: "#0a192f",
                  border: "1px solid #233554",
                  color: "#ccd6f6",
                  padding: "6px 12px",
                  borderRadius: "20px",
                  cursor: "pointer",
                  fontSize: "12px",
                  fontWeight: "bold",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                🚀 {item.votos} Votos
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AutomatizacionesView;