// Test para verificar que no se repiten contemplaciones entre semanas
const fs = require('fs');

// Simular funciones necesarias (versión simplificada)
function addDays(d, days) {
  const nd = new Date(d.getTime())
  nd.setUTCDate(nd.getUTCDate() + days)
  return nd
}

function subDays(d, days) {
  return addDays(d, -days)
}

function getDomingoDeEstaSemana(fecha) {
  const fechaCopia = new Date(fecha.getTime())
  const diaSemana = fechaCopia.getUTCDay()
  
  if (diaSemana === 0) return fechaCopia
  
  if (diaSemana <= 3) {
    return subDays(fechaCopia, diaSemana)
  }
  
  const diasHastaDomingo = 7 - diaSemana
  return addDays(fechaCopia, diasHastaDomingo)
}

function formatearFechaEspanol(fecha) {
  const opciones = {
    weekday: 'long',
    year: 'numeric', 
    month: 'long',
    day: 'numeric'
  }
  
  const fechaFormateada = fecha.toLocaleDateString('es-ES', opciones)
  return fechaFormateada.charAt(0).toUpperCase() + fechaFormateada.slice(1)
}

// Leer contemplaciones
const contemplacionesJson = JSON.parse(fs.readFileSync('./lib/contemplaciones.json', 'utf8'));
const contemplacionesData = contemplacionesJson.map(c => ({
  id: c.id,
  ciclo: c.ciclo,
  tiempo_liturgico: c.tiempo_liturgico,
  titulo: c.titulo,
  lecturas: Array.isArray(c.lecturas) ? c.lecturas.join('; ') : c.lecturas,
  resumen: c.resumen,
  link: c.link,
  dominical: c.dominical
}));

console.log('=== TEST DE NO REPETICIÓN DE CONTEMPLACIONES ===\n');

// Simular función getContemplacionesSemana para Tiempo Ordinario
function simularContemplacionesSemana(fecha) {
  const fechaDomingo = getDomingoDeEstaSemana(fecha);
  const fechaFormateada = formatearFechaEspanol(fechaDomingo);
  
  // Simular fecha de Pentecostés 2025 (1 de junio aproximadamente)
  const pentecostes = new Date('2025-06-01');
  const inicioTiempoOrdinario2 = addDays(pentecostes, 1);
  const diasPasados = Math.floor((fechaDomingo.getTime() - inicioTiempoOrdinario2.getTime()) / (1000 * 60 * 60 * 24));
  const numeroDomingo = Math.floor(diasPasados / 7) + 2;
  
  let contemplaciones = [];
  
  if (numeroDomingo >= 2 && numeroDomingo <= 34) {
    contemplaciones = contemplacionesData.filter(cont => {
      if (cont.tiempo_liturgico !== 'Tiempo Ordinario' || cont.ciclo !== 'A' || !cont.dominical) {
        return false;
      }
      
      const patronDomingo = new RegExp(`domingo\\s+${numeroDomingo}\\s+A`, 'i');
      const patronNumerico = new RegExp(`${numeroDomingo}\\s+A\\s+(\\d{4})`, 'i');
      
      return patronDomingo.test(cont.titulo) || patronNumerico.test(cont.titulo);
    });
  }
  
  return {
    fecha: fechaDomingo,
    fechaFormateada: fechaFormateada,
    numeroDomingo: numeroDomingo,
    contemplaciones: contemplaciones.map(cont => ({
      ...cont,
      fecha: fechaFormateada
    }))
  };
}

// Probar con varias semanas consecutivas de octubre-noviembre 2025
const fechasPrueba = [
  new Date('2025-10-20'), // Semana del 19 de octubre (Domingo 29)
  new Date('2025-10-27'), // Semana del 26 de octubre (Domingo 30)  
  new Date('2025-11-03'), // Semana del 2 de noviembre (Domingo 31)
  new Date('2025-11-10'), // Semana del 9 de noviembre (Domingo 32)
  new Date('2025-11-17'), // Semana del 16 de noviembre (Domingo 33)
  new Date('2025-11-24'), // Semana del 23 de noviembre (Domingo 34)
];

const resultados = fechasPrueba.map(fecha => {
  const resultado = simularContemplacionesSemana(fecha);
  console.log(`📅 ${resultado.fechaFormateada} (Domingo ${resultado.numeroDomingo})`);
  
  if (resultado.contemplaciones.length > 0) {
    resultado.contemplaciones.forEach((cont, i) => {
      console.log(`  ${i+1}. ${cont.titulo}`);
      console.log(`     ID: ${cont.id}`);
    });
  } else {
    console.log('  ❌ Sin contemplaciones específicas');
  }
  console.log('');
  
  return resultado;
});

// Verificar duplicados
console.log('🔍 VERIFICACIÓN DE DUPLICADOS:');
const idsUsados = new Set();
let hayDuplicados = false;

resultados.forEach(resultado => {
  resultado.contemplaciones.forEach(cont => {
    if (idsUsados.has(cont.id)) {
      console.log(`⚠️  DUPLICADO ENCONTRADO: ID ${cont.id} - "${cont.titulo}"`);
      hayDuplicados = true;
    } else {
      idsUsados.add(cont.id);
    }
  });
});

if (!hayDuplicados) {
  console.log('✅ No se encontraron contemplaciones duplicadas entre semanas');
} else {
  console.log('❌ Se encontraron contemplaciones duplicadas');
}

console.log(`\n📊 Total de contemplaciones únicas: ${idsUsados.size}`);
console.log(`📊 Semanas con contemplaciones: ${resultados.filter(r => r.contemplaciones.length > 0).length}/${resultados.length}`);

console.log('\n=== FIN DEL TEST ===');