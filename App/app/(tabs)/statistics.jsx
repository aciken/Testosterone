import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Dimensions, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LineChart } from 'react-native-chart-kit';
import TestosteroneGauge from '../../components/TestosteroneGauge';
import programData from '../../data/programData';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const screenWidth = Dimensions.get('window').width;
const BASELINE_TESTOSTERONE = 450;

const KeyFactorItem = ({ icon, name, totalImpact, color, maxValue, onPress }) => (
    <TouchableOpacity style={styles.keyFactorItem} onPress={onPress}>
        <Ionicons name={icon} size={22} color={color} style={styles.keyFactorIcon} />
        <View style={styles.keyFactorDetails}>
            <Text style={styles.keyFactorName}>{name}</Text>
            <View style={styles.keyFactorBarBackground}>
                <View style={[styles.keyFactorBar, { width: `${(Math.abs(totalImpact) / maxValue) * 100}%`, backgroundColor: color }]} />
            </View>
        </View>
        <Text style={[styles.keyFactorValue, { color }]}>
            {totalImpact > 0 ? '+' : ''}{Math.round(totalImpact)}
        </Text>
    </TouchableOpacity>
);

const taskIcons = {
    '1': 'sunny-outline', '2': 'barbell-outline', '3': 'restaurant-outline',
    '4': 'moon-outline', '5': 'medkit-outline', 'd1': 'ice-cream-outline',
    'd2': 'pulse-outline', 'd3': 'beer-outline'
};

export default function StatisticsScreen() {
    const router = useRouter();
    const [stats, setStats] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [currentTScore, setCurrentTScore] = useState(BASELINE_TESTOSTERONE);

    useEffect(() => {
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
                
                const dailyContributions = Array(programDuration).fill(0);
                dailyContributions[0] = BASELINE_TESTOSTERONE;

                user.tasks.forEach(savedTask => {
                    const taskInfo = taskMap[savedTask.taskId];
                    if (!taskInfo) return;

                    const taskDate = new Date(savedTask.date);
                    taskDate.setHours(0,0,0,0);
                    const dayIndex = Math.round((taskDate - dateCreated) / (1000 * 60 * 60 * 24));
                    
                    // New calculation: use actual value achieved (progress × goal) for impact
                    let contribution;
                    if (taskInfo.type === 'slider' && !taskInfo.inverted) {
                        // For regular slider tasks: progress × goal gives actual value achieved
                        const actualValue = (savedTask.progress / 100) * taskInfo.goal;
                        // Scale impact based on how much of the goal was achieved
                        const impactMultiplier = Math.min(actualValue / taskInfo.goal, 2); // Cap at 2x for overachievement
                        contribution = impactMultiplier * taskInfo.impact;
                    } else if (taskInfo.type === 'slider' && taskInfo.inverted) {
                        // For inverted tasks (don'ts): higher progress = worse impact
                        const progressPercent = savedTask.progress / 100;
                        contribution = -1 * progressPercent * taskInfo.impact;
                    } else if (taskInfo.type === 'meals') {
                        // For meals: negative progress means bad meal (negative impact)
                        if (savedTask.progress < 0) {
                            contribution = savedTask.progress * taskInfo.impact / 100;
                        } else {
                            contribution = (savedTask.progress / 100) * taskInfo.impact;
                        }
                    } else {
                        // For simple/checklist: use original calculation
                        const progressPercent = savedTask.progress / 100;
                        contribution = taskInfo.inverted 
                            ? -1 * progressPercent * taskInfo.impact
                            : progressPercent * taskInfo.impact;
                    }
                    
                    if (dayIndex > 0 && dayIndex < programDuration) {
                        dailyContributions[dayIndex] += contribution;
                    }
                });
                
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
                    chartLabels[1] = 'Day 0';
                    if (programDuration > 1) {
                        chartLabels[programDuration] = `Day ${programDuration - 1}`;
                    }
                }

                const allImpacts = {};
                user.tasks.forEach(savedTask => {
                    const taskInfo = taskMap[savedTask.taskId];
                    if (!taskInfo) return;
                    
                    let contribution;
                    if (taskInfo.type === 'slider' && !taskInfo.inverted) {
                        const actualValue = (savedTask.progress / 100) * taskInfo.goal;
                        const impactMultiplier = Math.min(actualValue / taskInfo.goal, 2);
                        contribution = impactMultiplier * taskInfo.impact;
                    } else if (taskInfo.type === 'slider' && taskInfo.inverted) {
                        const progressPercent = savedTask.progress / 100;
                        contribution = -1 * progressPercent * taskInfo.impact;
                    } else if (taskInfo.type === 'meals') {
                        // For meals: negative progress means bad meal (negative impact)
                        if (savedTask.progress < 0) {
                            contribution = savedTask.progress * taskInfo.impact / 100;
                        } else {
                            contribution = (savedTask.progress / 100) * taskInfo.impact;
                        }
                    } else {
                        const progressPercent = savedTask.progress / 100;
                        contribution = taskInfo.inverted 
                            ? -1 * progressPercent * taskInfo.impact
                            : progressPercent * taskInfo.impact;
                    }
                    
                    if (!allImpacts[savedTask.taskId]) {
                        allImpacts[savedTask.taskId] = { id: savedTask.taskId, name: taskInfo.task, totalImpact: 0 };
                    }
                    allImpacts[savedTask.taskId].totalImpact += contribution;
                });

                const impactsArray = Object.values(allImpacts);
                const topBoosts = impactsArray.filter(t => t.totalImpact > 0).sort((a,b) => b.totalImpact - a.totalImpact).slice(0, 3);
                const topDrains = impactsArray.filter(t => t.totalImpact < 0).sort((a,b) => a.totalImpact - b.totalImpact).slice(0, 3);
                const maxImpact = Math.max(...topBoosts.map(t => t.totalImpact), ...topDrains.map(t => Math.abs(t.totalImpact)), 1);
                
                const finalTodayScore = Math.round(chartData[chartData.length - 1]);
                setCurrentTScore(finalTodayScore);
                setStats({ chartData: finalChartData, chartLabels, topBoosts, topDrains, maxImpact });

            } catch (error) {
                console.error("Failed to calculate stats:", error);
            } finally {
                setIsLoading(false);
            }
        };
        calculateStats();
    }, []);

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
                                <Text style={styles.sectionTitle}>KEY FACTORS</Text>
                                {stats.topBoosts.map(c => <KeyFactorItem key={c.id} icon={taskIcons[c.id]} name={c.name} totalImpact={c.totalImpact} color="#FFFFFF" maxValue={stats.maxImpact} onPress={() => router.push({ pathname: '/modal/factorHistory', params: { factorId: c.id } })} />)}
                                {stats.topDrains.map(c => <KeyFactorItem key={c.id} icon={taskIcons[c.id]} name={c.name} totalImpact={c.totalImpact} color="#FF6B6B" maxValue={stats.maxImpact} onPress={() => router.push({ pathname: '/modal/factorHistory', params: { factorId: c.id } })} />)}
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
    keyFactorItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 12,
        padding: 15,
        marginBottom: 15,
    },
    keyFactorIcon: { marginRight: 15, width: 25, },
    keyFactorDetails: { flex: 1, },
    keyFactorName: { color: '#E0E0E0', fontSize: 16, fontWeight: '600', marginBottom: 6, },
    keyFactorBarBackground: { height: 6, width: '100%', backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: 3, },
    keyFactorBar: { height: '100%', borderRadius: 3, },
    keyFactorValue: { fontSize: 15, fontWeight: 'bold', marginLeft: 15, width: 50, textAlign: 'right' },
    noDataContainer: { marginTop: 60, alignItems: 'center', opacity: 0.5 },
    noDataText: { color: '#8A95B6', marginTop: 20, fontSize: 16, textAlign: 'center' },
});
