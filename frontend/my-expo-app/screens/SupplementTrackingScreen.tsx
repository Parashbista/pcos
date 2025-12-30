import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  Plus,
  Check,
  X,
  Clock,
  Pill,
  TrendingUp,
  AlertTriangle,
  Sparkles,
  ChevronDown,
  Info,
} from 'lucide-react-native';
import * as supplementService from '../services/supplementService';
import {
  Supplement,
  SupplementAnalysis,
  TodayStatus,
  SUPPLEMENT_OPTIONS,
  INSTRUCTION_LABELS,
  FREQUENCY_LABELS,
  getConsistencyColor,
  ALERT_COLORS,
  SupplementName,
  IntakeInstruction,
} from '../services/supplementService';

interface SupplementTrackingScreenProps {
  onNavigateBack?: () => void;
}

export const SupplementTrackingScreen: React.FC<SupplementTrackingScreenProps> = ({
  onNavigateBack,
}) => {
  const [supplements, setSupplements] = useState<Supplement[]>([]);
  const [todayStatus, setTodayStatus] = useState<TodayStatus | null>(null);
  const [analysis, setAnalysis] = useState<SupplementAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);

  // New supplement form
  const [newSupplement, setNewSupplement] = useState({
    name: 'vitamin_d' as SupplementName,
    customName: '',
    dosage: '',
    frequency: 'daily',
    timeOfDay: ['08:00'],
    instruction: 'with_food' as IntakeInstruction,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [supps, status, analysisData] = await Promise.all([
        supplementService.getSupplements(true),
        supplementService.getTodayStatus(),
        supplementService.getSupplementAnalysis(),
      ]);
      setSupplements(supps);
      setTodayStatus(status);
      setAnalysis(analysisData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSupplement = async () => {
    if (!newSupplement.dosage.trim()) {
      Alert.alert('Error', 'Please enter dosage');
      return;
    }
    if (newSupplement.name === 'custom' && !newSupplement.customName.trim()) {
      Alert.alert('Error', 'Please enter supplement name');
      return;
    }

    try {
      await supplementService.createSupplement(newSupplement);
      setShowAddModal(false);
      setNewSupplement({
        name: 'vitamin_d',
        customName: '',
        dosage: '',
        frequency: 'daily',
        timeOfDay: ['08:00'],
        instruction: 'with_food',
      });
      loadData();
      Alert.alert('Success', 'Supplement added!');
    } catch (error) {
      Alert.alert('Error', 'Failed to add supplement');
    }
  };

  const handleLogIntake = async (supplement: Supplement, taken: boolean) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const option = SUPPLEMENT_OPTIONS.find((s) => s.name === supplement.name);
      const displayName =
        supplement.name === 'custom'
          ? supplement.customName || 'Custom'
          : option?.label || supplement.name;

      await supplementService.logSupplementIntake({
        supplementId: supplement.id,
        supplementName: displayName,
        date: today,
        taken,
        takenWithFood: supplement.instruction === 'with_food' || supplement.instruction === 'with_fat',
      });

      // Reload today's status
      const status = await supplementService.getTodayStatus();
      setTodayStatus(status);

      if (taken) {
        Alert.alert('Logged! ✓', `${displayName} marked as taken`);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to log intake');
    }
  };

  const getSupplementDisplay = (supplement: Supplement) => {
    const option = SUPPLEMENT_OPTIONS.find((s) => s.name === supplement.name);
    return {
      emoji: option?.emoji || '💊',
      label:
        supplement.name === 'custom'
          ? supplement.customName || 'Custom'
          : option?.label || supplement.name,
      pcosRelation: option?.pcosRelation || '',
    };
  };

  const renderTodayCard = () => {
    if (!todayStatus) return null;

    const progress = todayStatus.total > 0 ? (todayStatus.taken / todayStatus.total) * 100 : 0;

    return (
      <View
        style={{
          backgroundColor: 'rgba(255,255,255,0.15)',
          borderRadius: 16,
          padding: 16,
          marginTop: 20,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View>
            <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)' }}>Today's Progress</Text>
            <Text style={{ fontSize: 28, fontWeight: 'bold', color: 'white', marginTop: 4 }}>
              {todayStatus.taken}/{todayStatus.total}
            </Text>
          </View>
          <View
            style={{
              width: 60,
              height: 60,
              borderRadius: 30,
              backgroundColor: 'rgba(255,255,255,0.2)',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: 'bold', color: 'white' }}>
              {Math.round(progress)}%
            </Text>
          </View>
        </View>

        {/* Progress bar */}
        <View
          style={{
            height: 8,
            backgroundColor: 'rgba(255,255,255,0.2)',
            borderRadius: 4,
            marginTop: 12,
            overflow: 'hidden',
          }}
        >
          <View
            style={{
              height: '100%',
              width: `${progress}%`,
              backgroundColor: progress === 100 ? '#22C55E' : 'white',
              borderRadius: 4,
            }}
          />
        </View>

        {todayStatus.pending > 0 && (
          <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 8 }}>
            {todayStatus.pending} supplement{todayStatus.pending > 1 ? 's' : ''} remaining
          </Text>
        )}
      </View>
    );
  };

  const renderSupplementCard = (supplement: Supplement) => {
    const display = getSupplementDisplay(supplement);
    const isTaken = todayStatus?.supplements.find(
      (s) => s.name === display.label
    )?.taken;

    return (
      <View
        key={supplement.id}
        style={{
          backgroundColor: 'white',
          borderRadius: 16,
          padding: 16,
          marginBottom: 12,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 8,
          elevation: 2,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              backgroundColor: isTaken ? '#DCFCE7' : '#F3E8FF',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Text style={{ fontSize: 24 }}>{display.emoji}</Text>
          </View>

          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={{ fontSize: 16, fontWeight: '600', color: '#1F2937' }}>
              {display.label}
            </Text>
            <Text style={{ fontSize: 13, color: '#6B7280', marginTop: 2 }}>
              {supplement.dosage} • {FREQUENCY_LABELS[supplement.frequency]}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
              <Clock size={12} color="#9CA3AF" />
              <Text style={{ fontSize: 12, color: '#9CA3AF', marginLeft: 4 }}>
                {supplement.timeOfDay.join(', ')} • {INSTRUCTION_LABELS[supplement.instruction]}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={() => handleLogIntake(supplement, !isTaken)}
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: isTaken ? '#22C55E' : '#F3F4F6',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            {isTaken ? (
              <Check size={24} color="white" />
            ) : (
              <Plus size={24} color="#9CA3AF" />
            )}
          </TouchableOpacity>
        </View>

        {display.pcosRelation && (
          <View
            style={{
              backgroundColor: '#F3E8FF',
              borderRadius: 8,
              padding: 8,
              marginTop: 12,
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            <Info size={14} color="#8B5CF6" />
            <Text style={{ fontSize: 12, color: '#7C3AED', marginLeft: 6 }}>
              {display.pcosRelation}
            </Text>
          </View>
        )}
      </View>
    );
  };

  const renderAnalysisSection = () => {
    if (!analysis) return null;

    return (
      <View style={{ marginTop: 16 }}>
        {/* Overall Consistency */}
        <TouchableOpacity
          onPress={() => setShowAnalysis(!showAnalysis)}
          style={{
            backgroundColor: 'white',
            borderRadius: 16,
            padding: 16,
            marginBottom: 12,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 8,
            elevation: 2,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <TrendingUp size={20} color={getConsistencyColor(analysis.overallConsistency)} />
              <Text style={{ fontSize: 16, fontWeight: '600', color: '#1F2937', marginLeft: 8 }}>
                2-Week Consistency
              </Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: 'bold',
                  color: getConsistencyColor(analysis.overallConsistency),
                }}
              >
                {analysis.overallConsistency}%
              </Text>
              <ChevronDown
                size={20}
                color="#9CA3AF"
                style={{ marginLeft: 8, transform: [{ rotate: showAnalysis ? '180deg' : '0deg' }] }}
              />
            </View>
          </View>
        </TouchableOpacity>

        {/* Expanded Analysis */}
        {showAnalysis && (
          <>
            {/* Per-supplement consistency */}
            {analysis.supplements.map((supp) => (
              <View
                key={supp.supplementId}
                style={{
                  backgroundColor: 'white',
                  borderRadius: 12,
                  padding: 12,
                  marginBottom: 8,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <View>
                  <Text style={{ fontSize: 14, fontWeight: '500', color: '#1F2937' }}>
                    {supp.supplementName}
                  </Text>
                  <Text style={{ fontSize: 12, color: '#6B7280' }}>
                    {supp.takenDays}/{supp.totalDays} days • {supp.streak} day streak
                  </Text>
                </View>
                <View
                  style={{
                    backgroundColor: getConsistencyColor(supp.consistencyRate) + '20',
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                    borderRadius: 12,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: '600',
                      color: getConsistencyColor(supp.consistencyRate),
                    }}
                  >
                    {supp.consistencyRate}%
                  </Text>
                </View>
              </View>
            ))}

            {/* AI Recommendation */}
            {analysis.aiRecommendation && (
              <View
                style={{
                  backgroundColor: '#FDF4FF',
                  borderRadius: 16,
                  padding: 16,
                  marginTop: 8,
                  borderWidth: 1,
                  borderColor: '#F5D0FE',
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                  <Sparkles size={18} color="#A855F7" />
                  <Text style={{ fontSize: 14, fontWeight: '600', color: '#7C3AED', marginLeft: 8 }}>
                    AI Recommendation
                  </Text>
                </View>
                <Text style={{ fontSize: 13, color: '#6B21A8', lineHeight: 20 }}>
                  {analysis.aiRecommendation}
                </Text>
              </View>
            )}

            {/* Cycle Impact */}
            {analysis.cycleImpactInsight && (
              <View
                style={{
                  backgroundColor: '#FFF7ED',
                  borderRadius: 16,
                  padding: 16,
                  marginTop: 8,
                  borderWidth: 1,
                  borderColor: '#FED7AA',
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                  <Text style={{ fontSize: 16, marginRight: 8 }}>🌸</Text>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: '#C2410C' }}>
                    Cycle Impact
                  </Text>
                </View>
                <Text style={{ fontSize: 13, color: '#9A3412', lineHeight: 20 }}>
                  {analysis.cycleImpactInsight}
                </Text>
              </View>
            )}
          </>
        )}

        {/* Alerts */}
        {analysis.alerts.length > 0 && (
          <View style={{ marginTop: 8 }}>
            {analysis.alerts.slice(0, 3).map((alert, index) => (
              <View
                key={index}
                style={{
                  backgroundColor:
                    alert.severity === 'alert'
                      ? '#FEF2F2'
                      : alert.severity === 'warning'
                      ? '#FFFBEB'
                      : '#EEF2FF',
                  borderRadius: 12,
                  padding: 12,
                  marginBottom: 8,
                  borderLeftWidth: 4,
                  borderLeftColor: ALERT_COLORS[alert.severity],
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                  {alert.severity === 'alert' || alert.severity === 'warning' ? (
                    <AlertTriangle size={16} color={ALERT_COLORS[alert.severity]} />
                  ) : (
                    <Info size={16} color={ALERT_COLORS[alert.severity]} />
                  )}
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: '600',
                      color: '#1F2937',
                      marginLeft: 6,
                    }}
                  >
                    {alert.title}
                  </Text>
                </View>
                <Text style={{ fontSize: 12, color: '#6B7280', lineHeight: 18 }}>
                  {alert.recommendation}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>
    );
  };

  const renderAddModal = () => (
    <Modal visible={showAddModal} animationType="slide" transparent>
      <View
        style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}
      >
        <View
          style={{
            backgroundColor: 'white',
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            padding: 24,
            maxHeight: '85%',
          }}
        >
          <ScrollView showsVerticalScrollIndicator={false}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 20,
              }}
            >
              <Text style={{ fontSize: 20, fontWeight: '700', color: '#1F2937' }}>
                Add Supplement
              </Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <X size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {/* Supplement Selection */}
            <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 }}>
              Select Supplement
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
              {SUPPLEMENT_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.name}
                  onPress={() => setNewSupplement({ ...newSupplement, name: option.name })}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor:
                      newSupplement.name === option.name ? '#8B5CF6' : '#F3F4F6',
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    borderRadius: 20,
                  }}
                >
                  <Text style={{ fontSize: 14, marginRight: 4 }}>{option.emoji}</Text>
                  <Text
                    style={{
                      fontSize: 13,
                      color: newSupplement.name === option.name ? 'white' : '#374151',
                      fontWeight: newSupplement.name === option.name ? '600' : '400',
                    }}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Custom Name */}
            {newSupplement.name === 'custom' && (
              <>
                <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 }}>
                  Supplement Name
                </Text>
                <TextInput
                  style={{
                    backgroundColor: '#F9FAFB',
                    borderRadius: 12,
                    padding: 14,
                    fontSize: 15,
                    marginBottom: 16,
                    borderWidth: 1,
                    borderColor: '#E5E7EB',
                  }}
                  placeholder="Enter supplement name"
                  value={newSupplement.customName}
                  onChangeText={(text) =>
                    setNewSupplement({ ...newSupplement, customName: text })
                  }
                />
              </>
            )}

            {/* Dosage */}
            <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 }}>
              Dosage
            </Text>
            <TextInput
              style={{
                backgroundColor: '#F9FAFB',
                borderRadius: 12,
                padding: 14,
                fontSize: 15,
                marginBottom: 16,
                borderWidth: 1,
                borderColor: '#E5E7EB',
              }}
              placeholder="e.g., 1000 IU, 500mg"
              value={newSupplement.dosage}
              onChangeText={(text) => setNewSupplement({ ...newSupplement, dosage: text })}
            />

            {/* Frequency */}
            <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 }}>
              Frequency
            </Text>
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
              {Object.entries(FREQUENCY_LABELS).map(([key, label]) => (
                <TouchableOpacity
                  key={key}
                  onPress={() => setNewSupplement({ ...newSupplement, frequency: key })}
                  style={{
                    flex: 1,
                    paddingVertical: 10,
                    borderRadius: 12,
                    backgroundColor:
                      newSupplement.frequency === key ? '#8B5CF6' : '#F3F4F6',
                    alignItems: 'center',
                  }}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      color: newSupplement.frequency === key ? 'white' : '#4B5563',
                      fontWeight: newSupplement.frequency === key ? '600' : '400',
                    }}
                  >
                    {label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Time */}
            <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 }}>
              Time
            </Text>
            <TextInput
              style={{
                backgroundColor: '#F9FAFB',
                borderRadius: 12,
                padding: 14,
                fontSize: 15,
                marginBottom: 16,
                borderWidth: 1,
                borderColor: '#E5E7EB',
              }}
              placeholder="HH:MM (e.g., 08:00)"
              value={newSupplement.timeOfDay[0]}
              onChangeText={(text) =>
                setNewSupplement({ ...newSupplement, timeOfDay: [text] })
              }
            />

            {/* Instruction */}
            <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 }}>
              How to Take
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
              {Object.entries(INSTRUCTION_LABELS).map(([key, label]) => (
                <TouchableOpacity
                  key={key}
                  onPress={() =>
                    setNewSupplement({
                      ...newSupplement,
                      instruction: key as IntakeInstruction,
                    })
                  }
                  style={{
                    paddingHorizontal: 14,
                    paddingVertical: 10,
                    borderRadius: 12,
                    backgroundColor:
                      newSupplement.instruction === key ? '#8B5CF6' : '#F3F4F6',
                  }}
                >
                  <Text
                    style={{
                      fontSize: 13,
                      color: newSupplement.instruction === key ? 'white' : '#4B5563',
                      fontWeight: newSupplement.instruction === key ? '600' : '400',
                    }}
                  >
                    {label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              onPress={handleAddSupplement}
              style={{
                backgroundColor: '#8B5CF6',
                borderRadius: 12,
                paddingVertical: 16,
                alignItems: 'center',
                marginBottom: 20,
              }}
            >
              <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>
                Add Supplement
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View
          style={{
            backgroundColor: '#8B5CF6',
            paddingHorizontal: 20,
            paddingTop: 16,
            paddingBottom: 32,
            borderBottomLeftRadius: 32,
            borderBottomRightRadius: 32,
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              {onNavigateBack && (
                <TouchableOpacity
                  onPress={onNavigateBack}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginRight: 12,
                  }}
                >
                  <ArrowLeft size={20} color="white" />
                </TouchableOpacity>
              )}
              <View>
                <Text style={{ fontSize: 24, fontWeight: 'bold', color: 'white' }}>
                  Supplements
                </Text>
                <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 2 }}>
                  Track your PCOS supplements
                </Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={() => setShowAddModal(true)}
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: 'rgba(255,255,255,0.2)',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Plus size={20} color="white" />
            </TouchableOpacity>
          </View>

          {renderTodayCard()}
        </View>

        <View style={{ padding: 20, marginTop: -16 }}>
          {isLoading ? (
            <View
              style={{
                backgroundColor: 'white',
                borderRadius: 20,
                padding: 40,
                alignItems: 'center',
              }}
            >
              <ActivityIndicator size="large" color="#8B5CF6" />
            </View>
          ) : (
            <>
              {/* Supplements List */}
              {supplements.length === 0 ? (
                <View
                  style={{
                    backgroundColor: 'white',
                    borderRadius: 20,
                    padding: 32,
                    alignItems: 'center',
                  }}
                >
                  <Pill size={48} color="#D1D5DB" />
                  <Text
                    style={{ fontSize: 16, color: '#6B7280', marginTop: 16, fontWeight: '500' }}
                  >
                    No supplements yet
                  </Text>
                  <Text
                    style={{
                      fontSize: 14,
                      color: '#9CA3AF',
                      marginTop: 4,
                      textAlign: 'center',
                    }}
                  >
                    Add your PCOS supplements to track consistency
                  </Text>
                  <TouchableOpacity
                    onPress={() => setShowAddModal(true)}
                    style={{
                      backgroundColor: '#8B5CF6',
                      paddingHorizontal: 24,
                      paddingVertical: 12,
                      borderRadius: 12,
                      marginTop: 16,
                    }}
                  >
                    <Text style={{ color: 'white', fontWeight: '600' }}>Add Supplement</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <>
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: '600',
                      color: '#1F2937',
                      marginBottom: 12,
                      marginLeft: 4,
                    }}
                  >
                    Today's Supplements
                  </Text>
                  {supplements.map(renderSupplementCard)}
                </>
              )}

              {/* Analysis Section */}
              {supplements.length > 0 && renderAnalysisSection()}
            </>
          )}
        </View>
      </ScrollView>

      {renderAddModal()}
    </SafeAreaView>
  );
};
