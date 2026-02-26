import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
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

  useEffect(() => { initChat(); }, []);

  const initChat = async () => {
    if (chatId) {
      const history = await chatService.getHistory(chatId);
      if (history) { setMessages(history.messages); return; }
    }
    const chat = await chatService.createChat();
    setChatId(chat.id);

    const welcome: ChatMessage = {
      id: 'welcome',
      role: 'assistant',
      content: '您好！我是房产大师AI助手。\n\n我可以帮您：\n- 税务规划和咨询\n- 房产管理建议\n- 证件管理提醒\n- 政策解读分析\n\n请问有什么可以帮您的？',
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
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);

      const aiMsg = await chatService.getAIResponse(chatId, text);
      setMessages(prev => [...prev, aiMsg]);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
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
          <View style={styles.aiLabel}>
            <Text style={styles.aiLabelText}>AI</Text>
          </View>
        )}
        <View style={[styles.messageContent, isUser ? styles.userContent : styles.aiContent]}>
          <Text style={[styles.messageText, isUser ? styles.userText : styles.aiText]}>
            {item.content}
          </Text>
        </View>
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
              <View style={styles.typingRow}>
                <View style={styles.aiLabel}>
                  <Text style={styles.aiLabelText}>AI</Text>
                </View>
                <View style={styles.typingDots}>
                  <ActivityIndicator size="small" color={colors.accent.primary} />
                  <Text style={styles.typingText}>正在思考...</Text>
                </View>
              </View>
            ) : messages.length <= 1 ? (
              <View style={styles.quickSection}>
                <Text style={styles.quickTitle}>常见问题</Text>
                {QUICK_QUESTIONS.map((q, i) => (
                  <TouchableOpacity
                    key={i}
                    style={styles.quickChip}
                    activeOpacity={0.7}
                    onPress={() => setInputText(q)}
                  >
                    <Text style={styles.quickChipText}>{q}</Text>
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
            style={[styles.sendBtn, (!inputText.trim() || sending) && styles.sendBtnDisabled]}
            activeOpacity={0.7}
            onPress={handleSend}
            disabled={!inputText.trim() || sending}
          >
            <Text style={[styles.sendBtnText, (!inputText.trim() || sending) && styles.sendBtnTextDisabled]}>
              发送
            </Text>
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
  aiLabel: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
    backgroundColor: colors.accent.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  aiLabelText: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: colors.accent.primary,
  },
  messageContent: {
    maxWidth: '75%',
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  userContent: {
    backgroundColor: colors.accent.primary,
    borderBottomRightRadius: spacing.xs,
  },
  aiContent: {
    backgroundColor: colors.bg.card,
    borderBottomLeftRadius: spacing.xs,
    ...shadow.card,
  },
  messageText: {
    fontSize: fontSize.md,
    lineHeight: 24,
  },
  userText: {
    color: colors.text.inverse,
  },
  aiText: {
    color: colors.text.primary,
  },
  typingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  typingDots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.bg.card,
    borderRadius: radius.lg,
    padding: spacing.md,
    ...shadow.card,
  },
  typingText: {
    fontSize: fontSize.sm,
    color: colors.text.tertiary,
  },
  quickSection: {
    marginTop: spacing.sm,
    padding: spacing.xs,
  },
  quickTitle: {
    fontSize: fontSize.sm,
    color: colors.text.tertiary,
    marginBottom: spacing.md,
    fontWeight: '500',
  },
  quickChip: {
    backgroundColor: colors.bg.card,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  quickChipText: {
    fontSize: fontSize.sm,
    color: colors.accent.primary,
    fontWeight: '500',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.bg.card,
    borderTopWidth: 1,
    borderTopColor: colors.border.subtle,
    gap: spacing.sm,
  },
  inputWrapper: {
    flex: 1,
    backgroundColor: colors.bg.input,
    borderRadius: radius.lg,
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
    backgroundColor: colors.accent.primary,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  sendBtnDisabled: {
    backgroundColor: colors.bg.primary,
    borderWidth: 1,
    borderColor: colors.border.medium,
  },
  sendBtnText: {
    color: colors.text.inverse,
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  sendBtnTextDisabled: {
    color: colors.text.tertiary,
  },
});
