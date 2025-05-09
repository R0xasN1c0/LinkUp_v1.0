
import { Navigate } from "react-router-dom";

/**
 * Index route component
 * Redirects to the main dashboard
 */
const Index = () => {
  return <Navigate to="/" replace />;
};

export default Index;
