import { createBrowserRouter } from "react-router-dom";
import Connect from "./routes/connect";
import Home from "./routes/home";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Connect />,
  },
  {
    path: "/connect",
    element: <Connect />,
  },
  {
    path: "/home",
    element: <Home />,
  },
  // ... other routes ...
]);

export default router;
