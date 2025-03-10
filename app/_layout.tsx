import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';
import LoadingScreen from '@/components/LoadingScreen';
import { MQTTProvider } from '../context/MQTTContext';
// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      SplashScreen.hideAsync();
      setIsLoading(false);
    }, 2000);
  }, []);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return ( 
    <MQTTProvider>
      <Stack>
        <Stack.Screen name="(tabs)/main" options={{ headerShown: false }} />
        <Stack.Screen name="connect" options={{ headerShown: false }} />
        
      </Stack>
      <StatusBar style="auto" />
    </MQTTProvider>
  );
}
