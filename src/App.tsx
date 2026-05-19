import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Shell } from './components/layout/Shell';
import Dashboard from './pages/Dashboard';
import Analytics from './pages/Analytics';
import Intelligence from './pages/Intelligence';
import AudienceMap from './pages/AudienceMap';
import NarrativeAnalysis from './pages/NarrativeAnalysis';
import ContentPrep from './pages/ContentPrep';
import ApprovalWorkflow from './pages/ApprovalWorkflow';
import Monitoring from './pages/Monitoring';
import Conversations from './pages/Conversations';
import ReportBuilder from './pages/ReportBuilder';
import LiveOperations from './pages/LiveOperations';
import LiveOperationsTerminal from './pages/LiveOperationsTerminal';
import Settings from './pages/Settings';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Shell />,
    children: [
      { index: true, element: <LiveOperationsTerminal /> },
      { path: 'dashboard', element: <Dashboard /> },
      { path: 'analytics', element: <Analytics /> },
      { path: 'ingestion', element: <Intelligence /> },
      { path: 'audience-map', element: <AudienceMap /> },
      { path: 'narratives', element: <NarrativeAnalysis /> },
      { path: 'content-prep', element: <ContentPrep /> },
      { path: 'approvals', element: <ApprovalWorkflow /> },
      { path: 'execution', element: <Monitoring /> },
      { path: 'conversations', element: <Conversations /> },
      { path: 'reports', element: <ReportBuilder /> },
      { path: 'terminal', element: <LiveOperationsTerminal /> },
      { path: 'live-operations', element: <LiveOperations /> },
      { path: 'settings', element: <Settings /> },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
