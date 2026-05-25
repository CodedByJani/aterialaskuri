export default function HistorySelector({
  restaurants,
  selectedUnit,
  setSelectedUnit,
  onClose
}) {
  const handleOpen = () => {
    if (!selectedUnit) return;

    window.open(
      `/history-view?unitName=${encodeURIComponent(selectedUnit)}`,
      "_blank"
    );

    setSelectedUnit("");
    onClose();
  };

  return (
    <div
      style={{
        marginTop: "10px",
        padding: "10px",
        background: "white",
        border: "1px solid #e5e7eb",
        borderRadius: "8px",
        width: "220px"
      }}
    >
      <select
        value={selectedUnit}
        onChange={(e) => setSelectedUnit(e.target.value)}
        style={{
          padding: "8px",
          borderRadius: "6px",
          width: "100%",
          marginBottom: "10px"
        }}
      >
        <option value="">Valitse yksikkö</option>
        {Object.keys(restaurants).map(unit => (
          <option key={unit} value={unit}>
            {unit}
          </option>
        ))}
      </select>

      <button
        onClick={handleOpen}
        style={{ backgroundColor: "#10b981", width: "100%" }}
      >
        Avaa historia
      </button>

      <button
        onClick={onClose}
        style={{
          backgroundColor: "#6b7280",
          width: "100%",
          marginTop: "8px"
        }}
      >
        Sulje
      </button>
    </div>
  );
}