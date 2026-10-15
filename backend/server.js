const express = require("express");
const cors = require("cors");
const { PrismaClient } = require("@prisma/client");
const multer = require("multer");
const ExcelJS = require("exceljs");
const upload = multer({ storage: multer.memoryStorage() });

// Inicialización limpia para PostgreSQL
const prisma = new PrismaClient();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

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

// Auxiliar para sembrar datos iniciales si la BD está vacía
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

// GET: Leer listas, tarjetas y tareas
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

    // Adaptar estructura limpia para React
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

// POST: Guardar todo el estado (Niveles: Tablero -> Tarjetas -> Tareas)
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

// Columnas objetivo
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
// --- FUNCIÓN DE FORMATEO DE FECHAS (DD/MM/YYYY) ---
function formatearFecha(val) {
  if (!val) return "";
  const str = String(val).trim();

  // Caso YYYYMMDD (ej: 20261013)
  if (str.length === 8 && /^\d+$/.test(str)) {
    return `${str.substring(6, 8)}/${str.substring(4, 6)}/${str.substring(0, 4)}`;
  }

  // Caso YYYY-MM-DD (ej: 2026-10-13)
  if (str.length === 10 && str.includes("-")) {
    const partes = str.split("-");
    if (partes.length === 3 && partes[0].length === 4) {
      return `${partes[2]}/${partes[1]}/${partes[0]}`;
    }
  }

  return str;
}

// --- ENDPOINT PROCESAR LISTADO ---
app.post(
  "/api/procesar-listado",
  upload.single("archivo"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No se subió ningún archivo" });
      }

      // Convertir buffer CSV
      const contenidoCsv = req.file.buffer.toString("latin1");
      const lineas = contenidoCsv
        .split(/\r?\n/)
        .filter((linea) => linea.trim() !== "");

      const primeraLinea = lineas[0].toLowerCase().includes("sep=") ? 1 : 0;
      const encabezados = lineas[primeraLinea]
        .split(";")
        .map((h) => h.trim().replace(/^"|"$/g, ""));

      const matriculados = [];
      const renovados = [];

      for (let i = primeraLinea + 1; i < lineas.length; i++) {
        const valores = lineas[i]
          .split(";")
          .map((v) => v.trim().replace(/^"|"$/g, ""));
        if (valores.length < encabezados.length) continue;

        const filaObj = {};
        encabezados.forEach((header, index) => {
          filaObj[header] = valores[index];
        });

        // Extraer columnas deseadas preservando ceros a la izquierda y formatos limpios
        const filaFiltrada = {};
        COLUMNAS_DESEADAS.forEach((col) => {
          let val = filaObj[col] !== undefined ? filaObj[col] : "";

          // Formatear fechas
          if (
            col.toUpperCase().includes("FEC") ||
            col.toUpperCase().includes("FECHA")
          ) {
            val = formatearFecha(val);
          }

          filaFiltrada[col] = String(val).trim();
        });

        const fecMat = String(filaObj["FEC-MATRICULA"] || "").trim();
        const fecRen = String(filaObj["FEC-RENOVACION"] || "").trim();

        if (fecMat && fecRen && fecMat === fecRen) {
          matriculados.push(filaFiltrada);
        } else {
          renovados.push(filaFiltrada);
        }
      }

      const workbook = new ExcelJS.Workbook();

      const agregarYFormatearPestana = (nombrePestana, datos) => {
        const sheet = workbook.addWorksheet(nombrePestana);

        // Asegurar que las cuadrículas sean visibles siempre
        sheet.views = [{ showGridLines: true }];

        // 1. Agregar Encabezados
        sheet.addRow(COLUMNAS_DESEADAS);

        // 2. Agregar Filas de Datos
        datos.forEach((row) => {
          const valoresFila = COLUMNAS_DESEADAS.map((col) => row[col] || "");
          sheet.addRow(valoresFila);
        });

        // Estilo Encabezado (Texto en Negrita, Fondo Blanco, Centrado)
        const headerRow = sheet.getRow(1);
        headerRow.font = {
          name: "Aptos Narrow",
          bold: false,
          color: { argb: "000000" },
          size: 11,
        };
        headerRow.alignment = { vertical: "middle", horizontal: "left" };

        const totalFilas = datos.length + 1;
        const totalColumnas = COLUMNAS_DESEADAS.length;

        // 3. Aplicar BORDES NEGROS/GRISES FINOS Y ALINEACIÓN
        for (let r = 1; r <= totalFilas; r++) {
          const row = sheet.getRow(r);
          row.height = 20; // Altura cómoda para la fila

          for (let c = 1; c <= totalColumnas; c++) {
            const cell = row.getCell(c);

            // Forzar formato de texto para evitar notaciones científicas (ej: 9.02E+09)
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

        // 4. Auto-espaciado dinámico de columnas (Calcula ancho perfecto según el contenido)
        COLUMNAS_DESEADAS.forEach((colName, index) => {
          const colIndex = index + 1;
          let maxLen = colName.length;

          for (let r = 1; r <= totalFilas; r++) {
            const cellVal = sheet.getRow(r).getCell(colIndex).value;
            if (cellVal) {
              const len = String(cellVal).length;
              if (len > maxLen) maxLen = len;
            }
          }

          // Le agregamos 3 puntos de margen para que la celda se vea aireada como en tu imagen
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
app.listen(PORT, () => {
  console.log(`Servidor con SQLite corriendo en http://localhost:${PORT}`);
});
