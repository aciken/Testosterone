import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { GlobalProvider } from './context/GlobalProvider';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';

export default function RootLayout() {
    const colorScheme = useColorScheme();

    return (
        <SafeAreaProvider style={{ flex: 1 }}>
            <GestureHandlerRootView style={{ flex: 1 }}>
                <GlobalProvider>
                    <Stack
                        screenOptions={{
                            headerStyle: {
                                backgroundColor: colorScheme === 'dark' ? '#000' : '#fff',
                            },
                            headerTintColor: colorScheme === 'dark' ? '#fff' : '#000',
                            headerTitleStyle: {
                                fontWeight: 'bold',
                            },
                        }}
                    >
                        <Stack.Screen
                            name="index"
                            options={{
                                headerShown: false,
                            }}
                        />
                        <Stack.Screen
                            name="(tabs)"
                            options={{
                                headerShown: false,
                            }}
                        />
                        <Stack.Screen
                            name="modal"
                            options={{
                                headerShown: false,
                                presentation: 'modal',
                                animation: 'slide_from_bottom',
                                animationDuration: 800,
                            }}
                        />
                    </Stack>
                </GlobalProvider>
            </GestureHandlerRootView>
        </SafeAreaProvider>
    )
}
