import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { GlobalProvider } from './context/GlobalProvider';

export default function RootLayout() {
    return (
        <SafeAreaProvider>
            <GestureHandlerRootView style={{ flex: 1, backgroundColor: '#000000' }}>
                <GlobalProvider>
                    <Stack
                        screenOptions={{
                            contentStyle: { backgroundColor: '#000000' }
                        }}
                    >
                        <Stack.Screen name="index" options={{ headerShown: false }} />
                        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                        <Stack.Screen name="allBadges" options={{ headerShown: false }} />
                        <Stack.Screen name="badgeDetails" options={{ headerShown: false, presentation: 'modal' }} />
                        <Stack.Screen name="rankTimeline" options={{ headerShown: false }} />
                        <Stack.Screen name="modal" options={{ headerShown: false, presentation: 'modal' }} />
                        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
                        <Stack.Screen
                                name="utils/Paywall"
                                options={{
                                    headerShown: false,
                                }}
                            />
                    </Stack>
                </GlobalProvider>
            </GestureHandlerRootView>
        </SafeAreaProvider>
    )
}
