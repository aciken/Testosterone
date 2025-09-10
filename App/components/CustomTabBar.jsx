import { View, TouchableOpacity, Text } from 'react-native';
import { usePathname, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function CustomTabBar() {
  const pathname = usePathname();

  // Define the tabs with normal Ionicons
  const tabs = [
    { 
      name: 'Home', 
      path: '/home', 
      ionIcon: 'home'
    },
    { 
      name: 'Friends', 
      path: '/friends', 
      ionIcon: 'people'
    },
    { 
      name: 'Profile', 
      path: '/profile', 
      ionIcon: 'person'
    },
  ];

  const handleTabPress = (path) => {
    router.push(path);
  };

  return (
    <View style={styles.tabBarContainer}>
      {tabs.map((tab) => {
        const isActive = pathname === tab.path;
        const iconColor = isActive ? '#FFFFFF' : '#8A95B6';
        
        return (
          <TouchableOpacity
            key={tab.path}
            style={styles.tabButton}
            onPress={() => handleTabPress(tab.path)}
          >
            <Ionicons
              name={isActive ? tab.ionIcon : `${tab.ionIcon}-outline`}
              size={24}
              color={iconColor}
            />
            <Text style={[styles.tabLabel, { color: iconColor }]}>
              {tab.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = {
  tabBarContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#000000',
    height: 60,
    paddingBottom: 10,
  },
  tabButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: '600',
  },
};