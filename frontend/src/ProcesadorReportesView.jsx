import { useState } from 'react';

function ProcesadorReportesView() {
  const [archivo, setArchivo] = useState(null);
  const [cargando, setCargando] = useState(false);

  const handleProcesar = async (e) => {
    e.preventDefault();
    if (!archivo) return alert('Por favor selecciona un archivo CSV');

    const formData = new FormData();
    formData.append('archivo', archivo);

    setCargando(true);
    try {
      // 👈 AQUÍ ESTÁ LA CORRECCIÓN: Se agrega /api/procesar-listado al final
      const response = await fetch('https://proyectoareatecnologia.onrender.com/api/procesar-listado', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Error en el procesamiento del servidor');

      // Descargar el Excel directamente
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Matriculados_y_Renovados_${new Date().toISOString().slice(0, 10)}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      alert('Ocurrió un error al procesar el archivo');
      console.error(err);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div style={{ padding: '30px', color: '#fff', backgroundColor: '#112240', borderRadius: '8px' }}>
      <h2>📊 Automatizador de Listados (Matriculados y Renovados)</h2>
      <p style={{ color: '#8892b0' }}>
        Sube el archivo CSV exportado y obtén el reporte filtrado en Excel con las pestañas
        <strong> MATRICULADOS</strong> y <strong>RENOVADOS</strong>.
      </p>

      <form onSubmit={handleProcesar} style={{ display: 'flex', gap: '15px', alignItems: 'center', marginTop: '20px' }}>
        <input
          type="file"
          accept=".csv"
          onChange={(e) => setArchivo(e.target.files[0])}
          style={{ color: '#fff' }}
        />
        <button
          type="submit"
          disabled={cargando}
          style={{
            padding: '10px 20px',
            backgroundColor: '#64ffda',
            color: '#0a192f',
            border: 'none',
            borderRadius: '6px',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          {cargando ? 'Procesando Excel...' : '⚡ Procesar y Descargar Excel'}
        </button>
      </form>
    </div>
  );
}

export default ProcesadorReportesView;