import { getRowTotal } from "../utils/calculations";

export default function RestaurantRow({
  dayName,
  restaurant,
  fields,
  values,
  updateValue
}) {
  return (
    <tr className="restaurant-row">
      <td></td>

      <td className="restaurant-name">{restaurant}</td>

      <td>
        {fields.map(field => (
          <div key={field} className="field-row">
            <span>{field}</span>

            <input
              type="number"
              min="0"
              value={values[field] || ""}
              onChange={(e) => {
                const val = e.target.value;
                if (val === "" || Number(val) >= 0) {
                updateValue(dayName, restaurant, field, val)
              }
            }}  
              className={values[field] ? "filled" : ""}
            />
          </div>
        ))}
      </td>

      <td className="total-cell">
        {getRowTotal(values)}
      </td>
    </tr>
  );
}