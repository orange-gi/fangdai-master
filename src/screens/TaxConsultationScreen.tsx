import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ChatMessage, RootStackParamList } from '../types';
import { colors, spacing, radius, fontSize, shadow } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'TaxConsultation'>;

const TAX_AI_RESPONSES: Record<string, string> = {
  '房产税': '关于海外房产税的详细说明：\n\n美国房产税\n- 税率：通常为房产评估价值的0.5%-2.5%\n- 各州税率差异较大\n- 加州约1.1%，纽约约2.1%，德州约1.8%\n\n缴纳方式\n- 通常每年分两次缴纳\n- 可通过银行托管账户自动缴纳\n- 逾期有罚金和利息\n\n减免政策\n- 自住房可能有减免\n- 老年人和退伍军人有额外减免\n- 部分州有首次购房者优惠\n\n建议您根据房产所在州的具体规定，提前做好税务规划。',
  '所得税': '关于海外房产所得税说明：\n\n租金收入\n- 外国人在美国的租金收入需缴纳30%预扣税\n- 也可选择按净收入申报，按累进税率缴税（通常更优惠）\n- 可扣除的费用：房贷利息、折旧、维修费、物业管理费等\n\n申报要求\n- 需要申请ITIN（个人纳税识别号）\n- 每年4月15日前提交1040-NR表格\n- 建议聘请专业会计师\n\n税务优化\n- 合理使用折旧扣除（住宅27.5年，商业39年）\n- 记录所有可扣除的费用\n- 考虑使用LLC结构持有房产',
  '资本利得': '关于资本利得税的说明：\n\n基本规则\n- 出售房产的增值部分需缴税\n- 持有1年以上：长期资本利得税率0%-20%\n- 持有不足1年：按普通所得税率\n\nFIRPTA预扣\n- 外国人出售美国房产，买方须预扣15%\n- 成交价低于30万美元且买方自住可豁免\n- 预扣税可在报税时申请退还差额\n\n税务筹划建议\n- 尽量持有超过1年以享受低税率\n- 考虑1031交换延迟纳税\n- 合理计算成本基础（购入价+改善费用）',
};

const DEFAULT_TAX_RESPONSE = '感谢您的税务咨询！\n\n作为税务AI助手，我可以帮您解答以下问题：\n\n1. 房产税 - 各国房产税计算和缴纳\n2. 所得税 - 租金收入的税务处理\n3. 资本利得税 - 房产出售的税务规划\n4. 税务申报 - 申报流程和截止日期\n5. 税务优化 - 合法节税策略\n\n请告诉我您具体想了解哪方面的税务问题？';

function generateTaxResponse(msg: string): string {
  for (const [keyword, response] of Object.entries(TAX_AI_RESPONSES)) {
    if (msg.includes(keyword)) return response;
  }
  return DEFAULT_TAX_RESPONSE;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function TaxConsultationScreen(_props: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: '您好！我是税务咨询专家。\n\n我专注于海外房产税务问题，可以为您提供：\n- 房产税计算与规划\n- 所得税申报指导\n- 资本利得税优化\n- 跨境税务合规建议\n\n请问您想咨询什么税务问题？',
      timestamp: new Date().toISOString(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const handleSend = async () => {
    if (!inputText.trim() || sending) return;
    const text = inputText.trim();
    setInputText('');
    setSending(true);

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMsg]);
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);

    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1500));

    const aiMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: generateTaxResponse(text),
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, aiMsg]);
    setSending(false);
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const TAX_QUICK_QUESTIONS = [
    '美国房产税怎么计算？',
    '租金所得税怎么申报？',
    '资本利得税如何优化？',
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
                  <Text style={styles.typingText}>税务专家分析中...</Text>
                </View>
              </View>
            ) : messages.length <= 1 ? (
              <View style={styles.quickSection}>
                <Text style={styles.quickTitle}>常见税务问题</Text>
                {TAX_QUICK_QUESTIONS.map((q, i) => (
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
              placeholder="输入税务问题..."
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
