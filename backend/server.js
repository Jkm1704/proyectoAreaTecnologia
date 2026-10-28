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
// Permite recibir JSONs pesados de hasta 100 Megabytes
app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ limit: "100mb", extended: true }));

// --- DATOS INICIALES POR DEFECTO ---
const datosInicialesTableros = [
  {
    titulo: "📌 Proyecto Principal",
    tarjetas: [
      {
        titulo: "Por Hacer",
        tareas: [
          {
            texto: "Diseñar la interfaz",
            etiqueta: "Diseño",
            colorEtiqueta: "#ef4444",
          },
        ],
      },
      {
        titulo: "En Proceso",
        tareas: [
          {
            texto: "Conectar backend con React",
            etiqueta: "Dev",
            colorEtiqueta: "#3b82f6",
          },
        ],
      },
    ],
  },
];

async function sembrarDatosIniciales() {
  for (const tablero of datosInicialesTableros) {
    await prisma.tablero.create({
      data: {
        titulo: tablero.titulo,
        tarjetas: {
          create: (tablero.tarjetas || []).map((tarjeta) => ({
            titulo: tarjeta.titulo,
            tareas: {
              create: (tarjeta.tareas || []).map((tarea) => ({
                texto: tarea.texto || "",
                etiqueta: tarea.etiqueta || null,
                colorEtiqueta: tarea.colorEtiqueta || null,
              })),
            },
          })),
        },
      },
    });
  }
}

// ==========================================
// 📌 MÓDULO TABLEROS (TRELLO)
// ==========================================
app.get("/api/tableros", async (req, res) => {
  try {
    let tableros = await prisma.tablero.findMany({
      include: {
        tarjetas: {
          include: {
            tareas: true,
          },
        },
      },
    });

    if (tableros.length === 0) {
      await sembrarDatosIniciales();
      tableros = await prisma.tablero.findMany({
        include: {
          tarjetas: {
            include: {
              tareas: true,
            },
          },
        },
      });
    }

    const respuestaFormateada = tableros.map((t) => ({
      id: t.id,
      titulo: t.titulo,
      tarjetas: t.tarjetas.map((tarjeta) => ({
        id: tarjeta.id,
        titulo: tarjeta.titulo,
        tareas: tarjeta.tareas.map((tarea) => ({
          id: tarea.id,
          texto: tarea.texto,
          etiqueta: tarea.etiqueta,
          colorEtiqueta: tarea.colorEtiqueta,
        })),
      })),
    }));

    res.json(respuestaFormateada);
  } catch (error) {
    console.error("Error al obtener tableros:", error);
    res.status(500).json({ error: "Error al consultar la base de datos" });
  }
});

app.post("/api/tableros", async (req, res) => {
  const nuevosTableros = req.body;

  try {
    await prisma.$transaction(async (tx) => {
      await tx.tablero.deleteMany();

      for (const tablero of nuevosTableros) {
        await tx.tablero.create({
          data: {
            titulo: tablero.titulo,
            tarjetas: {
              create: (tablero.tarjetas || []).map((tarjeta) => ({
                titulo: tarjeta.titulo,
                tareas: {
                  create: (tarjeta.tareas || []).map((tarea) => ({
                    texto: tarea.texto || "",
                    etiqueta: tarea.etiqueta || null,
                    colorEtiqueta: tarea.colorEtiqueta || null,
                  })),
                },
              })),
            },
          },
        });
      }
    });

    res.json({ mensaje: "Guardado correctamente", tableros: nuevosTableros });
  } catch (error) {
    console.error("Error al guardar tableros:", error);
    res
      .status(500)
      .json({ error: "Error al guardar tableros en la base de datos" });
  }
});

// ==========================================
// 📌 MÓDULO DE PRÉSTAMOS Y EQUIPOS
// ==========================================
app.get("/api/prestamos-data", async (req, res) => {
  try {
    const equipos = await prisma.equipo.findMany();
    const prestamos = await prisma.prestamo.findMany();
    res.json({ equipos, prestamos });
  } catch (error) {
    console.error("Error al obtener préstamos:", error);
    res.status(500).json({ error: "Error al leer los datos de préstamos" });
  }
});

app.post("/api/prestamos-data", async (req, res) => {
  try {
    const { equipos = [], prestamos = [] } = req.body;

    await prisma.$transaction(async (tx) => {
      await tx.equipo.deleteMany();
      await tx.prestamo.deleteMany();

      if (equipos.length > 0) {
        await tx.equipo.createMany({
          data: equipos.map((e) => ({
            nombre: e.nombre,
            categoria: e.categoria,
            estado: e.estado || "Disponible",
          })),
        });
      }

      if (prestamos.length > 0) {
        await tx.prestamo.createMany({
          data: prestamos.map((p) => ({
            equipoId: p.equipoId,
            solicitante: p.solicitante,
            fechaPrestamo: p.fechaPrestamo,
            fechaDevolucion: p.fechaDevolucion,
          })),
        });
      }
    });

    res.json({ message: "Datos de préstamos guardados correctamente" });
  } catch (error) {
    console.error("Error al guardar préstamos:", error);
    res.status(500).json({ error: "Error al guardar datos de préstamos" });
  }
});

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

  // Omitir la directiva "sep=" de Excel si está presente al inicio
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

  // Detectar automáticamente si el separador es ';' o ','
  const primeraLinea = lineas[0];
  const separador = primeraLinea.includes(";") ? ";" : ",";

  // Limpiar encabezados de comillas y caracteres residuales
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
          // Búsqueda insensible a Mayúsculas/Minúsculas de las columnas
          const claveExistente = Object.keys(filaObj).find(
            (k) => k.trim().toUpperCase() === col.toUpperCase(),
          );

          let val = claveExistente ? filaObj[claveExistente] : "";

          if (
            col.toUpperCase().includes("FEC") ||
            col.toUpperCase().includes("FECHA")
          ) {
            val = formatearFecha(val);
          }

          filaFiltrada[col] = String(val).trim();
        });

        // Ignorar filas vacías
        const tieneValores = Object.values(filaFiltrada).some((v) => v !== "");
        if (!tieneValores) return;

        const fecMat = filaFiltrada["FEC-MATRICULA"];
        const fecRen = filaFiltrada["FEC-RENOVACION"];

        // Comparación de fechas de matrícula y renovación
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

        // Agregar fila de Encabezado
        sheet.addRow(COLUMNAS_DESEADAS);

        // Agregar Filas de Datos
        datos.forEach((row) => {
          const valoresFila = COLUMNAS_DESEADAS.map((col) => row[col] || "");
          sheet.addRow(valoresFila);
        });

        const totalFilas = datos.length + 1;
        const totalColumnas = COLUMNAS_DESEADAS.length;

        // Formato visual de celdas
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

            if (r === 1) {
              cell.font = { name: "Aptos Narrow", bold: false, size: 11 };
              cell.alignment = { vertical: "middle", horizontal: "left" };
            } else {
              cell.font = { name: "Aptos Narrow", size: 11 };
              cell.alignment = { vertical: "middle", horizontal: "left" };
            }
          }
        }

        // Ancho automático para columnas
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
// 📌 2. ENDPOINT: GENERAR EXCEL DESDE JSON
// ==========================================
app.post("/api/generar-excel-base", async (req, res) => {
  try {
    const { datos = [] } = req.body;

    const datosProcesados = datos.map((fila) => {
      const ciiuFila = String(fila["CIIU-1"] || "").trim();
      const sectorFila = ciiuFila ? ciiuFila.charAt(0).toUpperCase() : "";

      return {
        MATRICULA: fila["MATRICULA"] || "",
        ORGANIZACION: fila["ORGANIZACION"] || "",
        "EST-MATRICULA": fila["EST-MATRICULA"] || "",
        "RAZON SOCIAL": fila["RAZON SOCIAL"] || "",
        "NOMBRE 1": fila["NOMBRE 1"] || "",
        "NOMBRE 2": fila["NOMBRE 2"] || "",
        "APELLIDO 1": fila["APELLIDO 1"] || "",
        "APELLIDO 2": fila["APELLIDO 2"] || "",
        NIT: fila["NIT"] || "",
        "FEC-MATRICULA": formatearFecha(fila["FEC-MATRICULA"]),
        "FEC-RENOVACION": formatearFecha(fila["FEC-RENOVACION"]),
        "ULT-ANO_REN": fila["ULT-ANO_REN"] || "",
        "DIR-COMERCIAL": fila["DIR-COMERCIAL"] || "",
        "BARRIO-COMERCIAL": fila["BARRIO-COMERCIAL"] || "",
        "MUN-COMERCIAL": fila["MUN-COMERCIAL"] || "",
        "TEL-COM-1": fila["TEL-COM-1"] || "",
        "EMAIL-COMERCIAL": fila["EMAIL-COMERCIAL"] || "",
        SECTORES: sectorFila,
        "CIIU-1": ciiuFila,
        "ACTIVIDAD ECONOMICA": fila["ACTIVIDAD"] || "",
        "TAM-EMPRESA": fila["TAM-EMPRESA"] || "",
        PERSONAL: fila["PERSONAL"] || "0",
      };
    });

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("PN-PJ-ACTIVOS-R2026");
    sheet.views = [{ showGridLines: true }];

    sheet.addRow(COLUMNAS_BASE);

    datosProcesados.forEach((row) => {
      const valoresFila = COLUMNAS_BASE.map((col) => row[col] || "");
      sheet.addRow(valoresFila);
    });

    const headerRow = sheet.getRow(1);
    headerRow.font = { name: "Aptos Narrow", bold: false, size: 11 };
    headerRow.alignment = { vertical: "middle", horizontal: "left" };

    const totalFilas = datosProcesados.length + 1;
    const totalColumnas = COLUMNAS_BASE.length;

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

        if (r > 1) {
          cell.font = { name: "Aptos Narrow", size: 11 };
          cell.alignment = { vertical: "middle" };
        }
      }
    }

    COLUMNAS_BASE.forEach((colName, index) => {
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

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="BASE_FILTRADA_ACTIVOS.xlsx"',
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
