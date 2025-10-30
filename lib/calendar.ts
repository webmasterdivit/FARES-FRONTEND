// Calculos litúrgicos básicos en TypeScript
/**
 * 🕊️ 1. El Año Litúrgico

El año litúrgico no coincide con el calendario civil.
Comienza con el Primer Domingo de Adviento y se divide en:

Adviento (4 semanas antes de Navidad)

Navidad (hasta el Bautismo del Señor)

Tiempo Ordinario I (hasta Cuaresma)

Cuaresma (desde Miércoles de Ceniza hasta Pascua)

Pascua (50 días desde la Resurrección hasta Pentecostés)

Tiempo Ordinario II (desde Pentecostés hasta Adviento)

Cada día dentro de estos tiempos tiene lecturas específicas.

📖 2. Ciclos de Lectura

Domingos y solemnidades:
Se dividen en tres años:

Año A → Evangelio según Mateo

Año B → Evangelio según Marcos

Año C → Evangelio según Lucas
(Juan se lee en momentos especiales como Pascua o Cuaresma)

Días feriales (de lunes a sábado):
Se dividen en dos años:

Año I → años impares

Año II → años pares

⛪ 3. Fuentes de las lecturas

Las lecturas provienen de:

El Leccionario Romano, que tiene varios volúmenes:

Leccionario dominical y festivo

Leccionario ferial

Leccionarios para misas de santos, difuntos y ocasiones especiales

Los textos se basan en la Biblia de la Iglesia (traducción oficial según la conferencia episcopal de cada país).

📅 4. Cómo se determina cada día

Se identifica el tiempo litúrgico y el día específico.

Se consulta el Leccionario correspondiente:

Si es domingo, se usa el ciclo A, B o C.

Si es día de semana, se usa el año I o II.

Si coincide con una fiesta o solemnidad, esta tiene prioridad sobre la lectura ferial.

Algunas memorias opcionales permiten elegir entre las lecturas del día o las del santo.

🪔 5. Ejemplo

Supongamos que hoy es 22 de octubre de 2025:

Tiempo ordinario (segundo bloque)

Año litúrgico B

Año ferial I (porque 2025 es impar)

Por tanto, las lecturas diarias se tomarán del Leccionario ferial del Año I, y si coincide con la memoria de San Juan Pablo II, se pueden usar sus lecturas propias.
 */

// Importar contemplaciones desde JSON
import contemplacionesJson from './contemplaciones.json'

export type Season = 'Advent' | 'Christmas' | 'Lent' | 'Easter' | 'Ordinary Time' | 'Triduum'

export interface SeasonInfo {
  season: Season
  start: Date
  end: Date
  keyDates: {
    easter: Date
    ashWednesday: Date
    pentecost: Date
  }
}

export interface Contemplacion {
  id: number
  ciclo: 'A' | 'B' | 'C'
  tiempo_liturgico: string
  titulo: string
  lecturas: string
  resumen: string
  link: string
  dominical: boolean
  fecha?: string
}

export interface ContemplacionesSemana {
  fecha: Date
  temporada: Season
  ciclo: 'A' | 'B' | 'C'
  contemplaciones: Contemplacion[]
}

// Mapear los datos del JSON al formato esperado  
const contemplacionesData = contemplacionesJson.map((c: any) => ({
  id: c.id,
  ciclo: c.ciclo,
  tiempo_liturgico: c.tiempo_liturgico,
  titulo: c.titulo,
  lecturas: Array.isArray(c.lecturas) ? c.lecturas.join('; ') : c.lecturas,
  resumen: c.resumen,
  link: c.link,
  dominical: c.dominical
})) as Contemplacion[]

/**
 * Calcula la fecha de Pascua (domingo de Pascua) para un año dado usando el algoritmo de Meeus/Jones.
 */
export function easterDate(year: number): Date {
  const a = year % 19
  const b = Math.floor(year / 100)
  const c = year % 100
  const d = Math.floor(b / 4)
  const e = b % 4
  const f = Math.floor((b + 8) / 25)
  const g = Math.floor((b - f + 1) / 3)
  const h = (19 * a + b - d - g + 15) % 30
  const i = Math.floor(c / 4)
  const k = c % 4
  const l = (32 + 2 * e + 2 * i - h - k) % 7
  const m = Math.floor((a + 11 * h + 22 * l) / 451)
  const month = Math.floor((h + l - 7 * m + 114) / 31) // 3=March, 4=April
  const day = ((h + l - 7 * m + 114) % 31) + 1
  return new Date(Date.UTC(year, month - 1, day))
}

export function addDays(d: Date, days: number): Date {
  const nd = new Date(d.getTime())
  nd.setUTCDate(nd.getUTCDate() + days)
  return nd
}

export function subDays(d: Date, days: number): Date {
  return addDays(d, -days)
}

/**
 * Calcula el inicio del Adviento para un año calendario: cuarto domingo antes de Navidad (25 de diciembre).
 */
export function adventStart(year: number): Date {
  // Start from Dec 25
  const dec25 = new Date(Date.UTC(year, 11, 25))
  // find the fourth Sunday before Dec 25: go back to the nearest Sunday on or before Dec 25, then go back 3 more weeks
  const dow = dec25.getUTCDay() // 0=Sun
  const daysToLastSunday = dow // how many days to subtract to reach Sunday
  const lastSunday = subDays(dec25, daysToLastSunday)
  const fourthSundayBefore = subDays(lastSunday, 21)
  return fourthSundayBefore
}

/**
 * Calcula el Miércoles de Ceniza (46 días antes de Pascua)
 */
export function ashWednesday(year: number): Date {
  const e = easterDate(year)
  return subDays(e, 46)
}

export function pentecost(year: number): Date {
  const e = easterDate(year)
  return addDays(e, 49)
}

/**
 * Determina el año litúrgico para una fecha determinada.
 * El año litúrgico comienza el primer día del Adviento, que es el cuarto domingo antes de Navidad.
 */
export function liturgicalYearForDate(date: Date): number {
  const year = date.getUTCFullYear()
  const advStart = adventStart(year)
  if (date >= advStart) return year + 1
  return year
}

/**
 * Devuelve información de la temporada litúrgica para una fecha dada.
 */
export function getLiturgicalSeason(date: Date): SeasonInfo {
  // Work in UTC dates for consistency
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()))
  const ly = liturgicalYearForDate(d)
  const easter = easterDate(ly)
  const ash = ashWednesday(ly)
  const pent = pentecost(ly)

  const advStart = adventStart(ly - 1) // Advent that begins the liturgical year (usually in previous calendar year)
  const christmasStart = new Date(Date.UTC(ly - 1, 11, 25)) // Dec 25 of previous calendar year
  const christmasEnd = new Date(Date.UTC(ly, 0, 13)) // conservatively to Jan 13

  // Lent: Ash Wednesday .. Holy Saturday (day before Easter)
  const lentStart = ash
  const lentEnd = subDays(easter, 1)

  const triduumStart = subDays(easter, 3)
  const triduumEnd = subDays(easter, 1)

  // Easter season: Easter Sunday .. Pentecost
  const easterStart = easter
  const easterEnd = pent

  // Ordinary Time: from after Baptism of the Lord (approx Jan 13) to Ash Wednesday, and from Pentecost+1 to AdventStart
  const ordinary1Start = christmasEnd
  const ordinary1End = subDays(ash, 1)
  const ordinary2Start = addDays(pent, 1)
  const ordinary2End = subDays(adventStart(ly), 1)

  if (d >= advStart && d < christmasStart) {
    return { season: 'Advent', start: advStart, end: subDays(christmasStart, 1), keyDates: { easter, ashWednesday: ash, pentecost: pent } }
  }
  if (d >= christmasStart && d <= christmasEnd) {
    return { season: 'Christmas', start: christmasStart, end: christmasEnd, keyDates: { easter, ashWednesday: ash, pentecost: pent } }
  }
  if (d >= lentStart && d <= lentEnd) {
    return { season: 'Lent', start: lentStart, end: lentEnd, keyDates: { easter, ashWednesday: ash, pentecost: pent } }
  }
  if (d >= triduumStart && d <= triduumEnd) {
    return { season: 'Triduum', start: triduumStart, end: triduumEnd, keyDates: { easter, ashWednesday: ash, pentecost: pent } }
  }
  if (d >= easterStart && d <= easterEnd) {
    return { season: 'Easter', start: easterStart, end: easterEnd, keyDates: { easter, ashWednesday: ash, pentecost: pent } }
  }
  // Ordinary time (either before Lent or after Pentecost)
  if ((d >= ordinary1Start && d <= ordinary1End) || (d >= ordinary2Start && d <= ordinary2End)) {
    // compute overall start/end for returned season
    const start = d <= ordinary1End ? ordinary1Start : ordinary2Start
    const end = d <= ordinary1End ? ordinary1End : ordinary2End
    return { season: 'Ordinary Time', start, end, keyDates: { easter, ashWednesday: ash, pentecost: pent } }
  }

  // Fallback: return Ordinary Time
  return { season: 'Ordinary Time', start: ordinary1Start, end: ordinary2End, keyDates: { easter, ashWednesday: ash, pentecost: pent } }
}

/**
 * Obtiene el ciclo litúrgico (A, B, C) para un año litúrgico dado
 */
export function getCicloLiturgico(year: number): 'A' | 'B' | 'C' {
  const cycles = ['C', 'A', 'B'] as const
  return cycles[year % 3]
}

/**
 * Mapea las temporadas internas a los nombres usados en el JSON de contemplaciones
 */
function mapSeasonToSpanish(season: Season): string {
  const mapping: Record<Season, string> = {
    'Advent': 'Adviento',
    'Christmas': 'Navidad', 
    'Lent': 'Cuaresma',
    'Easter': 'Pascua',
    'Ordinary Time': 'Tiempo Ordinario',
    'Triduum': 'Triduo'
  }
  return mapping[season]
}

/**
 * Obtiene la fecha del domingo de la semana dada
 * Si la fecha es de lunes a miércoles, retorna el domingo anterior
 * Si la fecha es de jueves a sábado, retorna el domingo siguiente
 * Si ya es domingo, retorna la misma fecha
 */
function getDomingoDeEstaSemana(fecha: Date): Date {
  const fechaCopia = new Date(fecha.getTime())
  const diaSemana = fechaCopia.getUTCDay() // 0 = Domingo, 1 = Lunes, etc.
  
  // Si ya es domingo, retornar la misma fecha
  if (diaSemana === 0) {
    return fechaCopia
  }
  
  // Si es lunes, martes o miércoles (1, 2, 3), ir al domingo anterior
  if (diaSemana <= 3) {
    return subDays(fechaCopia, diaSemana)
  }
  
  // Si es jueves, viernes o sábado (4, 5, 6), ir al domingo siguiente
  const diasHastaDomingo = 7 - diaSemana
  return addDays(fechaCopia, diasHastaDomingo)
}

/**
 * Formatea una fecha en español
 */
function formatearFechaEspanol(fecha: Date): string {
  const opciones: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    year: 'numeric', 
    month: 'long',
    day: 'numeric'
  }
  
  const fechaFormateada = fecha.toLocaleDateString('es-ES', opciones)
  // Capitalizar la primera letra
  return fechaFormateada.charAt(0).toUpperCase() + fechaFormateada.slice(1)
}



/**
 * Obtiene las contemplaciones para la semana actual
 * Busca contemplaciones dominicales específicas que coincidan exactamente con el domingo de la fecha dada
 * No retorna contemplaciones duplicadas entre semanas diferentes
 */
export function getContemplacionesSemana(fecha?: Date): ContemplacionesSemana {
  const hoy = fecha || new Date()
  const seasonInfo = getLiturgicalSeason(hoy)
  const year = liturgicalYearForDate(hoy)
  const ciclo = getCicloLiturgico(year)
  const temporadaEspanol = mapSeasonToSpanish(seasonInfo.season)
  
  // Calcular la fecha del domingo correspondiente
  const fechaDomingo = getDomingoDeEstaSemana(hoy)
  const fechaFormateada = formatearFechaEspanol(fechaDomingo)
  
  let contemplaciones: Contemplacion[] = []
  
  if (seasonInfo.season === 'Ordinary Time') {
    // Para Tiempo Ordinario, calcular el número exacto del domingo
    const inicioTiempoOrdinario2 = addDays(seasonInfo.keyDates.pentecost, 1)
    const diasPasados = Math.floor((fechaDomingo.getTime() - inicioTiempoOrdinario2.getTime()) / (1000 * 60 * 60 * 24))
    const numeroDomingo = Math.floor(diasPasados / 7) + 2 // +2 porque el primer domingo es el 2
    
    // Solo buscar si está en rango válido
    if (numeroDomingo >= 2 && numeroDomingo <= 34) {
      contemplaciones = (contemplacionesData as Contemplacion[]).filter(cont => {
        if (cont.tiempo_liturgico !== temporadaEspanol || cont.ciclo !== ciclo || !cont.dominical) {
          return false
        }
        
        // Buscar referencias exactas al número del domingo en el título
        const patronDomingo = new RegExp(`domingo\\s+${numeroDomingo}\\s+${ciclo}`, 'i')
        const patronNumerico = new RegExp(`${numeroDomingo}\\s+${ciclo}\\s+(\\d{4})`, 'i')
        
        return patronDomingo.test(cont.titulo) || patronNumerico.test(cont.titulo)
      })
    }
  } else {
    // Para otras temporadas (Adviento, Cuaresma, Pascua, etc.)
    const domingoActual = fechaDomingo.getUTCDate()
    const mesActual = fechaDomingo.getUTCMonth() + 1
    const añoActual = fechaDomingo.getUTCFullYear()
    
    // Buscar contemplaciones que mencionen fechas específicas o sean del año actual
    contemplaciones = (contemplacionesData as Contemplacion[]).filter(cont => {
      if (cont.tiempo_liturgico !== temporadaEspanol || cont.ciclo !== ciclo || !cont.dominical) {
        return false
      }
      
      // Para temporadas especiales, buscar contemplaciones que mencionen el año actual
      // o que sean específicas para la temporada
      const añoEnTitulo = cont.titulo.match(/(\d{4})/g)
      if (añoEnTitulo) {
        // Si hay años mencionados, preferir contemplaciones del año actual o año litúrgico
        return añoEnTitulo.includes(añoActual.toString()) || añoEnTitulo.includes((añoActual - 1).toString())
      }
      
      // Si no hay año específico, es una contemplación genérica para la temporada
      return true
    }).slice(0, 1) // Máximo 1 contemplación para evitar repeticiones
  }
  
  // Si no se encontraron contemplaciones específicas, no retornar ninguna
  // (en lugar de usar contemplaciones genéricas que se repetirían)
  if (contemplaciones.length === 0) {
    return {
      fecha: hoy,
      temporada: seasonInfo.season,
      ciclo,
      contemplaciones: []
    }
  }
  
  // Agregar la fecha a cada contemplación
  const contemplacionesConFecha = contemplaciones.map(cont => ({
    ...cont,
    fecha: fechaFormateada
  }))
    
  return {
    fecha: hoy,
    temporada: seasonInfo.season,
    ciclo,
    contemplaciones: contemplacionesConFecha
  }
}


