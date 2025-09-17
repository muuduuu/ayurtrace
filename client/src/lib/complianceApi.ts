import { fetchData } from "./utils"; // A utility function to fetch data from the backend

export const fetchComplianceReport = async () => {
  const response = await fetchData("/api/compliance-report");
  return response.data; // Assuming the response contains the compliance data in the "data" field
};
