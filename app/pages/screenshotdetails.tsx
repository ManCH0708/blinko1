import React, { useEffect } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useNavigation } from '@react-navigation/native';

const COLORS = {
  purple: '#8E72DC',
  purpleDark: '#6C4AB6',
  purpleLight: '#E6DEFA',
  gray: '#f0f0f0',
  grayDark: '#333',
  grayMedium: '#666',
  white: '#fff',
};

export default function ScreenshotDetails() {
  const navigation = useNavigation();
  
  useEffect(() => {
    navigation.setOptions?.({ headerShown: false });
  }, []);
  const params = useLocalSearchParams();

  // Log the params to check the data being passed
  console.log('Params received:', params);

  const imageUri = params.imageUri as string;
  const description = params.description as string;
  const description_en = params.description_en as string;
  const tagsParam = params.tags as string;
  const tagsEnParam = params.tags_en as string;
  const creationTime = parseInt(params.creationTime as string, 10); 
  const formattedDate = new Date(creationTime).toLocaleString();
  const language = params.language as 'fr' | 'en' || 'fr'; // récupère la langue passée

  // Parse tags based on the language passed from previous page
  let parsedTags: string[] = [];
  if (language === 'fr' && tagsParam) {
    parsedTags = tagsParam.startsWith('[')
      ? JSON.parse(tagsParam)
      : tagsParam.split(',').filter(Boolean);
  } else if (language === 'en' && tagsEnParam) {
    parsedTags = tagsEnParam.startsWith('[')
      ? JSON.parse(tagsEnParam)
      : tagsEnParam.split(',').filter(Boolean);
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16, marginTop: 32 }}>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 8, marginRight: 8 }}>
          <Text style={{ fontSize: 22, color: COLORS.purpleDark }}>←</Text>
        </TouchableOpacity>
        <Text style={{ fontSize: 18, fontWeight: 'bold', color: COLORS.purpleDark }}>Back</Text>
      </View>
      <Image 
        source={{ uri: imageUri }} 
        style={styles.image}
        resizeMode="contain"
      />
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Description</Text>
        <Text style={styles.descriptionText}>
          {language === 'fr' ? description : description_en}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tags</Text>
        <View style={styles.tagsContainer}>
          {parsedTags.map((tag, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Date</Text>
        <Text style={styles.descriptionText}>{formattedDate}</Text>
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: COLORS.gray,
    minHeight: '100%',
  },
  image: {
    width: '100%',
    height: 320,
    borderRadius: 18,
    marginBottom: 24,
    backgroundColor: COLORS.purpleLight,
    borderWidth: 2,
    borderColor: COLORS.purpleLight,
  },
  section: {
    marginBottom: 28,
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 16,
    shadowColor: COLORS.purpleDark,
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: COLORS.purpleDark,
    letterSpacing: 0.5,
  },
  descriptionText: {
    fontSize: 16,
    lineHeight: 24,
    color: COLORS.grayDark,
    fontWeight: '500',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  tag: {
    backgroundColor: COLORS.purpleLight,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 6,
    marginBottom: 6,
  },
  tagText: {
    color: COLORS.purpleDark,
    fontSize: 14,
    fontWeight: '600',
  },
});
