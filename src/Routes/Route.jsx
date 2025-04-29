import { createBrowserRouter } from "react-router-dom";
import MainRoutes from "./MainRoutes";

const router = createBrowserRouter([{ path: "*", element: <MainRoutes /> }]);

export default router;
