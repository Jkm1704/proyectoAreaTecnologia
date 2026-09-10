import { useState } from "react";

function FormularioFotovoltaico({ onGenerarInforme }) {
  const [formData, setFormData] = useState({
    mes: "Junio",
    anio: 2026,
    anioAnterior: 2025,
    generacionTotalKwh: 14958,
    gananciaEstimadaCop: 9851130,
    consumoCelsia: 13842,
    facturaCelsia: 8504787,
    ahorroDirecto: 11382581,
    costoSinSolar: 19887368,

    // Series de datos para gráficas (separados por coma)
    gen2025: "450, 480, 500, 420, 490, 510, 470, 460, 520, 500, 480, 490, 510, 530, 490, 480, 500, 510, 520, 490, 470, 480, 500, 510, 490, 480, 520, 500, 490, 510",
    gen2026: "480, 500, 520, 450, 510, 530, 490, 480, 540, 520, 500, 510, 530, 550, 510, 500, 520, 530, 540, 510, 490, 500, 520, 530, 510, 500, 540, 520, 510, 530",
    gan2025: "300000, 320000, 310000, 290000, 330000, 340000, 310000, 305000, 350000, 320000, 310000, 320000, 335000, 340000, 320000, 310000, 330000, 340000, 350000, 320000, 310000, 320000, 330000, 340000, 320000, 310000, 350000, 330000, 320000, 340000",
    gan2026: "320000, 340000, 330000, 300000, 350000, 360000, 330000, 320000, 370000, 340000, 330000, 340000, 350000, 360000, 340000, 330000, 350000, 360000, 370000, 340000, 330000, 340000, 350000, 360000, 340000, 330000, 370000, 350000, 340000, 360000",

    // Históricos (Ene - May)
    historicoKwh2025: "16494, 12882, 15651, 16863, 14434",
    historicoKwh2026: "14939, 15503, 16581, 17696, 12316",
    historicoDinero2025: "6119452, 5784383, 6180160, 6407585, 6975656",
    historicoDinero2026: "6343335, 5785245, 7399734, 7153031, 8286374"
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const parseArray = (str) =>
      str ? str.split(",").map((v) => Number(v.trim()) || 0) : [];

    const datosProcesados = {
      ...formData,
      generacionTotalKwh: Number(formData.generacionTotalKwh),
      gananciaEstimadaCop: Number(formData.gananciaEstimadaCop),
      consumoCelsia: Number(formData.consumoCelsia),
      facturaCelsia: Number(formData.facturaCelsia),
      ahorroDirecto: Number(formData.ahorroDirecto),
      costoSinSolar: Number(formData.costoSinSolar),
      gen2025: parseArray(formData.gen2025),
      gen2026: parseArray(formData.gen2026),
      gan2025: parseArray(formData.gan2025),
      gan2026: parseArray(formData.gan2026),
      historicoKwh2025: parseArray(formData.historicoKwh2025),
      historicoKwh2026: parseArray(formData.historicoKwh2026),
      historicoDinero2025: parseArray(formData.historicoDinero2025),
      historicoDinero2026: parseArray(formData.historicoDinero2026),
    };

    onGenerarInforme(datosProcesados);
  };

  return (
    <form onSubmit={handleSubmit} style={{ color: "#fff", display: "flex", flexDirection: "column", gap: "20px" }}>
      <h3 style={{ color: "#64ffda", margin: 0 }}>📋 Datos para el Informe Ejecutivo Energético</h3>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
        <div>
          <label style={{ fontSize: "12px", color: "#8892b0" }}>Mes del Informe:</label>
          <input type="text" name="mes" value={formData.mes} onChange={handleChange} style={inputStyle} />
        </div>
        <div>
          <label style={{ fontSize: "12px", color: "#8892b0" }}>Año Evaluación:</label>
          <input type="number" name="anio" value={formData.anio} onChange={handleChange} style={inputStyle} />
        </div>
        <div>
          <label style={{ fontSize: "12px", color: "#8892b0" }}>Generación Fotovoltaica (kWh):</label>
          <input type="number" name="generacionTotalKwh" value={formData.generacionTotalKwh} onChange={handleChange} style={inputStyle} />
        </div>
        <div>
          <label style={{ fontSize: "12px", color: "#8892b0" }}>Ganancia Estimada ($ COP):</label>
          <input type="number" name="gananciaEstimadaCop" value={formData.gananciaEstimadaCop} onChange={handleChange} style={inputStyle} />
        </div>
        <div>
          <label style={{ fontSize: "12px", color: "#8892b0" }}>Consumo Red Celsia (kWh):</label>
          <input type="number" name="consumoCelsia" value={formData.consumoCelsia} onChange={handleChange} style={inputStyle} />
        </div>
        <div>
          <label style={{ fontSize: "12px", color: "#8892b0" }}>Factura Celsia ($ COP):</label>
          <input type="number" name="facturaCelsia" value={formData.facturaCelsia} onChange={handleChange} style={inputStyle} />
        </div>
        <div>
          <label style={{ fontSize: "12px", color: "#8892b0" }}>Ahorro Neto Directo ($ COP):</label>
          <input type="number" name="ahorroDirecto" value={formData.ahorroDirecto} onChange={handleChange} style={inputStyle} />
        </div>
        <div>
          <label style={{ fontSize: "12px", color: "#8892b0" }}>Costo Estimado SIN Solar ($ COP):</label>
          <input type="number" name="costoSinSolar" value={formData.costoSinSolar} onChange={handleChange} style={inputStyle} />
        </div>
      </div>

      <details style={{ border: "1px solid #233554", borderRadius: "8px", padding: "12px" }}>
        <summary style={{ cursor: "pointer", color: "#64ffda", fontWeight: "bold" }}>
          ⚙️ Modificar Serie de Datos Diarios y Históricos (Avanzado)
        </summary>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "12px" }}>
          <div>
            <label style={{ fontSize: "11px", color: "#8892b0" }}>Gen. Diaria 2025 (kWh):</label>
            <input type="text" name="gen2025" value={formData.gen2025} onChange={handleChange} style={inputStyle} />
          </div>
          <div>
            <label style={{ fontSize: "11px", color: "#8892b0" }}>Gen. Diaria 2026 (kWh):</label>
            <input type="text" name="gen2026" value={formData.gen2026} onChange={handleChange} style={inputStyle} />
          </div>
          <div>
            <label style={{ fontSize: "11px", color: "#8892b0" }}>Ganancia Diaria 2025 ($ COP):</label>
            <input type="text" name="gan2025" value={formData.gan2025} onChange={handleChange} style={inputStyle} />
          </div>
          <div>
            <label style={{ fontSize: "11px", color: "#8892b0" }}>Ganancia Diaria 2026 ($ COP):</label>
            <input type="text" name="gan2026" value={formData.gan2026} onChange={handleChange} style={inputStyle} />
          </div>
        </div>
      </details>

      <button type="submit" style={buttonStyle}>
        ⚡ Generar Informe Ejecutivo
      </button>
    </form>
  );
}

const inputStyle = {
  width: "100%",
  padding: "10px",
  borderRadius: "6px",
  border: "1px solid #233554",
  backgroundColor: "#0a192f",
  color: "#fff",
  marginTop: "4px",
  boxSizing: "border-box"
};

const buttonStyle = {
  width: "100%",
  padding: "14px",
  backgroundColor: "#84cc16",
  color: "#0a192f",
  border: "none",
  borderRadius: "8px",
  fontWeight: "bold",
  fontSize: "16px",
  cursor: "pointer",
  marginTop: "10px"
};

export default FormularioFotovoltaico;