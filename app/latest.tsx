import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, View, Text, ScrollView, Image } from 'react-native';
import { useRoute } from '@react-navigation/native';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { ThemedText } from '@/components/ThemedText';

export default function Latest() {
  const apiKey = process.env.EXPO_PUBLIC_FACEIT_APP_API_KEY;
  const route = useRoute();
  const { matchData } = route.params;
  const [matchStats, setMatchStats] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    axios.get(`https://open.faceit.com/data/v4/matches/${matchData.match_id}/stats`, {
      headers: { Authorization: `Bearer ${apiKey}` }
    })
      .then(response => {
        setMatchStats(response.data);
      })
      .catch(err => {
        console.log(err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const statKeyMapping = {
    "Kills": "Kills",
    "Assists": "Assists",
    "Deaths": "Deaths",
    "K/D Ratio": "K/D Ratio",
    "K/R Ratio": "K/R Ratio",
    "Headshots": "Headshots",
    "Headshots %": "Headshots %",
    "MVPs": "MVPs",
    "Triple Kills": "Triple Kills",
    "Quadro Kills": "Quadro Kills",
    "Penta Kills": "Penta Kills"
  };


  if (isLoading) {
    return <Text>Loading ...</Text>;
  } else {
    const team1Players = matchStats.rounds[0].teams[0].players;
    const team2Players = matchStats.rounds[0].teams[1].players;

    if (matchData.teams.faction1.avatar == "") {
      faction1Avatar = "https://media.istockphoto.com/id/1337144146/sv/vektor/default-avatar-profile-icon-vector.jpg?s=612x612&w=0&k=20&c=GXVOqN9-6nUrgmK2thaQuTtf1bpxUMCEUvNlun-uX7g="
    } else {
      var faction1Avatar = matchData.teams.faction1.avatar
    }

    if (matchData.teams.faction2.avatar == "") {
      faction2Avatar = "https://media.istockphoto.com/id/1337144146/sv/vektor/default-avatar-profile-icon-vector.jpg?s=612x612&w=0&k=20&c=GXVOqN9-6nUrgmK2thaQuTtf1bpxUMCEUvNlun-uX7g="
    } else {
      var faction2Avatar = matchData.teams.faction2.avatar
    }



    // Sort players by the number of kills in descending order
    team1Players.sort((a, b) => b.player_stats.Kills - a.player_stats.Kills);
    team2Players.sort((a, b) => b.player_stats.Kills - a.player_stats.Kills);

    const playerStatsTitles = ["Kills", "Assists", "Deaths", "K/D Ratio", "K/R Ratio", "Headshots", "Headshots %", "MVPs", "Triple Kills", "Quadro Kills", "Penta Kills"];
    return (
      <ScrollView style={styles.background}>
        <View style={styles.headerImage}>
          <View style={styles.mainContainer}>
            <View style={({ alignItems: "center" })}>
              <Image
                source={{ uri: faction1Avatar }}
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 50,
                  marginBottom: 5
                }}
              />
              <ThemedText type='defaultSemiBold'>{matchStats.rounds[0].teams[0].team_stats.Team}</ThemedText>
              {matchStats.rounds[0].teams[0].team_stats["Team Win"] == 1 && (
                <ThemedText type='defaultSemiBold' style={{ color: "green" }}>Won</ThemedText>
              )}
              {matchStats.rounds[0].teams[0].team_stats["Team Win"] == 0 && (
                <ThemedText type='defaultSemiBold' style={{ color: "red" }}>Lost</ThemedText>
              )}
            </View>
            <View style={{ marginHorizontal: 20 }}>
              <ThemedText type='default'>{matchStats.rounds[0].round_stats.Score.replace(/\//g, "-")}</ThemedText>
            </View>
            <View style={({ alignItems: "center" })}>
              <Image
                source={{ uri: faction2Avatar }}
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 50,
                  marginBottom: 5
                }}
              />
              <ThemedText type='defaultSemiBold'>{matchStats.rounds[0].teams[1].team_stats.Team}</ThemedText>
              {matchStats.rounds[0].teams[1].team_stats["Team Win"] == 1 && (
                <ThemedText type='defaultSemiBold' style={{ color: "green" }}>Won</ThemedText>
              )}
              {matchStats.rounds[0].teams[1].team_stats["Team Win"] == 0 && (
                <ThemedText type='defaultSemiBold' style={{ color: "red" }}>Lost</ThemedText>
              )}
            </View>
          </View>
          <View style={styles.mainContainer}>
            <ThemedText type='defaultSemiBold'>Map: </ThemedText>
            <ThemedText type='subtitle'>{matchStats.rounds[0].round_stats.Map}</ThemedText>
          </View>
        </View>

        {/* FIRST TEAM SCOREBOARD */}
        <ThemedText type='default' style={({ marginLeft: 10, marginBottom: 10 })}>{matchStats.rounds[0].teams[0].team_stats.Team}</ThemedText>
        <View style={{ flexDirection: "row", marginHorizontal: 10 }}>
          <View style={styles.playerColumn}>
            <ThemedText type='defaultSemiBold'>Player</ThemedText>
            {matchStats.rounds[0].teams[0].players.map((player, index) => (
              <ThemedText key={index} style={{ marginVertical: 10 }} type='defaultSemiBold'>
                {player.nickname}
              </ThemedText>
            ))}
          </View>
          <ScrollView horizontal={true} style={{ marginLeft: 10 }}>
            <View style={styles.scoreboardContainer}>
              {playerStatsTitles.map((title, index) => (
                <View key={index} style={styles.titleContainer}>
                  <ThemedText type='defaultSemiBold'>{title}</ThemedText>
                  {matchStats.rounds[0].teams[0].players.map((player, playerIndex) => (
                    <ThemedText key={playerIndex} style={{ marginVertical: 10 }} type='defaultSemiBold'>
                      {player.player_stats[statKeyMapping[title]]}
                    </ThemedText>
                  ))}
                </View>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* SECOND TEAM SCOREBOARD */}
        <ThemedText type='default' style={({ marginLeft: 10, marginBottom: 10, marginTop: 20 })}>{matchStats.rounds[0].teams[1].team_stats.Team}</ThemedText>
        <View style={{ flexDirection: "row", marginHorizontal: 10 }}>
          <View style={styles.playerColumn}>
            <ThemedText type='defaultSemiBold'>Player</ThemedText>
            {matchStats.rounds[0].teams[1].players.map((player, index) => (
              <ThemedText key={index} style={{ marginVertical: 10 }} type='defaultSemiBold'>
                {player.nickname}
              </ThemedText>
            ))}
          </View>
          <ScrollView horizontal={true} style={{ marginLeft: 10 }}>
            <View style={styles.scoreboardContainer}>
              {playerStatsTitles.map((title, index) => (
                <View key={index} style={styles.titleContainer}>
                  <ThemedText type='defaultSemiBold'>{title}</ThemedText>
                  {matchStats.rounds[0].teams[1].players.map((player, playerIndex) => (
                    <ThemedText key={playerIndex} style={{ marginVertical: 10 }} type='defaultSemiBold'>
                      {player.player_stats[statKeyMapping[title]]}
                    </ThemedText>
                  ))}
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  headerImage: {
    alignItems: 'center',
    paddingTop: 15,
  },
  playerColumn: {
    alignItems: 'flex-start',
    marginRight: 10,
  },
  playernames: {
    fontSize: 20,
    marginVertical: 10,
  },
  resultsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginVertical: 10,
  },
  scoreboardContainer: {
    flexDirection: 'row',
  },
  titleContainer: {
    marginHorizontal: 10,
    alignItems: 'center',
  },
  mainContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '90%',
    backgroundColor: '#444',
    padding: 10,
    marginVertical: 10,
    borderColor: '#444',
    borderWidth: 1,
    borderRadius: 10,
    justifyContent: "center",
  },
  background: {
    width: '100%',
    backgroundColor: '#262626',
  },
});
