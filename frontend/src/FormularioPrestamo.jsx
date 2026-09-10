import { useState } from "react";

function FormularioPrestamo({ equipos, onGuardar, onCancelar }) {
  const [form, setForm] = useState({
    solicitante: "",
    area: "",
    equipoId: "",
    fechaPrestamo: new Date().toISOString().split("T")[0],
    fechaDevolucionProbable: "",
    observaciones: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.solicitante || !form.equipoId) {
      alert("Por favor completa el solicitante y selecciona un equipo.");
      return;
    }

    const equipoSeleccionado = equipos.find((e) => e.id === Number(form.equipoId));

    onGuardar({
      ...form,
      equipoNombre: equipoSeleccionado ? equipoSeleccionado.nombre : "",
      equipoSerial: equipoSeleccionado ? equipoSeleccionado.serial : "",
    });
  };

  return (
    <div style={{ backgroundColor: "#0a192f", padding: "20px", borderRadius: "8px", border: "1px solid #233554" }}>
      <h3 style={{ color: "#64ffda", marginTop: 0 }}>Registrar Salida de Equipo</h3>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
          <div>
            <label style={{ display: "block", fontSize: "0.85rem", color: "#8892b0", marginBottom: "5px" }}>
              Nombre del Solicitante:
            </label>
            <input
              type="text"
              name="solicitante"
              value={form.solicitante}
              onChange={handleChange}
              style={inputStyle}
              placeholder="Ej. Carlos Martínez"
              required
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.85rem", color: "#8892b0", marginBottom: "5px" }}>
              Área / Dependencia:
            </label>
            <input
              type="text"
              name="area"
              value={form.area}
              onChange={handleChange}
              style={inputStyle}
              placeholder="Ej. Registro Mercantil"
            />
          </div>

          <div style={{ gridColumn: "span 2" }}>
            <label style={{ display: "block", fontSize: "0.85rem", color: "#64ffda", marginBottom: "5px", fontWeight: "bold" }}>
              Seleccionar Equipo Disponible:
            </label>
            <select
              name="equipoId"
              value={form.equipoId}
              onChange={handleChange}
              style={{ ...inputStyle, color: "#fff", cursor: "pointer" }}
              required
            >
              <option value="">-- Seleccionar Equipo del Inventario --</option>
              {equipos.map((eq) => (
                <option key={eq.id} value={eq.id} style={{ backgroundColor: "#0a192f" }}>
                  {eq.nombre} — (Serial: {eq.serial})
                </option>
              ))}
            </select>
            {equipos.length === 0 && (
              <span style={{ fontSize: "0.75rem", color: "#f7b801", marginTop: "4px", display: "block" }}>
                No hay equipos disponibles para préstamo. Registra uno en el menú "Inventario Equipos".
              </span>
            )}
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.85rem", color: "#8892b0", marginBottom: "5px" }}>
              Fecha de Salida:
            </label>
            <input
              type="date"
              name="fechaPrestamo"
              value={form.fechaPrestamo}
              onChange={handleChange}
              style={inputStyle}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.85rem", color: "#8892b0", marginBottom: "5px" }}>
              Fecha Estimada de Devolución:
            </label>
            <input
              type="date"
              name="fechaDevolucionProbable"
              value={form.fechaDevolucionProbable}
              onChange={handleChange}
              style={inputStyle}
            />
          </div>
        </div>

        <div>
          <label style={{ display: "block", fontSize: "0.85rem", color: "#8892b0", marginBottom: "5px" }}>
            Observaciones / Estado del equipo al entregar:
          </label>
          <textarea
            name="observaciones"
            value={form.observaciones}
            onChange={handleChange}
            rows="3"
            style={{ ...inputStyle, resize: "vertical" }}
            placeholder="Ej. Entregado con maletín y cargador original."
          ></textarea>
        </div>

        <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "10px" }}>
          <button
            type="button"
            onClick={onCancelar}
            style={{
              padding: "10px 20px",
              backgroundColor: "#112240",
              color: "#8892b0",
              border: "1px solid #233554",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={equipos.length === 0}
            style={{
              padding: "10px 20px",
              backgroundColor: equipos.length > 0 ? "#84cc16" : "#555",
              color: "#0a192f",
              border: "none",
              borderRadius: "4px",
              fontWeight: "bold",
              cursor: equipos.length > 0 ? "pointer" : "not-allowed",
            }}
          >
            Guardar Préstamo
          </button>
        </div>
      </form>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "10px",
  backgroundColor: "#112240",
  border: "1px solid #233554",
  borderRadius: "4px",
  color: "#e6f1ff",
  boxSizing: "border-box",
};

export default FormularioPrestamo;