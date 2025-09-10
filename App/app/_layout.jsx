import { Slot, SplashScreen } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { GlobalProvider } from './context/GlobalProvider';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';

export default function RootLayout() {
    const colorScheme = useColorScheme();

    return (
        <SafeAreaProvider>
            <GestureHandlerRootView style={{ flex: 1 }}>
                <GlobalProvider>
                    <Slot />
                </GlobalProvider>
            </GestureHandlerRootView>
        </SafeAreaProvider>
    )
}
