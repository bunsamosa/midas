import { createBrowserRouter } from "react-router-dom";
import Connect from "./routes/connect";
import Home from "./routes/home";
import Swap from "./routes/swap";

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
          {
          path: "/swap",
          element: <Swap />,
        },

  // ... other routes ...
]);

export default router;
