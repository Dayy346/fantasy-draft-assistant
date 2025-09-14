import { Link } from 'react-router-dom'

interface LandingProps {
  onStartDraft: (sessionId: string) => void
}

export default function Landing({ onStartDraft }: LandingProps) {
  return (
    <div className="max-w-4xl mx-auto text-center">
      <h1 className="text-5xl font-bold text-gray-900 mb-6">
        Fantasy Draft Assistant
      </h1>
      <p className="text-xl text-gray-600 mb-8">
        Make smarter draft decisions with data-driven insights, transparent metrics, and real-time suggestions.
      </p>
      
      <div className="grid md:grid-cols-3 gap-8 mb-12">
        <div className="card text-left">
          <h2 className="text-2xl font-semibold mb-4">📊 Player Analytics</h2>
          <p className="text-gray-600 mb-4">
            Explore comprehensive player statistics with 3-year weighted metrics, 
            position-adjusted z-scores, and transparent composite draft scores.
          </p>
          <Link to="/players" className="btn-primary">
            Browse Players
          </Link>
        </div>
        
        <div className="card text-left">
          <h2 className="text-2xl font-semibold mb-4">🎯 Live Draft Assistant</h2>
          <p className="text-gray-600 mb-4">
            Get real-time draft suggestions based on your roster needs, 
            remaining players, and advanced analytics.
          </p>
          <Link to="/draft" className="btn-primary">
            Start Draft
          </Link>
        </div>

        <div className="card text-left">
          <h2 className="text-2xl font-semibold mb-4">🤖 Mock Draft</h2>
          <p className="text-gray-600 mb-4">
            Practice against AI bots with different strategies. 
            Snake draft with 2-12 teams and customizable settings.
          </p>
          <Link to="/mock-draft" className="btn-primary">
            Start Mock Draft
          </Link>
        </div>
      </div>
      
      <div className="bg-blue-50 rounded-lg p-8">
        <h3 className="text-2xl font-semibold mb-4">How It Works</h3>
        <div className="grid md:grid-cols-3 gap-6 text-left">
          <div>
            <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold mb-3">1</div>
            <h4 className="font-semibold mb-2">Data Analysis</h4>
            <p className="text-sm text-gray-600">
              We analyze 3 years of NFL data to compute weighted metrics, efficiency stats, and position-adjusted scores.
            </p>
          </div>
          <div>
            <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold mb-3">2</div>
            <h4 className="font-semibold mb-2">Transparent Scoring</h4>
            <p className="text-sm text-gray-600">
              Every metric is explained with clear formulas. No black-box algorithms - just transparent, explainable math.
            </p>
          </div>
          <div>
            <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold mb-3">3</div>
            <h4 className="font-semibold mb-2">Live Suggestions</h4>
            <p className="text-sm text-gray-600">
              Get real-time draft recommendations that adapt to your roster needs and remaining player pool.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
