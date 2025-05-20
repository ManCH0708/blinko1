import React, { useEffect, useState, useRef } from 'react';
import { 
  View, 
  Text, 
  Image, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView, 
  StatusBar, 
  ScrollView, 
  ActivityIndicator, 
  Platform, 
  Animated, 
  TextInput 
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { router } from 'expo-router';

const API_CONFIG = {
  baseUrl: Platform.select({
    ios: 'http://169.254.2.253:8080',
    android: 'http://10.0.2.2:8080',
    default: 'http://localhost:8080',
  }),
  endpoints: {
    register: '/register',
    profile: '/profile',
  },
};

const COLORS = {
  purple: '#8E72DC',
  purpleDark: '#6C4AB6',
  purpleLight: '#E6DEFA',
  purpleLighter: '#F5F0FF',
  gray: '#f0f0f0',
  grayMedium: '#D1D1D1',
  grayDark: '#333',
  white: '#fff',
  black: '#000',
  backdrop: 'rgba(0,0,0,0.03)',
};

export default function ProfileScreen() {
  const navigation = useNavigation();
  interface User {
    username: string;
    email: string;
    joined?: string;
    avatar?: string;
    phone?: string;
    birthday?: string;
    adresse?: string;
    screenshots?: number;
    audios?: number;
  }

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEdit, setShowEdit] = useState(false);
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    navigation.setOptions?.({ headerShown: false });
    // Appelle ton backend Java pour récupérer le profil
    fetch(`${API_CONFIG.baseUrl}/profile`, {
      method: 'GET',
    })
      .then(res => res.json())
      .then(data => setUser(data))
      .catch(err => {
        console.error('Erreur profil:', err);
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleEditPress = () => {
    setShowEdit(v => !v);
    Animated.timing(slideAnim, {
      toValue: showEdit ? 0 : 1,
      duration: 350,
      useNativeDriver: false,
    }).start();
  };

  const handleSave = async () => {
    const updatedData = {
      phone: user?.phone || '',
      birthday: user?.birthday || '',
      adresse: user?.adresse || '',
    };

    try {
      const response = await fetch(`${API_CONFIG.baseUrl}/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      });

      const result = await response.json();
      if (result.success) {
        alert('Profil mis à jour avec succès');
        setShowEdit(false); // Close the edit form
      } else {
        alert('Erreur : ' + result.message);
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil :', error);
      alert('Une erreur est survenue.');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.purpleDark} />
        <Text style={styles.loadingText}>Chargement du profil...</Text>
      </SafeAreaView>
    );
  }
  
  if (!user) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Image 
          source={{ uri: 'https://cdn-icons-png.flaticon.com/512/1684/1684375.png' }} 
          style={styles.errorIcon} 
        />
        <Text style={styles.errorText}>
          Erreur lors du chargement du profil
        </Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={() => {
            setLoading(true);
            // Re-attempt loading the profile
            fetch(`${API_CONFIG.baseUrl}/profile`, {
              method: 'GET',
            })
              .then(res => res.json())
              .then(data => setUser(data))
              .catch(err => {
                console.error('Erreur profil:', err);
                setUser(null);
              })
              .finally(() => setLoading(false));
          }}
        >
          <Text style={styles.retryButtonText}>Réessayer</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      
      {/* Header with back button */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.push('/home/Home')}
        >
          <Text style={styles.backButtonIcon}>←</Text>
          <Text style={styles.backButtonText}>Menu</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mon Profil</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.profileCard}>
          {/* Avatar and main info */}
          <View style={styles.profileHeader}>
            <Image
              source={{ uri: user.avatar || 'https://randomuser.me/api/portraits/men/1.jpg' }}
              style={styles.avatar}
            />
            <View style={styles.profileInfo}>
              <Text style={styles.username}>@{user.username}</Text>
              <Text style={styles.email}>{user.email}</Text>
              {user.joined && <Text style={styles.joined}>Membre depuis {user.joined}</Text>}
            </View>
          </View>

          {/* Stats cards */}
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{user.screenshots ?? 20}</Text>
              <Text style={styles.statLabel}>Captures</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{user.audios ?? 0}</Text>
              <Text style={styles.statLabel}>Audios</Text>
            </View>
          </View>

          {/* Contact info section */}
          {!showEdit && (
            <View style={styles.infoSection}>
              <Text style={styles.sectionTitle}>Informations</Text>
              <View style={styles.infoList}>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Téléphone</Text>
                  <Text style={styles.infoValue}>{user.phone || '–'}</Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Date de naissance</Text>
                  <Text style={styles.infoValue}>{user.birthday || '–'}</Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Adresse</Text>
                  <Text style={styles.infoValue}>{user.adresse || '–'}</Text>
                </View>
              </View>
            </View>
          )}
        </View>

        {/* Edit profile button */}
        <TouchableOpacity 
          style={[styles.editButton, showEdit && styles.cancelButton]} 
          onPress={handleEditPress}
        >
          <Text style={styles.buttonText}>
            {showEdit ? 'Annuler' : 'Modifier le profil'}
          </Text>
        </TouchableOpacity>

        {/* Edit form animated container */}
        <Animated.View
          style={{
            overflow: 'hidden',
            height: slideAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 400], // Ajuste la hauteur pour inclure tout le formulaire
            }),
            opacity: slideAnim,
            marginTop: 8,
          }}
        >
          {showEdit && (
            <ScrollView contentContainerStyle={styles.editForm}>
              <Text style={styles.formTitle}>Modifier mes informations</Text>
              <TextInput
                style={styles.input}
                placeholder="Téléphone"
                value={user.phone}
                onChangeText={val => setUser({ ...user, phone: val })}
                placeholderTextColor={COLORS.grayMedium}
              />
              <TextInput
                style={styles.input}
                placeholder="Date de naissance"
                value={user.birthday}
                onChangeText={val => setUser({ ...user, birthday: val })}
                placeholderTextColor={COLORS.grayMedium}
              />
              <TextInput
                style={styles.input}
                placeholder="Adresse"
                value={user.adresse}
                onChangeText={val => setUser({ ...user, adresse: val })}
                placeholderTextColor={COLORS.grayMedium}
              />
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSave}
              >
                <Text style={styles.buttonText}>Enregistrer</Text>
              </TouchableOpacity>
            </ScrollView>
          )}
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.grayDark,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: 20,
  },
  errorIcon: {
    width: 80,
    height: 80,
    marginBottom: 20,
    tintColor: '#FF6B6B',
  },
  errorText: {
    fontSize: 18,
    color: '#FF6B6B',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: COLORS.purple,
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  retryButtonText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.purpleDark,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButtonIcon: {
    fontSize: 24,
    color: COLORS.purple,
    marginRight: 4,
  },
  backButtonText: {
    fontSize: 16,
    color: COLORS.purple,
    fontWeight: '500',
  },
  headerSpacer: {
    width: 70, // To balance the header
  },
  scrollContent: {
    paddingBottom: 30,
  },
  profileCard: {
    backgroundColor: COLORS.white,
    borderRadius: 15,
    marginHorizontal: 16,
    marginTop: 16,
    padding: 20,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 3,
    borderColor: COLORS.purple,
  },
  profileInfo: {
    marginLeft: 16,
    flex: 1,
  },
  username: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.purpleDark,
    marginBottom: 4,
  },
  email: {
    fontSize: 15,
    color: COLORS.grayDark,
    marginBottom: 4,
  },
  joined: {
    fontSize: 13,
    color: COLORS.purple,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.purpleLighter,
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.purpleDark,
  },
  statLabel: {
    fontSize: 14,
    color: COLORS.purpleDark,
    marginTop: 4,
  },
  infoSection: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.purpleDark,
    marginBottom: 12,
  },
  infoList: {
    backgroundColor: COLORS.purpleLighter,
    borderRadius: 12,
    overflow: 'hidden',
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.white,
  },
  infoLabel: {
    fontSize: 15,
    color: COLORS.grayDark,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 15,
    color: COLORS.purpleDark,
    fontWeight: '500',
  },
  editButton: {
    backgroundColor: COLORS.purple,
    paddingVertical: 15,
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 16,
    shadowColor: COLORS.purpleDark,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 2,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: COLORS.grayDark,
  },
  buttonText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 16,
  },
  editForm: {
    backgroundColor: COLORS.white,
    borderRadius: 15,
    padding: 20,
    marginHorizontal: 16,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.purpleDark,
    marginBottom: 16,
  },
  input: {
    backgroundColor: COLORS.purpleLighter,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.purpleLight,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 12,
    fontSize: 16,
    color: COLORS.grayDark,
  },
  saveButton: {
    backgroundColor: COLORS.purpleDark,
    paddingVertical: 14,
    borderRadius: 10,
    marginTop: 8,
    alignItems: 'center',
  },
});