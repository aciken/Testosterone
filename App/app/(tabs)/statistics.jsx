import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Dimensions, TouchableOpacity, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LineChart } from 'react-native-chart-kit';
import TestosteroneGauge from '../../components/TestosteroneGauge';
import programData from '../../data/programData';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { taskIcons, taskIconsGrayscale } from '../../data/icons';
import * as Haptics from 'expo-haptics';

const screenWidth = Dimensions.get('window').width;
const BASELINE_TESTOSTERONE = 280;

// Mock data for badges
const badges = [
    { id: '1', name: 'First Victory', image: require('../../assets/reward.png'), unlocked: true },
    { id: '2', name: 'Week Streak', image: null, unlocked: false },
    { id: '3', name: 'Perfect Month', image: null, unlocked: false },
    { id: '4', name: 'Comeback King', image: null, unlocked: false },
    { id: '5', name: 'T-Level 500', image: null, unlocked: false },
    { id: '6', name: 'Alpha Badge', image: null, unlocked: false },
];

const KeyFactorItem = ({ icon, name, totalImpact, color, maxValue, onPress, streak }) => {
    const hasStreak = streak > 0;

    // The glow effect will radiate from the right, getting stronger with the streak
    const glowOpacity = hasStreak ? Math.min(0.05 + streak * 0.03, 0.5) : 0;
    const nonStreakBg = 'rgba(255, 255, 255, 0.05)';
    const streakGlowColor = `rgba(255, 149, 0, ${glowOpacity})`;
    
    const gradientColors = hasStreak
        ? [streakGlowColor, nonStreakBg]
        : [nonStreakBg, nonStreakBg];
    
    // The border and shadow will also reflect the streak's intensity
    const borderOpacity = hasStreak ? Math.min(0.2 + streak * 0.04, 0.8) : 0.1;
    const borderColor = hasStreak ? `rgba(255, 149, 0, ${borderOpacity})` : 'rgba(255, 255, 255, 0.1)';
    
    const shadowColor = hasStreak ? `rgba(255, 149, 0, 1)` : '#000';
    const shadowOpacity = hasStreak ? Math.min(0.05 + streak * 0.02, 0.2) : 0.3;

    const currentIcon = hasStreak ? (taskIcons[icon] || icon) : (taskIconsGrayscale[icon] || icon);

    return (
        <TouchableOpacity onPress={onPress} style={[styles.keyFactorTouchable, { shadowColor, shadowOpacity }]}>
            <LinearGradient
                colors={gradientColors}
                start={{ x: 1, y: 0.5 }}
                end={{ x: 0, y: 0.5 }}
                style={[styles.keyFactorItem, { borderColor }]}
            >
                <View style={styles.keyFactorIconContainer}>
                    {typeof currentIcon === 'string' ? (
                        <Ionicons name={currentIcon} size={24} color={color} />
                    ) : (
                        <Image source={currentIcon} style={styles.keyFactorImage} />
                    )}
                </View>
                <View style={styles.keyFactorDetails}>
                    <Text style={styles.keyFactorName}>{name}</Text>
                </View>
                <View style={styles.keyFactorValueContainer}>
                    <Image source={streak > 0 ? require('../../assets/StreakImage3.png') : require('../../assets/StreakImage4.png')} style={[styles.streakImage, { opacity: streak > 0 ? 1 : 0.7 }]} />
                    <Text style={[styles.keyFactorValue, { color: streak > 0 ? '#FFFFFF' : '#888' }]}>
                        {streak}
                    </Text>
                </View>
            </LinearGradient>
        </TouchableOpacity>
    );
};

export default function StatisticsScreen() {
    const router = useRouter();
    const [stats, setStats] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [currentTScore, setCurrentTScore] = useState(BASELINE_TESTOSTERONE);
    const [viewMode, setViewMode] = useState('score');

    useFocusEffect(
        useCallback(() => {
            const calculateStats = async () => {
                try {
                    const userString = await AsyncStorage.getItem('user');
                    if (!userString) { setIsLoading(false); return; }

                    const user = JSON.parse(userString);
                    if (!user.tasks || user.tasks.length === 0) { setIsLoading(false); return; }
                    
                    const allTasks = [...programData[1].dos, ...programData[1].donts];
                    const taskMap = allTasks.reduce((map, task) => {
                        map[task.id] = { ...task };
                        return map;
                    }, {});

                    const dateCreated = new Date(user.dateCreated);
                    const today = new Date();
                    dateCreated.setHours(0,0,0,0);
                    today.setHours(0,0,0,0);
                    const programDuration = Math.ceil((today - dateCreated) / (1000 * 60 * 60 * 24)) + 1;
                    
                    const totalPossiblePositiveImpact = programData[1].dos.reduce((sum, task) => sum + (task.impact || 0), 0);
                    const totalPossibleNegativeImpact = 
                        programData[1].donts.reduce((sum, task) => sum + (task.impact || 0), 0) +
                        programData[1].dos.filter(t => t.type === 'meals').reduce((sum, task) => sum + (task.impact || 0), 0);

                    const dailyPositiveContributions = Array(programDuration).fill(0);
                    const dailyNegativeContributions = Array(programDuration).fill(0);

                    user.tasks.forEach(savedTask => {
                        const taskInfo = taskMap[savedTask.taskId];
                        if (!taskInfo) return;

                        const taskDate = new Date(savedTask.date);
                        taskDate.setHours(0,0,0,0);
                        const dayIndex = Math.round((taskDate - dateCreated) / (1000 * 60 * 60 * 24));
                        
                        let contribution;
                        if (taskInfo.type === 'slider' && !taskInfo.inverted) {
                            const actualValue = ((savedTask.progress || 0) / 100) * taskInfo.goal;
                            const impactMultiplier = taskInfo.goal > 0 ? Math.min(actualValue / taskInfo.goal, 2) : 0;
                            contribution = impactMultiplier * taskInfo.impact;
                        } else if (taskInfo.type === 'slider' && taskInfo.inverted) {
                            const progressPercent = (savedTask.progress || 0) / 100;
                            contribution = -1 * progressPercent * taskInfo.impact;
                        } else if (taskInfo.type === 'meals') {
                            if ((savedTask.progress || 0) < 0) {
                                contribution = (savedTask.progress || 0) * taskInfo.impact / 100;
                            } else {
                                contribution = ((savedTask.progress || 0) / 100) * taskInfo.impact;
                            }
                        } else {
                            const progressPercent = (savedTask.progress || 0) / 100;
                            contribution = taskInfo.inverted 
                                ? -1 * progressPercent * taskInfo.impact
                                : progressPercent * taskInfo.impact;
                        }
                        
                        if (dayIndex > 0 && dayIndex < programDuration) {
                            if (contribution > 0) {
                                dailyPositiveContributions[dayIndex] += contribution;
                            } else {
                                dailyNegativeContributions[dayIndex] += contribution;
                            }
                        }
                    });

                    const dailyContributions = Array(programDuration).fill(0);
                    dailyContributions[0] = BASELINE_TESTOSTERONE;
                    
                    for (let i = 1; i < programDuration; i++) {
                        const scaledPositive = totalPossiblePositiveImpact > 0
                            ? (dailyPositiveContributions[i] / totalPossiblePositiveImpact) * 6
                            : 0;
                        
                        const scaledNegative = totalPossibleNegativeImpact > 0
                            ? (dailyNegativeContributions[i] / totalPossibleNegativeImpact) * 3
                            : 0;
                        
                        const netChange = scaledPositive + scaledNegative;
                        dailyContributions[i] = netChange;
                    }
                    
                    for (let i = 1; i < programDuration; i++) {
                        dailyContributions[i] += dailyContributions[i-1];
                    }

                    const rawChartData = dailyContributions.map(c => Math.max(200, Math.min(1100, c)));

                    // Apply a simple moving average to smooth the data
                    const smoothingWindow = Math.min(5, Math.floor(programDuration / 2));
                    const chartData = rawChartData.map((_, i, arr) => {
                        if (i < smoothingWindow) return arr[i];
                        const slice = arr.slice(i - smoothingWindow, i + 1);
                        return slice.reduce((a, b) => a + b, 0) / slice.length;
                    });
                    
                    const finalChartData = [chartData[0], ...chartData];

                    const chartLabels = Array(programDuration + 1).fill('');
                    if (programDuration > 0) {
                        chartLabels[1] = 'Start';
                        if (programDuration > 1) {
                            chartLabels[programDuration] = `Now`;
                        }
                    }

                    const allImpacts = {};
                    programData[1].dos.forEach(task => {
                        allImpacts[task.id] = { id: task.id, name: task.task, totalImpact: 0, isDo: true };
                    });
                    programData[1].donts.forEach(task => {
                        allImpacts[task.id] = { id: task.id, name: task.task, totalImpact: 0, isDo: false };
                    });

                    user.tasks.forEach(savedTask => {
                        const taskInfo = taskMap[savedTask.taskId];
                        if (!taskInfo) return;
                        
                        let contribution;
                        if (taskInfo.type === 'slider' && !taskInfo.inverted) {
                            const actualValue = ((savedTask.progress || 0) / 100) * taskInfo.goal;
                            const impactMultiplier = taskInfo.goal > 0 ? Math.min(actualValue / taskInfo.goal, 2) : 0;
                            contribution = impactMultiplier * taskInfo.impact;
                        } else if (taskInfo.type === 'slider' && taskInfo.inverted) {
                            const progressPercent = (savedTask.progress || 0) / 100;
                            contribution = -1 * progressPercent * taskInfo.impact;
                        } else if (taskInfo.type === 'meals') {
                            if ((savedTask.progress || 0) < 0) {
                                contribution = (savedTask.progress || 0) * taskInfo.impact / 100;
                            } else {
                                contribution = ((savedTask.progress || 0) / 100) * taskInfo.impact;
                            }
                        } else {
                            const progressPercent = (savedTask.progress || 0) / 100;
                            contribution = taskInfo.inverted 
                                ? -1 * progressPercent * taskInfo.impact
                                : progressPercent * taskInfo.impact;
                        }
                        
                        if (allImpacts[savedTask.taskId]) {
                            allImpacts[savedTask.taskId].totalImpact += contribution;
                        }
                    });

                    const tasksById = user.tasks.reduce((acc, task) => {
                        if (!acc[task.taskId]) acc[task.taskId] = [];
                        acc[task.taskId].push(task);
                        return acc;
                    }, {});

                    for (const taskId in allImpacts) {
                        const taskLogs = tasksById[taskId];
                        if (!taskLogs) {
                            allImpacts[taskId].streak = 0;
                            continue;
                        }
                        const taskInfo = taskMap[taskId];
                    
                        const successTimestamps = new Set();
                        taskLogs.forEach(log => {
                            const isSuccess = taskInfo.inverted ? log.progress < 50 : log.progress >= 50;
                            if (isSuccess) {
                                const date = new Date(log.date);
                                date.setHours(0, 0, 0, 0);
                                successTimestamps.add(date.getTime());
                            }
                        });
                        
                        let streak = 0;
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        const yesterday = new Date(today);
                        yesterday.setDate(today.getDate() - 1);
                        let currentDate = new Date(today);
                    
                        if (!successTimestamps.has(today.getTime()) && !successTimestamps.has(yesterday.getTime())) {
                            streak = 0;
                        } else {
                            if (!successTimestamps.has(today.getTime())) {
                                currentDate.setDate(currentDate.getDate() - 1);
                            }
                            while (successTimestamps.has(currentDate.getTime())) {
                                streak++;
                                currentDate.setDate(currentDate.getDate() - 1);
                            }
                        }
                        allImpacts[taskId].streak = streak;
                    }

                    const impactsArray = Object.values(allImpacts);
                    
                    // Separate factors into streaking and non-streaking to ensure streaking are always on top
                    const streakingFactors = impactsArray.filter(t => t.streak > 0).sort((a, b) => b.streak - a.streak);
                    const nonStreakingFactors = impactsArray.filter(t => t.streak === 0);

                    // Sort non-streaking factors: boosts first, then drains, each sorted by impact
                    const nonStreakingBoosts = nonStreakingFactors.filter(t => t.isDo).sort((a, b) => b.totalImpact - a.totalImpact);
                    const nonStreakingDrains = nonStreakingFactors.filter(t => !t.isDo).sort((a, b) => a.totalImpact - b.totalImpact);
                    const sortedNonStreakingFactors = [...nonStreakingBoosts, ...nonStreakingDrains];

                    const maxImpact = Math.max(...impactsArray.map(t => Math.abs(t.totalImpact)), 1);
                    
                    const finalTodayScore = Math.round(chartData[chartData.length - 1]);
                    setCurrentTScore(finalTodayScore);
                    setStats({ chartData: finalChartData, chartLabels, streakingFactors, nonStreakingFactors: sortedNonStreakingFactors, maxImpact });

                } catch (error) {
                    console.error("Failed to calculate stats:", error);
                } finally {
                    setIsLoading(false);
                }
            };
            calculateStats();
        }, [])
    );

    return (
        <LinearGradient colors={['#101010', '#000000']} style={styles.container}>
            <SafeAreaView style={styles.safeArea} edges={['top']}>
                <ScrollView contentContainerStyle={styles.contentContainer}>
                    <View style={styles.header}>
                        <View style={styles.toggleContainer}>
                            <TouchableOpacity 
                                style={[styles.toggleButton, viewMode === 'score' && styles.toggleButtonActive]} 
                                onPress={() => {
                                    setViewMode('score');
                                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                                }}
                            >
                                <Text style={[styles.toggleButtonText, viewMode === 'score' && styles.toggleButtonTextActive]}>Score</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={[styles.toggleButton, viewMode === 'rank' && styles.toggleButtonActive]} 
                                onPress={() => {
                                    setViewMode('rank');
                                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                                }}
                            >
                                <Text style={[styles.toggleButtonText, viewMode === 'rank' && styles.toggleButtonTextActive]}>Rank</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={[styles.toggleButton, viewMode === 'graph' && styles.toggleButtonActive]} 
                                onPress={() => {
                                    setViewMode('graph');
                                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                                }}
                            >
                                <Text style={[styles.toggleButtonText, viewMode === 'graph' && styles.toggleButtonTextActive]}>Graph</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                    {isLoading ? <ActivityIndicator size="large" color="#FFFFFF" style={{ marginTop: 50 }} />
                    : stats ? (
                        <>
                            <View style={styles.mainDisplayContainer}>
                                {viewMode === 'score' && <TestosteroneGauge value={currentTScore} />}

                                {viewMode === 'rank' && (
                                    <View style={styles.rankContainer}>
                                        <View style={styles.rankImageContainer}>
                                            <Image source={require('../../assets/BronzeRank.png')} style={styles.rankImage} />
                                        </View>
                                        <Text style={styles.rankText}>Bronze Tier</Text>
                                    </View>
                                )}
                                
                                {viewMode === 'graph' && (
                                    <View style={styles.chartContainer}>
                                        <Text style={styles.sectionTitle}>PERFORMANCE TIMELINE</Text>
                                        <LineChart
                                            data={{ labels: stats.chartLabels, datasets: [{ data: stats.chartData, strokeWidth: 2.5 }] }}
                                            width={screenWidth}
                                            height={240}
                                            chartConfig={chartConfig}
                                            withShadow={true}
                                            withInnerLines={true}
                                            withOuterLines={false}
                                            withVerticalLabels={true}
                                            withHorizontalLabels={true}
                                            bezier
                                            style={styles.chart}
                                            renderDotContent={({x, y, index, indexData}) => {
                                                if (index === 1 || index === stats.chartData.length - 1) {
                                                    const isStart = index === 1;
                                                    const labelY = y;
                                                    const labelX = isStart ? x + 5 : x - 45;
                                                    const labelOffset = y > 100 ? -35 : 15;
                                        
                                                    return (
                                                        <View key={index} style={[styles.chartLabelContainer, { top: labelY + labelOffset, left: labelX }]}>
                                                            <Text style={styles.chartLabelText}>{Math.round(indexData)}</Text>
                                                        </View>
                                                    );
                                                }
                                                return null;
                                            }}
                                        />
                                    </View>
                                )}
                            </View>

                            <View style={styles.badgesContainer}>
                                <Text style={styles.sectionTitle}>BADGES COLLECTED</Text>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.badgesScrollView}>
                                    {badges.map(badge => (
                                        <View key={badge.id} style={styles.badgeItem}>
                                            <View style={[styles.badgeImageContainer, !badge.unlocked && styles.badgeLocked]}>
                                                {badge.unlocked ? (
                                                    <Image source={badge.image} style={styles.badgeImage} />
                                                ) : (
                                                    <Ionicons name="lock-closed" size={30} color="rgba(255, 255, 255, 0.5)" />
                                                )}
                                            </View>
                                            <Text style={styles.badgeName}>{badge.name}</Text>
                                        </View>
                                    ))}
                                </ScrollView>
                            </View>

                            <View style={styles.keyFactorsContainer}>
                                <Text style={styles.sectionTitle}>TASK STREAKS</Text>
                                {stats.streakingFactors.map(c => {
                                    const color = c.isDo ? "#FFFFFF" : "#FF6B6B";
                                    return <KeyFactorItem key={c.id} icon={c.id} name={c.name} totalImpact={c.totalImpact} color={color} maxValue={stats.maxImpact} onPress={() => router.push({ pathname: '/modal/factorHistory', params: { factorId: c.id } })} streak={c.streak} />;
                                })}
                                {stats.nonStreakingFactors.map(c => {
                                    const color = c.isDo ? "#FFFFFF" : "#FF6B6B";
                                    return <KeyFactorItem key={c.id} icon={c.id} name={c.name} totalImpact={c.totalImpact} color={color} maxValue={stats.maxImpact} onPress={() => router.push({ pathname: '/modal/factorHistory', params: { factorId: c.id } })} streak={c.streak} />;
                                })}
                            </View>
                        </>
                    ) : (
                        <View style={styles.noDataContainer}><Ionicons name="stats-chart-outline" size={60} color="#333" /><Text style={styles.noDataText}>Start completing tasks to see your statistics.</Text></View>
                    )}
                </ScrollView>
            </SafeAreaView>
        </LinearGradient>
    );
}

const chartConfig = {
    backgroundGradientFrom: "#101010",
    backgroundGradientFromOpacity: 0,
    backgroundGradientTo: "#000000",
    backgroundGradientToOpacity: 0,
    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    strokeWidth: 3,
    propsForDots: { r: "0" },
    fillShadowGradientFrom: '#FFFFFF',
    fillShadowGradientFromOpacity: 0.1,
    fillShadowGradientTo: '#FFFFFF',
    fillShadowGradientToOpacity: 0,
    decimalPlaces: 0,
    linejoinType: 'round',
    propsForBackgroundLines: {
        stroke: 'rgba(255, 255, 255, 0.1)',
        strokeDasharray: '0',
    },
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    safeArea: { flex: 1 },
    contentContainer: { paddingBottom: 100 },
    header: {
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 10,
        alignItems: 'flex-end',
        width: '100%',
    },
    toggleContainer: {
        flexDirection: 'row',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 20,
        padding: 4,
    },
    toggleButton: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 16,
    },
    toggleButtonActive: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
    },
    toggleButtonText: {
        color: '#FFFFFF',
        fontWeight: '700',
    },
    toggleButtonTextActive: {
        color: '#000000',
    },
    mainDisplayContainer: {
        height: 300,
        justifyContent: 'center',
        alignItems: 'center',
    },
    rankContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    rankImageContainer: {
        shadowColor: '#CD7F32',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.8,
        shadowRadius: 25,
    },
    rankImage: {
        width: 220,
        height: 220,
        resizeMode: 'contain',
    },
    rankText: {
        color: '#E6A66A',
        fontSize: 24,
        fontWeight: 'bold',
        marginTop: 20,
        letterSpacing: 1.5,
        textShadowColor: 'rgba(0, 0, 0, 0.5)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 3,
    },
    headerTitle: {
        color: '#E0E0E0',
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    sectionTitle: { color: '#C5C5C5', fontSize: 12, fontWeight: 'bold', letterSpacing: 2, marginBottom: 20, textAlign: 'center' },
    chartContainer: {
        width: '100%',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        paddingVertical: 20,
    },
    chart: { marginLeft: -15, paddingRight: 20 },
    chartLabelContainer: {
        position: 'absolute',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        paddingVertical: 3,
        paddingHorizontal: 8,
        borderRadius: 6,
    },
    chartLabelText: {
        color: '#000000',
        fontWeight: 'bold',
        fontSize: 12,
    },
    keyFactorsContainer: { width: '100%', marginTop: 40, paddingHorizontal: 20, },
    badgesContainer: {
        marginTop: 40,
        paddingTop: 10,
        paddingBottom: 30,
        borderBottomWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    badgesScrollView: {
        paddingHorizontal: 20,
    },
    badgeItem: {
        alignItems: 'center',
        marginRight: 25,
        width: 90,
    },
    badgeImageContainer: {
        width: 90,
        height: 90,
        borderRadius: 45,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
        borderWidth: 2,
        borderColor: '#C0C0C0',
        shadowColor: '#FFFFFF',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.6,
        shadowRadius: 12,
        elevation: 10,
    },
    badgeLocked: {
        borderColor: 'rgba(255, 255, 255, 0.2)',
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        shadowColor: '#000',
        shadowOpacity: 0,
        shadowRadius: 0,
        elevation: 0,
    },
    badgeImage: {
        width: 80,
        height: 80,
        borderRadius: 40,
    },
    badgeName: {
        color: '#E0E0E0',
        fontSize: 13,
        fontWeight: '600',
        textAlign: 'center',
        marginTop: 5,
    },
    keyFactorTouchable: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
        marginBottom: 15,
    },
    keyFactorItem: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 28,
        padding: 20,
        borderWidth: 1.5,
    },
    keyFactorIconContainer: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    keyFactorIcon: {
        marginRight: 15,
    },
    keyFactorDetails: { flex: 1, },
    keyFactorName: { color: '#E0E0E0', fontSize: 17, fontWeight: '700', },
    keyFactorImage: {
        width: 36,
        height: 36,
    },
    streakImage: {
        width: 26,
        height: 26,
    },
    keyFactorValueContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 15,
        width: 50,
        justifyContent: 'flex-end',
    },
    keyFactorValue: {
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 4,
    },
    noDataContainer: { marginTop: 60, alignItems: 'center', opacity: 0.5 },
    noDataText: { color: '#8A95B6', marginTop: 20, fontSize: 16, textAlign: 'center' },
});
