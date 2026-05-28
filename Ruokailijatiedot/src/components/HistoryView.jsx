import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

function formatDate(dateObj) {
  const y = dateObj.getFullYear();
  const m = String(dateObj.getMonth() + 1).padStart(2, "0");
  const d = String(dateObj.getDate()).padStart(2, "0");

  return `${y}-${m}-${d}`;
}

export default function HistoryView() {
  const [searchParams] = useSearchParams();
  const unitName = searchParams.get("unitName");
  const navigate = useNavigate();

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
  }, [unitName, startDate, endDate]);

  return (
    <div className="app-container">
      <h1>Historia: {unitName}</h1>

      <div style={{ marginBottom: "10px" }}>
        <button
          onClick={() => navigate("/")}
          style={{
            backgroundColor: "#6b7280",
            color: "white"
          }}
        >
          Takaisin
        </button>
      </div>

      <div
        style={{
          display: "flex",
          gap: "10px",
          flexWrap: "wrap",
          alignItems: "flex-end",
          marginBottom: "20px"
        }}
      >
        <div>
          <label htmlFor="start-Date">Alkupäivä</label>
          <br />
          <input
            type="date"
            id="start-Date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            style={{ width: "140px" }}
          />
        </div>

        <div>
          <label htmlFor="end-Date">Loppupäivä</label>
          <br />
          <input
            type="date"
            id="end-Date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            style={{ width: "140px" }}
          />
        </div>

        <button
          onClick={fetchHistory}
          style={{
            backgroundColor: "#2563eb",
            color: "white",
            height: "40px"
          }}
        >
          Hae historia
        </button>
      </div>

      {loading ? (
        <p>Ladataan...</p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ minWidth: "600px" }}>
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
        </div>
      )}
    </div>
  );
}