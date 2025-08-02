import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "components/ui/card";
import { Navbar } from "components/Navbar";

export default function AgentsPage() {
  const navigate = useNavigate();

  const navigateToAgent = (agentPath: string) => {
    navigate(agentPath);
  };

  return (
    <div className="flex p-2 flex-col min-h-screen w-full max-w-4xl mx-auto">
      <Navbar />
      <main className="flex flex-col items-center justify-center gap-8 m-auto w-full max-w-4xl px-4">
        <h1 className="text-3xl font-bold mb-6">Your AI Agents</h1>
        <Card
          className="w-full sm:w-2/3 md:w-1/2 h-40 shadow-md rounded-xl transition-all hover:shadow-xl hover:scale-105 cursor-pointer overflow-hidden group"
          onClick={() => navigateToAgent("/power")}
        >
          <CardContent className="flex items-center justify-center h-full p-6 bg-gradient-to-br from-blue-500 to-purple-600 text-white">
            <h2 className="text-2xl font-semibold group-hover:scale-110 transition-transform duration-200">Spend Power Agent</h2>
          </CardContent>
        </Card>
        <Card
          className="w-full sm:w-2/3 md:w-1/2 h-40 shadow-md rounded-xl transition-all hover:shadow-xl hover:scale-105 cursor-pointer overflow-hidden group"
          onClick={() => navigateToAgent("/networth")}
        >
          <CardContent className="flex items-center justify-center h-full p-6 bg-gradient-to-br from-green-500 to-teal-600 text-white">
            <h2 className="text-2xl font-semibold group-hover:scale-110 transition-transform duration-200">Net Worth Agent</h2>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
