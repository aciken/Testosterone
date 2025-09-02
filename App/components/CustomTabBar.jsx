import { View, TouchableOpacity, Text, Image } from 'react-native';
import { usePathname, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function CustomTabBar() {
  const pathname = usePathname();

  // Define the tabs with both the custom icons and fallback Ionicons
  const tabs = [
    { 
      name: 'Home', 
      path: '/home', 
      iconPath: require('../assets/HomeIcon2.png'),
      ionIcon: 'home'
    },
    { 
      name: 'Friends', 
      path: '/friends', 
      iconPath: require('../assets/FriendsIcon2.png'),
      ionIcon: 'people'
    },
    { 
      name: 'Profile', 
      path: '/profile', 
      iconPath: require('../assets/ProfileIcon2.png'),
      ionIcon: 'person'
    },
  ];

  const handleTabPress = (path) => {
    router.push(path);
  };

  return (
    <View style={{ 
      flexDirection: 'row', 
      justifyContent: 'space-around', 
      alignItems: 'center', 
      backgroundColor: '#1E2747', 
      paddingVertical: 12,
      borderTopWidth: 1,
      borderTopColor: '#2A3455',
    }}>
      {tabs.map((tab) => {
        const isActive = pathname === tab.path;
        return (
          <TouchableOpacity
            key={tab.path}
            style={{ 
              alignItems: 'center', 
              justifyContent: 'center',
              backgroundColor: 'transparent',
              padding: 8,
              width: 70,
              height: 70
            }}
            onPress={() => handleTabPress(tab.path)}
          >
            <View
              style={{
                borderWidth: isActive ? 2 : 0,
                borderColor: '#00DDFF',
                borderRadius: 12,
                padding: 2,
                width: 50,
                height: 50,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Image 
                source={tab.iconPath}
                style={{
                  width: 46,
                  height: 46
                }}
                resizeMode="contain"
              />
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}