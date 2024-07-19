import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, Image, View, Text, ScrollView, Alert, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useNavigation, NavigationContainer } from '@react-navigation/native';

export default function Friends() {
    const apiKey = process.env.EXPO_PUBLIC_FACEIT_APP_API_KEY;
    const route = useRoute();
    const navigation = useNavigation();
    const { profileData } = route.params;
    const [loadedProfiles, setLoadedProfiles] = useState([])
    const [friends, setFriends] = useState([]);
    const [loading, setLoading] = useState(true);
    const defaultAvatar = 'https://media.istockphoto.com/id/1337144146/sv/vektor/default-avatar-profile-icon-vector.jpg?s=612x612&w=0&k=20&c=GXVOqN9-6nUrgmK2thaQuTtf1bpxUMCEUvNlun-uX7g=';


    useEffect(() => {
        loadProfilesFromStorage()
        const fetchFriendsData = async () => {
            try {
                const promises = profileData.friends_ids.map(id =>
                    axios.get(`https://open.faceit.com/data/v4/players/${id}`, {
                        headers: { "Authorization": "Bearer " + apiKey }
                    })
                );

                const responses = await Promise.all(promises);
                const friendsData = responses.map(response => {
                    const data = response.data;
                    if (data.avatar === '') {
                        data.avatar = defaultAvatar;
                    }
                    return data;
                });

                setFriends(friendsData);
            } catch (err) {
                console.log(err);
            } finally {
                setLoading(false);
            }
        };

        fetchFriendsData();
    }, [profileData.friends_ids, apiKey]);

    const buttonAlert = () => {
        Alert.alert('Add profile?', `Do you want to add this profile to your tracker`, [
            { text: 'Yes', onPress: (saveProfileToStorage) },
            { text: 'No' },
        ]);

    }

    const loadProfilesFromStorage = async () => {
        try {
            const jsonValue = await AsyncStorage.getItem('@profiles');
            if (jsonValue != null) {
                setLoadedProfiles(JSON.parse(jsonValue));
            }
        } catch (e) {
            console.error('Error loading profiles from storage', e);
        }
    };





    const saveProfileToStorage = async (profile) => {
        if (!profile.games.cs2) {
            Alert.alert('Error!', `This player has not yet played CS2 and cannot be added to your tracker`, [
                { text: 'Ok' },
            ]);
        } else {
            const isDuplicate = loadedProfiles.some(storedProfiles => storedProfiles.nickname.toLowerCase() === profile.nickname.toLowerCase());
            if (isDuplicate) {
                Alert.alert('Error!', `Profile is "${profile.nickname}" already added`, [
                    { text: 'Ok' },
                ]);
            } else {
                try {
                    const storedProfiles = await AsyncStorage.getItem('@profiles');
                    const profiles = storedProfiles ? JSON.parse(storedProfiles) : [];
                    profiles.push(profile);
                    const jsonValue = JSON.stringify(profiles);
                    await AsyncStorage.setItem('@profiles', jsonValue);
                    console.log('Profile saved to storage');
                    navigation.navigate('index', { profileData });
                } catch (e) {
                    console.error('Error saving profile to storage', e);
                }
            }

        }
    };

    const ProfileCard = ({ profileData, onSave }) => {
        return (
            <View style={styles.profileCard}>
                <Image
                    source={{ uri: profileData.avatar }}
                    style={styles.profileImage}
                />
                <View style={styles.profileTextContainer}>
                    <ThemedText style={styles.profileName}>{profileData.nickname}</ThemedText>
                </View>
                <View>
                    <TouchableOpacity onPress={() => onSave(profileData)} style={styles.addProfile}>
                        <ThemedText>Add profile</ThemedText>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    return (
        <ScrollView style={styles.background}>
            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="white" />
                    <Text style={styles.loadingText}>Loading...</Text>
                </View>
            ) : (
                friends.map((friend, index) => (
                    <ProfileCard key={index} profileData={friend} onSave={saveProfileToStorage} />
                ))
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    headerImage: {
        alignItems: 'center',
        paddingTop: 15,
    },
    mainContainer: {
        flexDirection: 'column',
        alignItems: 'center',
        width: '90%',
        backgroundColor: '#444',
        padding: 10,
        marginVertical: 10,
        borderColor: '#444',
        borderWidth: 1,
        borderRadius: 10,
    },
    rowContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    statsContainer: {
        flexDirection: 'column',
        width: '45%',
        backgroundColor: '#444',
        padding: 5,
        marginVertical: 5,
        marginHorizontal: 5,
        borderColor: '#444',
        borderWidth: 1,
        borderRadius: 10,
    },
    background: {
        width: '100%',
        backgroundColor: '#262626',
    },
    mapImage: {
        width: "95%",
        height: 200,
        marginBottom: 20,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 50,
    },
    loadingText: {
        marginTop: 10,
        fontSize: 18,
        color: 'white',
    },
    profileName: {
        fontSize: 20,
        fontWeight: 'bold',
        justifyContent: 'center',
        alignItems: 'center'
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
        alignItems: 'flex-start',
        marginLeft: 20,
        marginRight: 20,
    },
    addProfile: {
        backgroundColor: "rgba(255, 95, 31, 0.8)",
        padding: 10,
        borderRadius: 6,
        flexDirection: 'row',
        marginHorizontal: 5,
        marginTop: 10,
        fontSize: 20
    }
});
