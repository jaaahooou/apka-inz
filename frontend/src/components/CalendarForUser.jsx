import React, { useState } from "react";
import Calendar from "react-calendar";

export default function CalendarForUser() {

  //Lokalny kalendarz testowy
  const events = [
    { date: "2025-10-10", title: "Rozprawa II K 123/21" },
    { date: "2025-10-15", title: "Posiedzenie II W 123/12" },
    { date: "2025-10-23", title: "Zarządzenie II K 123/123" },
  ];

  const [value, setValue] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState(null);

  const tileClassName = ({ date, view }) => {
    if (view === "month") {
      const formatted = date.toISOString().split("T")[0];
      if (events.find((e) => e.date === formatted)) return "highlight";
    }
    return null;
  };

  const handleClickDay = (date) => {
    const formatted = date.toISOString().split("T")[0];
    const event = events.find((e) => e.date === formatted);
    setSelectedEvent(event || null);
    setValue(date);
  };


  const styles = `
  

  .calendar-container {
    background: #1f1f1f;
    border-radius: 16px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.7);
    padding: 1rem;
    max-width: 320px;
    margin: 1rem auto;
    transition: all 0.3s ease;
    color: #ffffffff;
  }

  .calendar-container:hover {
    transform: scale(1.02);
    box-shadow: 0 6px 16px rgba(0,0,0,0.85);
  }

  /* React Calendar styling */
  .react-calendar {
    border: none;
    font-family: 'Inter', sans-serif;
    font-size: 14px;
    width: 100%;
    
    background: #1f1f1f;
    color: #e0e0e0;
  }

  .react-calendar__navigation {
    background: transparent;
    margin-bottom: 0.5rem;
  }

  .react-calendar__navigation button {
    color: #d10d0dff;
    font-weight: 600;
    min-width: 30px;
    background: none;
    border: none;
    border-radius: 8px;
    transition: background 0.2s;
  }

  .react-calendar__navigation button:hover {
    background: #333333;
  }

  .react-calendar__tile {
    padding: 0.4rem 0.2rem !important;
    border-radius: 8px;
    transition: all 0.2s;
    color: #000000ff;
    background-color: #a0a0a0ff;
  }

  /* Podswietlenie dzisiejszej daty */
  .react-calendar__tile--now {
    background: #4444ff !important;
    color: #ffffff !important;
    font-weight: 700;
  }

  .react-calendar__tile--active {
    background: #2c2c2cff !important;
    color: #ffffffff !important;
    border-radius: 8px;
  }

  /* Podswietlenie daty */
  .highlight {
    background-color: #ff0000ff !important;
    color: #1f1f1fff !important;
    border-radius: 8px;
  }

  .highlight:hover {
    background-color: #5f2929ff !important;
    color: #ffffffff !important;
  }

  /* Opis wydarzenia */
  .event-card {
    margin-top: 1rem;
    background: #2a2a2a;
    border-radius: 12px;
    padding: 0.75rem 1rem;
    font-size: 14px;
    color: #ffffffff;
    border-left: 4px solid #ff0000ff;
  }

  .no-event {
    margin-top: 1rem;
    color: #ff0000ff;
    font-style: italic;
    text-align: center;
  }
`;

  return (
    <div className="calendar-container">
      <style>{styles}</style>

      <h2 className="text-center text-lg font-semibold mb-2 text-blue-700">
        Kalendarz spraw
      </h2>

      <Calendar
        onChange={setValue}
        value={value}
        onClickDay={handleClickDay}
        tileClassName={tileClassName}
      />

      {selectedEvent ? (
        <div className="event-card">
          <p><strong>{selectedEvent.date}</strong></p>
          <p>{selectedEvent.title}</p>
        </div>
      ) : (
        <div className="no-event">Kliknij dzień kalendarza, aby poznać szczegóły</div>
      )}
    </div>
  );
}
