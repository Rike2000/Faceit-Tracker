import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, Image, View, Text, ScrollView, Alert, TouchableOpacity, ActivityIndicator, FlatList } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useEffect, useState, useRef } from 'react';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useLocalSearchParams, useRouter } from 'expo-router';


interface FriendData {
    nickname: string;
    avatar: string;
    games: {
        cs2?: any;
    };
    [key: string]: any;  
}

const FRIENDS_PER_PAGE = 20;

export default function Friends() {
    const apiKey = process.env.EXPO_PUBLIC_FACEIT_APP_API_KEY;
    const params = useLocalSearchParams();
    const router = useRouter();
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const abortControllerRef = useRef<AbortController | null>(null);
    
    // Parse the profileData safely
    let profileData;
    try {
        profileData = typeof params.profileData === 'string' 
            ? JSON.parse(params.profileData)
            : params.profileData;
    } catch (error) {
        console.error('Error parsing profile data:', error);
        router.back();
        return null;
    }

    const [loadedProfiles, setLoadedProfiles] = useState([]);
    const [friends, setFriends] = useState<FriendData[]>([]);
    const [loading, setLoading] = useState(true);
    const [showLongLoadingMessage, setShowLongLoadingMessage] = useState(false);
    const defaultAvatar = 'https://media.istockphoto.com/id/1337144146/sv/vektor/default-avatar-profile-icon-vector.jpg?s=612x612&w=0&k=20&c=GXVOqN9-6nUrgmK2thaQuTtf1bpxUMCEUvNlun-uX7g=';

    const fetchFriendsData = async (page: number) => {
        try {
            if (!profileData?.friends_ids) {
                setLoading(false);
                return;
            }

            abortControllerRef.current = new AbortController();
            const startIndex = (page - 1) * FRIENDS_PER_PAGE;
            const endIndex = startIndex + FRIENDS_PER_PAGE;
            const currentFriendsIds = profileData.friends_ids.slice(startIndex, endIndex);
            setHasMore(endIndex < profileData.friends_ids.length);

            const promises = currentFriendsIds.map((id: string) =>
                axios.get(`https://open.faceit.com/data/v4/players/${id}`, {
                    headers: { "Authorization": "Bearer " + apiKey },
                    signal: abortControllerRef.current.signal
                })
            );

            const responses = await Promise.all(promises);
            const friendsData = responses.map(response => ({
                ...response.data,
                avatar: response.data.avatar || defaultAvatar
            }));

            if (page === 1) {
                setFriends(friendsData);
            } else {
                setFriends(prev => [...prev, ...friendsData]);
            }

            setCurrentPage(page);
        } catch (err) {
            if (axios.isCancel(err)) {
                console.log('Request cancelled');
                return;
            }
            console.error('Error fetching friends:', err);
            Alert.alert('Error', 'Failed to load friends data', [
                { text: 'OK', onPress: () => router.back() }
            ]);
        } finally {
            setLoading(false);
            setIsLoadingMore(false);
            setShowLongLoadingMessage(false);
        }
    };

    useEffect(() => {
        loadProfilesFromStorage();
        fetchFriendsData(1);

        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, []);

    const loadMoreFriends = () => {
        if (!isLoadingMore && hasMore) {
            setIsLoadingMore(true);
            fetchFriendsData(currentPage + 1);
        }
    };

    const buttonAlert = (profile: any) => {
        Alert.alert('Add profile?', 'Do you want to add this profile to your tracker', [
            { text: 'Yes', onPress: () => saveProfileToStorage(profile) },
            { text: 'No' },
        ]);
    };

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

    const saveProfileToStorage = async (profile: { games: { cs2: any }, nickname: string }) => {
        try {
            setLoading(true);

            if (!profile.games.cs2) {
                Alert.alert('Error!', 'This player has not yet registered CS2 on Faceit and cannot be added to your tracker', [
                    { text: 'Ok' },
                ]);
                return;
            }

            // Check for duplicate before proceeding
            const isDuplicate = loadedProfiles.some(
                (storedProfile: { nickname: string }) => storedProfile.nickname.toLowerCase() === profile.nickname.toLowerCase()
            );

            if (isDuplicate) {
                Alert.alert('Error!', `Profile "${profile.nickname}" is already added`, [
                    { text: 'Ok' },
                ]);
                return;
            }

            // Get stored profiles
            const storedProfiles = await AsyncStorage.getItem('@profiles');
            const profiles = storedProfiles ? JSON.parse(storedProfiles) : [];
            
            // Add new profile
            profiles.push(profile);
            
            // Save to storage
            await AsyncStorage.setItem('@profiles', JSON.stringify(profiles));
            
            // Show success message
            Alert.alert('Success', `Profile "${profile.nickname}" has been added!`, [
                { 
                    text: 'OK',
                    onPress: () => {
                        // Navigate back to home
                        router.push({
                            pathname: "/"
                        });
                    }
                },
            ]);

        } catch (error) {
            console.error('Error saving profile:', error);
            Alert.alert(
                'Error',
                'Failed to add profile. Please try again later.',
                [{ text: 'OK' }]
            );
        } finally {
            setLoading(false); // Hide loading state
        }
    };

    const ProfileCard = ({ profileData }: { profileData: { avatar: string, nickname: string } }) => {
        return (
            <View style={styles.profileCard}>
                <Image
                    source={{ uri: profileData.avatar }}
                    style={styles.profileImage}
                />
                <View style={styles.profileTextContainer}>
                    <ThemedText style={styles.profileName}>{profileData.nickname}</ThemedText>
                </View>
                <TouchableOpacity 
                    onPress={() => buttonAlert(profileData)} 
                    style={styles.addProfile}
                    activeOpacity={0.7}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <ThemedText>Add profile</ThemedText>
                </TouchableOpacity>
            </View>
        );
    };

    const renderFooter = () => {
        if(loading) return null;
        if (!isLoadingMore) return null;
        return (
            <View style={styles.loadingMoreContainer}>
                <ActivityIndicator size="small" color="white" />
                <Text style={styles.loadingMoreText}>Loading more friends...</Text>
            </View>
        );
    };

    return (
        <FlatList
            data={friends}
            renderItem={({ item }) => <ProfileCard profileData={item} />}
            keyExtractor={(item, index) => item.nickname + index}
            onEndReached={loadMoreFriends}
            onEndReachedThreshold={0.5}
            ListFooterComponent={renderFooter}
            ListEmptyComponent={
                loading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="white" />
                        <Text style={styles.loadingText}>Loading...</Text>
                        {showLongLoadingMessage && (
                            <Text style={styles.longLoadingText}>
                                Looks like this person has a lot of friends added
                            </Text>
                        )}
                    </View>
                ) : null
            }
            style={styles.background}
            contentContainerStyle={{ paddingBottom: 100 }}
        />
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
        paddingBottom: 50,
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
    },
    longLoadingText: {
        marginTop: 10,
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.7)',
        fontStyle: 'italic'
    },
    loadingMoreContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 20,
    },
    loadingMoreText: {
        marginLeft: 10,
        color: 'white',
        fontSize: 14,
    }
});
