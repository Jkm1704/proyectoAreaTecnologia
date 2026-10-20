import { useState } from "react";
import { API_URL } from "./config";

const OPCIONES_AÑOS = ["2026", "2025", "2024", "2023", "2022", "2021", "2020"];
const OPCIONES_MUNICIPIOS = [
  "76520 - PALMIRA",
  "76130 - CANDELARIA",
  "76563 - PRADERA",
  "76306 - GINEBRA",
  "76275 - FLORIDA",
];
const OPCIONES_SECTORES = [
  "A - Agricultura, ganadería, caza y silvicultura",
  "B - Explotación de minas y canteras",
  "C - Industrias manufactureras",
  "D - Suministro de electricidad, gas, vapor",
  "E - Distribución de agua, evacuación y tratamiento de aguas servidas",
  "F - Construcción",
  "G - Comercio al por mayor y al por menor",
  "H - Transporte y almacenamiento",
  "I - Alojamiento y servicios de comida",
  "J - Información y comunicaciones",
  "K - Actividades financieras y de seguros",
  "L - Actividades inmobiliarias",
  "M - Actividades profesionales, científicas y técnicas",
  "N - Actividades de servicios administrativos y de apoyo",
  "O - Administración pública y defensa",
  "P - Educación",
  "Q - Actividades de atención de la salud humana y de asistencia social",
  "R - Actividades artísticas, de entretenimiento y recreación",
  "S - Otras actividades de servicios",
];

function ProcesadorReportesView() {
  const [tipoReporte, setTipoReporte] = useState("matriculados_renovados");
  const [archivo, setArchivo] = useState(null);
  const [cargando, setCargando] = useState(false);

  // Filtros de Selección Múltiple
  const [anosSeleccionados, setAnosSeleccionados] = useState([]);
  const [munsSeleccionados, setMunsSeleccionados] = useState([]);
  const [sectoresSeleccionados, setSectoresSeleccionados] = useState([]);
  const [ciiuTexto, setCiiuTexto] = useState("");

  // Función para parsear CSV en el Frontend de forma ultra segura
  const parsearCsvEnNavegador = (textoCsv) => {
    let contenido = textoCsv;
    if (
      contenido.toLowerCase().startsWith("sep=") ||
      contenido.startsWith("﻿sep=")
    ) {
      contenido = contenido.substring(contenido.indexOf("\n") + 1);
    }

    const lineas = [];
    let lineaActual = "";
    let dentroDeComillas = false;

    for (let i = 0; i < contenido.length; i++) {
      const char = contenido[i];
      if (char === '"') {
        dentroDeComillas = !dentroDeComillas;
        lineaActual += char;
      } else if ((char === "\n" || char === "\r") && !dentroDeComillas) {
        if (lineaActual.trim().length > 0) lineas.push(lineaActual);
        lineaActual = "";
      } else {
        lineaActual += char;
      }
    }
    if (lineaActual.trim().length > 0) lineas.push(lineaActual);

    if (lineas.length === 0) return [];

    const encabezados = lineas[0]
      .split(";")
      .map((h) => h.trim().replace(/^"|"$/g, ""));
    const datos = [];

    for (let i = 1; i < lineas.length; i++) {
      const valores = lineas[i]
        .split(";")
        .map((v) => v.trim().replace(/^"|"$/g, ""));
      const filaObj = {};
      encabezados.forEach((header, index) => {
        filaObj[header] = valores[index] !== undefined ? valores[index] : "";
      });
      datos.push(filaObj);
    }
    return datos;
  };

  // 1. Reporte Matriculados / Renovados
  const handleProcesarMatriculados = async (e) => {
    e.preventDefault();
    if (!archivo) return alert("Por favor selecciona un archivo CSV");

    const formData = new FormData();
    formData.append("archivo", archivo);

    setCargando(true);
    try {
      const response = await fetch(`${API_URL}/api/procesar-listado`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Error en el servidor");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Matriculados_y_Renovados_${new Date().toISOString().slice(0, 10)}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      alert("Ocurrió un error al procesar el archivo");
      console.error(err);
    } finally {
      setCargando(false);
    }
  };

  // 2. Reporte Excel Base procesado en Frontend
  const handleProcesarBase = async (e) => {
    e.preventDefault();
    if (!archivo) return alert("Por favor selecciona un archivo CSV");

    setCargando(true);
    try {
      const reader = new FileReader();

      reader.onload = async (evento) => {
        try {
          const textoCsv = evento.target.result;
          const datosBrutos = parsearCsvEnNavegador(textoCsv);

          // Limpiar listas de filtros
          const listaCiius = ciiuTexto
            ? ciiuTexto
                .split(",")
                .map((c) => c.trim().toLowerCase())
                .filter((c) => c.length > 0)
            : [];
          const listaSectores = sectoresSeleccionados.map((s) =>
            s.charAt(0).toUpperCase(),
          );
          const listaMunicipios = munsSeleccionados.map((m) => {
            const partes = m.split("-");
            return (partes.length > 1 ? partes[1] : m).trim().toLowerCase();
          });

          // Filtrar directamente en React
          const datosFiltrados = datosBrutos.filter((fila) => {
            const ultAnoFila = String(fila["ULT-ANO_REN"] || "").trim();
            const munFila = String(fila["MUN-COMERCIAL"] || "")
              .trim()
              .toLowerCase();
            const ciiuFila = String(fila["CIIU-1"] || "")
              .trim()
              .toLowerCase();
            const sectorFila = ciiuFila ? ciiuFila.charAt(0).toUpperCase() : "";

            if (
              anosSeleccionados.length > 0 &&
              !anosSeleccionados.includes(ultAnoFila)
            )
              return false;
            if (
              listaMunicipios.length > 0 &&
              !listaMunicipios.some((m) => munFila.includes(m))
            )
              return false;
            if (listaSectores.length > 0 && !listaSectores.includes(sectorFila))
              return false;
            if (
              listaCiius.length > 0 &&
              !listaCiius.some((c) => ciiuFila.includes(c))
            )
              return false;

            return true;
          });

          // Enviar únicamente los datos filtrados en formato JSON
          const response = await fetch(`${API_URL}/api/generar-excel-base`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ datos: datosFiltrados }),
          });

          if (!response.ok)
            throw new Error("Error al generar el archivo Excel");

          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `BASE_FILTRADA_ACTIVOS_${new Date().toISOString().slice(0, 10)}.xlsx`;
          document.body.appendChild(a);
          a.click();
          a.remove();
        } catch (err) {
          console.error(err);
          alert("Error procesando los datos filtrados.");
        } finally {
          setCargando(false);
        }
      };

      reader.readAsText(archivo, "latin1");
    } catch (err) {
      alert("Error leyendo el archivo");
      console.error(err);
      setCargando(false);
    }
  };

  return (
    <div style={{ padding: "20px 40px", color: "#fff" }}>
      <div style={{ display: "flex", gap: "15px", marginBottom: "25px" }}>
        <button
          onClick={() => {
            setTipoReporte("matriculados_renovados");
            setArchivo(null);
          }}
          style={{
            padding: "10px 20px",
            backgroundColor:
              tipoReporte === "matriculados_renovados" ? "#64ffda" : "#112240",
            color:
              tipoReporte === "matriculados_renovados" ? "#0a192f" : "#a8b2d1",
            border: "1px solid #64ffda",
            borderRadius: "6px",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
           Matriculados y Renovados
        </button>

        <button
          onClick={() => {
            setTipoReporte("excel_base");
            setArchivo(null);
          }}
          style={{
            padding: "10px 20px",
            backgroundColor:
              tipoReporte === "excel_base" ? "#64ffda" : "#112240",
            color: tipoReporte === "excel_base" ? "#0a192f" : "#a8b2d1",
            border: "1px solid #64ffda",
            borderRadius: "6px",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
           Convertir a Excel Base (Con Filtros Múltiples)
        </button>
      </div>

      {tipoReporte === "matriculados_renovados" && (
        <div
          style={{
            padding: "25px",
            backgroundColor: "#112240",
            borderRadius: "8px",
            border: "1px solid #233554",
          }}
        >
          <h2 style={{ color: "#64ffda", marginTop: 0 }}>
             Automatizador de Listados (Matriculados y Renovados)
          </h2>
          <p style={{ color: "#8892b0" }}>
            Sube el archivo CSV exportado y obtén el reporte filtrado en Excel
            con las pestañas
            <strong> MATRICULADOS</strong> y <strong>RENOVADOS</strong>.
          </p>

          <form
            onSubmit={handleProcesarMatriculados}
            style={{
              display: "flex",
              gap: "15px",
              alignItems: "center",
              marginTop: "20px",
            }}
          >
            <input
              type="file"
              accept=".csv"
              onChange={(e) => setArchivo(e.target.files[0])}
              style={{ color: "#fff" }}
            />
            <button
              type="submit"
              disabled={cargando}
              style={{
                padding: "10px 20px",
                backgroundColor: "#64ffda",
                color: "#0a192f",
                border: "none",
                borderRadius: "6px",
                fontWeight: "bold",
                cursor: "pointer",
              }}
            >
              {cargando
                ? "Procesando Excel..."
                : "Procesar y Descargar Excel"}
            </button>
          </form>
        </div>
      )}

      {tipoReporte === "excel_base" && (
        <div
          style={{
            padding: "25px",
            backgroundColor: "#112240",
            borderRadius: "8px",
            border: "1px solid #233554",
          }}
        >
          <h2 style={{ color: "#64ffda", marginTop: 0 }}>
            📋 Transformador a Excel Base con Desplegables Múltiples
          </h2>
          <p style={{ color: "#8892b0" }}>
            Selecciona múltiples opciones en cada desplegable para realizar
            filtrados avanzados.
          </p>

          <form
            onSubmit={handleProcesarBase}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "20px",
              marginTop: "20px",
            }}
          >
            <div
              style={{
                backgroundColor: "#0a192f",
                padding: "15px",
                borderRadius: "6px",
                border: "1px solid #233554",
              }}
            >
              <label
                style={{
                  display: "block",
                  color: "#64ffda",
                  fontWeight: "bold",
                  marginBottom: "8px",
                }}
              >
                Seleccionar Archivo CSV:
              </label>
              <input
                type="file"
                accept=".csv"
                onChange={(e) => setArchivo(e.target.files[0])}
                style={{ color: "#fff" }}
              />
            </div>

            <div
              style={{
                backgroundColor: "#0a192f",
                padding: "20px",
                borderRadius: "6px",
                border: "1px solid #233554",
              }}
            >
              <h4
                style={{ color: "#ccd6f6", marginTop: 0, marginBottom: "15px" }}
              >
                Filtros de Selección Múltiple:
              </h4>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "20px",
                }}
              >
                <DesplegableMultiSeleccion
                  titulo="Último Año Renovado (ULT-ANO_REN):"
                  opciones={OPCIONES_AÑOS}
                  seleccionados={anosSeleccionados}
                  setSeleccionados={setAnosSeleccionados}
                  placeholder="Todos los años"
                />

                <DesplegableMultiSeleccion
                  titulo="Municipio Comercial:"
                  opciones={OPCIONES_MUNICIPIOS}
                  seleccionados={munsSeleccionados}
                  setSeleccionados={setMunsSeleccionados}
                  placeholder="Todos los municipios"
                />

                <DesplegableMultiSeleccion
                  titulo="Sectores Económicos:"
                  opciones={OPCIONES_SECTORES}
                  seleccionados={sectoresSeleccionados}
                  setSeleccionados={setSectoresSeleccionados}
                  placeholder="Todos los sectores"
                />

                <div>
                  <label
                    style={{
                      fontSize: "13px",
                      color: "#8892b0",
                      display: "block",
                      marginBottom: "6px",
                    }}
                  >
                    Códigos CIIU-1 (Separados por coma):
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: C1081, G4771, Q8691"
                    value={ciiuTexto}
                    onChange={(e) => setCiiuTexto(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "10px",
                      borderRadius: "6px",
                      border: "1px solid #233554",
                      backgroundColor: "#112240",
                      color: "#fff",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={cargando}
              style={{
                padding: "12px 24px",
                backgroundColor: "#84cc16",
                color: "#0a192f",
                border: "none",
                borderRadius: "6px",
                fontWeight: "bold",
                fontSize: "14px",
                cursor: "pointer",
              }}
            >
              {cargando
                ? "Generando Excel Base..."
                : "⚡ Transformar y Descargar Excel Base"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

function DesplegableMultiSeleccion({
  titulo,
  opciones,
  seleccionados,
  setSeleccionados,
  placeholder,
}) {
  const [abierto, setAbierto] = useState(false);

  const toggleOpción = (opcion) => {
    if (seleccionados.includes(opcion)) {
      setSeleccionados(seleccionados.filter((item) => item !== opcion));
    } else {
      setSeleccionados([...seleccionados, opcion]);
    }
  };

  const seleccionarTodos = () => {
    if (seleccionados.length === opciones.length) {
      setSeleccionados([]);
    } else {
      setSeleccionados([...opciones]);
    }
  };

  return (
    <div style={{ position: "relative" }}>
      <label
        style={{
          fontSize: "13px",
          color: "#8892b0",
          display: "block",
          marginBottom: "6px",
        }}
      >
        {titulo}
      </label>

      <div
        onClick={() => setAbierto(!abierto)}
        style={{
          padding: "10px",
          backgroundColor: "#112240",
          border: "1px solid #233554",
          borderRadius: "6px",
          cursor: "pointer",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          color: "#fff",
          fontSize: "13px",
        }}
      >
        <span
          style={{
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            maxWidth: "85%",
          }}
        >
          {seleccionados.length === 0
            ? placeholder
            : `${seleccionados.length} seleccionado(s): ${seleccionados.join(", ")}`}
        </span>
        <span style={{ color: "#64ffda", fontSize: "10px" }}>
          {abierto ? "▲" : "▼"}
        </span>
      </div>

      {abierto && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            zIndex: 10,
            backgroundColor: "#0a192f",
            border: "1px solid #64ffda",
            borderRadius: "6px",
            maxHeight: "220px",
            overflowY: "auto",
            marginTop: "4px",
            boxShadow: "0 8px 16px rgba(0,0,0,0.5)",
            padding: "8px",
          }}
        >
          <div
            onClick={seleccionarTodos}
            style={{
              padding: "6px 8px",
              cursor: "pointer",
              borderBottom: "1px solid #233554",
              color: "#64ffda",
              fontWeight: "bold",
              fontSize: "12px",
            }}
          >
            {seleccionados.length === opciones.length
              ? "❌ Desmarcar Todos"
              : "✅ Seleccionar Todos"}
          </div>

          {opciones.map((opcion) => (
            <label
              key={opcion}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "6px 8px",
                cursor: "pointer",
                fontSize: "12px",
                color: seleccionados.includes(opcion) ? "#64ffda" : "#ccd6f6",
                borderRadius: "4px",
                backgroundColor: seleccionados.includes(opcion)
                  ? "#112240"
                  : "transparent",
              }}
            >
              <input
                type="checkbox"
                checked={seleccionados.includes(opcion)}
                onChange={() => toggleOpción(opcion)}
                style={{ cursor: "pointer" }}
              />
              {opcion}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

export default ProcesadorReportesView;
