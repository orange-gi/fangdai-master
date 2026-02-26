import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { ChatMessage, RootStackParamList } from '../types';
import { chatService } from '../services/chat';
import { colors, spacing, radius, fontSize, shadow } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Chat'>;

export default function ChatScreen({ route }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const [chatId, setChatId] = useState<string | null>(route.params?.chatId || null);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    initChat();
  }, []);

  const initChat = async () => {
    if (chatId) {
      const history = await chatService.getHistory(chatId);
      if (history) {
        setMessages(history.messages);
        return;
      }
    }
    const chat = await chatService.createChat();
    setChatId(chat.id);

    const welcome: ChatMessage = {
      id: 'welcome',
      role: 'assistant',
      content: '您好！我是房产大师AI助手 🤖\n\n我可以帮您：\n• 💰 税务规划和咨询\n• 🏠 房产管理建议\n• 📄 证件管理提醒\n• 📚 政策解读分析\n\n请问有什么可以帮您的？',
      timestamp: new Date().toISOString(),
    };
    setMessages([welcome]);
  };

  const handleSend = async () => {
    if (!inputText.trim() || sending || !chatId) return;

    const text = inputText.trim();
    setInputText('');
    setSending(true);

    try {
      const userMsg = await chatService.sendMessage(chatId, text);
      setMessages(prev => [...prev, userMsg]);

      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);

      const aiMsg = await chatService.getAIResponse(chatId, text);
      setMessages(prev => [...prev, aiMsg]);

      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      console.error('发送消息失败:', error);
    } finally {
      setSending(false);
    }
  };

  const QUICK_QUESTIONS = [
    '美国房产税怎么交？',
    '怎么优化税务？',
    '海外房产政策有什么变化？',
    '购房贷款需要什么条件？',
  ];

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isUser = item.role === 'user';
    return (
      <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.aiBubble]}>
        {!isUser && (
          <View style={styles.aiAvatarContainer}>
            <Text style={styles.aiAvatar}>🤖</Text>
          </View>
        )}
        {isUser ? (
          <LinearGradient
            colors={[colors.accent.gold, colors.gradient.goldEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.messageContent, styles.userContent]}
          >
            <Text style={[styles.messageText, styles.userText]}>
              {item.content}
            </Text>
          </LinearGradient>
        ) : (
          <View style={[styles.messageContent, styles.aiContent]}>
            <Text style={[styles.messageText, styles.aiText]}>
              {item.content}
            </Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={90}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.messageList}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={
            sending ? (
              <View style={styles.typingIndicator}>
                <View style={styles.aiAvatarContainer}>
                  <Text style={styles.aiAvatar}>🤖</Text>
                </View>
                <View style={styles.typingDots}>
                  <ActivityIndicator size="small" color={colors.accent.jade} />
                  <Text style={styles.typingText}>正在思考...</Text>
                </View>
              </View>
            ) : messages.length <= 1 ? (
              <View style={styles.quickQuestions}>
                <Text style={styles.quickTitle}>常见问题</Text>
                {QUICK_QUESTIONS.map((q, i) => (
                  <TouchableOpacity
                    key={i}
                    style={styles.quickBtn}
                    activeOpacity={0.7}
                    onPress={() => { setInputText(q); }}
                  >
                    <Text style={styles.quickText}>{q}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : null
          }
        />

        <View style={styles.inputBar}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.textInput}
              placeholder="输入您的问题..."
              placeholderTextColor={colors.text.tertiary}
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={1000}
              onSubmitEditing={handleSend}
              blurOnSubmit={false}
            />
          </View>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleSend}
            disabled={!inputText.trim() || sending}
          >
            <LinearGradient
              colors={
                !inputText.trim() || sending
                  ? [colors.bg.card, colors.bg.card]
                  : [colors.accent.gold, colors.gradient.goldEnd]
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.sendBtn}
            >
              <Text style={[
                styles.sendBtnText,
                (!inputText.trim() || sending) && styles.sendBtnTextDisabled,
              ]}>
                发送
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg.primary,
  },
  keyboardView: {
    flex: 1,
  },
  messageList: {
    padding: spacing.lg,
    paddingBottom: spacing.sm,
  },
  messageBubble: {
    flexDirection: 'row',
    marginBottom: spacing.lg,
    alignItems: 'flex-start',
  },
  userBubble: {
    justifyContent: 'flex-end',
  },
  aiBubble: {
    justifyContent: 'flex-start',
  },
  aiAvatarContainer: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    backgroundColor: colors.bg.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  aiAvatar: {
    fontSize: 18,
  },
  messageContent: {
    maxWidth: '75%',
    borderRadius: radius.xl,
    padding: spacing.lg,
  },
  userContent: {
    borderBottomRightRadius: spacing.xs,
    ...shadow.card,
  },
  aiContent: {
    backgroundColor: colors.bg.card,
    borderBottomLeftRadius: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  messageText: {
    fontSize: fontSize.md,
    lineHeight: 24,
  },
  userText: {
    color: colors.text.inverse,
    fontWeight: '500',
  },
  aiText: {
    color: colors.text.primary,
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  typingDots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.bg.card,
    borderRadius: radius.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  typingText: {
    fontSize: fontSize.sm,
    color: colors.text.tertiary,
  },
  quickQuestions: {
    marginTop: spacing.sm,
    padding: spacing.xs,
  },
  quickTitle: {
    fontSize: fontSize.sm,
    color: colors.text.tertiary,
    marginBottom: spacing.md,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  quickBtn: {
    backgroundColor: colors.bg.card,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border.accent,
  },
  quickText: {
    fontSize: fontSize.sm,
    color: colors.accent.gold,
    fontWeight: '500',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.bg.secondary,
    borderTopWidth: 1,
    borderTopColor: colors.border.subtle,
    gap: spacing.sm,
  },
  inputWrapper: {
    flex: 1,
    backgroundColor: colors.bg.input,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border.medium,
    paddingHorizontal: spacing.lg,
  },
  textInput: {
    fontSize: fontSize.md,
    color: colors.text.primary,
    paddingVertical: spacing.md,
    maxHeight: 100,
  },
  sendBtn: {
    borderRadius: radius.xl,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  sendBtnText: {
    color: colors.text.inverse,
    fontSize: fontSize.md,
    fontWeight: '700',
  },
  sendBtnTextDisabled: {
    color: colors.text.tertiary,
  },
});
