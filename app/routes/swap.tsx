import { Navbar } from "components/Navbar";
import { Card, CardContent } from "components/ui/card";
import { Button } from "components/ui/button";
import { Input } from "components/ui/input";
import { useState, useEffect } from "react";
import { ArrowRight, Clock, Lock, AlertCircle, CheckCircle, TrendingUp, DollarSign, Coins, ArrowUpDown, Settings, Zap, Shield, Timer } from "lucide-react";

interface SwapStatus {
  id: string;
  fromChain: string;
  toChain: string;
  fromToken: string;
  toToken: string;
  fromAmount: string;
  toAmount: string;
  status: 'pending' | 'hashlock-created' | 'timelock-active' | 'completed' | 'expired';
  hashlock: string;
  timelock: string;
  createdAt: Date;
}

interface OrderStatus {
  id: string;
  fromChain: string;
  toChain: string;
  fromToken: string;
  toToken: string;
  fromAmount: string;
  toAmount: string;
  filledAmount: string;
  remainingAmount: string;
  fillPercentage: number;
  status: 'active' | 'filled' | 'cancelled' | 'expired';
  timelock: string;
  createdAt: Date;
}

export default function Swap() {
  const [swapStatuses, setSwapStatuses] = useState<SwapStatus[]>([]);
  const [orderStatuses, setOrderStatuses] = useState<OrderStatus[]>([]);
  const [showSwapForm, setShowSwapForm] = useState(false);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [activeTab, setActiveTab] = useState<'swaps' | 'orders'>('swaps');
  const [swapMode, setSwapMode] = useState<'instant' | 'limit'>('instant');
  
  const [swapForm, setSwapForm] = useState({
    fromChain: 'ethereum',
    toChain: 'polygon',
    fromToken: 'ETH',
    toToken: 'MATIC',
    fromAmount: '',
    toAmount: '',
    timelockDuration: '3600',
    slippage: '0.5'
  });

  const [orderForm, setOrderForm] = useState({
    fromChain: 'ethereum',
    toChain: 'arbitrum',
    fromToken: 'ETH',
    toToken: 'ARB',
    fromAmount: '',
    toAmount: '',
    timelockDuration: '7200'
  });

  useEffect(() => {
    // Load swap history from localStorage
    const storedSwaps = JSON.parse(localStorage.getItem('swapHistory') || '[]');
    setSwapStatuses(storedSwaps);

    // Load order history from localStorage
    const storedOrders = JSON.parse(localStorage.getItem('orderHistory') || '[]');
    setOrderStatuses(storedOrders);
  }, []);

  const handleCreateSwap = () => {
    const newSwap: SwapStatus = {
      id: Date.now().toString(),
      fromChain: swapForm.fromChain,
      toChain: swapForm.toChain,
      fromToken: swapForm.fromToken,
      toToken: swapForm.toToken,
      fromAmount: swapForm.fromAmount,
      toAmount: swapForm.toAmount,
      status: 'pending',
      hashlock: '0x' + Math.random().toString(16).substr(2, 64),
      timelock: new Date(Date.now() + parseInt(swapForm.timelockDuration) * 1000).toISOString(),
      createdAt: new Date()
    };

    const updatedSwaps = [newSwap, ...swapStatuses];
    setSwapStatuses(updatedSwaps);
    localStorage.setItem('swapHistory', JSON.stringify(updatedSwaps));
    setShowSwapForm(false);
    setSwapForm({
      fromChain: 'ethereum',
      toChain: 'polygon',
      fromToken: 'ETH',
      toToken: 'MATIC',
      fromAmount: '',
      toAmount: '',
      timelockDuration: '3600',
      slippage: '0.5'
    });
  };

  const handleCreateOrder = () => {
    const newOrder: OrderStatus = {
      id: Date.now().toString(),
      fromChain: orderForm.fromChain,
      toChain: orderForm.toChain,
      fromToken: orderForm.fromToken,
      toToken: orderForm.toToken,
      fromAmount: orderForm.fromAmount,
      toAmount: orderForm.toAmount,
      filledAmount: '0',
      remainingAmount: orderForm.fromAmount,
      fillPercentage: 0,
      status: 'active',
      timelock: new Date(Date.now() + parseInt(orderForm.timelockDuration) * 1000).toISOString(),
      createdAt: new Date()
    };

    const updatedOrders = [newOrder, ...orderStatuses];
    setOrderStatuses(updatedOrders);
    localStorage.setItem('orderHistory', JSON.stringify(updatedOrders));
    setShowOrderForm(false);
    setOrderForm({
      fromChain: 'ethereum',
      toChain: 'arbitrum',
      fromToken: 'ETH',
      toToken: 'ARB',
      fromAmount: '',
      toAmount: '',
      timelockDuration: '7200'
    });
  };

  const getStatusIcon = (status: SwapStatus['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'hashlock-created':
        return <Lock className="h-4 w-4 text-blue-600" />;
      case 'timelock-active':
        return <AlertCircle className="h-4 w-4 text-orange-600" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'expired':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusText = (status: SwapStatus['status']) => {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'hashlock-created':
        return 'Hashlock Created';
      case 'timelock-active':
        return 'Timelock Active';
      case 'completed':
        return 'Completed';
      case 'expired':
        return 'Expired';
      default:
        return 'Unknown';
    }
  };

  const getOrderStatusIcon = (status: OrderStatus['status']) => {
    switch (status) {
      case 'active':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'filled':
        return <CheckCircle className="h-4 w-4 text-blue-600" />;
      case 'cancelled':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      case 'expired':
        return <Clock className="h-4 w-4 text-gray-600" />;
      default:
        return <TrendingUp className="h-4 w-4 text-gray-600" />;
    }
  };

  const getOrderStatusText = (status: OrderStatus['status']) => {
    switch (status) {
      case 'active':
        return 'Active';
      case 'filled':
        return 'Filled';
      case 'cancelled':
        return 'Cancelled';
      case 'expired':
        return 'Expired';
      default:
        return 'Unknown';
    }
  };

  const getChainIcon = (chain: string) => {
    switch (chain.toLowerCase()) {
      case 'ethereum':
        return '🔵';
      case 'polygon':
        return '🟣';
      case 'arbitrum':
        return '🔵';
      case 'optimism':
        return '🔴';
      default:
        return '⚪';
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Header Section */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Cross-Chain Swap
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Secure cross-chain swaps with hashlock and timelock functionality. 
              Support for bidirectional swaps and partial fills.
            </p>
          </div>

          {/* Mode Selection */}
          <div className="flex justify-center mb-8">
            <div className="bg-white rounded-lg p-1 shadow-sm border border-gray-200">
              <button
                onClick={() => setSwapMode('instant')}
                className={`px-6 py-2 rounded-md font-medium transition-colors ${
                  swapMode === 'instant'
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Zap className="h-4 w-4" />
                  <span>Instant Swap</span>
                </div>
              </button>
              <button
                onClick={() => setSwapMode('limit')}
                className={`px-6 py-2 rounded-md font-medium transition-colors ${
                  swapMode === 'limit'
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4" />
                  <span>Limit Order</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          {/* Tab Navigation */}
          <div className="flex justify-center mb-12">
            <div className="bg-white rounded-lg p-1 shadow-sm border border-gray-200">
              <button
                onClick={() => setActiveTab('swaps')}
                className={`px-6 py-2 rounded-md font-medium transition-colors ${
                  activeTab === 'swaps'
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <ArrowUpDown className="h-4 w-4" />
                  <span>Swap History</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('orders')}
                className={`px-6 py-2 rounded-md font-medium transition-colors ${
                  activeTab === 'orders'
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4" />
                  <span>Order History</span>
                </div>
              </button>
            </div>
          </div>

          {/* Swap Interface */}
          {swapMode === 'instant' ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Swap Form */}
              <div className="lg:col-span-2">
                <Card className="border border-gray-200 bg-white">
                  <CardContent className="p-6">
                    <div className="flex items-center mb-6">
                      <div className="bg-purple-500 p-2 rounded-lg mr-3">
                        <ArrowUpDown className="h-5 w-5 text-white" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900">Instant Swap</h3>
                    </div>

                    {!showSwapForm ? (
                      <div className="text-center py-8">
                        <h4 className="text-lg font-semibold text-gray-900 mb-2">Ready to Swap?</h4>
                        <p className="text-gray-600 mb-6">Create a new cross-chain swap with hashlock protection</p>
                        <Button 
                          onClick={() => setShowSwapForm(true)}
                          className="bg-gray-900 hover:bg-gray-800 text-white"
                        >
                          Start New Swap
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">From Chain</label>
                            <select 
                              value={swapForm.fromChain}
                              onChange={(e) => setSwapForm({...swapForm, fromChain: e.target.value})}
                              className="w-full p-2 border border-gray-300 rounded-md"
                            >
                              <option value="ethereum">Ethereum</option>
                              <option value="polygon">Polygon</option>
                              <option value="arbitrum">Arbitrum</option>
                              <option value="optimism">Optimism</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">To Chain</label>
                            <select 
                              value={swapForm.toChain}
                              onChange={(e) => setSwapForm({...swapForm, toChain: e.target.value})}
                              className="w-full p-2 border border-gray-300 rounded-md"
                            >
                              <option value="polygon">Polygon</option>
                              <option value="ethereum">Ethereum</option>
                              <option value="arbitrum">Arbitrum</option>
                              <option value="optimism">Optimism</option>
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">From Token</label>
                            <Input
                              value={swapForm.fromToken}
                              onChange={(e) => setSwapForm({...swapForm, fromToken: e.target.value})}
                              placeholder="ETH"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">To Token</label>
                            <Input
                              value={swapForm.toToken}
                              onChange={(e) => setSwapForm({...swapForm, toToken: e.target.value})}
                              placeholder="MATIC"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">From Amount</label>
                            <Input
                              type="number"
                              value={swapForm.fromAmount}
                              onChange={(e) => setSwapForm({...swapForm, fromAmount: e.target.value})}
                              placeholder="0.0"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">To Amount</label>
                            <Input
                              type="number"
                              value={swapForm.toAmount}
                              onChange={(e) => setSwapForm({...swapForm, toAmount: e.target.value})}
                              placeholder="0.0"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Timelock Duration (seconds)</label>
                          <select 
                            value={swapForm.timelockDuration}
                            onChange={(e) => setSwapForm({...swapForm, timelockDuration: e.target.value})}
                            className="w-full p-2 border border-gray-300 rounded-md"
                          >
                            <option value="3600">1 Hour</option>
                            <option value="7200">2 Hours</option>
                            <option value="14400">4 Hours</option>
                            <option value="86400">24 Hours</option>
                          </select>
                        </div>

                        <div className="flex space-x-3">
                          <Button 
                            onClick={handleCreateSwap}
                            className="flex-1 bg-gray-900 hover:bg-gray-800 text-white"
                          >
                            Create Swap
                          </Button>
                          <Button 
                            onClick={() => setShowSwapForm(false)}
                            variant="outline"
                            className="flex-1"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Swap History */}
              <div className="lg:col-span-1">
                <Card className="border border-gray-200 bg-white">
                  <CardContent className="p-6">
                    <div className="flex items-center mb-6">
                      <div className="bg-blue-500 p-2 rounded-lg mr-3">
                        <Clock className="h-5 w-5 text-white" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900">Swap History</h3>
                    </div>

                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {swapStatuses.length > 0 ? (
                        swapStatuses.map((swap) => (
                          <div key={swap.id} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center space-x-2">
                                {getStatusIcon(swap.status)}
                                <span className="text-sm font-medium text-gray-900">
                                  {getStatusText(swap.status)}
                                </span>
                              </div>
                              <span className="text-xs text-gray-500">
                                {new Date(swap.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">From:</span>
                                <span className="font-medium">{swap.fromAmount} {swap.fromToken} ({swap.fromChain})</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">To:</span>
                                <span className="font-medium">{swap.toAmount} {swap.toToken} ({swap.toChain})</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Hashlock:</span>
                                <span className="font-mono text-xs">{swap.hashlock.slice(0, 8)}...</span>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500 text-center py-8">No swap history</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Limit Order Form */}
              <div className="lg:col-span-2">
                <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                  <CardContent className="p-8">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center space-x-3">
                        <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-3 rounded-xl">
                          <TrendingUp className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">Limit Order</h3>
                          <p className="text-sm text-gray-600">Set your preferred exchange rate</p>
                        </div>
                      </div>
                    </div>

                    {!showOrderForm ? (
                      <div className="text-center py-12">
                        <div className="bg-gradient-to-r from-green-100 to-emerald-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                          <TrendingUp className="h-8 w-8 text-green-600" />
                        </div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-2">Create Limit Order</h4>
                        <p className="text-gray-600 mb-6">Set your preferred rate and wait for the market to match</p>
                        <Button 
                          onClick={() => setShowOrderForm(true)}
                          className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 py-3 rounded-xl font-semibold"
                        >
                          Create Order
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {/* Order Details */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4">
                            <label className="text-sm font-medium text-gray-700 mb-2 block">From Chain</label>
                            <select 
                              value={orderForm.fromChain}
                              onChange={(e) => setOrderForm({...orderForm, fromChain: e.target.value})}
                              className="w-full p-3 border border-gray-200 rounded-lg bg-white"
                            >
                              <option value="ethereum">Ethereum</option>
                              <option value="polygon">Polygon</option>
                              <option value="arbitrum">Arbitrum</option>
                              <option value="optimism">Optimism</option>
                            </select>
                          </div>
                          <div className="bg-gradient-to-r from-blue-50 to-purple-100 rounded-xl p-4">
                            <label className="text-sm font-medium text-gray-700 mb-2 block">To Chain</label>
                            <select 
                              value={orderForm.toChain}
                              onChange={(e) => setOrderForm({...orderForm, toChain: e.target.value})}
                              className="w-full p-3 border border-gray-200 rounded-lg bg-white"
                            >
                              <option value="arbitrum">Arbitrum</option>
                              <option value="ethereum">Ethereum</option>
                              <option value="polygon">Polygon</option>
                              <option value="optimism">Optimism</option>
                            </select>
                          </div>
                        </div>

                        {/* Token Amounts */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4">
                            <label className="text-sm font-medium text-gray-700 mb-2 block">From Amount</label>
                            <div className="flex items-center space-x-3">
                              <Input
                                type="number"
                                value={orderForm.fromAmount}
                                onChange={(e) => setOrderForm({...orderForm, fromAmount: e.target.value})}
                                placeholder="0.0"
                                className="text-xl font-bold border-0 bg-transparent p-0 focus:ring-0"
                              />
                              <div className="flex items-center space-x-2 bg-white rounded-lg px-3 py-2 border">
                                <span>{getChainIcon(orderForm.fromChain)}</span>
                                <select 
                                  value={orderForm.fromToken}
                                  onChange={(e) => setOrderForm({...orderForm, fromToken: e.target.value})}
                                  className="font-semibold text-gray-900 bg-transparent border-0 focus:ring-0"
                                >
                                  <option value="ETH">ETH</option>
                                  <option value="MATIC">MATIC</option>
                                  <option value="ARB">ARB</option>
                                </select>
                              </div>
                            </div>
                          </div>
                          <div className="bg-gradient-to-r from-blue-50 to-purple-100 rounded-xl p-4">
                            <label className="text-sm font-medium text-gray-700 mb-2 block">To Amount</label>
                            <div className="flex items-center space-x-3">
                              <Input
                                type="number"
                                value={orderForm.toAmount}
                                onChange={(e) => setOrderForm({...orderForm, toAmount: e.target.value})}
                                placeholder="0.0"
                                className="text-xl font-bold border-0 bg-transparent p-0 focus:ring-0"
                              />
                              <div className="flex items-center space-x-2 bg-white rounded-lg px-3 py-2 border">
                                <span>{getChainIcon(orderForm.toChain)}</span>
                                <select 
                                  value={orderForm.toToken}
                                  onChange={(e) => setOrderForm({...orderForm, toToken: e.target.value})}
                                  className="font-semibold text-gray-900 bg-transparent border-0 focus:ring-0"
                                >
                                  <option value="ARB">ARB</option>
                                  <option value="ETH">ETH</option>
                                  <option value="MATIC">MATIC</option>
                                </select>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Order Settings */}
                        <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Order Duration</span>
                            <select 
                              value={orderForm.timelockDuration}
                              onChange={(e) => setOrderForm({...orderForm, timelockDuration: e.target.value})}
                              className="font-medium text-purple-600 bg-transparent border-0 focus:ring-0"
                            >
                              <option value="7200">2 Hours</option>
                              <option value="14400">4 Hours</option>
                              <option value="86400">24 Hours</option>
                              <option value="604800">7 Days</option>
                            </select>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Partial Fills</span>
                            <span className="font-medium text-green-600">Enabled</span>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex space-x-4">
                          <Button 
                            onClick={handleCreateOrder}
                            className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-4 rounded-xl font-semibold text-lg"
                          >
                            <TrendingUp className="h-5 w-5 mr-2" />
                            Create Limit Order
                          </Button>
                          <Button 
                            onClick={() => setShowOrderForm(false)}
                            variant="outline"
                            className="px-8 py-4 rounded-xl font-semibold"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Order History */}
              <div className="lg:col-span-1">
                <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm h-fit">
                  <CardContent className="p-6">
                    <div className="flex items-center mb-6">
                      <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-2 rounded-lg mr-3">
                        <TrendingUp className="h-5 w-5 text-white" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">Active Orders</h3>
                    </div>

                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {orderStatuses.length > 0 ? (
                        orderStatuses.map((order) => (
                          <div key={order.id} className="bg-gradient-to-r from-green-50 to-emerald-100 rounded-lg p-4 border border-green-200">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center space-x-2">
                                {getOrderStatusIcon(order.status)}
                                <span className="text-sm font-medium text-gray-900">
                                  {getOrderStatusText(order.status)}
                                </span>
                              </div>
                              <span className="text-xs text-gray-500">
                                {new Date(order.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">From:</span>
                                <span className="font-medium">{order.fromAmount} {order.fromToken}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">To:</span>
                                <span className="font-medium">{order.toAmount} {order.toToken}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Filled:</span>
                                <span className="font-medium">{order.filledAmount} / {order.fromAmount} ({order.fillPercentage}%)</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-300" 
                                  style={{ width: `${order.fillPercentage}%` }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8">
                          <div className="bg-gray-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                            <TrendingUp className="h-6 w-6 text-gray-400" />
                          </div>
                          <p className="text-gray-500 text-sm">No active orders</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 