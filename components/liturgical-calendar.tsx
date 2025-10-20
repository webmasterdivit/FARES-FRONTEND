"use client"
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react"
import { useState } from "react"
import { getContemplacionesSemana } from "@/lib/calendar"

interface LiturgicalEvent {
  date: string
  title: string
  description: string
  color: string
}

// Hardcoded liturgical events for testing
const liturgicalEvents: LiturgicalEvent[] = [
  {
    date: "2024-12-25",
    title: "Navidad",
    description: "Nacimiento de Nuestro Señor Jesucristo",
    color: "text-red-600"
  },
  {
    date: "2024-12-31",
    title: "Fin de Año",
    description: "Santa María, Madre de Dios",
    color: "text-blue-600"
  },
  {
    date: "2025-01-01",
    title: "Año Nuevo",
    description: "Santa María, Madre de Dios",
    color: "text-blue-600"
  },
  {
    date: "2025-01-06",
    title: "Epifanía",
    description: "Manifestación del Señor",
    color: "text-yellow-600"
  },
  {
    date: "2025-02-14",
    title: "San Valentín",
    description: "Santos Cirilo y Metodio",
    color: "text-purple-600"
  },
  {
    date: "2025-03-19",
    title: "San José",
    description: "Esposo de la Santísima Virgen María",
    color: "text-green-600"
  },
  {
    date: "2025-04-20",
    title: "Domingo de Ramos",
    description: "Entrada triunfal de Jesús en Jerusalén",
    color: "text-green-600"
  }
]

export default function LiturgicalCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  const today = new Date()
  const currentMonth = currentDate.getMonth()
  const currentYear = currentDate.getFullYear()

  // Get first day of month and number of days
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay()
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
  const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate()

  const monthNames = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ]

  const dayNames = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"]

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      if (direction === "next") {
        newDate.setMonth(newDate.getMonth() + 1)
      } else {
        newDate.setMonth(newDate.getMonth() - 1)
      }
      return newDate
    })
    setSelectedDate(null)
  }

  const isToday = (day: number) => {
    return today.getDate() === day && 
           today.getMonth() === currentMonth && 
           today.getFullYear() === currentYear
  }

  const isSelected = (day: number) => {
    if (!selectedDate) return false
    return selectedDate.getDate() === day &&
           selectedDate.getMonth() === currentMonth &&
           selectedDate.getFullYear() === currentYear
  }

  const getLiturgicalEvent = (day: number) => {
    const dateString = `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`
    return liturgicalEvents.find(event => event.date === dateString)
  }

  const handleDateClick = (day: number) => {
    const newSelectedDate = new Date(currentYear, currentMonth, day)
    setSelectedDate(newSelectedDate)
  }

  const selectedEvent = selectedDate ? getLiturgicalEvent(selectedDate.getDate()) : null

  // Create calendar grid
  const calendarDays = []
  
  // Get weekly contemplations from the liturgical calendar library
  const contemplacionesSemana = getContemplacionesSemana(currentDate)
  console.log(contemplacionesSemana )


  // Previous month's trailing days
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    const day = daysInPrevMonth - i
    calendarDays.push(
      <button
        key={`prev-${day}`}
        className="w-8 h-8 text-xs text-gray-400 hover:bg-gray-100 rounded"
        onClick={() => navigateMonth("prev")}
      >
        {day}
      </button>
    )
  }

  // Current month's days
  for (let day = 1; day <= daysInMonth; day++) {
    const liturgicalEvent = getLiturgicalEvent(day)
    const todayClass = isToday(day) ? "bg-slate-700 text-white" : ""
    const selectedClass = isSelected(day) ? "bg-slate-500 text-white" : ""
    const liturgicalClass = liturgicalEvent ? "font-semibold border border-slate-300" : ""
    
    calendarDays.push(
      <button
        key={day}
        onClick={() => handleDateClick(day)}
        className={`w-6 h-6 lg:w-8 lg:h-8 text-xs rounded transition-colors hover:bg-gray-100 ${todayClass} ${selectedClass} ${liturgicalClass} ${liturgicalEvent ? liturgicalEvent.color : 'text-gray-700'}`}
      >
        {day}
      </button>
    )
  }

  // Next month's leading days
  const remainingCells = 42 - calendarDays.length // 6 rows × 7 days
  for (let day = 1; day <= remainingCells; day++) {
    calendarDays.push(
      <button
        key={`next-${day}`}
        className="w-8 h-8 text-xs text-gray-400 hover:bg-gray-100 rounded"
        onClick={() => navigateMonth("next")}
      >
        {day}
      </button>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-4 lg:p-6 w-full h-full">
      <h3 className="title-playfair-small mb-4 text-center text-slate-700">
        Contemplaciones de acuerdo al Calendario Litúrgico
      </h3>

      {/* Month navigation */}
      <div className="flex items-center justify-between mb-4">
        <button 
          onClick={() => navigateMonth("prev")}
          className="p-1 hover:bg-gray-100 rounded"
        >
          <ChevronLeft className="w-4 h-4 text-gray-600" />
        </button>

        <h4 className="subtitle-lato-xs text-slate-700">
          {monthNames[currentMonth]} {currentYear}
        </h4>

        <button 
          onClick={() => navigateMonth("next")}
          className="p-1 hover:bg-gray-100 rounded"
        >
          <ChevronRight className="w-4 h-4 text-gray-600" />
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map(day => (
          <div key={day} className="text-center text-xs text-gray-500 font-medium">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-0.5 lg:gap-1 mb-4">
        {calendarDays}
      </div>

      {/* Selected date info */}
      <div className="text-center pt-4 border-t">
        {selectedEvent ? (
          <div>
            <div className={`text-sm font-medium mb-1 ${selectedEvent.color}`}>
              {selectedEvent.title}
            </div>
            <p className="text-xs text-gray-600">{selectedEvent.description}</p>
          </div>
        ) : selectedDate ? (
          <div>
            <div className="text-sm text-slate-700 mb-1">
              {selectedDate.toLocaleDateString('es-ES', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
            <p className="text-xs text-gray-500">Tiempo Ordinario</p>
          </div>
        ) : (
          <div>
            <Calendar className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Selecciona una fecha</p>
          </div>
        )}
      </div>
    </div>
  )
}