import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from './contexts/AuthContext';
import { RootNavigator } from './navigation';
import { TestScreen } from './TestScreen';

import './global.css';

// Temporary: Set to true to test without NativeWind styles
const USE_TEST_SCREEN = false;

export default function App() {
  if (USE_TEST_SCREEN) {
    return <TestScreen />;
  }

  return (
    <AuthProvider>
      <RootNavigator />
      <StatusBar style="auto" />
    </AuthProvider>
  );
}
