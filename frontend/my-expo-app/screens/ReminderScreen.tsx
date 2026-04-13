import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput, Modal, Switch, ActivityIndicator, Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Plus, Bell, Pill, Apple, Trash2, Clock, X } from 'lucide-react-native';
import { Reminder, getReminders, createReminder, deleteReminder, toggleReminder } from '../services/reminderService';
import { scheduleReminderNotification, cancelReminderNotifications, requestNotificationPermissions } from '../services/notificationService';
import { useThemedStyles } from '../hooks/useThemedStyles';

interface ReminderScreenProps {
  onNavigateBack?: () => void;
}

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const DAY_MAP: Record<string, string> = {
  'Mon': 'monday', 'Tue': 'tuesday', 'Wed': 'wednesday', 'Thu': 'thursday',
  'Fri': 'friday', 'Sat': 'saturday', 'Sun': 'sunday'
};

export const ReminderScreen: React.FC<ReminderScreenProps> = ({ onNavigateBack }) => {
  const { colors } = useThemedStyles();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newReminder, setNewReminder] = useState({
    type: 'supplement' as 'food' | 'supplement' | 'medication',
    name: '',
    description: '',
    time: '08:00',
    days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
  });

  useEffect(() => {
    requestNotificationPermissions();
    loadReminders();
  }, []);

  const loadReminders = async () => {
    try {
      const data = await getReminders();
      setReminders(data);
      
      // Re-schedule notifications for all active reminders
      for (const reminder of data) {
        if (reminder.isActive) {
          await scheduleReminderNotification(
            reminder.id,
            reminder.name,
            reminder.type,
            reminder.time,
            reminder.days
          );
        }
      }
    } catch (error) {
      console.error('Error loading reminders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!newReminder.name.trim()) {
      Alert.alert('Error', 'Please enter a name');
      return;
    }
    try {
      const created = await createReminder(newReminder);
      setReminders([...reminders, created]);
      
      // Schedule notification for this reminder
      await scheduleReminderNotification(
        created.id,
        created.name,
        created.type,
        created.time,
        created.days
      );
      
      setShowModal(false);
      setNewReminder({ type: 'supplement', name: '', description: '', time: '08:00', 
        days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] });
      
      Alert.alert('Success', `Reminder created! You'll be notified at ${created.time}`);
    } catch (error) {
      Alert.alert('Error', 'Failed to create reminder');
    }
  };

  const handleDelete = async (id: string) => {
    Alert.alert('Delete Reminder', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try {
          await deleteReminder(id);
          await cancelReminderNotifications(id);
          setReminders(reminders.filter(r => r.id !== id));
        } catch (error) {
          Alert.alert('Error', 'Failed to delete');
        }
      }}
    ]);
  };

  const handleToggle = async (id: string) => {
    try {
      const updated = await toggleReminder(id);
      setReminders(reminders.map(r => r.id === id ? updated : r));
      
      // Schedule or cancel notifications based on active status
      if (updated.isActive) {
        await scheduleReminderNotification(updated.id, updated.name, updated.type, updated.time, updated.days);
      } else {
        await cancelReminderNotifications(updated.id);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update');
    }
  };

  const toggleDay = (day: string) => {
    const dayKey = DAY_MAP[day];
    setNewReminder(prev => ({
      ...prev,
      days: prev.days.includes(dayKey) 
        ? prev.days.filter(d => d !== dayKey)
        : [...prev.days, dayKey]
    }));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'food': return <Apple size={20} color="#22C55E" />;
      case 'supplement': return <Pill size={20} color="#8B5CF6" />;
      case 'medication': return <Pill size={20} color="#EC4899" />;
      default: return <Bell size={20} color="#6B7280" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'food': return '#DCFCE7';
      case 'supplement': return '#EDE9FE';
      case 'medication': return '#FCE7F3';
      default: return '#F3F4F6';
    }
  };


  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16, backgroundColor: colors.card, borderBottomWidth: 1, borderBottomColor: colors.border }}>
        <TouchableOpacity onPress={onNavigateBack} style={{ padding: 4 }}>
          <ArrowLeft size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={{ fontSize: 18, fontWeight: '600', color: colors.textPrimary }}>Reminders</Text>
        <TouchableOpacity onPress={() => setShowModal(true)} style={{ backgroundColor: colors.primary, borderRadius: 20, padding: 8 }}>
          <Plus size={20} color="white" />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20 }}>
          {reminders.length === 0 ? (
            <View style={{ alignItems: 'center', paddingTop: 60 }}>
              <Bell size={48} color={colors.textMuted} />
              <Text style={{ fontSize: 16, color: colors.textSecondary, marginTop: 16 }}>No reminders yet</Text>
              <Text style={{ fontSize: 14, color: colors.textMuted, marginTop: 4 }}>Tap + to add your first reminder</Text>
            </View>
          ) : (
            reminders.map(reminder => (
              <View key={reminder.id} style={{ backgroundColor: colors.card, borderRadius: 16, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                    <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: getTypeColor(reminder.type), justifyContent: 'center', alignItems: 'center' }}>
                      {getIcon(reminder.type)}
                    </View>
                    <View style={{ marginLeft: 12, flex: 1 }}>
                      <Text style={{ fontSize: 16, fontWeight: '600', color: colors.textPrimary }}>{reminder.name}</Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                        <Clock size={14} color={colors.textMuted} />
                        <Text style={{ fontSize: 13, color: colors.textSecondary, marginLeft: 4 }}>{reminder.time}</Text>
                        <Text style={{ fontSize: 12, color: colors.textMuted, marginLeft: 8 }}>
                          {reminder.days.length === 7 ? 'Everyday' : reminder.days.map(d => d.slice(0, 3)).join(', ')}
                        </Text>
                      </View>
                    </View>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Switch value={reminder.isActive} onValueChange={() => handleToggle(reminder.id)} trackColor={{ false: colors.border, true: colors.periodLight }} thumbColor={reminder.isActive ? colors.primary : colors.textMuted} />
                    <TouchableOpacity onPress={() => handleDelete(reminder.id)} style={{ marginLeft: 8, padding: 8 }}>
                      <Trash2 size={18} color={colors.error} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))
          )}
        </ScrollView>
      )}

      {/* Add Modal */}
      <Modal visible={showModal} animationType="slide" transparent>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: colors.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '80%' }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <Text style={{ fontSize: 20, fontWeight: '700', color: colors.textPrimary }}>New Reminder</Text>
              <TouchableOpacity onPress={() => setShowModal(false)}><X size={24} color={colors.textSecondary} /></TouchableOpacity>
            </View>

            {/* Type Selection */}
            <Text style={{ fontSize: 14, fontWeight: '600', color: colors.textPrimary, marginBottom: 8 }}>Type</Text>
            <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
              {(['supplement', 'food', 'medication'] as const).map(type => (
                <TouchableOpacity key={type} onPress={() => setNewReminder({ ...newReminder, type })}
                  style={{ flex: 1, paddingVertical: 12, borderRadius: 12, backgroundColor: newReminder.type === type ? colors.primary : colors.borderLight, alignItems: 'center' }}>
                  <Text style={{ fontSize: 13, fontWeight: '500', color: newReminder.type === type ? 'white' : colors.textSecondary, textTransform: 'capitalize' }}>{type}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Name */}
            <Text style={{ fontSize: 14, fontWeight: '600', color: colors.textPrimary, marginBottom: 8 }}>Name</Text>
            <TextInput
              style={{ backgroundColor: colors.borderLight, borderRadius: 12, padding: 14, fontSize: 15, marginBottom: 16, borderWidth: 1, borderColor: colors.border, color: colors.textPrimary }}
              placeholder="e.g., Vitamin D, Breakfast"
              placeholderTextColor={colors.textMuted}
              value={newReminder.name}
              onChangeText={text => setNewReminder({ ...newReminder, name: text })}
            />

            {/* Time */}
            <Text style={{ fontSize: 14, fontWeight: '600', color: colors.textPrimary, marginBottom: 8 }}>Time</Text>
            <TextInput
              style={{ backgroundColor: colors.borderLight, borderRadius: 12, padding: 14, fontSize: 15, marginBottom: 16, borderWidth: 1, borderColor: colors.border, color: colors.textPrimary }}
              placeholder="HH:MM (e.g., 08:00)"
              placeholderTextColor={colors.textMuted}
              value={newReminder.time}
              onChangeText={text => setNewReminder({ ...newReminder, time: text })}
            />

            {/* Days */}
            <Text style={{ fontSize: 14, fontWeight: '600', color: colors.textPrimary, marginBottom: 8 }}>Days</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 }}>
              {DAYS.map(day => (
                <TouchableOpacity key={day} onPress={() => toggleDay(day)}
                  style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: newReminder.days.includes(DAY_MAP[day]) ? colors.primary : colors.borderLight, justifyContent: 'center', alignItems: 'center' }}>
                  <Text style={{ fontSize: 12, fontWeight: '600', color: newReminder.days.includes(DAY_MAP[day]) ? 'white' : colors.textSecondary }}>{day}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity onPress={handleCreate} style={{ backgroundColor: colors.primary, borderRadius: 12, paddingVertical: 16, alignItems: 'center' }}>
              <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>Create Reminder</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};
