const express = require("express");
const cors = require("cors");
const { PrismaBetterSqlite3 } = require("@prisma/adapter-better-sqlite3");
const { PrismaClient } = require("@prisma/client");

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL || "file:./dev.db",
});
const prisma = new PrismaClient({ adapter });

const app = express();
const PORT = 5000;

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

app.listen(PORT, () => {
  console.log(`Servidor con SQLite corriendo en http://localhost:${PORT}`);
});