import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { AlertTriangle, Info, AlertCircle, Heart } from 'lucide-react-native';
import { SleepAlert, getAlertColor } from '../../services/sleepService';

interface SleepAlertCardProps {
  alert: SleepAlert;
  onDismiss?: () => void;
}

const getAlertIcon = (type: string, color: string) => {
  switch (type) {
    case 'low_sleep':
      return <AlertTriangle size={24} color={color} />;
    case 'cycle_impact':
      return <Heart size={24} color={color} />;
    case 'quality_drop':
      return <AlertCircle size={24} color={color} />;
    default:
      return <Info size={24} color={color} />;
  }
};

const getAlertBgColor = (severity: string): string => {
  switch (severity) {
    case 'alert':
      return '#FEF2F2';
    case 'warning':
      return '#FFFBEB';
    case 'info':
      return '#EEF2FF';
    default:
      return '#F9FAFB';
  }
};

const getAlertBorderColor = (severity: string): string => {
  switch (severity) {
    case 'alert':
      return '#FECACA';
    case 'warning':
      return '#FDE68A';
    case 'info':
      return '#C7D2FE';
    default:
      return '#E5E7EB';
  }
};

export default function SleepAlertCard({ alert, onDismiss }: SleepAlertCardProps) {
  const color = getAlertColor(alert.severity);
  const bgColor = getAlertBgColor(alert.severity);
  const borderColor = getAlertBorderColor(alert.severity);

  return (
    <View
      style={{
        backgroundColor: bgColor,
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: borderColor,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
        <View
          style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: color + '20',
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: 12,
          }}
        >
          {getAlertIcon(alert.type, color)}
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 15, fontWeight: '600', color: '#1F2937', marginBottom: 4 }}>
            {alert.title}
          </Text>
          <Text style={{ fontSize: 13, color: '#6B7280', lineHeight: 20, marginBottom: 8 }}>
            {alert.message}
          </Text>
          <View
            style={{
              backgroundColor: 'white',
              borderRadius: 10,
              padding: 12,
              borderWidth: 1,
              borderColor: borderColor,
            }}
          >
            <Text style={{ fontSize: 12, color: '#4B5563', lineHeight: 18 }}>
              💡 {alert.recommendation}
            </Text>
          </View>
        </View>
      </View>

      {alert.data && (
        <View
          style={{
            flexDirection: 'row',
            marginTop: 12,
            paddingTop: 12,
            borderTopWidth: 1,
            borderTopColor: borderColor,
          }}
        >
          {alert.data.averageSleep && (
            <View style={{ flex: 1, alignItems: 'center' }}>
              <Text style={{ fontSize: 18, fontWeight: '700', color: color }}>
                {(alert.data.averageSleep / 60).toFixed(1)}h
              </Text>
              <Text style={{ fontSize: 11, color: '#9CA3AF' }}>Your Average</Text>
            </View>
          )}
          {alert.data.targetSleep && (
            <View style={{ flex: 1, alignItems: 'center' }}>
              <Text style={{ fontSize: 18, fontWeight: '700', color: '#22C55E' }}>
                {(alert.data.targetSleep / 60).toFixed(1)}h
              </Text>
              <Text style={{ fontSize: 11, color: '#9CA3AF' }}>Recommended</Text>
            </View>
          )}
          {alert.data.daysAnalyzed && (
            <View style={{ flex: 1, alignItems: 'center' }}>
              <Text style={{ fontSize: 18, fontWeight: '700', color: '#6366F1' }}>
                {alert.data.daysAnalyzed}
              </Text>
              <Text style={{ fontSize: 11, color: '#9CA3AF' }}>Days Tracked</Text>
            </View>
          )}
        </View>
      )}

      {onDismiss && (
        <TouchableOpacity
          onPress={onDismiss}
          style={{
            position: 'absolute',
            top: 8,
            right: 8,
            padding: 4,
          }}
        >
          <Text style={{ fontSize: 16, color: '#9CA3AF' }}>✕</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
