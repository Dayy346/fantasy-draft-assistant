import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useState } from 'react'
import Landing from './pages/Landing'
import Players from './pages/Players'
import Draft from './pages/Draft'
import MockDraft from './pages/MockDraft'
import Header from './components/Header'

function App() {
  const [draftSession, setDraftSession] = useState<string | null>(null)

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Landing onStartDraft={setDraftSession} />} />
            <Route path="/players" element={<Players />} />
            <Route path="/draft" element={<Draft sessionId={draftSession} />} />
            <Route path="/mock-draft" element={<MockDraft />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App
