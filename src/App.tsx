
import React, { useEffect } from 'react';
import { AppRoutes } from '@/routes/AppRoutes';
import { initializeCentralizedSync } from './services/sync/centralizedSyncService';

function App() {
  const initializeApp = async () => {
    try {
      initializeCentralizedSync();
      console.log('✅ App initialization completed successfully');
    } catch (error) {
      console.error('❌ App initialization failed:', error);
    }
  };

  useEffect(() => {
    initializeApp();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <AppRoutes />
    </div>
  );
}

export default App;
