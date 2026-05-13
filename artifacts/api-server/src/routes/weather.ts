import { Router, type IRouter } from "express";

const router: IRouter = Router();

const MOCK_WEATHER: Record<string, object> = {
  "bihar sharif": {
    city: "Bihar Sharif",
    country: "India",
    temp: 32,
    feels_like: 31,
    description: "Haze",
    humidity: 49,
    wind: 13,
    visibility: 5,
    uv: 1,
    sunrise: "05:07 AM",
    sunset: "06:22 PM",
    unit: "C",
  },
  delhi: {
    city: "Delhi",
    country: "India",
    temp: 38,
    feels_like: 40,
    description: "Sunny",
    humidity: 32,
    wind: 18,
    visibility: 8,
    uv: 9,
    sunrise: "05:30 AM",
    sunset: "07:01 PM",
    unit: "C",
  },
  mumbai: {
    city: "Mumbai",
    country: "India",
    temp: 33,
    feels_like: 37,
    description: "Partly Cloudy",
    humidity: 78,
    wind: 22,
    visibility: 10,
    uv: 7,
    sunrise: "06:02 AM",
    sunset: "07:14 PM",
    unit: "C",
  },
  bangalore: {
    city: "Bangalore",
    country: "India",
    temp: 27,
    feels_like: 28,
    description: "Clear Sky",
    humidity: 55,
    wind: 12,
    visibility: 15,
    uv: 6,
    sunrise: "06:05 AM",
    sunset: "06:48 PM",
    unit: "C",
  },
  london: {
    city: "London",
    country: "UK",
    temp: 15,
    feels_like: 13,
    description: "Overcast",
    humidity: 72,
    wind: 25,
    visibility: 12,
    uv: 2,
    sunrise: "05:15 AM",
    sunset: "08:52 PM",
    unit: "C",
  },
  "new york": {
    city: "New York",
    country: "US",
    temp: 22,
    feels_like: 21,
    description: "Partly Cloudy",
    humidity: 58,
    wind: 20,
    visibility: 16,
    uv: 5,
    sunrise: "05:45 AM",
    sunset: "07:58 PM",
    unit: "C",
  },
  tokyo: {
    city: "Tokyo",
    country: "Japan",
    temp: 24,
    feels_like: 25,
    description: "Light Rain",
    humidity: 82,
    wind: 15,
    visibility: 7,
    uv: 3,
    sunrise: "04:44 AM",
    sunset: "06:44 PM",
    unit: "C",
  },
  paris: {
    city: "Paris",
    country: "France",
    temp: 17,
    feels_like: 16,
    description: "Cloudy",
    humidity: 68,
    wind: 18,
    visibility: 14,
    uv: 3,
    sunrise: "06:02 AM",
    sunset: "09:28 PM",
    unit: "C",
  },
  dubai: {
    city: "Dubai",
    country: "UAE",
    temp: 42,
    feels_like: 45,
    description: "Sunny",
    humidity: 28,
    wind: 16,
    visibility: 20,
    uv: 11,
    sunrise: "05:28 AM",
    sunset: "06:58 PM",
    unit: "C",
  },
};

router.get("/weather", (req, res) => {
  const city = ((req.query.city as string) || "Bihar Sharif").toLowerCase().trim();
  const unit = (req.query.unit as string) || "C";

  let data = MOCK_WEATHER[city];

  if (!data) {
    const cityName = (req.query.city as string) || "Bihar Sharif";
    data = {
      city: cityName,
      country: "India",
      temp: 29 + Math.floor(Math.random() * 10),
      feels_like: 28 + Math.floor(Math.random() * 8),
      description: "Partly Cloudy",
      humidity: 50 + Math.floor(Math.random() * 30),
      wind: 10 + Math.floor(Math.random() * 20),
      visibility: 8 + Math.floor(Math.random() * 10),
      uv: 3 + Math.floor(Math.random() * 7),
      sunrise: "05:45 AM",
      sunset: "06:45 PM",
      unit: "C",
    };
  }

  const weatherData = data as Record<string, unknown>;
  if (unit === "F") {
    const tempC = weatherData.temp as number;
    const feelsC = weatherData.feels_like as number;
    res.json({
      ...weatherData,
      temp: Math.round((tempC * 9) / 5 + 32),
      feels_like: Math.round((feelsC * 9) / 5 + 32),
      unit: "F",
    });
  } else {
    res.json({ ...weatherData, unit: "C" });
  }
});

export default router;
