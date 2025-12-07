import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Download, FileText, Calendar, Moon, Heart, CheckCircle } from 'lucide-react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import api from '../services/api';

interface ExportDataScreenProps {
  onNavigateBack?: () => void;
}

export const ExportDataScreen: React.FC<ExportDataScreenProps> = ({ onNavigateBack }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState({
    period: true,
    mood: true,
    sleep: true,
  });

  const toggleType = (type: keyof typeof selectedTypes) => {
    setSelectedTypes(prev => ({ ...prev, [type]: !prev[type] }));
  };

  const fetchData = async () => {
    const data: any = { exportDate: new Date().toISOString() };

    if (selectedTypes.period) {
      try {
        const response = await api.get('/api/period/entries');
        data.periodEntries = response.data;
      } catch (e) { data.periodEntries = []; }
    }

    if (selectedTypes.mood) {
      try {
        const response = await api.get('/api/mood/entries');
        data.moodEntries = response.data;
      } catch (e) { data.moodEntries = []; }
    }

    if (selectedTypes.sleep) {
      try {
        const response = await api.get('/api/sleep/entries');
        data.sleepEntries = response.data;
      } catch (e) { data.sleepEntries = []; }
    }

    return data;
  };

  const handleExport = async () => {
    const anySelected = Object.values(selectedTypes).some(v => v);
    if (!anySelected) {
      Alert.alert('Select Data', 'Please select at least one data type to export.');
      return;
    }

    setIsExporting(true);
    try {
      const data = await fetchData();
      const jsonString = JSON.stringify(data, null, 2);
      
      // Check if we have any data
      const hasData = (data.periodEntries?.length > 0) || 
                      (data.moodEntries?.length > 0) || 
                      (data.sleepEntries?.length > 0);
      
      if (!hasData) {
        Alert.alert('No Data', 'No data found to export. Start tracking to have data to export!');
        setIsExporting(false);
        return;
      }

      const fileName = `pcos_tracker_export_${new Date().toISOString().split('T')[0]}.json`;
      const filePath = `${FileSystem.cacheDirectory}${fileName}`;

      await FileSystem.writeAsStringAsync(filePath, jsonString, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(filePath, {
          mimeType: 'application/json',
          dialogTitle: 'Export PCOS Tracker Data',
          UTI: 'public.json',
        });
        Alert.alert('Success', 'Data exported successfully!');
      } else {
        Alert.alert('Export Complete', 'Data has been prepared but sharing is not available on this device.');
      }
    } catch (error: any) {
      console.error('Export error:', error);
      Alert.alert('Export Failed', error?.message || 'Unable to export data. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const DataTypeCard: React.FC<{
    icon: React.ReactNode;
    title: string;
    subtitle: string;
    selected: boolean;
    onToggle: () => void;
    color: string;
  }> = ({ icon, title, subtitle, selected, onToggle, color }) => (
    <TouchableOpacity
      onPress={onToggle}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        padding: 16,
        borderRadius: 14,
        marginBottom: 12,
        borderWidth: 2,
        borderColor: selected ? color : 'transparent',
      }}
    >
      <View style={{ width: 48, height: 48, borderRadius: 12, backgroundColor: color + '20', justifyContent: 'center', alignItems: 'center' }}>
        {icon}
      </View>
      <View style={{ flex: 1, marginLeft: 14 }}>
        <Text style={{ fontSize: 16, fontWeight: '600', color: '#1F2937' }}>{title}</Text>
        <Text style={{ fontSize: 13, color: '#6B7280', marginTop: 2 }}>{subtitle}</Text>
      </View>
      <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: selected ? color : '#E5E7EB', justifyContent: 'center', alignItems: 'center' }}>
        {selected && <CheckCircle size={16} color="white" />}
      </View>
    </TouchableOpacity>
  );


  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' }}>
        <TouchableOpacity onPress={onNavigateBack} style={{ padding: 4 }}>
          <ArrowLeft size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={{ fontSize: 18, fontWeight: '600', color: '#1F2937', marginLeft: 12 }}>Export Data</Text>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20 }}>
        {/* Info Card */}
        <View style={{ backgroundColor: '#EDE9FE', borderRadius: 14, padding: 16, marginBottom: 24 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <FileText size={20} color="#7C3AED" />
            <Text style={{ fontSize: 14, fontWeight: '600', color: '#5B21B6', marginLeft: 8 }}>Your Data, Your Control</Text>
          </View>
          <Text style={{ fontSize: 13, color: '#6D28D9', marginTop: 8, lineHeight: 18 }}>
            Export your health data as a JSON file. You can use this to backup your data or share it with your healthcare provider.
          </Text>
        </View>

        {/* Data Types */}
        <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 12 }}>Select data to export</Text>

        <DataTypeCard
          icon={<Calendar size={24} color="#EC4899" />}
          title="Period Data"
          subtitle="Cycle history, symptoms, flow"
          selected={selectedTypes.period}
          onToggle={() => toggleType('period')}
          color="#EC4899"
        />

        <DataTypeCard
          icon={<Heart size={24} color="#F59E0B" />}
          title="Mood Data"
          subtitle="Mood logs, energy levels, notes"
          selected={selectedTypes.mood}
          onToggle={() => toggleType('mood')}
          color="#F59E0B"
        />

        <DataTypeCard
          icon={<Moon size={24} color="#3B82F6" />}
          title="Sleep Data"
          subtitle="Sleep duration, quality, patterns"
          selected={selectedTypes.sleep}
          onToggle={() => toggleType('sleep')}
          color="#3B82F6"
        />

        {/* Export Button */}
        <TouchableOpacity
          onPress={handleExport}
          disabled={isExporting}
          style={{
            backgroundColor: isExporting ? '#F9A8D4' : '#EC4899',
            borderRadius: 14,
            padding: 18,
            alignItems: 'center',
            flexDirection: 'row',
            justifyContent: 'center',
            marginTop: 12,
          }}
        >
          {isExporting ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <Download size={20} color="white" />
              <Text style={{ color: 'white', fontSize: 16, fontWeight: '600', marginLeft: 8 }}>Export Selected Data</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Privacy Note */}
        <Text style={{ fontSize: 12, color: '#9CA3AF', textAlign: 'center', marginTop: 16, lineHeight: 16 }}>
          Your exported data is stored locally and only shared when you choose to share it.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};
