import { Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import DatasetDashboard from "./pages/DatasetDashboard";
import DatasetHistoryPage from "./pages/DatasetHistoryPage";
import LandingPage from "./pages/LandingPage";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<LandingPage />} />
        <Route path="/datasets" element={<DatasetHistoryPage />} />
        <Route path="/dataset/:datasetId" element={<DatasetDashboard />} />
      </Route>
    </Routes>
  );
}
