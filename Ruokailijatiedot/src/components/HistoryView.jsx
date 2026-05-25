import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

function formatDate(dateObj) {
  const y = dateObj.getFullYear();
  const m = String(dateObj.getMonth() + 1).padStart(2, "0");
  const d = String(dateObj.getDate()).padStart(2, "0");

  return `${y}-${m}-${d}`;
}

export default function HistoryView() {
  const [searchParams] = useSearchParams();
  const unitName = searchParams.get("unitName");

  const today = new Date();

  const [startDate, setStartDate] = useState(
    formatDate(new Date(today.getFullYear(), today.getMonth(), 1))
  );

  const [endDate, setEndDate] = useState(
    formatDate(today)
  );

  const [currentData, setCurrentData] = useState([]);
  const [previousData, setPreviousData] = useState([]);
  const [loading, setLoading] = useState(false);

  const getPreviousYearDate = (dateString) => {
    const date = new Date(dateString);
    date.setFullYear(date.getFullYear() - 1);

    return formatDate(date);
  };

  const fetchHistory = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("sessionToken");

      const currentParams = new URLSearchParams({
        unitName,
        startDate,
        endDate
      });

      const previousParams = new URLSearchParams({
        unitName,
        startDate: getPreviousYearDate(startDate),
        endDate: getPreviousYearDate(endDate)
      });

      const [currentRes, previousRes] = await Promise.all([
        fetch(
          `${import.meta.env.VITE_API_URL}/stats/history?${currentParams.toString()}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        ),
        
        fetch(
          `${import.meta.env.VITE_API_URL}/stats/history?${previousParams.toString()}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        
        )
      ]);
    
      if (!currentRes.ok || !previousRes.ok) {
        throw new Error("Failed to fetch history");
      }

      const currentJson = await currentRes.json();
      const previousJson = await previousRes.json();

      setCurrentData(currentJson);
      setPreviousData(previousJson);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (unitName) {
      fetchHistory();
    }
  }, [unitName]);

  return (
    <div className="app-container">
      <h1>Historia: {unitName}</h1>

      <div
        style={{
          display: "flex",
          gap: "10px",
          marginBottom: "20px",
          alignItems: "center"
        }}
      >
        <div>
          <label>Alkupäivä</label>
          <br />
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            style={{
              width: "100px"
            }}
          />
        </div>

        <div>
          <label>Loppupäivä</label>
          <br />
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            style={{
              width: "100px"
            }}
          />
        </div>

        <button
          onClick={fetchHistory}
          style={{
            marginTop: "20px",
            backgroundColor: "#2563eb",
            color: "white"
          }}
        >
          Hae historia
        </button>
      </div>

      {loading ? (
        <p>Ladataan...</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Päivä</th>

              <th>{startDate.slice(0, 4)}</th>

              <th>{Number(startDate.slice(0, 4)) - 1}</th>
            </tr>
          </thead>

          <tbody>
            {currentData.map((row, index) => {
              const previousRow = previousData[index];

              return (
                <tr key={row.date}>
                  <td>{row.date}</td>

                  <td>
                    {row.meals.map((m, i) => (
                      <div key={i}>
                        {m.type}: {m.count}
                      </div>
                    ))}
                  </td>

                  <td>
                    {previousRow ? (
                      previousRow.meals.map((m, i) => (
                        <div key={i}>
                          {m.type}: {m.count}
                        </div>
                      ))
                    ) : (
                      <div>Ei dataa</div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}