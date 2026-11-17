const express = require("express");
const cors = require("cors");
const { PrismaBetterSqlite3 } = require("@prisma/adapter-better-sqlite3");
const { PrismaClient } = require("@prisma/client");
const multer = require("multer");
const ExcelJS = require("exceljs");
const upload = multer({ storage: multer.memoryStorage() });

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL || "file:./dev.db",
});
const prisma = new PrismaClient({ adapter });

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ limit: "100mb", extended: true }));

// --- ESTRUCTURA DE COLUMNAS PARA REPORTES ---
const COLUMNAS_DESEADAS = [
  "MATRICULA",
  "ORGANIZACION",
  "EST-MATRICULA",
  "RAZON SOCIAL",
  "NOMBRE 1",
  "NOMBRE 2",
  "APELLIDO 1",
  "APELLIDO 2",
  "IDENTIFICACION",
  "NIT",
  "FEC-MATRICULA",
  "FEC-RENOVACION",
  "ULT-ANO_REN",
  "DIR-COMERCIAL",
  "BARRIO-COMERCIAL",
  "MUN-COMERCIAL",
  "TEL-COM-1",
  "TEL-COM-2",
  "TEL-COM-3",
  "EMAIL-COMERCIAL",
  "EMAIL-COM-2",
  "EMAIL-COM-3",
  "DIR-NOTIFICACION",
  "MUN-NOTIFICACION",
  "EMAIL-NOTIFICACION",
  "TAM-EMPRESA",
  "PERSONAL",
];

const COLUMNAS_BASE = [
  "MATRICULA",
  "ORGANIZACION",
  "EST-MATRICULA",
  "RAZON SOCIAL",
  "NOMBRE 1",
  "NOMBRE 2",
  "APELLIDO 1",
  "APELLIDO 2",
  "NIT",
  "FEC-MATRICULA",
  "FEC-RENOVACION",
  "ULT-ANO_REN",
  "DIR-COMERCIAL",
  "BARRIO-COMERCIAL",
  "MUN-COMERCIAL",
  "TEL-COM-1",
  "EMAIL-COMERCIAL",
  "SECTORES",
  "CIIU-1",
  "ACTIVIDAD ECONOMICA",
  "TAM-EMPRESA",
  "PERSONAL",
];

function formatearFecha(val) {
  if (!val) return "";
  const str = String(val).trim();

  if (str.length === 8 && /^\d+$/.test(str)) {
    return `${str.substring(6, 8)}/${str.substring(4, 6)}/${str.substring(0, 4)}`;
  }

  if (str.length === 10 && str.includes("-")) {
    const partes = str.split("-");
    if (partes.length === 3 && partes[0].length === 4) {
      return `${partes[2]}/${partes[1]}/${partes[0]}`;
    }
  }

  return str;
}

// ==========================================
// PARSER ULTRA ROBUSTO DE CSV
// ==========================================
function parsearCsvLineas(buffer) {
  let contenido = buffer.toString("latin1");

  if (
    contenido.toLowerCase().startsWith("sep=") ||
    contenido.toLowerCase().startsWith("ï»¿sep=") ||
    contenido.includes("sep=")
  ) {
    const primerSalto = contenido.indexOf("\n");
    if (primerSalto !== -1) {
      contenido = contenido.substring(primerSalto + 1);
    }
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
      if (lineaActual.trim().length > 0) {
        lineas.push(lineaActual);
      }
      lineaActual = "";
    } else {
      lineaActual += char;
    }
  }
  if (lineaActual.trim().length > 0) {
    lineas.push(lineaActual);
  }

  if (lineas.length === 0) return [];

  const primeraLinea = lineas[0];
  const separador = primeraLinea.includes(";") ? ";" : ",";

  const encabezados = primeraLinea
    .split(separador)
    .map((h) =>
      h.trim().replace(/^"|"$/g, "").replace(/\r/g, "").toUpperCase(),
    );

  const datos = [];

  for (let i = 1; i < lineas.length; i++) {
    const valores = lineas[i]
      .split(separador)
      .map((v) => v.trim().replace(/^"|"$/g, "").replace(/\r/g, ""));

    const filaObj = {};
    encabezados.forEach((header, index) => {
      filaObj[header] = valores[index] !== undefined ? valores[index] : "";
    });

    datos.push(filaObj);
  }

  return datos;
}

// Helper para obtener valor de propiedad sin importar mayúsculas
function obtenerValor(fila, clave) {
  const kFound = Object.keys(fila).find(
    (k) => k.trim().toUpperCase() === clave.toUpperCase(),
  );
  return kFound ? String(fila[kFound]).trim() : "";
}

// ==========================================
// 📌 1. ENDPOINT: MATRICULADOS Y RENOVADOS
// ==========================================
app.post(
  "/api/procesar-listado",
  upload.single("archivo"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No se subió ningún archivo" });
      }

      const datosBrutos = parsearCsvLineas(req.file.buffer);
      const matriculados = [];
      const renovados = [];

      datosBrutos.forEach((filaObj) => {
        const filaFiltrada = {};

        COLUMNAS_DESEADAS.forEach((col) => {
          let val = obtenerValor(filaObj, col);

          if (
            col.toUpperCase().includes("FEC") ||
            col.toUpperCase().includes("FECHA")
          ) {
            val = formatearFecha(val);
          }

          filaFiltrada[col] = String(val).trim();
        });

        const tieneValores = Object.values(filaFiltrada).some((v) => v !== "");
        if (!tieneValores) return;

        const fecMat = filaFiltrada["FEC-MATRICULA"];
        const fecRen = filaFiltrada["FEC-RENOVACION"];

        if (fecMat && fecRen && fecMat === fecRen) {
          matriculados.push(filaFiltrada);
        } else {
          renovados.push(filaFiltrada);
        }
      });

      const workbook = new ExcelJS.Workbook();

      const agregarYFormatearPestana = (nombrePestana, datos) => {
        const sheet = workbook.addWorksheet(nombrePestana);
        sheet.views = [{ showGridLines: true }];

        sheet.addRow(COLUMNAS_DESEADAS);

        datos.forEach((row) => {
          const valoresFila = COLUMNAS_DESEADAS.map((col) => row[col] || "");
          sheet.addRow(valoresFila);
        });

        const totalFilas = datos.length + 1;
        const totalColumnas = COLUMNAS_DESEADAS.length;

        for (let r = 1; r <= totalFilas; r++) {
          const row = sheet.getRow(r);
          row.height = 20;

          for (let c = 1; c <= totalColumnas; c++) {
            const cell = row.getCell(c);
            cell.numFmt = "@";
            cell.border = {
              top: { style: "thin", color: { argb: "808080" } },
              left: { style: "thin", color: { argb: "808080" } },
              bottom: { style: "thin", color: { argb: "808080" } },
              right: { style: "thin", color: { argb: "808080" } },
            };

            cell.font = { name: "Aptos Narrow", size: 11 };
            cell.alignment = { vertical: "middle", horizontal: "left" };
          }
        }

        COLUMNAS_DESEADAS.forEach((colName, index) => {
          const colIndex = index + 1;
          let maxLen = colName.length;

          for (let r = 1; r <= Math.min(totalFilas, 100); r++) {
            const cellVal = sheet.getRow(r).getCell(colIndex).value;
            if (cellVal) {
              const len = String(cellVal).length;
              if (len > maxLen) maxLen = len;
            }
          }

          sheet.getColumn(colIndex).width = Math.max(maxLen + 3, 12);
        });
      };

      agregarYFormatearPestana("RENOVADOS", renovados);
      agregarYFormatearPestana("MATRICULADOS", matriculados);

      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      );
      res.setHeader(
        "Content-Disposition",
        'attachment; filename="Matriculados_y_Renovados_Filtrado.xlsx"',
      );

      await workbook.xlsx.write(res);
      res.end();
    } catch (error) {
      console.error("Error procesando archivo:", error);
      res
        .status(500)
        .json({ error: "Error interno al procesar el archivo Excel" });
    }
  },
);

// ==========================================
// 📌 2. ENDPOINT: GENERAR EXCEL BASE CON ENCABEZADO "CAMARA DE COMERCIO DE PALMIRA"
// ==========================================
app.post("/api/generar-excel-base", async (req, res) => {
  try {
    const { datos = [] } = req.body;

    const datosProcesados = datos.map((fila) => {
      const ciiuRaw = obtenerValor(fila, "CIIU-1");
      let sectorFila = "";
      let ciiuCodigo = "";
      let actividadFila = obtenerValor(fila, "ACTIVIDAD");

      if (ciiuRaw) {
        const partes = ciiuRaw.split("**");
        const codigoPart = partes[0].trim();
        if (codigoPart.length > 0) {
          sectorFila = codigoPart.charAt(0).toUpperCase();
          ciiuCodigo = codigoPart.substring(1);
        }
        if (partes.length > 1 && partes[1].trim()) {
          actividadFila = partes[1].trim();
        }
      }

      return {
        MATRICULA: obtenerValor(fila, "MATRICULA"),
        ORGANIZACION: obtenerValor(fila, "ORGANIZACION"),
        "EST-MATRICULA": obtenerValor(fila, "EST-MATRICULA"),
        "RAZON SOCIAL": obtenerValor(fila, "RAZON SOCIAL"),
        "NOMBRE 1": obtenerValor(fila, "NOMBRE 1"),
        "NOMBRE 2": obtenerValor(fila, "NOMBRE 2"),
        "APELLIDO 1": obtenerValor(fila, "APELLIDO 1"),
        "APELLIDO 2": obtenerValor(fila, "APELLIDO 2"),
        NIT: obtenerValor(fila, "NIT"),
        "FEC-MATRICULA": obtenerValor(fila, "FEC-MATRICULA"),
        "FEC-RENOVACION": obtenerValor(fila, "FEC-RENOVACION"),
        "ULT-ANO_REN": obtenerValor(fila, "ULT-ANO_REN"),
        "DIR-COMERCIAL": obtenerValor(fila, "DIR-COMERCIAL"),
        "BARRIO-COMERCIAL": obtenerValor(fila, "BARRIO-COMERCIAL"),
        "MUN-COMERCIAL": obtenerValor(fila, "MUN-COMERCIAL"),
        "TEL-COM-1": obtenerValor(fila, "TEL-COM-1"),
        "EMAIL-COMERCIAL": obtenerValor(fila, "EMAIL-COMERCIAL"),
        SECTORES: sectorFila,
        "CIIU-1": ciiuCodigo,
        "ACTIVIDAD ECONOMICA": actividadFila,
        "TAM-EMPRESA": obtenerValor(fila, "TAM-EMPRESA"),
        PERSONAL: obtenerValor(fila, "PERSONAL"),
      };
    });

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("19-10-2026-PN-PJ-ACTIVOS-R2026");
    sheet.views = [{ showGridLines: true }];

    // Fila 1: Título exacto de la plantilla
    sheet.addRow(["CAMARA DE COMERCIO DE PALMIRA"]);

    // Fila 2: Nombres de columnas
    sheet.addRow(COLUMNAS_BASE);

    // Filas 3+: Datos
    datosProcesados.forEach((row) => {
      const valoresFila = COLUMNAS_BASE.map((col) => row[col] || "");
      sheet.addRow(valoresFila);
    });

    const totalFilas = datosProcesados.length + 2;
    const totalColumnas = COLUMNAS_BASE.length;

    // Formatear Fila 1 (Título)
    const titleCell = sheet.getCell("A1");
    titleCell.font = { name: "Aptos Narrow", bold: true, size: 12 };

    // Formatear Filas 2 a N
    for (let r = 2; r <= totalFilas; r++) {
      const row = sheet.getRow(r);
      row.height = 20;

      for (let c = 1; c <= totalColumnas; c++) {
        const cell = row.getCell(c);
        cell.numFmt = "@";
        cell.border = {
          top: { style: "thin", color: { argb: "808080" } },
          left: { style: "thin", color: { argb: "808080" } },
          bottom: { style: "thin", color: { argb: "808080" } },
          right: { style: "thin", color: { argb: "808080" } },
        };

        if (r === 2) {
          cell.font = { name: "Aptos Narrow", bold: true, size: 11 };
        } else {
          cell.font = { name: "Aptos Narrow", size: 11 };
        }
        cell.alignment = { vertical: "middle", horizontal: "left" };
      }
    }

    // Auto-ajustar anchos
    COLUMNAS_BASE.forEach((colName, index) => {
      const colIndex = index + 1;
      let maxLen = colName.length;

      for (let r = 2; r <= Math.min(totalFilas, 100); r++) {
        const cellVal = sheet.getRow(r).getCell(colIndex).value;
        if (cellVal) {
          const len = String(cellVal).length;
          if (len > maxLen) maxLen = len;
        }
      }

      sheet.getColumn(colIndex).width = Math.max(maxLen + 3, 12);
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="19-10-2026-BASE-PN-PJ-ACTIVOS-R2026.xlsx"',
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error("Error generando Excel base:", error);
    res
      .status(500)
      .json({ error: "Error interno al generar el archivo Excel" });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
