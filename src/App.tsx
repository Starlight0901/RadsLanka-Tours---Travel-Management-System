import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '@/contexts/AuthProvider.tsx'
import { AppRoutes } from '@/routes/AppRoutes.tsx'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  )
}
