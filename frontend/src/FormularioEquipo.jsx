import { useState } from "react";

function FormularioEquipo({ onGuardar, onCancelar }) {
  const [nombre, setNombre] = useState("");
  const [serial, setSerial] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!nombre.trim()) {
      alert("Debes escribir el nombre del equipo.");
      return;
    }

    onGuardar({
      nombre,
      serial: serial.trim() || "S/N",
    });
  };

  return (
    <div style={{ backgroundColor: "#0a192f", padding: "20px", borderRadius: "8px", border: "1px solid #233554" }}>
      <h3 style={{ color: "#64ffda", marginTop: 0 }}>Registrar Nuevo Equipo en Inventario</h3>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "15px", maxWidth: "600px" }}>
        <div>
          <label style={{ display: "block", fontSize: "0.85rem", color: "#8892b0", marginBottom: "5px" }}>
            Nombre / Descripción del Equipo:
          </label>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            style={inputStyle}
            placeholder="Ej. Videobeam Epson EB-X05"
            required
          />
        </div>

        <div>
          <label style={{ display: "block", fontSize: "0.85rem", color: "#8892b0", marginBottom: "5px" }}>
            Número de Serial / Placa de Inventario:
          </label>
          <input
            type="text"
            value={serial}
            onChange={(e) => setSerial(e.target.value)}
            style={inputStyle}
            placeholder="Ej. EPS-998811"
          />
        </div>

        <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
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
            style={{
              padding: "10px 20px",
              backgroundColor: "#84cc16",
              color: "#0a192f",
              border: "none",
              borderRadius: "4px",
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            Guardar Equipo
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

export default FormularioEquipo;