import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  Image, 
  FlatList, 
  TouchableOpacity, 
  Platform, 
  Alert, 
  ActivityIndicator, 
  StyleSheet, 
  TextInput,
  SafeAreaView,
  StatusBar,
  ScrollView,
  SectionList
} from 'react-native';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';
import { router } from 'expo-router';
import { useNavigation } from '@react-navigation/native';


// Type definition for ScreenshotAsset
type ScreenshotAsset = MediaLibrary.Asset & {
  id: string;
  resolvedUri: string;
  isScreenshot?: boolean;
  tags?: string[] | string;
  description?: string;
  isAnalyzing?: boolean;
  creationTime?: number;
};

// Enhanced color palette with accessibility considerations
const COLORS = {
  // Primary colors
  primary: '#7953D2',        // Slightly adjusted purple, more vibrant
  primaryDark: '#5E35B1',    // Darker purple for contrast
  primaryLight: '#EDE7F6',   // Lighter purple for backgrounds

  // Additional purple shades for tags and FAB
  purple: '#7953D2',
  purpleLight: '#EDE7F6',
  purpleDark: '#5E35B1',
  
  // Secondary accent colors
  accent: '#4CAF50',         // Green for success states
  accentLight: '#E8F5E9',    // Light green background
  
  // Neutral colors
  white: '#FFFFFF',
  background: '#F9F9F9',     // Slightly off-white for main backgrounds
  card: '#FFFFFF',           // Pure white for cards
  
  // Text colors
  textPrimary: '#212121',    // Nearly black for primary text
  textSecondary: '#757575',  // Medium gray for secondary text
  textLight: '#BDBDBD',      // Light gray for disabled or hint text
  
  // Feedback colors
  error: '#F44336',          // Red for errors
  warning: '#FFC107',        // Amber for warnings
  success: '#4CAF50',        // Green for success
  
  // Utility colors
  divider: '#E0E0E0',        // Light gray for dividers
  overlay: 'rgba(33, 33, 33, 0.5)', // Semi-transparent overlay
};

// Spacing system for consistent layout
const SPACING = {
  xs: 4,
  s: 8,
  m: 16,
  l: 24,
  xl: 32,
  xxl: 48,
};

// Border radius system
const RADIUS = {
  xs: 4,
  s: 8,
  m: 12,
  l: 16,
  xl: 24,
  round: 9999,
};

// API configuration
export const API_CONFIG = {
  baseUrl: Platform.select({
    ios: 'http://169.254.2.253:8080', // Your local IP
    android: 'http://10.0.2.2:8080',
    default: 'http://localhost:8080'
  }),
  endpoints: {
    analyze: '/analyze'
  }
};



// Simple translation object for UI text
const t = {
  fr: {
    myScreenshots: 'Mes captures d\'écran',
    searchPlaceholder: 'Rechercher par tag...',
    all: 'Tous',
    year: 'Année',
    month: 'Mois',
    day: 'Jour',
  },
  en: {
    myScreenshots: 'My Screenshots',
    searchPlaceholder: 'Search by tag...',
    all: 'All',
    year: 'Year',
    month: 'Month',
    day: 'Day',
  },
};

const CapturePhotoScreen = () => {
  const navigation = useNavigation();

useEffect(() => {
  navigation.setOptions?.({ headerShown: false });
}, []);
  const [screenshots, setScreenshots] = useState<ScreenshotAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [search, setSearch] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [dateFilter, setDateFilter] = useState<'all' | 'year' | 'month' | 'day'>('all');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [language, setLanguage] = useState<'fr' | 'en'>('fr');

 

  // Enhanced screenshot detection
  const isScreenshot = (asset: MediaLibrary.Asset): boolean => {
    const filename = asset.filename?.toLowerCase() || '';
    const uri = asset.uri?.toLowerCase() || '';
    
    // Check filename for common screenshot patterns
    const hasScreenshotName = filename.includes('screenshot') || 
                              filename.includes('screen shot') ||
                              filename.startsWith('scr_') ||
                              filename.match(/^(img|image)_\d+/) !== null;
    
    // Check path for screenshot folders
    const inScreenshotFolder = uri.includes('/screenshots/') || 
                               uri.includes('/screen shots/') ||
                               uri.includes('/dcim/screenshots/');
    
    // For Android: additional directory checks
    if (Platform.OS === 'android') {
      return hasScreenshotName || inScreenshotFolder;
    }
    
    // Common screenshot dimensions (add more as needed)
    const isCommonScreenshotDimension = 
      (asset.width === 1284 && asset.height === 2778) || 
      (asset.width === 2778 && asset.height === 1284) ||
      (asset.width === 750 && asset.height === 1334) || 
      (asset.width === 1334 && asset.height === 750) ||
      (asset.width === 1080 && asset.height === 1920) || 
      (asset.width === 1920 && asset.height === 1080);
    
    // More flexible iOS detection
    return hasScreenshotName || inScreenshotFolder || isCommonScreenshotDimension;
  };

  // URI resolver with screenshot filtering
  const resolveAsset = async (asset: MediaLibrary.Asset): Promise<ScreenshotAsset | null> => {
    try {
      const assetInfo = await MediaLibrary.getAssetInfoAsync(asset.id);
      const resolvedUri = assetInfo.localUri || assetInfo.uri || asset.uri;

      // Get creation time from the original asset, not assetInfo
      const creationTime = asset.creationTime
        ? new Date(asset.creationTime).getTime() // Converts to timestamp (number)
        : Date.now(); // Fallback to current timestamp if not available
      
      // PNG filter check - automatic filtering
      const filename = asset.filename?.toLowerCase() || '';
      if (!filename.endsWith('.png')) {
        return null; // Skip non-PNG files
      }
      
      return {
        ...asset,
        resolvedUri,
        isScreenshot: isScreenshot(asset),
        creationTime: creationTime,
      };
    } catch (error) {
      console.warn(`Failed to resolve asset ${asset.id}:`, error);
      return null;
    }
  };

  // Load and filter screenshots
  const loadScreenshots = async () => {
    setLoading(true);
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      setPermissionGranted(status === 'granted');

      if (status === 'granted') {
        // First try to get the Screenshots album directly (works on Android)
        const screenshotAlbum = await MediaLibrary.getAlbumAsync('Screenshots');
        let assets: MediaLibrary.Asset[] = [];
        
        if (screenshotAlbum) {
          const result = await MediaLibrary.getAssetsAsync({ album: screenshotAlbum });
          assets = result.assets;
        } else {
          // Fallback: Get all photos and filter (required for iOS)
          const result = await MediaLibrary.getAssetsAsync({
            mediaType: MediaLibrary.MediaType.photo,
            first: 60, // or 30, or 20 for even faster load
            sortBy: ['creationTime'],
            createdAfter: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
          });
          assets = result.assets;
        }

        // Resolve and filter in parallel
        const resolvedAssets = (await Promise.all(assets.map(resolveAsset))).filter(
          (asset): asset is ScreenshotAsset => asset !== null
        );
        const filteredScreenshots = resolvedAssets.filter(asset => asset.isScreenshot);
        
        console.log(`Found ${filteredScreenshots.length} screenshots out of ${resolvedAssets.length} assets`);
        
        if (filteredScreenshots.length === 0 && resolvedAssets.length > 0) {
          setScreenshots(resolvedAssets.slice(0, 20));
          await analyzeAllUnanalyzed(resolvedAssets.slice(0, 20));
        } else {
          setScreenshots(filteredScreenshots);
          await analyzeAllUnanalyzed(filteredScreenshots);
        }
      }
    } catch (error) {
      console.error('Failed to load screenshots:', error);
      Alert.alert('Error', 'Could not load screenshots');
    } finally {
      setLoading(false);
    }
  };

  const analyzeScreenshot = async (asset: ScreenshotAsset, index: number) => {
    try {
      // 1. Show "analyzing" state in UI
      setScreenshots(prev => prev.map((item, i) =>
        i === index ? { ...item, isAnalyzing: true } : item
      ));

      // 2. Check if already analyzed
      const existing = await checkIfAnalyzed(asset.resolvedUri);
      if (existing && existing.description) {
        setScreenshots(prev => prev.map((item, i) =>
          i === index
            ? { ...item, description: existing.description, tags: existing.tags, isAnalyzing: false }
            : item
        ));

        // Always navigate to details page with the existing analysis
        router.navigate({
          pathname: '/pages/screenshotdetails',
          params: {
            imageUri: encodeURIComponent(asset.resolvedUri),
            description: language === 'fr' ? existing.description : existing.description_en,
            description_fr: existing.description,
            description_en: existing.description_en,
            tags: typeof existing.tags === 'string' ? existing.tags : JSON.stringify(existing.tags),
            tags_en: typeof existing.tags_en === 'string' ? existing.tags_en : JSON.stringify(existing.tags_en),
            creationTime: asset.creationTime,
            analysisData: JSON.stringify(existing),
            language,
          }
        });
        return;
      }

      // 3. Confirm image file exists
      const fileInfo = await FileSystem.getInfoAsync(asset.resolvedUri);
      if (!fileInfo.exists) {
        throw new Error('Image file not found');
      }

      // 4. Copy image to app storage to persist it
      const localCopyUri = FileSystem.documentDirectory + `screenshot_${Date.now()}.jpg`;
      await FileSystem.copyAsync({
        from: asset.resolvedUri,
        to: localCopyUri,
      });

      // 5. Prepare image for analysis (captioning)
      const formData = new FormData();
      formData.append('file', {
        uri: asset.resolvedUri,
        name: 'image.jpg',
        type: 'image/jpeg',
      } as any); // 'as any' avoids React Native TS warning

      const response = await fetch('http://169.254.2.253:8000/caption-image/', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          // DO NOT set Content-Type manually
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API error: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      const description_fr = result.caption_fr || 'Aucune légende générée';
      const description_en = result.caption || 'No caption generated';
      const tags =  result.tags_fr || [];
      const tags_en =  result.tags_en || [];

      console.log('Tags:', tags);
      console.log('Tags (EN):', tags_en);

      // 6. Save analysis to your Java backend with internal file path
      await saveAnalysis({
        imageUri: asset.resolvedUri, // <-- use the original screenshot URI!
        description: description_fr,
        description_en: description_en,
        tags: tags,      // ou tags: tags.join(',')
        tags_en: tags_en,   // ou tags_en: tags_en.join(',')
        creationTime: asset.creationTime,
      });

      // 7. Update UI
      setScreenshots(prev => prev.map((item, i) =>
        i === index
          ? { ...item, description: description_fr, tags, tags_en, isAnalyzing: false }
          : item
      ));

      // 8. Navigate to details screen
      router.navigate({
        pathname: '/pages/screenshotdetails',
        params: {
          imageUri: encodeURIComponent(localCopyUri),
          description: language === 'fr' ? description_fr : description_en,
          description_fr,
          description_en,
          tags: JSON.stringify(tags),
          tags_en: JSON.stringify(tags_en),
          creationTime: asset.creationTime,
          analysisData: JSON.stringify(result),
          language,
        }
      });

    } catch (error) {
      console.error('Analysis error:', error);
      setScreenshots(prev => prev.map((item, i) =>
        i === index ? {
          ...item,
          description: error instanceof Error ? error.message : 'Analysis failed',
          isAnalyzing: false
        } : item
      ));
    }
  };

  // Silent analysis without UI navigation
  const analyzeScreenshotSilently = async (asset: ScreenshotAsset, index: number) => {
    try {
      // 1. Show "analyzing" state in UI
      setScreenshots(prev => prev.map((item, i) =>
        i === index ? { ...item, isAnalyzing: true } : item
      ));

      // 2. Check if already analyzed
      const existing = await checkIfAnalyzed(asset.resolvedUri);
      if (existing && existing.description) {
        setScreenshots(prev => prev.map((item, i) =>
          i === index
            ? { ...item, description: existing.description, tags: existing.tags, isAnalyzing: false }
            : item
        ));
        return;
      }

      // 3. Confirm image file exists
      const fileInfo = await FileSystem.getInfoAsync(asset.resolvedUri);
      if (!fileInfo.exists) {
        throw new Error('Image file not found');
      }

      // 4. Prepare image for analysis (captioning)
      const formData = new FormData();
      formData.append('file', {
        uri: asset.resolvedUri,
        name: 'image.jpg',
        type: 'image/jpeg',
      } as any);

      const response = await fetch('http://169.254.2.253:8000/caption-image/', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API error: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      const description_fr = result.caption_fr || 'Aucune légende générée';
      const description_en = result.caption || 'No caption generated';
      const tags =  result.tags_fr || [];
      const tags_en =  result.tags_en || [];

      // 5. Save analysis to your backend
      await saveAnalysis({
        imageUri: asset.resolvedUri,
        description: description_fr,
        description_en: description_en,
        tags: tags,      
        tags_en: tags_en,  
        creationTime: asset.creationTime,
      });

      // 6. Update UI
      setScreenshots(prev => prev.map((item, i) =>
        i === index
          ? { ...item, description: description_fr, description_en, tags, tags_en, isAnalyzing: false }
          : item
      ));
    } catch (error) {
      console.error('Analysis error:', error);
      setScreenshots(prev => prev.map((item, i) =>
        i === index ? {
          ...item,
          description: error instanceof Error ? error.message : 'Analysis failed',
          isAnalyzing: false
        } : item
      ));
    }
  };

  // Check if already analyzed
  const checkIfAnalyzed = async (imageUri: string) => {
    try {
      const response = await fetch(
        `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.analyze}?imageUri=${encodeURIComponent(imageUri)}`
      );
      if (!response.ok) return null;
      const result = await response.json();
      // If not found, backend returns { alreadyAnalyzed: false }
      if (!result || result.alreadyAnalyzed === false) return null;
      return result; // { description, tags, ... }
    } catch (error) {
      console.error('CheckIfAnalyzed error:', error);
      return null;
    }
  };

  // Save analysis result to server
  const saveAnalysis = async (analysis: {
    imageUri: string;
    description: string;      // français
    description_en: string;   // anglais
    tags: string[] | string;
    tags_en?: string[] | string;
    creationTime?: number;
  }) => {
    try {
      await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.analyze}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...analysis,
          tags: Array.isArray(analysis.tags) ? analysis.tags.join(',') : (analysis.tags || ''),
          tags_en: Array.isArray(analysis.tags_en) ? analysis.tags_en.join(',') : (analysis.tags_en || ''),
        }),
      });
    } catch (error) {
      console.error('SaveAnalysis error:', error);
    }
  };

  const searchByTag = async (tag: string) => {
    setLoading(true);
    try {
      // 1. First verify we have permission
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        setPermissionGranted(false);
        throw new Error('Permission not granted');
      }
      setPermissionGranted(true);

      // 2. Get matching analyses from backend
      const response = await fetch(
        `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.analyze}?tag=${encodeURIComponent(tag)}`
      );
      
      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }
      
      const analysisResults = await response.json();
      console.log('Analysis results:', analysisResults);

      // 3. Get local assets safely
      let localAssets: MediaLibrary.Asset[] = [];
      try {
        const result = await MediaLibrary.getAssetsAsync({
          mediaType: MediaLibrary.MediaType.photo,
          first: 100 // Reduced for performance
        });
        localAssets = result.assets;
      } catch (error) {
        console.error('Failed to get local assets:', error);
        throw new Error('Could not load local photos');
      }

      // 4. Process assets with error handling
      const processAsset = async (asset: MediaLibrary.Asset): Promise<ScreenshotAsset | null> => {
        try {
          const resolved = await resolveAsset(asset);
          return resolved?.isScreenshot ? resolved : null;
        } catch (error) {
          console.warn(`Failed to process asset ${asset.id}:`, error);
          return null;
        }
      };

      // Process in batches to avoid memory issues
      const batchSize = 20;
      const localScreenshots: ScreenshotAsset[] = [];
      
      for (let i = 0; i < localAssets.length; i += batchSize) {
        const batch = localAssets.slice(i, i + batchSize);
        const results = await Promise.all(batch.map(processAsset));
        localScreenshots.push(...results.filter(Boolean) as ScreenshotAsset[]);
      }

      console.log('Found local screenshots:', localScreenshots.length);

      // 5. Match with analysis results safely
      const matchedScreenshots = localScreenshots.reduce((acc, screenshot) => {
        try {
          const analysis = analysisResults.find((a: { imageUri: string; tags?: string; tags_en?: string }) => 
            a.imageUri === screenshot.resolvedUri || 
            a.imageUri === screenshot.uri ||
            (a.imageUri && screenshot.resolvedUri?.includes(a.imageUri)) ||
            (a.imageUri && screenshot.uri?.includes(a.imageUri))
          );
          
          if (analysis) {
            const tagsField = language === 'fr'
              ? (Array.isArray(analysis.tags) ? analysis.tags : (typeof analysis.tags === 'string' ? analysis.tags.split(',') : []))
              : (Array.isArray(analysis.tags_en) ? analysis.tags_en : (typeof analysis.tags_en === 'string' ? analysis.tags_en.split(',') : []));
            acc.push({
              ...screenshot,
              description: language === 'fr' ? analysis.description : analysis.description_en,
              tags: tagsField,
            });
          }
        } catch (error) {
          console.warn('Error matching screenshot:', error);
        }
        return acc;
      }, [] as ScreenshotAsset[]);

      console.log('Matched screenshots:', matchedScreenshots.length);
      
      // 6. Update state
      setScreenshots(matchedScreenshots);

    } catch (error) {
      console.error('Search failed:', error);
      Alert.alert('Search Error', error instanceof Error ? error.message : 'Search failed');
      setScreenshots([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadScreenshots();
  }, []); // Only on mount

  useEffect(() => {
    if (search.trim()) {
      searchByTag(search.trim());
    }
  }, [search]);

  const refreshScreenshots = () => {
    Alert.alert(
      'Refresh Screenshots',
      Platform.select({
        ios: 'Take new screenshots with Side+Volume Up, then refresh',
        android: 'New screenshots will appear automatically'
      }),
      [
        { text: 'Refresh Now', onPress: loadScreenshots },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        {/* You can replace this with an icon component */}
        <Text style={{fontSize: 48, marginBottom: SPACING.m}}>📷</Text>
      </View>
      <Text style={styles.emptyTitle}>No PNG Screenshots Found</Text>
      <Text style={styles.emptyText}>
        {Platform.OS === 'ios'
          ? 'Take screenshots using Side+Volume Up, then tap Refresh'
          : 'Screenshots will appear here automatically'}
      </Text>
      <TouchableOpacity style={[styles.refreshButton, {marginTop: SPACING.l}]} onPress={loadScreenshots}>
        <Text style={styles.refreshButtonText}>Refresh Now</Text>
      </TouchableOpacity>
    </View>
  );

  const renderScreenshotItem = ({ item, index }: { item: ScreenshotAsset, index: number }) => (
    <TouchableOpacity
      style={styles.screenshotContainer}
      onPress={() => analyzeScreenshot(item, index)}
      disabled={item.isAnalyzing}
      activeOpacity={0.8}
    >
      <Image
        source={{ uri: item.resolvedUri }}
        style={styles.screenshot}
        resizeMode="cover"
      />
      
      {/* Show analyzing state with improved UI */}
      {item.isAnalyzing && (
        <View style={styles.overlay}>
          <ActivityIndicator size="small" color={COLORS.primary} />
          <Text style={styles.analyzingText}>Analyzing...</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const analyzeAllUnanalyzed = async (screenshots: ScreenshotAsset[]) => {
    // Limit concurrency to avoid server overload
    const concurrency = 3;
    let index = 0;

    const runBatch = async () => {
      while (index < screenshots.length) {
        const batch = screenshots.slice(index, index + concurrency);
        await Promise.all(
          batch.map((item, i) =>
            !item.description && !item.isAnalyzing
              ? analyzeScreenshotSilently(item, index + i)
              : Promise.resolve()
          )
        );
        index += concurrency;
      }
    };

    await runBatch();
  };

  const getFilteredScreenshots = () => {
    if (dateFilter === 'all') return screenshots;
    // For grouping, return all screenshots (no filter)
    return screenshots;
  };

  function groupScreenshotsByDate(screenshots: ScreenshotAsset[], filter: 'year' | 'month' | 'day') {
    const groups: { [key: string]: ScreenshotAsset[] } = {};
    screenshots.forEach(item => {
      if (!item.creationTime) return;
      const date = new Date(item.creationTime);
      let key = '';
      if (filter === 'year') {
        key = `${date.getFullYear()}`;
      } else if (filter === 'month') {
        key = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
      } else if (filter === 'day') {
        key = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
      }
      if (!groups[key]) groups[key] = [];
      groups[key].push(item);
    });
    // Sort groups by date descending
    return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]));
  }

  if (!permissionGranted) {
    return (
      <SafeAreaView style={styles.permissionContainer}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
        <View style={styles.permissionIconContainer}>
          {/* You can replace this with an icon component */}
          <Text style={{fontSize: 48, marginBottom: SPACING.m}}>🔒</Text>
        </View>
        <Text style={styles.permissionTitle}>Permission Required</Text>
        <Text style={styles.permissionText}>
          {Platform.OS === 'android'
            ? 'We need access to your Screenshots folder to help you organize your screenshots'
            : 'We need access to your Photos to find and analyze your screenshots'}
        </Text>
        <TouchableOpacity style={styles.permissionButton} onPress={loadScreenshots}>
          <Text style={styles.permissionButtonText}>Grant Access</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12, marginLeft: 8 }}>
        <TouchableOpacity onPress={() => router.push('/home/Home')}>
          <Text style={{ fontSize: 22, color: COLORS.primary, marginRight: 8 }}>←</Text>
        </TouchableOpacity>
        <Text style={{ fontSize: 18, fontWeight: 'bold', color: COLORS.primary }}>
          Retour au menu
        </Text>
      </View>
      
      <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginRight: 18, marginBottom: 4 }}>
        <TouchableOpacity onPress={() => setLanguage('fr')}>
          <Text style={{ color: language === 'fr' ? COLORS.primary : COLORS.textSecondary, marginRight: 12 }}>Français</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setLanguage('en')}>
          <Text style={{ color: language === 'en' ? COLORS.primary : COLORS.textSecondary }}>English</Text>
        </TouchableOpacity>
      </View>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.title}>{t[language].myScreenshots}</Text>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={refreshScreenshots}
          >
            {/* You can replace this with an icon component */}
            <Text style={{fontSize: 20, color: COLORS.primary}}>🔄</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={[
          styles.searchInput, 
          searchFocused && styles.searchInputFocused
        ]}>
          {/* You can replace this with an icon component */}
          <Text style={{marginRight: SPACING.s, color: COLORS.textSecondary}}>🔍</Text>
          <TextInput
            placeholder={t[language].searchPlaceholder}
            value={search}
            onChangeText={setSearch}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            style={{
              flex: 1,
              fontSize: 16,
              color: COLORS.textPrimary,
            }}
            placeholderTextColor={COLORS.textLight}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {search.length > 0 && (
            <TouchableOpacity 
              onPress={() => setSearch('')}
              style={{padding: SPACING.xs}}
            >
              {/* You can replace this with an icon component */}
              <Text style={{color: COLORS.textSecondary}}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Date Filter Buttons */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', margin: 12 }}>
        <TouchableOpacity onPress={() => setDateFilter('all')}>
          <Text style={{ color: dateFilter === 'all' ? COLORS.primary : COLORS.textSecondary }}>
            {t[language].all}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setDateFilter('year')}>
          <Text style={{ color: dateFilter === 'year' ? COLORS.primary : COLORS.textSecondary }}>
            {t[language].year}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setDateFilter('month')}>
          <Text style={{ color: dateFilter === 'month' ? COLORS.primary : COLORS.textSecondary }}>
            {t[language].month}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setDateFilter('day')}>
          <Text style={{ color: dateFilter === 'day' ? COLORS.primary : COLORS.textSecondary }}>
            {t[language].day}
          </Text>
        </TouchableOpacity>
      </View>

     
      

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Finding your screenshots...</Text>
        </View>
        ) : screenshots.length === 0 ? (
        renderEmptyState()
       ) : (
        ['year', 'month', 'day'].includes(dateFilter) ? (
          <SectionList
            sections={groupScreenshotsByDate(getFilteredScreenshots(), dateFilter as any).map(([group, items]) => ({
              title: dateFilter === 'year' ? group : 
                     dateFilter === 'month' ? new Date(group + '-01').toLocaleString(undefined, { month: 'long', year: 'numeric' }) :
                     new Date(group).toLocaleDateString(),
              data: [items],
            }))}
            keyExtractor={(item, index) => item.map(i => i.id).join(',') + index}
            renderSectionHeader={({ section: { title } }) => (
              <Text style={{
                fontWeight: 'bold',
                fontSize: 18,
                color: COLORS.primaryDark,
                marginBottom: 8,
                marginLeft: 4,
                marginTop: 16,
              }}>
                {title}
              </Text>
            )}
            renderItem={({ item }) => (
              <FlatList
                data={item}
                numColumns={3}
                keyExtractor={item => item.id}
                renderItem={renderScreenshotItem}
                scrollEnabled={false}
                contentContainerStyle={{ paddingBottom: 12 }}
              />
            )}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <FlatList
            data={getFilteredScreenshots()}
            numColumns={3}
            keyExtractor={(item) => String(item.id)}
            renderItem={renderScreenshotItem}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            refreshing={loading}
            onRefresh={loadScreenshots}
          />
        )
        )
      }
        
      </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.purpleLight,
    borderBottomWidth: 0,
    paddingBottom: SPACING.m,
    paddingTop: Platform.OS === 'ios' ? SPACING.l : SPACING.m,
    shadowColor: COLORS.purpleDark,
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.l,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.purpleDark,
    letterSpacing: 1,
  },
  actionButton: {
    padding: SPACING.s,
  },
  searchContainer: {
    paddingHorizontal: SPACING.l,
    paddingVertical: SPACING.m,
    backgroundColor: COLORS.purpleLight,
  },
  searchInput: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.l,
    borderWidth: 0,
    padding: SPACING.m,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: COLORS.purpleDark,
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  searchInputFocused: {
    borderColor: COLORS.primary,
    shadowOpacity: 0.16,
    elevation: 4,
  },
  listContainer: {
    padding: SPACING.s,
    paddingBottom: 100, // for FAB
  },
  screenshotContainer: {
    flex: 1 / 3,
    aspectRatio: 0.5,
    margin: SPACING.s,
    borderRadius: RADIUS.s, // Less rounded corners
    overflow: 'hidden',
    backgroundColor: COLORS.white,
    maxWidth: '31%',
    shadowColor: COLORS.purpleDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 5,
    borderWidth: 1,
    borderColor: COLORS.purpleLight,
  },
  screenshot: {
    width: '100%',
    height: '100%',
    borderRadius: RADIUS.s, // Less rounded corners
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(142,114,220,0.13)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  analyzingText: {
    fontSize: 13,
    color: COLORS.primaryDark,
    fontWeight: '700',
    marginTop: SPACING.s,
  },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 32,
    backgroundColor: COLORS.primary,
    borderRadius: 32,
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.purpleDark,
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 6,
  },
  fabIcon: {
    fontSize: 28,
    color: COLORS.white,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: SPACING.xl,
  },
  
  emptyIconContainer: {
    marginBottom: SPACING.m,
    alignItems: 'center',
  },
  
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: SPACING.s,
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  
  emptyText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    maxWidth: '80%',
    marginBottom: SPACING.l,
    lineHeight: 24,
  },
  
  refreshButton: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.m,
    paddingVertical: SPACING.m,
    paddingHorizontal: SPACING.l,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primaryDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.16,
    shadowRadius: 4,
    elevation: 4,
  },
  
  refreshButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
  
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: SPACING.xl,
  },
  
  permissionIconContainer: {
    marginBottom: SPACING.l,
    alignItems: 'center',
  },
  
  permissionTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: SPACING.m,
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  
  permissionText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
    maxWidth: '80%',
    lineHeight: 24,
  },
  
  permissionButton: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.m,
    paddingVertical: SPACING.m,
    paddingHorizontal: SPACING.xl,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primaryDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.16,
    shadowRadius: 4,
    elevation: 4,
    minWidth: 200,
  },
  
  permissionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
  
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  loadingText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginTop: SPACING.m,
  },
});

export default CapturePhotoScreen;
export const navigationOptions = { headerShown: false };

