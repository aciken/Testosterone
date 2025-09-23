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

const screenWidth = Dimensions.get('window').width;
const BASELINE_TESTOSTERONE = 450;

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
                    <TestosteroneGauge value={currentTScore} />
                    {isLoading ? <ActivityIndicator size="large" color="#FFFFFF" style={{ marginTop: 50 }} />
                    : stats ? (
                        <>
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
    strokeWidth: 2.5,
    propsForDots: { r: "0" },
    fillShadowGradient: '#FFFFFF',
    fillShadowGradientOpacity: 0.1,
    propsForBackgroundLines: {
        stroke: 'rgba(255, 255, 255, 0.1)',
        strokeDasharray: '0',
    },
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    safeArea: { flex: 1 },
    contentContainer: { paddingTop: 30, paddingBottom: 100 },
    header: {
        paddingHorizontal: 20,
        marginBottom: 10,
    },
    headerTitle: {
        color: '#E0E0E0',
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    sectionTitle: { color: '#8A95B6', fontSize: 12, fontWeight: 'bold', letterSpacing: 2, marginBottom: 20, textAlign: 'center' },
    chartContainer: { 
        marginTop: 20,
        borderTopWidth: 1, 
        borderBottomWidth: 1, 
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
