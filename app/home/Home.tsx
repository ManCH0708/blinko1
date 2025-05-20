import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  Dimensions,
  ScrollView,
  Image,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons, Feather } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  return (
    <ImageBackground
      source={require('@/assets/images/background_home.jpg')}
      style={styles.background}
      resizeMode="cover"
    >
      {/* Wave buttons */}
      
      <View style={styles.topButtonsRow}>
        <TouchableOpacity style={styles.waveBtnBottomLeft}
          onPress={() => router.push('/pages/capturephoto')}>
          <Feather name="menu" size={28} color="black" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.waveBtnBottomRight}>
          <Feather name="search" size={28} color="black" />
        </TouchableOpacity>
      </View>
<      View style={styles.bottomButtonsRow}>
        <TouchableOpacity style={styles.waveBtnTopLeft}
        onPress={() => router.push('/pages/profil')}>
          <Ionicons name="person-circle-outline" size={28} color="black" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.waveBtnTopRight}>
          <Ionicons name="settings-outline" size={28} color="black" />
        </TouchableOpacity>
      </View>
      {/* Central Capture button */}
      <View style={styles.centerContainer}>
        <TouchableOpacity style={styles.captureButton}>
          <Ionicons name="camera" size={40} color="#fff" />
          <Text style={styles.captureText}>Capture</Text>
        </TouchableOpacity>
      </View>

      {/* Recent section */}
      <View style={styles.recentContainer}>
        <Text style={styles.recentText}>Recent</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {[1, 2, 3, 4].map((item, index) => (
            <View key={index} style={styles.recentItem}>
              <Image
                source={require('@/assets/images/icon.png')} // replace with dynamic images later
                style={styles.recentImage}
              />
            </View>
          ))}
        </ScrollView>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    paddingTop: 60,
  },
  topButtonsRow: {
    position: 'absolute',
    top: 40,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  bottomButtonsRow: {
    position: 'absolute',
    bottom: 40,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,

  },
  waveBtnTopLeft: {
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderTopLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  waveBtnTopRight: {
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderTopRightRadius: 30,
    borderBottomLeftRadius: 30,
  },
  waveBtnBottomLeft: {
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderTopLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  waveBtnBottomRight: {
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderTopRightRadius: 30,
    borderBottomLeftRadius: 30,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    bottom: 100,
  },
  captureButton: {
    backgroundColor: '#8E72DC',
    paddingVertical: 20,
    paddingHorizontal: 40,
    borderRadius: 50,
    alignItems: 'center',
    elevation: 4,
  },
  captureText: {
    marginTop: 8,
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  recentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 30,
    bottom: 200,
  },
  recentText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E1E2C',
    marginBottom: 10,
  },
  recentItem: {
    marginRight: 15,
    borderRadius: 16,
    overflow: 'hidden',
  },
  recentImage: {
    width: 90,
    height: 90,
    borderRadius: 16,
  },
});