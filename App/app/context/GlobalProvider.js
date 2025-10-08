import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import axios from 'axios';
import { Platform } from 'react-native';
import Purchases from 'react-native-purchases';

const API_KEY = Platform.select({
    ios: "appl_rIVvwDddRxPEkmjanYMteRJrXzT",
    android: "YOUR_ANDROID_API_KEY"
});

const GlobalContext = createContext();
export const useGlobalContext = () => useContext(GlobalContext);

export const GlobalProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [error, setError] = useState(null);
    const [selectedAdventure, setSelectedAdventure] = useState(null);
    const [isPro, setIsPro] = useState(false);
    const [streak, setStreak] = useState(0);
    const [newlyUnlockedAchievement, setNewlyUnlockedAchievement] = useState(null);

    useEffect(() => {
        const init = async () => {
            if (API_KEY) {
                Purchases.setLogLevel(Purchases.LOG_LEVEL.DEBUG);
                Purchases.configure({ apiKey: API_KEY });
            }
        };
        init();
    }, []);

    useEffect(() => {
        const checkAuthAndLoginRevenueCat = async () => {
            setIsLoading(true);
            const storedUser = await AsyncStorage.getItem('user');
            if (storedUser) {
                const parsedUser = JSON.parse(storedUser);
                setIsAuthenticated(true);
                setUser(parsedUser);
                
                if (API_KEY) {
                    try {
                        const loginResult = await Purchases.logIn(parsedUser._id);
                        console.log("RevenueCat login success:", loginResult);
                    } catch (e) {
                        console.error("RevenueCat login error:", e);
                    }
                }
            } else {
                setIsAuthenticated(false);
                setUser(null);
            }
            setIsLoading(false);
        };
        checkAuthAndLoginRevenueCat();
    }, []);

    const login = async (email, password) => {
        try {
            const response = await axios.post('https://0ba0-109-245-204-138.ngrok-free.app/signin', { email, password });
            if(response.status === 200) {
                await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
                setIsAuthenticated(true);   
                setUser(response.data.user);

                if (API_KEY) {
                    try {
                        await Purchases.logIn(response.data.user._id);
                    } catch (e) {
                        console.error("RevenueCat login error on signin:", e);
                    }
                }
            } else {
                setError(response.data.message);
            }
        } catch (error) {
            setError(error.response.data.message);
        }
    }; 
    
    const signup = async (name,email, password) => {


    };

    const logout = async () => {
        if (API_KEY) {
            try {
                await Purchases.logOut();
            } catch (e) {
                console.error("RevenueCat logout error:", e);
            }
        }
        await AsyncStorage.removeItem('user');
        setIsAuthenticated(false);
        setUser(null);
        setStreak(0);
    };  
    
    return (
        <GlobalContext.Provider value={{ user, isAuthenticated, error, setError, setIsAuthenticated, setUser, login, logout, signup, selectedAdventure, setSelectedAdventure, streak, setStreak, newlyUnlockedAchievement, setNewlyUnlockedAchievement }}>
            {children}
        </GlobalContext.Provider>
    );
};
    
    
    
    
    
