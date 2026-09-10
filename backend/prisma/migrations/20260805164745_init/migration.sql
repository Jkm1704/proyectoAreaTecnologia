-- CreateTable
CREATE TABLE "Tablero" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "titulo" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Tarjeta" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "titulo" TEXT NOT NULL,
    "tableroId" INTEGER NOT NULL,
    CONSTRAINT "Tarjeta_tableroId_fkey" FOREIGN KEY ("tableroId") REFERENCES "Tablero" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Tarea" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "texto" TEXT NOT NULL,
    "etiqueta" TEXT,
    "colorEtiqueta" TEXT,
    "tarjetaId" INTEGER NOT NULL,
    CONSTRAINT "Tarea_tarjetaId_fkey" FOREIGN KEY ("tarjetaId") REFERENCES "Tarjeta" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Equipo" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL,
    "categoria" TEXT NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'Disponible'
);

-- CreateTable
CREATE TABLE "Prestamo" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "equipoId" INTEGER NOT NULL,
    "solicitante" TEXT NOT NULL,
    "fechaPrestamo" TEXT NOT NULL,
    "fechaDevolucion" TEXT
);
