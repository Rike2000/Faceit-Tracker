import React, { useState, useEffect } from 'react';
import { Image, StyleSheet, TextInput, TouchableOpacity, Text, Alert, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';

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

const TextInputExample = ({ text, onChangeText }) => {
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
  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigation();
  const [storage, setStorage] = useState(false)

  useEffect(() => {
    loadProfilesFromStorage();
  }, []);

  const saveProfilesToStorage = async (profiles) => {
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

  const clearProfilesFromStorage = async () => {
    try {
      await AsyncStorage.removeItem('@profiles');
      setProfileDataList([]);
      setStorage(false)
      Alert.alert('Success', 'Profile data cleared successfully', [
        { text: 'OK'},
      ]);
    } catch (e) {
      console.error('Error clearing profiles from storage', e);
    }
  };

  const ButtonAlertSuccess = () => {
    Alert.alert('Success', `Profile "${text}" added successfully`, [
      { text: 'OK'},
    ]);
  };

  const ButtonAlertFailed = () => {
    Alert.alert('Something went wrong', `A player with the name "${text}" cannot be found or does not play cs2`, [
      { text: 'OK'},
    ]);
  };

  const ButtonAlertDuplicate = () => {
    Alert.alert('Duplicate', `Profile "${text}" is already added`, [
      { text: 'OK'},
    ]);
  };

  const ButtonAlertClearData = () => {
    Alert.alert('Are you sure?', `Are you sure you want to clear all profiles?`, [
      { text: 'Yes', onPress: () => clearProfilesFromStorage() },
      { text: 'No'},
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

  const ClearButton =  () => {
      return (
        <TouchableOpacity style={styles.clearButton} onPress={ButtonAlertClearData}>
          <Text style={styles.buttonText}>Clear Data</Text>
        </TouchableOpacity>
      );
  }

  const ProfileCard = ({ profileData }) => {
    const skillLevel = profileData.games.cs2.skill_level;
    const levelImage = skillLevelImages[skillLevel];

    const navigateToProfile = () => {
      navigation.navigate('profile', { profileData });
    };

    return (
      <TouchableOpacity onPress={navigateToProfile} style={styles.profileCard}>
        <Image
          source={{ uri: profileData.avatar }}
          style={styles.profileImage}
        />
        <View style={styles.profileTextContainer}>
          <ThemedText style={styles.profileName}>{profileData.nickname}</ThemedText>
        </View>
        <View>
          <Image
            source={levelImage}
            style={{
              resizeMode: 'contain',
              height: 30,
              width: 30,
              marginRight: 5
            }}
          />
        </View>
        <View>
          <ThemedText>
            Elo: {profileData.games.cs2.faceit_elo}
          </ThemedText>
        </View>
      </TouchableOpacity>
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
        <ThemedText>Start tracking player profiles now</ThemedText>
        <ThemedText>Please note that player names are case sensitive</ThemedText>
      </ThemedView>
      <TextInputExample text={text} onChangeText={onChangeText} />
      <ButtonStatus />
      {profileDataList.length > 0 && (<ClearButton />)}
      {isLoading ? <Text>Loading...</Text> : null}
      {profileDataList.slice().reverse().map((profileData, index) => (
        <ProfileCard key={index} profileData={profileData} />
      ))}
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  background: {
    flexDirection: 'row',
    flexWrap: 'wrap'
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
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 50,
    marginRight: 20,
  },
  profileTextContainer: {
    flex: 1,
    alignItems: 'center',
    marginRight: 20,
  },
  profileName: {
    fontSize: 16,
    fontWeight: 'bold',
    justifyContent: 'center',
    alignItems: 'center'
  },
});
