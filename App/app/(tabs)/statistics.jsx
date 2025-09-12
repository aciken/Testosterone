import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LineChart } from 'react-native-chart-kit';
import TestosteroneGauge from '../../components/TestosteroneGauge';
import programData from '../../data/programData';
import { Ionicons } from '@expo/vector-icons';

const screenWidth = Dimensions.get('window').width;
const BASELINE_TESTOSTERONE = 450;

const KeyFactorItem = ({ icon, name, totalImpact, color, maxValue }) => (
    <View style={styles.keyFactorItem}>
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
    </View>
);

const taskIcons = {
    '1': 'sunny-outline', '2': 'barbell-outline', '3': 'restaurant-outline',
    '4': 'moon-outline', '5': 'medkit-outline', 'd1': 'ice-cream-outline',
    'd2': 'pulse-outline', 'd3': 'beer-outline'
};

export default function StatisticsScreen() {
    const [stats, setStats] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [currentTScore, setCurrentTScore] = useState(BASELINE_TESTOSTERONE);

    useEffect(() => {
        const generatePlaceholderStats = () => {
            setIsLoading(true);
            const programDuration = 30; // Simulate 30 days of data
            let dailyContributions = [BASELINE_TESTOSTERONE];

            for (let i = 1; i < programDuration; i++) {
                const randomChange = (Math.random() - 0.45) * 25; // Skewed slightly positive
                const newVal = dailyContributions[i-1] + randomChange;
                dailyContributions.push(Math.max(250, Math.min(1050, newVal)));
            }

            const chartData = dailyContributions;
            const finalChartData = [chartData[0], ...chartData];

            const chartLabels = Array(programDuration + 1).fill('');
            chartLabels[1] = 'Day 0';
            chartLabels[programDuration] = `Day ${programDuration - 1}`;
            
            const finalTodayScore = chartData[chartData.length - 1];
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
                                {stats.topBoosts.map(c => <KeyFactorItem key={c.id} icon={taskIcons[c.id]} name={c.name} totalImpact={c.totalImpact} color="#FFFFFF" maxValue={stats.maxImpact}/>)}
                                {stats.topDrains.map(c => <KeyFactorItem key={c.id} icon={taskIcons[c.id]} name={c.name} totalImpact={c.totalImpact} color="#FF6B6B" maxValue={stats.maxImpact}/>)}
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
    keyFactorItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 25, },
    keyFactorIcon: { marginRight: 15, width: 25, },
    keyFactorDetails: { flex: 1, },
    keyFactorName: { color: '#E0E0E0', fontSize: 16, fontWeight: '600', marginBottom: 8, },
    keyFactorBarBackground: { height: 5, width: '100%', backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: 2.5, },
    keyFactorBar: { height: '100%', borderRadius: 2.5, },
    keyFactorValue: { fontSize: 15, fontWeight: 'bold', marginLeft: 15, width: 50, textAlign: 'right' },
    noDataContainer: { marginTop: 60, alignItems: 'center', opacity: 0.5 },
    noDataText: { color: '#8A95B6', marginTop: 20, fontSize: 16, textAlign: 'center' },
});
