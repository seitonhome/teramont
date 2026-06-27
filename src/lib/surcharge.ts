// Colombian holiday detection for Sunday/holiday surcharge

function getEaster(year: number): Date {
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
  const month = Math.floor((h + l - 7 * m + 114) / 31) - 1
  const day = ((h + l - 7 * m + 114) % 31) + 1
  return new Date(year, month, day)
}

function addDaysToDate(date: Date, n: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + n)
}

// Holidays that are moved to the next Monday if they don't fall on Monday (Ley Emiliani)
function toNextMonday(date: Date): Date {
  const day = date.getDay()
  if (day === 1) return date
  const diff = day === 0 ? 1 : 8 - day
  return addDaysToDate(date, diff)
}

function getColombianHolidays(year: number): Array<{ month: number; day: number }> {
  const result: Array<{ month: number; day: number }> = []

  // Fixed holidays (always on this exact date)
  const fixed = [
    [1, 1],   // Año Nuevo
    [5, 1],   // Día del Trabajo
    [7, 20],  // Independencia
    [8, 7],   // Batalla de Boyacá
    [12, 8],  // Inmaculada Concepción
    [12, 25], // Navidad
  ]
  for (const [m, d] of fixed) {
    result.push({ month: m, day: d })
  }

  // Holidays moved to next Monday (Ley Emiliani)
  const mondayBased = [
    [1, 6],   // Reyes Magos
    [3, 19],  // San José
    [6, 29],  // San Pedro y San Pablo
    [8, 15],  // Asunción de la Virgen
    [10, 12], // Día de la Raza
    [11, 1],  // Todos los Santos
    [11, 11], // Independencia de Cartagena
  ]
  for (const [m, d] of mondayBased) {
    const moved = toNextMonday(new Date(year, m - 1, d))
    result.push({ month: moved.getMonth() + 1, day: moved.getDate() })
  }

  // Easter-based holidays
  const easter = getEaster(year)
  const easterBased = [
    addDaysToDate(easter, -3),                  // Jueves Santo
    addDaysToDate(easter, -2),                  // Viernes Santo
    toNextMonday(addDaysToDate(easter, 39)),    // Ascensión del Señor
    toNextMonday(addDaysToDate(easter, 60)),    // Corpus Christi
    toNextMonday(addDaysToDate(easter, 68)),    // Sagrado Corazón
  ]
  for (const d of easterBased) {
    result.push({ month: d.getMonth() + 1, day: d.getDate() })
  }

  return result
}

export function isSundayOrHoliday(dateStr: string): boolean {
  const [year, month, day] = dateStr.split('-').map(Number)
  const date = new Date(year, month - 1, day)

  // Sunday
  if (date.getDay() === 0) return true

  // Colombian holiday
  const holidays = getColombianHolidays(year)
  return holidays.some((h) => h.month === month && h.day === day)
}
