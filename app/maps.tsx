import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, Image, View, Text, ScrollView, FlatList, TouchableOpacity } from 'react-native';
import { useRoute } from '@react-navigation/native';
import axios from 'axios';
import { useEffect, useState } from 'react';
import * as Progress from 'react-native-progress';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useNavigation, NavigationContainer } from '@react-navigation/native';

export default function Maps() {
  const apiKey = process.env.EXPO_PUBLIC_FACEIT_APP_API_KEY;
  const route = useRoute();
  const { mapData } = route.params;



  return (
    <ScrollView style={styles.background}>
      <View style={styles.headerImage}>
        <ThemedText type='title'>{mapData.label}</ThemedText>
        <Image
          source={{ uri: mapData.img_regular }}
          style={styles.mapImage}
        />
        <View style={styles.rowContainer}>
          <ThemedView style={styles.statsContainer}>
            <ThemedText type='default'>Matches</ThemedText>
            <ThemedText type='subtitle'>{mapData.stats.Matches}</ThemedText>
          </ThemedView>
          <ThemedView style={styles.statsContainer}>
            <ThemedText type='default'>Win Rate %</ThemedText>
            <ThemedText type='subtitle'>{mapData.stats["Win Rate %"]}</ThemedText>
          </ThemedView>
        </View>
        <View style={styles.rowContainer}>
          <ThemedView style={styles.statsContainer}>
            <ThemedText type='default'>Average Kills</ThemedText>
            <ThemedText type='subtitle'>{mapData.stats["Average Kills"]}</ThemedText>
          </ThemedView>
          <ThemedView style={styles.statsContainer}>
            <ThemedText type='default'>Average Deaths</ThemedText>
            <ThemedText type='subtitle'>{mapData.stats["Average Deaths"]}</ThemedText>
          </ThemedView>
        </View>
        <View style={styles.rowContainer}>
          <ThemedView style={styles.statsContainer}>
            <ThemedText type='default'>Average Assists</ThemedText>
            <ThemedText type='subtitle'>{mapData.stats["Average Assists"]}</ThemedText>
          </ThemedView>
          <ThemedView style={styles.statsContainer}>
            <ThemedText type='default'>Average K/D Ratio</ThemedText>
            <ThemedText type='subtitle'>{mapData.stats["Average K/D Ratio"]}</ThemedText>
          </ThemedView>
        </View>
        <View style={styles.rowContainer}>
          <ThemedView style={styles.statsContainer}>
            <ThemedText type='default'>Average K/R Ratio</ThemedText>
            <ThemedText type='subtitle'>{mapData.stats["Average K/R Ratio"]}</ThemedText>
          </ThemedView>
          <ThemedView style={styles.statsContainer}>
            <ThemedText type='default'>Headshots per Match</ThemedText>
            <ThemedText type='subtitle'>{mapData.stats["Headshots per Match"]}</ThemedText>
          </ThemedView>
        </View>
        <View style={styles.rowContainer}>
          <ThemedView style={styles.statsContainer}>
            <ThemedText type='default'>Average Headshot %</ThemedText>
            <ThemedText type='subtitle'>{mapData.stats["Average Headshots %"]}</ThemedText>
          </ThemedView>
          <ThemedView style={styles.statsContainer}>
            <ThemedText type='default'>Average Triple Kills</ThemedText>
            <ThemedText type='subtitle'>{mapData.stats["Average Triple Kills"]}</ThemedText>
          </ThemedView>
        </View>
        <View style={styles.rowContainer}>
          <ThemedView style={styles.statsContainer}>
            <ThemedText type='default'>Average Quadro Kills</ThemedText>
            <ThemedText type='subtitle'>{mapData.stats["Average Quadro Kills"]}</ThemedText>
          </ThemedView>
          <ThemedView style={styles.statsContainer}>
            <ThemedText type='default'>Average Penta Kills</ThemedText>
            <ThemedText type='subtitle'>{mapData.stats["Average Penta Kills"]}</ThemedText>
          </ThemedView>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    alignItems: 'center',
    paddingTop: 15,
  },
  resultsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginVertical: 10,
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
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
    width: '90%',
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
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 70,
  },
  statsContainer: {
    flexDirection: 'column',
    width: '45%', // Adjust width as needed
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
    width: "95%",
    height: 200,
    marginBottom: 20
  },
});
