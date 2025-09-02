import React from 'react';
import { View, Text, SafeAreaView, StatusBar, ScrollView, Image, TouchableOpacity, ImageBackground } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useGlobalContext } from '../context/GlobalProvider';

export default function HomeScreen() {
  const { selectedAdventure, setSelectedAdventure } = useGlobalContext();

  const adventures = [
    { 
      id: '1', 
      title: 'Graphit Adventure', 
      section: 'MYSTIC MINES, ZONE 1',
      image: 'GraphitImage.png',
      quests: [
        { id: 'q1-1', title: 'Collect 10 Crystals', type: 'quest', status: 'completed' },
        { id: 'q1-2', title: 'Find the Hidden Tunnel', type: 'quest', status: 'completed' },
        { id: 'q1-3', title: 'Activate the Mine Cart', type: 'quest', status: 'active' },
        { id: 'q1-4', title: 'Defeat the Rock Golem', type: 'boss', status: 'locked' },
        { id: 'q1-5', title: 'Claim the Treasure', type: 'treasure', status: 'locked' },
      ]
    },
    { 
      id: '2', 
      title: 'Ancient Ruins', 
      section: 'DESERT LANDS, ZONE 2',
      image: 'ForestImage.png',
      quests: [
        { id: 'q2-1', title: 'Decipher the Hieroglyphs', type: 'quest', status: 'active' },
        { id: 'q2-2', title: 'Navigate the Maze', type: 'quest', status: 'locked' },
        { id: 'q2-3', title: 'Find the Oasis', type: 'treasure', status: 'locked' },
      ]
    },
    { 
      id: '3', 
      title: 'Speedway Challenge', 
      section: 'URBAN CIRCUIT, ZONE 3',
      image: 'CarImage.png',
      quests: [
        { id: 'q3-1', title: 'Win the First Race', type: 'quest', status: 'active' },
        { id: 'q3-2', title: 'Upgrade Your Car', type: 'quest', status: 'locked' },
        { id: 'q3-3', title: 'Beat the Champion', type: 'boss', status: 'locked' },
      ]
    }
  ];

  const router = useRouter();

  const getAdventureImage = (imageName) => {
    switch (imageName) {
      case 'GraphitImage.png': return require('../../assets/GraphitImage.png');
      case 'ForestImage.png': return require('../../assets/ForestImage.png');
      case 'MountainImage.png': return require('../../assets/MountainImage.png');
      case 'CarImage.png': return require('../../assets/CarImage.png');
      default: return require('../../assets/icon.png');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0C1126' }}>
      <StatusBar style="light" />
      
      {/* Header with greeting and streak */}
      <View style={{ 
        paddingHorizontal: 20, 
        paddingTop: 16, 
        paddingBottom: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <View>
          <Text style={{ 
            color: '#FFFFFF', 
            fontSize: 24, 
            fontWeight: 'bold',
          }}>
            Greetings, Adventurer!
          </Text>
          <Text style={{ 
            color: '#B3B8C8', 
            fontSize: 16, 
            marginTop: 2,
            fontWeight: '500'
          }}>
            Your next quest awaits
          </Text>
        </View>
        
        <View style={{ 
          flexDirection: 'row', 
          alignItems: 'center', 
          backgroundColor: 'rgba(30, 39, 71, 0.9)',
          paddingVertical: 8,
          paddingHorizontal: 14,
          borderRadius: 20,
          borderWidth: 1,
          borderColor: 'rgba(255, 149, 0, 0.3)'
        }}>
          <Image
            source={require('../../assets/FireImage.png')}
            style={{ width: 26, height: 26 }}
          />
          <Text style={{ 
            color: '#FFFFFF', 
            fontWeight: 'bold', 
            marginLeft: 6, 
            fontSize: 16
          }}>1</Text>
        </View>
      </View>
      
      <ScrollView style={{ flex: 1 }}>
        {/* Selected Adventure section */}
        {selectedAdventure ? (
          <TouchableOpacity
            onPress={() => {
              router.push({
                pathname: '/modal/questDetails',
                params: selectedAdventure
              });
            }}
            style={{
              marginTop: 8,
              marginHorizontal: 20,
              marginBottom: 24,
              shadowColor: '#FFFFFF',
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.4,
              shadowRadius: 16,
              elevation: 16,
              transform: [{ scale: 1.02 }]
            }}
          >
            <ImageBackground
              source={getAdventureImage(selectedAdventure.image)}
              style={{
                borderRadius: 20,
                overflow: 'hidden',
                borderWidth: 1,
                borderColor: 'rgba(255, 255, 255, 0.3)',
              }}
              imageStyle={{ borderRadius: 20 }}
            >
              <LinearGradient
                colors={['rgba(42, 52, 85, 0.7)', 'rgba(30, 39, 71, 0.7)']}
                style={{ 
                  padding: 20,
                  alignItems: 'center',
                  flexDirection: 'row',
                  height: 120,
                }}
              >
                <View style={{ 
                  height: 70, 
                  width: 70, 
                  borderRadius: 35, 
                  backgroundColor: '#FFCC00',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 16,
                  borderWidth: 2,
                  borderColor: 'rgba(255, 204, 0, 0.5)',
                  transform: [{rotate: '-5deg'}]
                }}>
                  <Ionicons name="map" size={34} color="#1C2230" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ 
                    color: '#FFFFFF', 
                    fontSize: 22, 
                    fontWeight: 'bold',
                  }}>
                    Active Quest: {selectedAdventure.title}
                  </Text>
                  <View style={{ 
                    height: 14, 
                    backgroundColor: 'rgba(42, 52, 85, 0.6)',
                    borderRadius: 7,
                    marginTop: 12,
                    width: '100%',
                    padding: 2,
                    overflow: 'hidden',
                    borderWidth: 1,
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                  }}>
                    <LinearGradient
                      colors={['#76FF03', '#CCFF90']}
                      style={{ 
                        height: '100%', 
                        width: `${selectedAdventure.progress * 100}%`, 
                        borderRadius: 5,
                      }}
                    />
                  </View>
                  <Text style={{ 
                    color: '#B3B8C8', 
                    fontSize: 15, 
                    marginTop: 8,
                    fontWeight: '500'
                  }}>
                    From: {selectedAdventure.adventureTitle}
                  </Text>
                </View>
              </LinearGradient>
            </ImageBackground>
          </TouchableOpacity>
        ) : (
          <View style={{
            marginHorizontal: 20,
            borderRadius: 20,
            backgroundColor: 'rgba(30, 39, 71, 0.7)',
            padding: 20,
            marginTop: 8,
            marginBottom: 24,
            alignItems: 'center',
            justifyContent: 'center',
            height: 120,
            borderWidth: 1,
            borderColor: 'rgba(255, 255, 255, 0.2)',
            borderStyle: 'dashed'
          }}>
            <Ionicons name="map-outline" size={32} color="#B3B8C8" />
            <Text style={{ color: '#FFFFFF', fontSize: 18, fontWeight: 'bold', marginTop: 8 }}>
              No adventure selected
            </Text>
            <Text style={{ color: '#B3B8C8', fontSize: 14, marginTop: 4 }}>
              Choose one from the list below!
            </Text>
          </View>
        )}
        
        {/* Daily Adventures Section */}
        <View style={{ marginBottom: 32 }}>
          <View style={{ 
            flexDirection: 'row', 
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: 20,
            marginBottom: 16
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons 
                name="calendar" 
                size={24} 
                color="#76FF03"
                style={{ marginRight: 8 }}
              />
              <Text style={{ 
                color: '#FFFFFF', 
                fontSize: 22, 
                fontWeight: 'bold',
              }}>
                Daily Adventures
              </Text>
            </View>
            <TouchableOpacity 
              style={{ 
                backgroundColor: 'rgba(118, 255, 3, 0.15)', 
                paddingVertical: 6,
                paddingHorizontal: 12, 
                borderRadius: 16,
                borderWidth: 1,
                borderColor: 'rgba(118, 255, 3, 0.3)'
              }}
            >
              <Text style={{ 
                color: '#76FF03', 
                fontSize: 14, 
                fontWeight: 'bold' 
              }}>
                View All
              </Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingLeft: 20, paddingRight: 12 }}
          >
            {/* Daily Challenge 1 */}
            <TouchableOpacity
              style={{
                width: 220,
                marginRight: 20,
                height: 140,
                shadowColor: "#76FF03",
                shadowOffset: {
                  width: 0,
                  height: 5,
                },
                shadowOpacity: 0.2,
                shadowRadius: 8,
                elevation: 6,
                transform: [{ rotate: '1deg' }],
              }}
            >
              <LinearGradient
                colors={['rgba(42, 52, 85, 0.95)', 'rgba(30, 39, 71, 0.95)']}
                style={{
                  borderRadius: 20,
                  overflow: 'hidden',
                  borderWidth: 2,
                  borderColor: 'rgba(118, 255, 3, 0.4)',
                  padding: 16,
                  height: '100%',
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                  <View style={{
                    backgroundColor: 'rgba(118, 255, 3, 0.2)',
                    paddingVertical: 4,
                    paddingHorizontal: 8,
                    borderRadius: 10
                  }}>
                    <Text style={{ color: '#76FF03', fontSize: 12, fontWeight: 'bold' }}>FOREST REALM</Text>
                  </View>
                </View>
                
                <Text style={{ 
                  color: '#FFFFFF', 
                  fontSize: 18, 
                  fontWeight: 'bold',
                  marginBottom: 8
                }}>
                  Explore Mystery Cave
                </Text>
                
                <View style={{ 
                  height: 10, 
                  backgroundColor: 'rgba(42, 52, 85, 0.6)',
                  borderRadius: 5,
                  marginTop: 8,
                  marginBottom: 8,
                  width: '100%',
                  padding: 2,
                  overflow: 'hidden',
                  borderWidth: 1,
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                }}>
                  <LinearGradient
                    colors={['#76FF03', '#CCFF90']}
                    style={{ 
                      height: '100%', 
                      width: '33%', 
                      borderRadius: 3,
                    }}
                  />
                </View>
                
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Text style={{ color: '#B3B8C8', fontSize: 14 }}>2 hours left</Text>
                  <Text style={{ color: '#76FF03', fontSize: 14, fontWeight: 'bold' }}>+50 XP</Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
            
            {/* Daily Challenge 2 */}
            <TouchableOpacity
              style={{
                width: 220,
                marginRight: 20,
                height: 140,
                shadowColor: "#00DDFF",
                shadowOffset: {
                  width: 0,
                  height: 5,
                },
                shadowOpacity: 0.2,
                shadowRadius: 8,
                elevation: 6,
                transform: [{ rotate: '-1deg' }],
              }}
            >
              <LinearGradient
                colors={['rgba(30, 39, 71, 0.95)', 'rgba(20, 26, 47, 0.95)']}
                style={{
                  borderRadius: 20,
                  overflow: 'hidden',
                  borderWidth: 2,
                  borderColor: 'rgba(0, 221, 255, 0.4)',
                  padding: 16,
                  height: '100%',
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                  <View style={{
                    backgroundColor: 'rgba(0, 221, 255, 0.2)',
                    paddingVertical: 4,
                    paddingHorizontal: 8,
                    borderRadius: 10
                  }}>
                    <Text style={{ color: '#00DDFF', fontSize: 12, fontWeight: 'bold' }}>MOUNTAIN REALM</Text>
                  </View>
                </View>
                
                <Text style={{ 
                  color: '#FFFFFF', 
                  fontSize: 18, 
                  fontWeight: 'bold',
                  marginBottom: 8
                }}>
                  Climb Mountain Peak
                </Text>
                
                <View style={{ 
                  height: 10, 
                  backgroundColor: 'rgba(42, 52, 85, 0.6)',
                  borderRadius: 5,
                  marginTop: 8,
                  marginBottom: 8,
                  width: '100%',
                  padding: 2,
                  overflow: 'hidden',
                  borderWidth: 1,
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                }}>
                  <LinearGradient
                    colors={['#00DDFF', '#00AAD4']}
                    style={{ 
                      height: '100%', 
                      width: '20%', 
                      borderRadius: 3,
                    }}
                  />
                </View>
                
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Text style={{ color: '#B3B8C8', fontSize: 14 }}>1 day left</Text>
                  <Text style={{ color: '#00DDFF', fontSize: 14, fontWeight: 'bold' }}>+100 XP</Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
            
            {/* Weekly Challenge */}
            <TouchableOpacity
              style={{
                width: 220,
                marginRight: 20,
                height: 140,
                shadowColor: "#FF9500",
                shadowOffset: {
                  width: 0,
                  height: 5,
                },
                shadowOpacity: 0.2,
                shadowRadius: 8,
                elevation: 6,
                transform: [{ rotate: '1deg' }],
              }}
            >
              <LinearGradient
                colors={['rgba(42, 52, 85, 0.95)', 'rgba(30, 39, 71, 0.95)']}
                style={{
                  borderRadius: 20,
                  overflow: 'hidden',
                  borderWidth: 2,
                  borderColor: 'rgba(255, 149, 0, 0.4)',
                  padding: 16,
                  height: '100%',
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                  <View style={{
                    backgroundColor: 'rgba(255, 149, 0, 0.2)',
                    paddingVertical: 4,
                    paddingHorizontal: 8,
                    borderRadius: 10
                  }}>
                    <Text style={{ color: '#FF9500', fontSize: 12, fontWeight: 'bold' }}>MYSTIC MINES</Text>
                  </View>
                </View>
                
                <Text style={{ 
                  color: '#FFFFFF', 
                  fontSize: 18, 
                  fontWeight: 'bold',
                  marginBottom: 8
                }}>
                  Complete Graphit Adventure
                </Text>
                
                <View style={{ 
                  height: 10, 
                  backgroundColor: 'rgba(42, 52, 85, 0.6)',
                  borderRadius: 5,
                  marginTop: 8,
                  marginBottom: 8,
                  width: '100%',
                  padding: 2,
                  overflow: 'hidden',
                  borderWidth: 1,
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                }}>
                  <LinearGradient
                    colors={['#FF9500', '#FFA500']}
                    style={{ 
                      height: '100%', 
                      width: '30%', 
                      borderRadius: 3,
                    }}
                  />
                </View>
                
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Text style={{ color: '#B3B8C8', fontSize: 14 }}>30% complete</Text>
                  <Text style={{ color: '#FF9500', fontSize: 14, fontWeight: 'bold' }}>+200 XP</Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </ScrollView>
        </View>
        
        {/* Possible Adventures */}
        <View style={{ marginBottom: 32 }}>
          <View style={{ 
            flexDirection: 'row', 
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: 20,
            marginBottom: 16
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons 
                name="map" 
                size={24} 
                color="#00DDFF"
                style={{ marginRight: 8 }}
              />
              <Text style={{ 
                color: '#FFFFFF', 
                fontSize: 22, 
                fontWeight: 'bold',
              }}>
                Possible Adventures
              </Text>
            </View>
            <TouchableOpacity 
              style={{ 
                backgroundColor: 'rgba(0, 221, 255, 0.15)', 
                paddingVertical: 6,
                paddingHorizontal: 12, 
                borderRadius: 16,
                borderWidth: 1,
                borderColor: 'rgba(0, 221, 255, 0.3)'
              }}
            >
              <Text style={{ 
                color: '#00DDFF', 
                fontSize: 14, 
                fontWeight: 'bold' 
              }}>
                See All
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingLeft: 20, paddingRight: 12 }}
          >
            {adventures.map((adventure, index) => (
              <TouchableOpacity
                key={adventure.id}
                onPress={() => {
                  router.push({
                    pathname: '/modal/adventureDetails',
                    params: { adventure: JSON.stringify(adventure) }
                  });
                }}
                style={{
                  width: 280,
                  marginRight: 20,
                  height: 170,
                  transform: [{ rotate: index % 2 === 0 ? '1deg' : '-1deg' }],
                  shadowColor: index % 2 === 0 ? "#00FF88" : "#00DDFF",
                  shadowOffset: {
                    width: 0,
                    height: 8,
                  },
                  shadowOpacity: 0.2,
                  shadowRadius: 10,
                  elevation: 8,
                }}
              >
                <ImageBackground
                  source={getAdventureImage(adventure.image)}
                  style={{
                    borderRadius: 24,
                    height: '100%',
                    width: '100%',
                    borderWidth: 2,
                    borderColor: 'rgba(118, 255, 3, 0.5)',
                    overflow: 'hidden',
                  }}
                  imageStyle={{ 
                    borderRadius: 22,
                    resizeMode: 'cover'
                  }}
                >
                  <View style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.2)',
                    borderRadius: 22
                  }} />
                  
                  <View style={{
                    padding: 20,
                    height: '100%',
                    width: '100%'
                  }}>
                    <Text style={{ 
                      color: '#FFFFFF', 
                      fontSize: 12, 
                      fontWeight: 'bold', 
                      marginBottom: 4,
                      letterSpacing: 1,
                      textShadowColor: 'rgba(0, 0, 0, 0.8)',
                      textShadowOffset: {width: 0, height: 1},
                      textShadowRadius: 3
                    }}>
                      {adventure.section}
                    </Text>
                    
                    <Text style={{ 
                      color: '#FFFFFF', 
                      fontSize: 26, 
                      fontWeight: 'bold',
                      textShadowColor: 'rgba(0, 0, 0, 0.8)',
                      textShadowOffset: {width: 0, height: 1},
                      textShadowRadius: 3
                    }}>
                      {adventure.title}
                    </Text>
                  </View>
                </ImageBackground>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
        
      </ScrollView>
    </SafeAreaView>
  );
} 