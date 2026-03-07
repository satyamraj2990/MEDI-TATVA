import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Pill, Search, MessageCircle, BarChart3, Hospital } from "lucide-react";

const SimpleLanding = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700/50 bg-slate-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-cyan-500 flex items-center justify-center">
              <Pill className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-white">MediTatva</span>
          </div>
          <Link to="/login">
            <Button variant="outline" className="text-white border-slate-600 hover:bg-slate-800">
              Login
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-20">
        <div className="text-center max-w-4xl mx-auto mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Find Your <span className="text-cyan-400">Medicines</span> Instantly
          </h1>
          <p className="text-xl text-slate-300 mb-8">
            AI-powered medicine search with 250,000+ medicines. Compare prices, find substitutes, and connect with nearby pharmacies.
          </p>
          <div className="flex gap-4 justify-center">
            <Link to="/cinematic">
              <Button size="lg" className="bg-cyan-500 hover:bg-cyan-600 text-white">
                Get Started
              </Button>
            </Link>
            <Link to="/pharmacy/dashboard">
              <Button size="lg" variant="outline" className="text-white border-slate-600 hover:bg-slate-800">
                Pharmacy Portal
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          <Card className="p-6 bg-slate-800/50 border-slate-700 hover:bg-slate-800 transition-colors">
            <div className="w-12 h-12 rounded-full bg-cyan-500/10 flex items-center justify-center mb-4">
              <Search className="w-6 h-6 text-cyan-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              Medicine Search
            </h3>
            <p className="text-slate-400 text-sm">
              Search from 250K+ medicines instantly with AI-powered suggestions
            </p>
          </Card>

          <Card className="p-6 bg-slate-800/50 border-slate-700 hover:bg-slate-800 transition-colors">
            <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center mb-4">
              <Pill className="w-6 h-6 text-green-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              Find Substitutes
            </h3>
            <p className="text-slate-400 text-sm">
              Discover cheaper alternatives with same composition and save money
            </p>
          </Card>

          <Card className="p-6 bg-slate-800/50 border-slate-700 hover:bg-slate-800 transition-colors">
            <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center mb-4">
              <MessageCircle className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              AI Assistant
            </h3>
            <p className="text-slate-400 text-sm">
              Get instant health advice and medicine recommendations via voice or chat
            </p>
          </Card>

          <Card className="p-6 bg-slate-800/50 border-slate-700 hover:bg-slate-800 transition-colors">
            <div className="w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center mb-4">
              <Hospital className="w-6 h-6 text-orange-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              Pharmacy Portal
            </h3>
            <p className="text-slate-400 text-sm">
              Manage inventory, billing, and orders with integrated pharmacy dashboard
            </p>
          </Card>
        </div>

        {/* Stats */}
        <div className="mt-20 grid grid-cols-3 gap-8 max-w-3xl mx-auto">
          <div className="text-center">
            <div className="text-4xl font-bold text-cyan-400 mb-2">250K+</div>
            <div className="text-slate-400">Medicines</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-green-400 mb-2">24/7</div>
            <div className="text-slate-400">Available</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-purple-400 mb-2">AI</div>
            <div className="text-slate-400">Powered</div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SimpleLanding;
