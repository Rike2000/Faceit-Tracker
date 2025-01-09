import React, { useState, useEffect, useCallback } from 'react';
import { Image, StyleSheet, TextInput, TouchableOpacity, Text, Alert, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import axios from 'axios';
import { useRouter, useFocusEffect } from 'expo-router';
import Ionicons from 'react-native-vector-icons/Ionicons';

const apiKey = process.env.EXPO_PUBLIC_FACEIT_APP_API_KEY;

export const skillLevelImages = {
  1: require('@/assets/images/lvl1.png'),
  2: require('@/assets/images/lvl2.png'),
  3: require('@/assets/images/lvl3.png'),
  4: require('@/assets/images/lvl4.png'),
  5: require('@/assets/images/lvl5.png'),
  6: require('@/assets/images/lvl6.png'),
  7: require('@/assets/images/lvl7.png'),
  8: require('@/assets/images/lvl8.png'),
  9: require('@/assets/images/lvl9.png'),
  10: require('@/assets/images/lvl10.png'),
};

const TextInputExample = ({ text, onChangeText }: { text: any, onChangeText: any }) => {
  return (
    <TextInput
      style={styles.input}
      onChangeText={onChangeText}
      value={text}
      placeholder="Faceit profile name"
      placeholderTextColor="rgba(255,255,255, 0.4)"
    />
  );
};

export default function HomeScreen() {
  const [text, onChangeText] = useState("");
  const [profileDataList, setProfileDataList] = useState([]);
  const [favoritesDataList, setfavoritesDataList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const [storage, setStorage] = useState(false)
  const defaultAvatar = 'https://media.istockphoto.com/id/1337144146/sv/vektor/default-avatar-profile-icon-vector.jpg?s=612x612&w=0&k=20&c=GXVOqN9-6nUrgmK2thaQuTtf1bpxUMCEUvNlun-uX7g=';

  useEffect(() => {
    loadProfilesFromStorage();
    loadfavoritesFromStorage();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadProfilesFromStorage();
      loadfavoritesFromStorage();
    }, [])
  );

  const saveProfilesToStorage = async (profiles: any) => {
    try {
      const jsonValue = JSON.stringify(profiles);
      await AsyncStorage.setItem('@profiles', jsonValue);
      setStorage(true)
    } catch (e) {
      console.error('Error saving profiles to storage', e);
    }
  };

  const loadProfilesFromStorage = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem('@profiles');
      if (jsonValue != null) {
        setProfileDataList(JSON.parse(jsonValue));
        
      }
    } catch (e) {
      console.error('Error loading profiles from storage', e);
    }
  };

  const loadfavoritesFromStorage = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem('favorites');
      if (jsonValue != null) {
        setfavoritesDataList(JSON.parse(jsonValue));
      }
    } catch (e) {
      console.error('Error loading favorites from storage', e);
    }
  };
  const clearfavoritesFromStorage = async () => {
    try {
      await AsyncStorage.removeItem('favorites');
      setfavoritesDataList([]);
      Alert.alert('Success', 'favorites cleared successfully', [
        { text: 'OK' },
      ]);
    } catch (e) {
      console.error('Error clearing favorites from storage', e);
    }
  };

  const clearProfilesFromStorage = async () => {
    try {
      await AsyncStorage.removeItem('@profiles');
      setProfileDataList([]);
      setStorage(false)
      Alert.alert('Success', 'Profile data cleared successfully', [
        { text: 'OK' },
      ]);
    } catch (e) {
      console.error('Error clearing profiles from storage', e);
    }
  };

  const ButtonAlertSuccess = () => {
    Alert.alert('Success', `Profile "${text}" added successfully`, [
      { text: 'OK' },
    ]);
  };

  const ButtonAlertFailed = () => {
    Alert.alert('Something went wrong', `A player with the name "${text}" cannot be found or has not yet played CS2 on Faceit`, [
      { text: 'OK' },
    ]);
  };

  const ButtonAlertDuplicate = () => {
    Alert.alert('Error!', `Profile "${text}" is already added`, [
      { text: 'OK' },
    ]);
  };

  const ButtonAlertClearData = () => {
    Alert.alert('Are you sure?', `Are you sure you want to delete all profiles from your tracker?`, [
      { text: 'Yes', onPress: () => clearProfilesFromStorage() },
      { text: 'No' },
    ]);
  };

  const ButtonAlertClearfavorites = () => {
    Alert.alert('Are you sure?', `Are you sure you want to delete favorited profiles?`, [
      { text: 'Yes', onPress: () => clearfavoritesFromStorage() },
      { text: 'No' },
    ]);
  };


  const ProfileDataQuery = () => {
    const isDuplicate = profileDataList.some(profile => profile.nickname.toLowerCase() === text.toLowerCase());

    if (isDuplicate) {
      ButtonAlertDuplicate();
      return;
    }
    setIsLoading(true);
    axios
      .get("https://open.faceit.com/data/v4/players?nickname=" + text, {
        headers: { "Authorization": "Bearer " + apiKey }
      })
      .then(response => {
        if (response.data.games.cs2 == undefined) {
          ButtonAlertFailed();
        } else {
          ButtonAlertSuccess();
          const updatedProfiles = [...profileDataList, response.data];          
          setProfileDataList(updatedProfiles);
          saveProfilesToStorage(updatedProfiles);
          onChangeText("")
        }
      })
      .catch(err => {
        ButtonAlertFailed();
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const ButtonStatus = () => {
    if (text.trim() === "") {
      return (
        <TouchableOpacity style={styles.buttonInActive}>
          <Text style={styles.buttonText}>Add profile</Text>
        </TouchableOpacity>
      );
    } else {
      return (
        <TouchableOpacity style={styles.button} onPress={ProfileDataQuery}>
          <Text style={styles.buttonText}>Add profile</Text>
        </TouchableOpacity>
      );
    }
  };

  const ClearButton = () => {
    return (
      <TouchableOpacity style={styles.clearButton} onPress={ButtonAlertClearData}>
        <Text style={styles.buttonText}>Delete all profiles</Text>
      </TouchableOpacity>
    );
  }
  const ClearButton2 = () => {
    return (
      <TouchableOpacity style={styles.clearButton} onPress={ButtonAlertClearfavorites}>
        <Text style={styles.buttonText}>Delete all favorites</Text>
      </TouchableOpacity>
    );
  }

  const ProfileCard = ({ profileData, isFavorite = false }: { profileData: any, isFavorite?: boolean }) => {
    const skillLevel = profileData.games.cs2.skill_level;
    const levelImage = skillLevelImages[skillLevel];

    const navigateToProfile = () => {
        router.push({
            pathname: "/profile",
            params: { 
                profileData: JSON.stringify(profileData)
            }
        });
    };

    const handleDelete = () => {
        Alert.alert(
            'Delete Profile',
            `Are you sure you want to remove ${profileData.nickname} from your ${isFavorite ? 'favorites' : 'followed profiles'}?`,
            [
                { 
                    text: 'Cancel',
                    style: 'cancel'
                },
                { 
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const storageKey = isFavorite ? 'favorites' : '@profiles';
                            const jsonValue = await AsyncStorage.getItem(storageKey);
                            if (jsonValue) {
                                const profiles = JSON.parse(jsonValue);
                                const updatedProfiles = profiles.filter(
                                    (profile) => profile.nickname !== profileData.nickname
                                );
                                await AsyncStorage.setItem(storageKey, JSON.stringify(updatedProfiles));
                                
                                // Update state based on which list we're modifying
                                if (isFavorite) {
                                    setfavoritesDataList(updatedProfiles);
                                } else {
                                    setProfileDataList(updatedProfiles);
                                }
                            }
                        } catch (error) {
                            console.error('Error deleting profile:', error);
                            Alert.alert('Error', 'Failed to delete profile');
                        }
                    }
                }
            ]
        );
    };

    return (
        <View style={styles.profileCard}>
            <TouchableOpacity 
                onPress={navigateToProfile}
                style={styles.profileContent}
            >
                <Image
                    source={{ uri: profileData.avatar || defaultAvatar }}
                    style={styles.profileImage}
                />
                <View style={styles.infoContainer}>
                    <ThemedText style={styles.profileName}>{profileData.nickname}</ThemedText>
                    <View style={styles.statsRow}>
                        <Image
                            source={levelImage}
                            style={styles.levelImage}
                        />
                        <ThemedText>
                            Elo: {profileData.games.cs2.faceit_elo}
                        </ThemedText>
                    </View>
                </View>
            </TouchableOpacity>
            <TouchableOpacity 
                onPress={handleDelete}
                style={styles.deleteButton}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
                <Ionicons name="trash-outline" size={24} color="red" />
            </TouchableOpacity>
        </View>
    );
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#262626', dark: '#262626' }}
      headerImage={
        <Image
          source={require('@/assets/images/header.png')}
          style={styles.background}
        />
      }>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Welcome to Faceit Tracker!</ThemedText>
        <ThemedText>Start tracking CS2 player profiles now</ThemedText>
        <ThemedText>Please note that player names are case sensitive</ThemedText>
      </ThemedView>
      <TextInputExample text={text} onChangeText={onChangeText} />
      <ButtonStatus />
      {isLoading ? <Text>Loading...</Text> : null}
      {favoritesDataList.length > 0 && (<ThemedText type="subtitle">Favorited profiles ⭐</ThemedText>)}
      {favoritesDataList.slice().reverse().map((profileData, index) => (
        <ProfileCard key={index} profileData={profileData} isFavorite={true} />
      ))}
      {favoritesDataList.length > 0 && (<ClearButton2 />)}
      {profileDataList.length > 0 && (<ThemedText type="subtitle">Followed profiles</ThemedText>)}
      {profileDataList.slice().reverse().map((profileData, index) => (
        <ProfileCard key={index} profileData={profileData} />
      ))}
      {profileDataList.length > 0 && (<ClearButton />)}
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  background: {
    maxWidth: "100%",
    maxHeight: "100%"
  },
  input: {
    width: '100%',
    padding: 10,
    borderWidth: 2,
    borderColor: '#444',
    borderRadius: 25,
    backgroundColor: '#1e1e1e',
    color: '#fcfcfa',
    fontSize: 16,
  },
  button: {
    height: 40,
    borderColor: '#444',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginVertical: 10,
    backgroundColor: '#007BFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearButton: {
    height: 40,
    borderColor: '#444',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginVertical: 10,
    backgroundColor: 'red',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
  },
  buttonInActive: {
    height: 40,
    borderColor: '#444',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginVertical: 10,
    backgroundColor: '#808080',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    backgroundColor: '#444',
    padding: 10,
    marginVertical: 10,
    borderColor: '#444',
    borderWidth: 1,
    borderRadius: 10,
  },
  profileContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 50,
    marginRight: 15,
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  profileName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  levelImage: {
    resizeMode: 'contain',
    height: 30,
    width: 30,
    marginRight: 10,
  },
  deleteButton: {
    padding: 10,
  },
});
