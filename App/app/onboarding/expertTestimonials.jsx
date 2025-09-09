import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

export default function ExpertTestimonials() {
  const router = useRouter();

  const testimonials = [
    {
      id: 1,
      text: "Testosterone optimization is one of the most impactful interventions for men's health, affecting everything from energy and mood to muscle mass and cognitive function.",
      author: "Dr. Andrew Huberman",
      title: "Neuroscientist & Health Expert"
    },
    {
      id: 2,
      text: "The decline in testosterone levels we're seeing in modern men is largely due to lifestyle factors - poor sleep, chronic stress, and sedentary behavior. These are all addressable.",
      author: "Dr. Andrew Huberman",
      title: "Neuroscientist & Health Expert"
    },
    {
      id: 3,
      text: "When testosterone levels are optimized naturally, men report significant improvements in confidence, focus, and overall life satisfaction. It's not just about physical changes.",
      author: "Dr. Andrew Huberman",
      title: "Neuroscientist & Health Expert"
    }
  ];

  return (
    <LinearGradient colors={['#0C1126', '#000000']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Expert Insights</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            <Text style={styles.title}>What Experts Say About Testosterone</Text>
            
            {testimonials.map((testimonial) => (
              <View key={testimonial.id} style={styles.testimonialContainer}>
                <View style={styles.profileContainer}>
                  <View style={styles.profileIcon}>
                    <Text style={styles.profileText}>AH</Text>
                  </View>
                  <View style={styles.profileInfo}>
                    <Text style={styles.authorName}>{testimonial.author}</Text>
                    <Text style={styles.authorTitle}>{testimonial.title}</Text>
                  </View>
                </View>
                
                <View style={styles.bubbleContainer}>
                  <View style={styles.chatBubble}>
                    <Text style={styles.bubbleText}>{testimonial.text}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>

        <TouchableOpacity 
          style={styles.continueButton} 
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            router.push('/onboarding/programResults');
          }}
        >
          <Text style={styles.continueButtonText}>Continue</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  backButton: {
    padding: 10,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 44,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 34,
  },
  testimonialContainer: {
    marginBottom: 25,
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  profileIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1E2747',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  profileText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  profileInfo: {
    flex: 1,
  },
  authorName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  authorTitle: {
    color: '#B3B8C8',
    fontSize: 14,
    marginTop: 2,
  },
  bubbleContainer: {
    marginLeft: 52,
  },
  chatBubble: {
    backgroundColor: '#1E2747',
    borderRadius: 15,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2A3A5C',
  },
  bubbleText: {
    color: '#FFFFFF',
    fontSize: 16,
    lineHeight: 22,
  },
  continueButton: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 30,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  continueButtonText: {
    color: '#000000',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
