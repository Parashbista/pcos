import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Send, Bot, User, Sparkles } from 'lucide-react-native';
import * as chatbotService from '../services/chatbotService';
import { ChatMessage } from '../services/chatbotService';
import { useThemedStyles } from '../hooks/useThemedStyles';

interface ChatbotScreenProps {
  onNavigateBack: () => void;
}

export const ChatbotScreen: React.FC<ChatbotScreenProps> = ({ onNavigateBack }) => {
  const { colors } = useThemedStyles();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    loadSuggestions();
    // Add welcome message
    const welcomeMessage: ChatMessage = {
      id: chatbotService.generateMessageId(),
      role: 'assistant',
      content: "Hi! I'm your PCOS health assistant 💜 I'm here to help answer your questions about PCOS, provide tips for managing symptoms, and offer support. How can I help you today?",
      timestamp: new Date(),
    };
    setMessages([welcomeMessage]);
  }, []);

  const loadSuggestions = async () => {
    const sug = await chatbotService.getSuggestions();
    setSuggestions(sug);
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: chatbotService.generateMessageId(),
      role: 'user',
      content: text.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);
    scrollToBottom();

    try {
      const response = await chatbotService.sendMessage(text.trim(), messages);

      if (response.success && response.response) {
        const assistantMessage: ChatMessage = {
          id: chatbotService.generateMessageId(),
          role: 'assistant',
          content: response.response,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        const errorMessage: ChatMessage = {
          id: chatbotService.generateMessageId(),
          role: 'assistant',
          content: "I'm sorry, I couldn't process your message right now. Please try again in a moment.",
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: chatbotService.generateMessageId(),
        role: 'assistant',
        content: "I'm having trouble connecting. Please check your internet connection and try again.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      scrollToBottom();
    }
  };

  const handleSuggestionPress = (suggestion: string) => {
    sendMessage(suggestion);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: colors.reminder,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
      }}>
        <TouchableOpacity
          onPress={onNavigateBack}
          style={{ padding: 8, marginRight: 8 }}
        >
          <ArrowLeft size={24} color="white" />
        </TouchableOpacity>
        <View style={{
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: 'rgba(255,255,255,0.2)',
          justifyContent: 'center',
          alignItems: 'center',
          marginRight: 12,
        }}>
          <Bot size={24} color="white" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 18, fontWeight: '600', color: 'white' }}>
            PCOS Assistant
          </Text>
          <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)' }}>
            AI-powered health support
          </Text>
        </View>
        <View style={{
          backgroundColor: 'rgba(255,255,255,0.2)',
          paddingHorizontal: 8,
          paddingVertical: 4,
          borderRadius: 8,
        }}>
          <Text style={{ fontSize: 10, fontWeight: '600', color: 'white' }}>AI</Text>
        </View>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        {/* Messages */}
        <ScrollView
          ref={scrollViewRef}
          style={{ flex: 1, paddingHorizontal: 16 }}
          contentContainerStyle={{ paddingVertical: 16 }}
          showsVerticalScrollIndicator={false}
        >
          {messages.map((message) => (
            <View
              key={message.id}
              style={{
                flexDirection: 'row',
                justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start',
                marginBottom: 12,
              }}
            >
              {message.role === 'assistant' && (
                <View style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: colors.reminderLight,
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginRight: 8,
                  marginTop: 4,
                }}>
                  <Bot size={18} color={colors.reminder} />
                </View>
              )}
              <View style={{
                maxWidth: '75%',
                backgroundColor: message.role === 'user' ? colors.primary : colors.card,
                borderRadius: 16,
                borderTopLeftRadius: message.role === 'assistant' ? 4 : 16,
                borderTopRightRadius: message.role === 'user' ? 4 : 16,
                padding: 12,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 4,
                elevation: 2,
              }}>
                <Text style={{
                  fontSize: 15,
                  color: message.role === 'user' ? 'white' : colors.textPrimary,
                  lineHeight: 22,
                }}>
                  {message.content}
                </Text>
                <Text style={{
                  fontSize: 10,
                  color: message.role === 'user' ? 'rgba(255,255,255,0.7)' : colors.textMuted,
                  marginTop: 4,
                  textAlign: 'right',
                }}>
                  {formatTime(message.timestamp)}
                </Text>
              </View>
              {message.role === 'user' && (
                <View style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: colors.primary,
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginLeft: 8,
                  marginTop: 4,
                }}>
                  <User size={18} color="white" />
                </View>
              )}
            </View>
          ))}

          {isLoading && (
            <View style={{ flexDirection: 'row', marginBottom: 12 }}>
              <View style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: colors.reminderLight,
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: 8,
              }}>
                <Bot size={18} color={colors.reminder} />
              </View>
              <View style={{
                backgroundColor: colors.card,
                borderRadius: 16,
                borderTopLeftRadius: 4,
                padding: 16,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 4,
                elevation: 2,
              }}>
                <ActivityIndicator size="small" color={colors.primary} />
              </View>
            </View>
          )}

          {/* Suggestions - show only when no user messages yet */}
          {messages.length <= 1 && suggestions.length > 0 && (
            <View style={{ marginTop: 8 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                <Sparkles size={16} color={colors.primary} />
                <Text style={{ fontSize: 14, fontWeight: '500', color: colors.textSecondary, marginLeft: 6 }}>
                  Suggested questions
                </Text>
              </View>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {suggestions.slice(0, 4).map((suggestion, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => handleSuggestionPress(suggestion)}
                    style={{
                      backgroundColor: colors.card,
                      borderRadius: 12,
                      paddingHorizontal: 14,
                      paddingVertical: 10,
                      borderWidth: 1,
                      borderColor: colors.reminderLight,
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.03,
                      shadowRadius: 2,
                      elevation: 1,
                    }}
                  >
                    <Text style={{ fontSize: 13, color: colors.reminder }}>{suggestion}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </ScrollView>

        {/* Input Area */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'flex-end',
          paddingHorizontal: 16,
          paddingVertical: 12,
          backgroundColor: colors.card,
          borderTopWidth: 1,
          borderTopColor: colors.border,
        }}>
          <TextInput
            style={{
              flex: 1,
              backgroundColor: colors.borderLight,
              borderRadius: 20,
              paddingHorizontal: 16,
              paddingVertical: 10,
              fontSize: 15,
              maxHeight: 100,
              color: colors.textPrimary,
            }}
            placeholder="Ask me anything about PCOS..."
            placeholderTextColor={colors.textMuted}
            value={inputText}
            onChangeText={setInputText}
            multiline
            editable={!isLoading}
          />
          <TouchableOpacity
            onPress={() => sendMessage(inputText)}
            disabled={!inputText.trim() || isLoading}
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: inputText.trim() && !isLoading ? colors.primary : colors.border,
              justifyContent: 'center',
              alignItems: 'center',
              marginLeft: 8,
            }}
          >
            <Send size={20} color="white" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
