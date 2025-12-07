import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, ActivityIndicator, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, User, Check, Camera } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import api from '../services/api';

interface EditProfileScreenProps {
  onNavigateBack?: () => void;
  onProfileUpdated?: () => void;
}

const PROFILE_IMAGE_KEY = 'profile_image';

export const EditProfileScreen: React.FC<EditProfileScreenProps> = ({
  onNavigateBack,
  onProfileUpdated,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadUserData();
    loadProfileImage();
  }, []);

  const loadUserData = async () => {
    try {
      setIsLoading(true);
      const storedUser = await AsyncStorage.getItem('userData');
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        setName(userData.name || '');
        setEmail(userData.email || '');
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadProfileImage = async () => {
    try {
      const savedImage = await AsyncStorage.getItem(PROFILE_IMAGE_KEY);
      if (savedImage) {
        setProfileImage(savedImage);
      }
    } catch (error) {
      console.error('Error loading profile image:', error);
    }
  };

  const pickImage = async () => {
    // Request permission
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow access to your photos to change your profile picture.');
      return;
    }

    // Show options
    Alert.alert(
      'Change Profile Photo',
      'Choose an option',
      [
        {
          text: 'Take Photo',
          onPress: takePhoto,
        },
        {
          text: 'Choose from Library',
          onPress: chooseFromLibrary,
        },
        {
          text: 'Remove Photo',
          onPress: removePhoto,
          style: 'destructive',
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow camera access to take a photo.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled && result.assets[0]) {
      const imageUri = result.assets[0].uri;
      setProfileImage(imageUri);
      await AsyncStorage.setItem(PROFILE_IMAGE_KEY, imageUri);
    }
  };

  const chooseFromLibrary = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled && result.assets[0]) {
      const imageUri = result.assets[0].uri;
      setProfileImage(imageUri);
      await AsyncStorage.setItem(PROFILE_IMAGE_KEY, imageUri);
    }
  };

  const removePhoto = async () => {
    setProfileImage(null);
    await AsyncStorage.removeItem(PROFILE_IMAGE_KEY);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Name cannot be empty');
      return;
    }

    try {
      setIsSaving(true);
      
      // Update profile on backend
      await api.put('/api/auth/profile', { name: name.trim() });
      
      // Update local storage
      const storedUser = await AsyncStorage.getItem('userData');
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        userData.name = name.trim();
        await AsyncStorage.setItem('userData', JSON.stringify(userData));
      }

      Alert.alert('Success', 'Profile updated successfully', [
        { text: 'OK', onPress: () => {
          onProfileUpdated?.();
          onNavigateBack?.();
        }}
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'U';
  };

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#F9FAFB', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#EC4899" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={onNavigateBack} style={{ padding: 4, marginRight: 12 }}>
            <ArrowLeft size={24} color="#1F2937" />
          </TouchableOpacity>
          <Text style={{ fontSize: 18, fontWeight: '600', color: '#1F2937' }}>Edit Profile</Text>
        </View>
        <TouchableOpacity 
          onPress={handleSave} 
          disabled={isSaving}
          style={{ padding: 8 }}
        >
          {isSaving ? (
            <ActivityIndicator size="small" color="#EC4899" />
          ) : (
            <Check size={24} color="#EC4899" />
          )}
        </TouchableOpacity>
      </View>

      <View style={{ padding: 20 }}>
        {/* Avatar */}
        <View style={{ alignItems: 'center', marginBottom: 32 }}>
          <TouchableOpacity onPress={pickImage} activeOpacity={0.8}>
            <View style={{ width: 110, height: 110, borderRadius: 55, backgroundColor: '#EC4899', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' }}>
              {profileImage ? (
                <Image source={{ uri: profileImage }} style={{ width: 110, height: 110, borderRadius: 55 }} />
              ) : (
                <Text style={{ fontSize: 40, fontWeight: '700', color: 'white' }}>{getInitials(name)}</Text>
              )}
            </View>
            {/* Camera Icon Overlay */}
            <View style={{ position: 'absolute', bottom: 0, right: 0, width: 36, height: 36, borderRadius: 18, backgroundColor: '#EC4899', justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: '#F9FAFB' }}>
              <Camera size={18} color="white" />
            </View>
          </TouchableOpacity>
          <Text style={{ fontSize: 13, color: '#6B7280', marginTop: 12 }}>Tap to change photo</Text>
        </View>

        {/* Name Input */}
        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontSize: 13, fontWeight: '600', color: '#6B7280', marginBottom: 8, marginLeft: 4 }}>NAME</Text>
          <View style={{ backgroundColor: 'white', borderRadius: 14, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16 }}>
            <User size={20} color="#9CA3AF" />
            <TextInput
              style={{ flex: 1, paddingVertical: 16, paddingHorizontal: 12, fontSize: 16, color: '#1F2937' }}
              value={name}
              onChangeText={setName}
              placeholder="Enter your name"
              placeholderTextColor="#9CA3AF"
              autoCapitalize="words"
            />
          </View>
        </View>

        {/* Email (Read-only) */}
        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontSize: 13, fontWeight: '600', color: '#6B7280', marginBottom: 8, marginLeft: 4 }}>EMAIL</Text>
          <View style={{ backgroundColor: '#F3F4F6', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 16 }}>
            <Text style={{ fontSize: 16, color: '#6B7280' }}>{email}</Text>
          </View>
          <Text style={{ fontSize: 12, color: '#9CA3AF', marginTop: 6, marginLeft: 4 }}>Email cannot be changed</Text>
        </View>

        {/* Save Button */}
        <TouchableOpacity
          onPress={handleSave}
          disabled={isSaving}
          style={{
            backgroundColor: '#EC4899',
            borderRadius: 14,
            padding: 16,
            alignItems: 'center',
            marginTop: 20,
            opacity: isSaving ? 0.7 : 1,
          }}
        >
          {isSaving ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={{ fontSize: 16, fontWeight: '600', color: 'white' }}>Save Changes</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};
