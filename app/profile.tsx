import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, Image, View, Text, ScrollView, FlatList, TouchableOpacity, Linking } from 'react-native';
import { useRoute } from '@react-navigation/native';
import axios from 'axios';
import { useEffect, useState } from 'react';
import * as Progress from 'react-native-progress';

import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { skillLevelImages } from './(tabs)/index';
import { useNavigation, NavigationContainer } from '@react-navigation/native';

export default function Profile() {
  const apiKey = process.env.EXPO_PUBLIC_FACEIT_APP_API_KEY;
  const route = useRoute();
  const { profileData } = route.params;
  const skillLevel = profileData.games.cs2.skill_level;
  const levelImage = skillLevelImages[skillLevel];
  const [playerData, setPlayerData] = useState([]);
  const [matchData, setMatchData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigation = useNavigation();
  const skillLevelLimitsMax = {
    1: 500,
    2: 750,
    3: 900,
    4: 1050,
    5: 1200,
    6: 1350,
    7: 1530,
    8: 1750,
    9: 2000,
    10: 0,
  };
  const skillLevelLimitsMin = {
    1: 1,
    2: 501,
    3: 751,
    4: 901,
    5: 1051,
    6: 1201,
    7: 1351,
    8: 1531,
    9: 1751,
    10: 2001,
  };
  var levelLimitMax = skillLevelLimitsMax[skillLevel];
  var levelLimitMin = skillLevelLimitsMin[skillLevel]
  var progressPerc = (profileData.games.cs2.faceit_elo - levelLimitMin) / (levelLimitMax - levelLimitMin)
  if (levelLimitMax == 0) {
    levelLimitMax = "Max Level Reached 🔥"
    progressPerc = 1
  }


  useEffect(() => {
    axios.get(`https://open.faceit.com/data/v4/players/${profileData.player_id}/stats/cs2`, {
      headers: { Authorization: `Bearer ${apiKey}` }
    })
      .then(response => {
        setPlayerData(response.data);
      })
      .catch(err => {
        console.log(err);
      })
      .finally(() => {
        setIsLoading(false);
      });

    axios.get(`https://open.faceit.com/data/v4/players/${profileData.player_id}/history`, {
      headers: { Authorization: `Bearer ${apiKey}` }
    })
      .then(response => {
        setMatchData(response.data);
      })
      .catch(err => {
        console.log(err);
      })
  }, []);

  const renderResults = (results) => {
    return (
      <View style={styles.resultsRow}>
        {results.map((result, index) => (
          <Text key={index} style={{ color: result === '1' ? 'green' : 'red', fontSize: 24, fontWeight: 'bold', marginRight: 5 }}>
            {result === '1' ? 'W' : 'L'}
          </Text>
        ))}
      </View>
    );
  };

  const handlePress = async (url) => {
    // Check if the link is supported
    const supported = await Linking.canOpenURL(url);

    if (supported) {
      // Open the link
      await Linking.openURL(url);
    } else {
      console.log("Don't know how to open this URL: " + url);
    }
  };

  const navigateToMaps = (segment) => {
    navigation.navigate('maps', { mapData: segment });
  };

  const navigateToLatest = (items) => {
    navigation.navigate('latest', { matchData: items });
  };

  const renderMapItems = () => {
    if (!playerData.segments) return null;

    return playerData.segments.map((segment, index) => {
      const { label, img_regular, stats, } = segment;
      return (
        <TouchableOpacity key={index} onPress={() => navigateToMaps(segment)} style={styles.mapContainer}>
          {img_regular && <Image source={{ uri: img_regular }} style={styles.mapImage} />}
          <View style={styles.mapContentContainer}>
            <ThemedText type='subtitle' style={({ marginBottom: 5 })}>{label}</ThemedText>
            <ThemedText type='default'>{stats.Matches} Matches played</ThemedText>
            <ThemedText type='default'>{stats["Win Rate %"]}% Win Rate</ThemedText>
          </View>
        </TouchableOpacity>
      );
    });
  };


  function convertTimestampToReadableDate(timestamp) {
    // Convert the Unix timestamp to milliseconds
    const date = new Date(timestamp * 1000);

    // Options for formatting the date
    const options = {
      day: 'numeric',
      year: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    };

    // Use toLocaleDateString to format the date
    return date.toLocaleDateString('en-US', options);
  }

  const renderLatestMatches = () => {
    if (!matchData.items) return null;


    return matchData.items.map((items, index) => {
      var team
      var result
      const { started_at, results, teams } = items;

      if (teams.faction1.players.some(player => player.nickname === profileData.nickname)) {
        team = "faction1"

      }

      if (teams.faction2.players.some(player => player.nickname === profileData.nickname)) {
        team = "faction2"
      }
      if (team == results.winner) {
        result = result = <ThemedText type='subtitle' style={({ color: "green" })}>WIN   </ThemedText>
      }
      if (team != results.winner) {
        result = <ThemedText type='subtitle' style={({ color: "red" })}>LOSS</ThemedText>
      }



      return (
        <TouchableOpacity key={index} onPress={() => navigateToLatest(items)} style={styles.mapContainer}>
          <View style={({ flexDirection: "row" })}>
            <View style={({ paddingHorizontal: 30 })}>
              {result}
            </View>
            <ThemedText type='subtitle' style={({ marginBottom: 5 })}>{convertTimestampToReadableDate(started_at)}</ThemedText>
          </View>
        </TouchableOpacity>
      );
    });
  };






  if (isLoading) {
    return <Text>Loading ...</Text>;
  } else {
    return (
      <ScrollView style={styles.background}>
        <View style={styles.headerImage}>
          <Image
            source={{ uri: profileData.avatar }}
            style={styles.profileImage}
          />
          <ThemedText type="title" style={{ paddingTop: 20 }}>{profileData.nickname}</ThemedText>
          <View style={styles.socialIconsContainer}>
            <View style={styles.socialIcons}>
              <TouchableOpacity onPress={() => handlePress("https://steamcommunity.com//profiles/" + profileData.steam_id_64)}>
                <Image
                  source={require('@/assets/images/steam_icon.png')}
                  style={({
                    height: 35,
                    width: 35
                  })}
                />
              </TouchableOpacity>
            </View>
            <View style={styles.socialIcons}>
              <TouchableOpacity onPress={() => handlePress("https://www.faceit.com//en/players/" + profileData.nickname)}>
                <Image
                  source={require('@/assets/images/faceit_icon.png')}
                  style={({
                    height: 35,
                    width: 35
                  })}
                />
              </TouchableOpacity>
            </View>
          </View>
          <ThemedView style={styles.mainContainer}>
            <ThemedText type='default'>Recent results</ThemedText>
            {renderResults(playerData.lifetime["Recent Results"])}
          </ThemedView>
          <ThemedView style={styles.eloContainer}>
            <Image
              source={levelImage}
              style={styles.levelImage}
            />
            <View style={styles.eloContentContainer}>
              <ThemedText type='default'>Elo: <Text style={({ fontWeight: 'bold' })}>{profileData.games.cs2.faceit_elo}</Text> / {levelLimitMax}</ThemedText>
              <View style={styles.progressBarWrapper}>
                <Progress.Bar
                  progress={progressPerc}
                  animated={false}
                  color={"rgba(255, 95, 31, 1)"}
                  width={null}
                  height={12}
                  borderRadius={2}
                  unfilledColor={"rgba(255, 95, 31, 0.2)"}
                  style={styles.progressBar}
                />
                <Image
                  source={skillLevel == 10 ? "" : levelImage + 1}
                  style={styles.nextLevelImage}
                />
              </View>
            </View>
          </ThemedView>
        </View>
        <View style={styles.rowContainer}>
          <ThemedView style={styles.statsContainer}>
            <ThemedText type='default'>Matches</ThemedText>
            <ThemedText type='subtitle'>{playerData.lifetime.Matches}</ThemedText>
          </ThemedView>
          <ThemedView style={styles.statsContainer}>
            <ThemedText type='default'>Win Rate %</ThemedText>
            <ThemedText type='subtitle'>{playerData.lifetime["Win Rate %"]}</ThemedText>
          </ThemedView>
        </View>
        <View style={styles.rowContainer}>
          <ThemedView style={styles.statsContainer}>
            <ThemedText type='default'>Longest Win Streak</ThemedText>
            <ThemedText type='subtitle'>{playerData.lifetime["Longest Win Streak"]}</ThemedText>
          </ThemedView>
          <ThemedView style={styles.statsContainer}>
            <ThemedText type='default'>Average K/D Ratio</ThemedText>
            <ThemedText type='subtitle'>{playerData.lifetime["Average K/D Ratio"]}</ThemedText>
          </ThemedView>
        </View>
        <View style={({ alignItems: "center", marginTop: 15 })}>
          <ThemedText type='default'>Maps</ThemedText>
          {renderMapItems()}
        </View>
        <View style={({ alignItems: "center", marginTop: 15 })}>
          <ThemedText type='default'>Latest Matches</ThemedText>
          {renderLatestMatches()}
        </View>
      </ScrollView>

    );
  }
}

const styles = StyleSheet.create({
  headerImage: {
    alignItems: 'center'
  },
  resultsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginVertical: 10,
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
  eloContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '90%',
    backgroundColor: '#444',
    padding: 10,
    marginVertical: 10,
    borderColor: '#444',
    borderWidth: 1,
    borderRadius: 10,
  },
  eloContentContainer: {
    flexDirection: 'column',
    flex: 1,
    marginLeft: 10,
  },
  progressBarWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
    width: '100%',
    marginVertical: 10,
    paddingRight: 35
  },
  progressBar: {
    flex: 1,
  },
  nextLevelImage: {
    resizeMode: 'contain',
    height: 30,
    width: 30,
    position: 'absolute',
    right: 0,
    marginLeft: 10
  },
  levelImage: {
    resizeMode: 'contain',
    height: 45,
    width: 45,
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 0,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 70,
  },
  statsContainer: {
    flexDirection: 'column',
    width: '45%',
    backgroundColor: '#444',
    padding: 10,
    marginVertical: 10,
    borderColor: '#444',
    borderWidth: 1,
    borderRadius: 10,
  },
  background: {
    width: '100%',
    backgroundColor: '#262626',
  },
  mapContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    width: '95%',
    backgroundColor: '#444',
    padding: 10,
    marginVertical: 9,
    borderColor: '#444',
    borderWidth: 1,
    borderRadius: 10,
  },
  mapContentContainer: {
    flexDirection: "column",
    alignContent: "center"
  },
  mapImage: {
    width: 70,
    height: 70,
    resizeMode: 'cover',
    marginVertical: 5,
    marginRight: 20,
    borderRadius: 5
  },
  socialIconsContainer: {
    flexDirection: 'row',
  },
  socialIcons: {
    backgroundColor: "rgba(255, 95, 31, 0.8)",
    padding: 3,
    borderRadius: 6,
    flexDirection: 'row',
    marginHorizontal: 5
  }
});
