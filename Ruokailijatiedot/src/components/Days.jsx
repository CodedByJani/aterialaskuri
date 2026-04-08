import RestaurantRow from "./RestaurantRow";

export default function DaySection({
  dayName,
  dateLabel,
  restaurants,
  weekData,
  updateValue,
  dayTotal
}) {
  return (
    <>
      <tr className="day-header">
        <td colSpan="3">
          {dayName} {dateLabel}
        </td>
        <td>
          <span style={{ float: 'right' }}>Päivä yhteensä: {dayTotal}</span>
        </td>
      </tr>

      {Object.entries(restaurants).map(([restaurant, fields]) => (
        <RestaurantRow
          key={restaurant}
          dayName={dayName}
          restaurant={restaurant}
          fields={fields}
          values={weekData?.[dayName]?.[restaurant] || {}}
          updateValue={updateValue}
        />
      ))}
    </>
  );
}