import { createBrowserRouter } from "react-router-dom";
import Connect from "./routes/connect";
import Home from "./routes/home";
import Swap from "./routes/swap";
import AdvancedSwap from "./routes/advanced-swap";

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
        {
          path: "/advanced-swap",
          element: <AdvancedSwap />,
        },
  // ... other routes ...
]);

export default router;
