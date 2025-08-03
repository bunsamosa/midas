import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "components/ui/card";
import { Navbar } from "components/Navbar";
import { Zap, TrendingUp, Bot, Sparkles } from "lucide-react";

export default function AgentsPage() {
  const navigate = useNavigate();

  const navigateToAgent = (agentPath: string) => {
    navigate(agentPath);
  };

  const agents = [
    {
      id: "defi-trading",
      title: "DeFi Trading Agent",
      description: "Advanced cross-chain trading with AI-powered optimization and risk management",
      icon: <Sparkles className="h-8 w-8 text-white" />,
      color: "bg-purple-500",
      path: "/swap",
      features: [
        "1inch DEX aggregation",
        "Cross-chain swaps",
        "AI trading recommendations",
        "Portfolio rebalancing"
      ]
    },
    {
      id: "spend-power",
      title: "Spend Power Agent",
      description: "Optimize your financing options and analyze credit vs loan scenarios",
      icon: <Zap className="h-8 w-8 text-white" />,
      color: "bg-blue-500",
      path: "/power",
      features: [
        "Credit vs loan analysis",
        "Crypto staking options",
        "Interest comparisons",
        "Credit impact assessment"
      ]
    },
    {
      id: "net-worth",
      title: "Net Worth Agent",
      description: "Track your complete financial picture and get personalized insights",
      icon: <TrendingUp className="h-8 w-8 text-white" />,
      color: "bg-green-500",
      path: "/networth",
      features: [
        "Real-time balance tracking",
        "Portfolio optimization",
        "Investment insights",
        "Financial goal planning"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Header Section */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Your AI Financial Agents
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Intelligent financial assistants that help you make smarter decisions and optimize your financial health
            </p>
          </div>

          {/* Agents Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {agents.map((agent) => (
              <Card
                key={agent.id}
                className="border border-gray-200 bg-white cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105"
                onClick={() => navigateToAgent(agent.path)}
              >
                <CardContent className="p-8">
                  <div className="text-center mb-6">
                    <div className={`mx-auto ${agent.color} p-4 rounded-lg w-fit mb-4`}>
                      {agent.icon}
                    </div>
                    <h2 className="text-2xl font-semibold text-gray-900 mb-2">{agent.title}</h2>
                    <p className="text-gray-600 mb-6">{agent.description}</p>
                  </div>
                  
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                      <Sparkles className="h-4 w-4 mr-2 text-blue-500" />
                      Key Features
                    </h3>
                    <ul className="space-y-2">
                      {agent.features.map((feature, index) => (
                        <li key={index} className="flex items-start">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                          <span className="text-sm text-gray-600">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="mt-6 pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-center text-blue-600 font-medium">
                      <Bot className="h-4 w-4 mr-2" />
                      Launch Agent
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Why Choose AI Agents?
            </h2>
            <p className="text-lg text-gray-600">
              Our intelligent agents provide personalized financial guidance 24/7
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="mx-auto bg-gray-900 p-3 rounded-lg w-fit mb-4">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Intelligent Analysis</h3>
              <p className="text-gray-600 text-sm">
                Advanced algorithms analyze your financial data to provide personalized insights and recommendations.
              </p>
            </div>
            
            <div className="text-center">
              <div className="mx-auto bg-gray-900 p-3 rounded-lg w-fit mb-4">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Real-time Monitoring</h3>
              <p className="text-gray-600 text-sm">
                Continuous monitoring of your financial health with instant alerts and proactive recommendations.
              </p>
            </div>
            
            <div className="text-center">
              <div className="mx-auto bg-gray-900 p-3 rounded-lg w-fit mb-4">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Optimization</h3>
              <p className="text-gray-600 text-sm">
                Automatically optimize your financial decisions to maximize returns and minimize risks.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
