import CreateProposal from 'pages/CreateProposal'
import { Routes, Route } from 'react-router-dom'

import Landing from './Landing'
import VotePage from './VotePage'

export default function Vote() {
  return (
    <Routes>
      <Route path="/vote/:governorIndex/:id" element={<VotePage />} />
      <Route path="/vote/create-proposal" element={<CreateProposal />} />
      <Route path="/vote" element={<Landing />} />
    </Routes>
  )
}
