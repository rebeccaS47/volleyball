interface CitySelectorProps {
    cities: string[];
    selectedCity: string;
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  }
  
  export const CitySelector: React.FC<CitySelectorProps> = ({ cities, selectedCity, onChange }) => (
    <select name="city" value={selectedCity} onChange={onChange}>
      <option value="">選擇城市</option>
      {cities.map((city, index) => (
        <option key={index} value={city}>
          {city}
        </option>
      ))}
    </select>
  );