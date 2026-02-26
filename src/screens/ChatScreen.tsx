import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ChatMessage, RootStackParamList } from '../types';
import { chatService } from '../services/chat';

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
        {!isUser && <Text style={styles.aiAvatar}>🤖</Text>}
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
          ListFooterComponent={
            sending ? (
              <View style={styles.typingIndicator}>
                <Text style={styles.aiAvatar}>🤖</Text>
                <View style={styles.typingDots}>
                  <ActivityIndicator size="small" color="#4CAF50" />
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
          <TextInput
            style={styles.textInput}
            placeholder="输入您的问题..."
            placeholderTextColor="#999"
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={1000}
            onSubmitEditing={handleSend}
            blurOnSubmit={false}
          />
          <TouchableOpacity
            style={[styles.sendBtn, (!inputText.trim() || sending) && styles.sendBtnDisabled]}
            onPress={handleSend}
            disabled={!inputText.trim() || sending}
          >
            <Text style={styles.sendBtnText}>发送</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f2f5' },
  keyboardView: { flex: 1 },
  messageList: { padding: 16, paddingBottom: 8 },
  messageBubble: { flexDirection: 'row', marginBottom: 16, alignItems: 'flex-start' },
  userBubble: { justifyContent: 'flex-end' },
  aiBubble: { justifyContent: 'flex-start' },
  aiAvatar: { fontSize: 28, marginRight: 8, marginTop: 2 },
  messageContent: { maxWidth: '75%', borderRadius: 16, padding: 14 },
  userContent: { backgroundColor: '#4CAF50', borderBottomRightRadius: 4 },
  aiContent: { backgroundColor: '#fff', borderBottomLeftRadius: 4 },
  messageText: { fontSize: 15, lineHeight: 22 },
  userText: { color: '#fff' },
  aiText: { color: '#333' },
  typingIndicator: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  typingDots: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#fff', borderRadius: 16, padding: 12 },
  typingText: { fontSize: 13, color: '#999' },
  quickQuestions: { marginTop: 8, padding: 4 },
  quickTitle: { fontSize: 14, color: '#999', marginBottom: 10 },
  quickBtn: {
    backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 12,
    borderRadius: 12, marginBottom: 8, borderWidth: 1, borderColor: '#e8e8e8',
  },
  quickText: { fontSize: 14, color: '#4CAF50' },
  inputBar: {
    flexDirection: 'row', alignItems: 'flex-end',
    paddingHorizontal: 12, paddingVertical: 8,
    backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#e8e8e8',
  },
  textInput: {
    flex: 1, backgroundColor: '#f5f5f5', borderRadius: 20,
    paddingHorizontal: 16, paddingVertical: 10, fontSize: 15,
    color: '#333', maxHeight: 100, marginRight: 8,
  },
  sendBtn: {
    backgroundColor: '#4CAF50', borderRadius: 20,
    paddingHorizontal: 18, paddingVertical: 10,
  },
  sendBtnDisabled: { backgroundColor: '#c8e6c9' },
  sendBtnText: { color: '#fff', fontSize: 15, fontWeight: '600' },
});
