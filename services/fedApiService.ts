// Mocks a call to a Federal Reserve or economic data API.

/**
 * Fetches a mock 5-year inflation forecast.
 * In a real application, this would make an authenticated API call to a reliable
 * economic data source.
 * @returns A promise that resolves to an array of 5 annual inflation rate forecasts.
 */
export const fetchInflationForecast = (): Promise<number[]> => {
  console.log("Fetching mock inflation forecast...");
  return new Promise(resolve => {
    setTimeout(() => {
      // Mocked realistic inflation forecast for the next 5 years
      const forecast = [0.032, 0.028, 0.025, 0.023, 0.021];
      console.log("Mock forecast received:", forecast);
      resolve(forecast);
    }, 800); // Simulate network delay
  });
};