import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Line, Doughnut } from "react-chartjs-2";
import ChartDataLabels from "chartjs-plugin-datalabels";

// Registrar componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels
);

function InformeFotovoltaicoView({ datos = {} }) {
  // Configuración de Días (1 a 30 por defecto o según la longitud de los arrays enviados)
  const dias = Array.from({ length: datos?.gen2026?.length || 30 }, (_, i) => i + 1);

  // 1. Configuración Gráfico Comparativa Diaria
  const dataComparativa = {
    labels: dias,
    datasets: [
      {
        label: `Generación ${datos?.anioAnterior || 2025} (kWh)`,
        data: datos?.gen2025 || [],
        backgroundColor: "rgba(180, 180, 180, 0.65)",
      },
      {
        label: `Generación ${datos?.anio || 2026} (kWh)`,
        data: datos?.gen2026 || [],
        backgroundColor: "rgba(0, 75, 135, 0.85)",
      },
    ],
  };

  // 2. Junio 2025 (Barras + Línea)
  const data2025 = {
    labels: dias,
    datasets: [
      {
        type: "bar",
        label: "kWh 2025",
        data: datos?.gen2025 || [],
        backgroundColor: "rgba(0, 75, 135, 0.6)",
        yAxisID: "y",
      },
      {
        type: "line",
        label: "Ganancia ($)",
        data: datos?.gan2025 || [],
        borderColor: "#a0a0a0",
        borderWidth: 2,
        pointRadius: 3,
        yAxisID: "y1",
      },
    ],
  };

  // 2. Junio 2026 (Barras + Línea)
  const data2026 = {
    labels: dias,
    datasets: [
      {
        type: "bar",
        label: "kWh 2026",
        data: datos?.gen2026 || [],
        backgroundColor: "rgba(123, 177, 60, 0.6)",
        yAxisID: "y",
      },
      {
        type: "line",
        label: "Ganancia ($)",
        data: datos?.gan2026 || [],
        borderColor: "#004b87",
        borderWidth: 2,
        pointRadius: 3,
        yAxisID: "y1",
      },
    ],
  };

  const optionsCombinadas = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      datalabels: {
        align: "top",
        anchor: "end",
        offset: 1,
        font: { size: 7, weight: "bold" },
        formatter: (value, context) => {
          if (context.datasetIndex === 1 && value) {
            return "$" + Math.round(value / 1000) + "k";
          }
          return null;
        },
      },
    },
    scales: { y: { display: false }, y1: { display: false } },
  };

  // 3. Históricos kWh
  const dataHistoricokWh = {
    labels: ["Ene", "Feb", "Mar", "Abr", "May"],
    datasets: [
      {
        label: "2025 (kWh)",
        data: datos?.historicoKwh2025 || [16494, 12882, 15651, 16863, 14434],
        borderColor: "#aaa",
        borderDash: [4, 4],
      },
      {
        label: "2026 (kWh)",
        data: datos?.historicoKwh2026 || [14939, 15503, 16581, 17696, 12316],
        borderColor: "#004b87",
        borderWidth: 3,
      },
    ],
  };

  // 3. Históricos Dinero ($)
  const dataHistoricoDinero = {
    labels: ["Ene", "Feb", "Mar", "Abr", "May"],
    datasets: [
      {
        label: "2025 ($ COP)",
        data: datos?.historicoDinero2025 || [6119452, 5784383, 6180160, 6407585, 6975656],
        backgroundColor: "#ccc",
      },
      {
        label: "2026 ($ COP)",
        data: datos?.historicoDinero2026 || [6343335, 5785245, 7399734, 7153031, 8286374],
        backgroundColor: "#7bb13c",
      },
    ],
  };

  // 4. Impacto Económico
  const dataImpacto = {
    labels: ["Factura Pagada Celsia", "Ahorro Aportado por Solar"],
    datasets: [
      {
        data: [
          Number(datos?.facturaCelsia || 8504787),
          Number(datos?.ahorroDirecto || 11382581),
        ],
        backgroundColor: ["#f7b801", "#7bb13c"],
      },
    ],
  };

  return (
    <div style={{ backgroundColor: "#f4f6f9", color: "#333", padding: "20px", borderRadius: "8px", fontFamily: "Segoe UI, sans-serif" }}>
      {/* HERO HEADER */}
      <div style={{ backgroundColor: "#fff", padding: "20px", borderRadius: "8px", borderBottom: "4px solid #7bb13c", marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "15px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <img src="https://i.ibb.co/4ZTX6XDH/CCPalmira-Logo-768x340.png" alt="Logo CCPalmira" style={{ height: "50px" }} />
          <div style={{ borderLeft: "3px solid #004b87", paddingLeft: "15px" }}>
            <h1 style={{ margin: 0, fontSize: "1.4rem", color: "#004b87", textTransform: "uppercase" }}>Informe Consumo y Generación de Energía</h1>
            <p style={{ margin: 0, color: "#555", fontSize: "0.9rem" }}>
              Análisis Energético y Desempeño Fotovoltaico Sede Principal — {datos?.mes || "Junio"} {datos?.anio || "2026"}
            </p>
          </div>
        </div>
        <span style={{ background: "#004b87", color: "white", padding: "6px 12px", borderRadius: "20px", fontSize: "0.75rem", fontWeight: "bold" }}>
          REALIZADO ÁREA TI CÁMARA DE COMERCIO DE PALMIRA
        </span>
      </div>

      {/* KPIS */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "15px", marginBottom: "20px" }}>
        <div style={{ background: "#fff", padding: "15px", borderRadius: "8px", borderLeft: "5px solid #7bb13c" }}>
          <div style={{ fontSize: "0.75rem", color: "#666", fontWeight: "bold" }}>GENERACIÓN FOTOVOLTAICA</div>
          <div style={{ fontSize: "1.4rem", fontWeight: "bold", margin: "5px 0" }}>{Number(datos?.generacionTotalKwh || 14958).toLocaleString()} kWh</div>
          <div style={{ fontSize: "0.75rem", color: "#777" }}>▲ +0.6% vs {datos?.mes || "Junio"} {datos?.anioAnterior || 2025}</div>
        </div>
        <div style={{ background: "#fff", padding: "15px", borderRadius: "8px", borderLeft: "5px solid #7bb13c" }}>
          <div style={{ fontSize: "0.75rem", color: "#666", fontWeight: "bold" }}>GANANCIA ESTIMADA ($)</div>
          <div style={{ fontSize: "1.4rem", fontWeight: "bold", margin: "5px 0" }}>${Number(datos?.gananciaEstimadaCop || 9851130).toLocaleString()} COP</div>
          <div style={{ fontSize: "0.75rem", color: "#777" }}>▲ +0.5% vs {datos?.mes || "Junio"} {datos?.anioAnterior || 2025}</div>
        </div>
        <div style={{ background: "#fff", padding: "15px", borderRadius: "8px", borderLeft: "5px solid #f7b801" }}>
          <div style={{ fontSize: "0.75rem", color: "#666", fontWeight: "bold" }}>CONSUMO RED (CELSIA)</div>
          <div style={{ fontSize: "1.4rem", fontWeight: "bold", margin: "5px 0" }}>{Number(datos?.consumoCelsia || 13842).toLocaleString()} kWh</div>
          <div style={{ fontSize: "0.75rem", color: "#777" }}>▲ +19.2% vs {datos?.mes || "Junio"} {datos?.anioAnterior || 2025}</div>
        </div>
        <div style={{ background: "#fff", padding: "15px", borderRadius: "8px", borderLeft: "5px solid #7bb13c" }}>
          <div style={{ fontSize: "0.75rem", color: "#666", fontWeight: "bold" }}>AHORRO NETO ESTIMADO</div>
          <div style={{ fontSize: "1.4rem", fontWeight: "bold", margin: "5px 0" }}>${Number(datos?.ahorroDirecto || 11382581).toLocaleString()} COP</div>
          <div style={{ fontSize: "0.75rem", color: "#777" }}>134% sobre la factura abonada</div>
        </div>
      </div>

      {/* SECCIÓN 1: COMPARATIVA DIARIA */}
      <div style={{ background: "#fff", padding: "20px", borderRadius: "8px", marginBottom: "20px" }}>
        <h3 style={{ color: "#004b87", marginTop: 0 }}>1. Comparativa Diaria de Generación Solar ({datos?.anioAnterior || 2025} vs {datos?.anio || 2026})</h3>
        <div style={{ height: "300px" }}>
          <Bar data={dataComparativa} options={{ responsive: true, maintainAspectRatio: false, plugins: { datalabels: { display: false } } }} />
        </div>
      </div>

      {/* SECCIÓN 2: RENDIMIENTO Y GANANCIA */}
      <div style={{ background: "#fff", padding: "20px", borderRadius: "8px", marginBottom: "20px" }}>
        <h3 style={{ color: "#004b87", marginTop: 0 }}>2. Rendimiento Energético y Ganancia Económica Calculada</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
          <div>
            <h4 style={{ textAlign: "center", color: "#555" }}>{datos?.mes || "Junio"} {datos?.anioAnterior || 2025}: kWh vs Ganancia ($ COP)</h4>
            <div style={{ height: "260px" }}><Bar data={data2025} options={optionsCombinadas} /></div>
          </div>
          <div>
            <h4 style={{ textAlign: "center", color: "#555" }}>{datos?.mes || "Junio"} {datos?.anio || 2026}: kWh vs Ganancia ($ COP)</h4>
            <div style={{ height: "260px" }}><Bar data={data2026} options={optionsCombinadas} /></div>
          </div>
        </div>
      </div>

      {/* SECCIÓN 3: HISTÓRICO ACUMULADO */}
      <div style={{ background: "#fff", padding: "20px", borderRadius: "8px", marginBottom: "20px" }}>
        <h3 style={{ color: "#004b87", marginTop: 0 }}>3. Comparativo Histórico Acumulado (Enero - Mayo)</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
          <div>
            <h4 style={{ textAlign: "center", color: "#555" }}>Generación Solar Acumulada (kWh)</h4>
            <div style={{ height: "240px" }}><Line data={dataHistoricokWh} options={{ responsive: true, maintainAspectRatio: false, plugins: { datalabels: { display: false } } }} /></div>
          </div>
          <div>
            <h4 style={{ textAlign: "center", color: "#555" }}>Valor Energía Calculada ($ COP)</h4>
            <div style={{ height: "240px" }}><Bar data={dataHistoricoDinero} options={{ responsive: true, maintainAspectRatio: false, plugins: { datalabels: { display: false } } }} /></div>
          </div>
        </div>
      </div>

      {/* SECCIÓN 4: IMPACTO ECONÓMICO */}
      <div style={{ background: "#fff", padding: "20px", borderRadius: "8px" }}>
        <h3 style={{ color: "#004b87", marginTop: 0 }}>4. Impacto Económico Real y Análisis de Facturación Celsia</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", alignItems: "center" }}>
          <div style={{ height: "250px" }}>
            <Doughnut data={dataImpacto} options={{ responsive: true, maintainAspectRatio: false, plugins: { datalabels: { display: false }, legend: { position: "bottom" } } }} />
          </div>
          <div>
            <p><strong>Balance Financiero del Mes ({datos?.mes || "Junio"} {datos?.anio || 2026}):</strong></p>
            <ul>
              <li><strong>Costo Estimado SIN Sistema Fotovoltaico:</strong> ${Number(datos?.costoSinSolar || 19887368).toLocaleString()} COP</li>
              <li><strong>Monto Efectivamente Liquidado a Celsia:</strong> ${Number(datos?.facturaCelsia || 8504787).toLocaleString()} COP</li>
              <li><strong>Ahorro Directo Obtenido en el Mes:</strong> <strong style={{ color: "#5b8c28", fontSize: "1.1rem" }}>${Number(datos?.ahorroDirecto || 11382581).toLocaleString()} COP</strong></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InformeFotovoltaicoView;