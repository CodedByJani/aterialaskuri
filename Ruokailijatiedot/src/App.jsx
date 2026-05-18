import { useState, useEffect, useRef } from "react";
import { Toaster, toast } from 'react-hot-toast';
import { useNavigate } from "react-router-dom"
import DaySection from "./components/Days";
import WeekSummary from "./components/WeekSum";
import { getWeekFieldTotals, getDayTotal } from "./utils/calculations";


import "./App.css";

const days = ["Ma", "Ti", "Ke", "To", "Pe"];

const restaurants = {
  "Napostella": ["puuro", "lounas"],
  "Ilona": ["puuro", "lounas"],
  "Käenkaali": ["aamupala", "lounas", "metsäeväät", "päivällinen"],
  "Kiito-Orava": ["puuro", "lounas"]
};

const months = [
  "Tammikuu","Helmikuu","Maaliskuu","Huhtikuu","Toukokuu","Kesäkuu",
  "Heinäkuu","Elokuu","Syyskuu","Lokakuu","Marraskuu","Joulukuu"
];

function getWeekNumber(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
  return Math.ceil((((d - yearStart) / 86400000) + 1)/7);
}

function formatDate(dateObj) {
  const y = dateObj.getFullYear()
  const m = String(dateObj.getMonth() + 1).padStart(2, '0')
  const d = String(dateObj.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export default function App() {

  const navigate = useNavigate()
  const timeoutsRef = useRef({})

  const createEmptyWeek = () => {
    const data = {};
    days.forEach(day => {
      data[day] = {};
      Object.entries(restaurants).forEach(([restaurant, fields]) => {
        data[day][restaurant] = {};
        fields.forEach(field => {
          data[day][restaurant][field] = "";
        });
      });
    });
    return data;
  };

  const [weekOffset, setWeekOffset] = useState(0);
  const [reports, setReports] = useState({});
  const [showOnlyLounas, setShowOnlyLounas] = useState(false);


  const today = new Date();
  today.setDate(today.getDate() + weekOffset * 7);

  const weekNumber = getWeekNumber(today);
  const year = today.getFullYear();
  const monthName = months[today.getMonth()];
  const weekKey = `${year}-W${weekNumber}`;

  const monday = new Date(today);
  const day = monday.getDay();
  const diff = monday.getDate() - day + (day === 0 ? -6 : 1);
  monday.setDate(diff);

  const weekData = reports[weekKey] || createEmptyWeek();

  const handleLogout = () => {
    localStorage.removeItem("sessionToken");
    localStorage.removeItem("userEmail");
    window.location.reload();
  };

  useEffect(() => {
    const fetchWeek = async () => {
      try {
        const token = localStorage.getItem("sessionToken");
        const startDate = formatDate(monday)
        const end = new Date(monday);
        end.setDate(monday.getDate() + 4);
        const endDate = formatDate(end)
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/stats?startDate=${startDate}&endDate=${endDate}`,
          {
            headers: token ? { Authorization: `Bearer ${token}` } : {}
          }
        );
        if (!res.ok) throw new Error("Failed to fetch week data");

        const data = await res.json();
        const weekObj = createEmptyWeek();

        data.forEach(dayStat => {
          const jsDay = new Date(dayStat.date).getDay();
          const dayIndex = jsDay === 0 ? 6 : jsDay - 1;
          const dayName = days[dayIndex];

          if (!dayName) return;
          dayStat.units.forEach(unit => {
            unit.meals.forEach(meal => {
              if (!weekObj[dayName][unit.unitName]) {
                weekObj[dayName][unit.unitName] = {};
              }
              weekObj[dayName][unit.unitName][meal.type] = meal.count;
            });
          });
        });
        setReports(prev => ({ ...prev, [weekKey]: weekObj }));
      } catch (err) {
        console.error(err);
      }
    };
    fetchWeek();
  }, [weekOffset]);

  const updateValue = async (dayName, restaurant, field, value) => {
    setReports(prev => ({
      ...prev,
      [weekKey]: {
        ...(prev[weekKey] || createEmptyWeek()),
        [dayName]: {
          ...((prev[weekKey] || createEmptyWeek())[dayName]),
          [restaurant]: {
            ...((prev[weekKey] || createEmptyWeek())[dayName][restaurant]),
            [field]: value
          }
        }
      }
    }));

    const timeoutKey = `${dayName}-${restaurant}-${field}`

    if (timeoutsRef.current[timeoutKey]) {
      clearTimeout(timeoutsRef.current[timeoutKey])
    }

    timeoutsRef.current[timeoutKey] = setTimeout(async () => {
      const token = localStorage.getItem("sessionToken");
      const dayIndex = days.indexOf(dayName);
      const selectedDate = new Date(monday);
      selectedDate.setDate(monday.getDate() + dayIndex);

      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/stats/update-count`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` })
          },
          body: JSON.stringify({
            date: formatDate(selectedDate),
            unitName: restaurant,
            mealType: field,
            newCount: Number(value)
          })
        });
        

        if (!res.ok) throw new Error("Virhe palvelimella");

        // Näytetään toast, mutta annetaan sille ID, jotta ruudulle ei tule montaa päällekkäistä viestiä
        toast.success('Tallennettu!', { id: 'tallennus-toast', duration: 2000 });

      } catch (err) {
        console.error("Failed to update backend:", err);
        toast.error('Virhe tallennuksessa!', { id: 'tallennus-toast' });
      }
    }, 800)
  };

  const fieldTotals = getWeekFieldTotals(weekData);
// Lisätty: suodatetaan näytettävät ravintolat ja ateriatyypit
const filteredRestaurants = showOnlyLounas
  ? Object.fromEntries(Object.entries(restaurants).map(([k, v]) => [k, v.filter(f => f === "lounas")]))
  : restaurants;

  return (
    <div className="app-container">
      <Toaster position="top-center" />
      <div className="app-header">
        {/* Lisätty ikoni otsikon viereen react-kirjastosta */}
        <h1>🍽️ Ruokailijatiedot</h1>
        <div>
          {/* Lisätty: suodatinnappi lounaiden näyttämiseen */}
          <button
            onClick={() => setShowOnlyLounas(!showOnlyLounas)}
          style={{ backgroundColor: showOnlyLounas ? "#6366f1" : "#2563eb", marginRight: "10px" }}
          > 
            {showOnlyLounas ? "Näytä kaikki" : "Näytä vain lounaat"}
          </button>
          <button 
            onClick={() => navigate("/logs")}
            style={{ backgroundColor: "#10b981", marginRight: "10px" }}
          >Näytä lokit
          </button>

          <button onClick={handleLogout} className="logout-button">
            Kirjaudu ulos
          </button>
        </div>
      </div>

      <h2>
        Viikko {weekNumber} – {monthName} {year}
      </h2>

      <div className="week-buttons">
        <button onClick={() => setWeekOffset(weekOffset - 1)}>
          ← Edellinen
        </button>
        <button onClick={() => setWeekOffset(weekOffset + 1)}>
          Seuraava →
        </button>
      </div>

      <h3>
        Viikon ateriat yhteensä: <WeekSummary fieldTotals={fieldTotals} />
      </h3>

      <table>
        <tbody>
          {days.map((dayName, i) => {
            const date = new Date(monday);
            date.setDate(monday.getDate() + i);
            const dateLabel = `${date.getDate()}.${date.getMonth()+1}.`;

      const dayTotal = getDayTotal(weekData[dayName] || {});

            return (
              <DaySection
                key={dayName}
                dayName={dayName}
                dateLabel={dateLabel}
                restaurants={filteredRestaurants}
                weekData={weekData}
                updateValue={updateValue}
                dayTotal={dayTotal}
              />
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
