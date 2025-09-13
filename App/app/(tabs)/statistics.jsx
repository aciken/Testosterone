import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Dimensions, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LineChart } from 'react-native-chart-kit';
import TestosteroneGauge from '../../components/TestosteroneGauge';
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
        const generatePlaceholderStats = () => {
            setIsLoading(true);
            const programDuration = 48; // Simulate 48 days of data
            const startT = BASELINE_TESTOSTERONE;
            const endT = 780; // A good target score
            
            let dailyContributions = [];
            for (let i = 0; i < programDuration; i++) {
                const progress = i / (programDuration - 1);
                // Use a cosine easing function for a smooth S-curve
                const easedProgress = (1 - Math.cos(progress * Math.PI)) / 2;
                const value = startT + (endT - startT) * easedProgress;
                // Add minor random noise to make it look more organic
                const noise = (Math.random() - 0.5) * 15;
                const finalValue = Math.round(value + noise);
                dailyContributions.push(Math.max(250, Math.min(1050, finalValue)));
            }

            const chartData = [...dailyContributions, dailyContributions[dailyContributions.length - 1]]; // Add a dummy point at the end
            const finalChartData = [chartData[0], ...chartData];

            const chartLabels = Array(programDuration + 2).fill(''); // Adjusted for dummy point
            chartLabels[1] = 'Day 0';
            chartLabels[programDuration] = `Day ${programDuration - 1}`;
            
            const finalTodayScore = dailyContributions[dailyContributions.length - 1]; // Use the real last value
            setCurrentTScore(finalTodayScore);

            const topBoosts = [
                { id: '2', name: 'High-intensity workout', totalImpact: 180 },
                { id: '4', name: '8 hours of quality sleep', totalImpact: 150 },
                { id: '3', name: 'Eat a protein-rich meal', totalImpact: 120 },
            ];

            const topDrains = [
                { id: 'd2', name: 'Stress Level', totalImpact: -90 },
                { id: 'd1', name: 'Sugar Intake', totalImpact: -75 },
                { id: 'd3', name: 'Alcohol Consumption', totalImpact: -50 },
            ];
            
            const maxImpact = 180;

            setStats({ chartData: finalChartData, chartLabels, topBoosts, topDrains, maxImpact });
            setIsLoading(false);
        };
        generatePlaceholderStats();
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
