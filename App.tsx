import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './src/types';

import HomeScreen from './src/screens/HomeScreen';
import PropertyListScreen from './src/screens/PropertyListScreen';
import PropertyDetailScreen from './src/screens/PropertyDetailScreen';
import AddPropertyScreen from './src/screens/AddPropertyScreen';
import EditPropertyScreen from './src/screens/EditPropertyScreen';
import TaxCenterScreen from './src/screens/TaxCenterScreen';
import TaxDetailScreen from './src/screens/TaxDetailScreen';
import TaxConsultationScreen from './src/screens/TaxConsultationScreen';
import DocumentListScreen from './src/screens/DocumentListScreen';
import DocumentDetailScreen from './src/screens/DocumentDetailScreen';
import AddDocumentScreen from './src/screens/AddDocumentScreen';
import PolicyListScreen from './src/screens/PolicyListScreen';
import PolicyDetailScreen from './src/screens/PolicyDetailScreen';
import ChatScreen from './src/screens/ChatScreen';
import ProfileScreen from './src/screens/ProfileScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

const screenOptions = {
  headerStyle: { backgroundColor: '#0E1225' },
  headerTintColor: '#F0EDE6',
  headerTitleStyle: { fontWeight: '600' as const, fontSize: 17, letterSpacing: 0.3 },
  headerShadowVisible: false,
  contentStyle: { backgroundColor: '#080C18' },
};

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={screenOptions}>
          <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
          <Stack.Screen name="PropertyList" component={PropertyListScreen} options={{ title: '房产管理' }} />
          <Stack.Screen name="PropertyDetail" component={PropertyDetailScreen} options={{ title: '房产详情' }} />
          <Stack.Screen name="AddProperty" component={AddPropertyScreen} options={{ title: '添加房产' }} />
          <Stack.Screen name="EditProperty" component={EditPropertyScreen} options={{ title: '编辑房产' }} />
          <Stack.Screen name="TaxCenter" component={TaxCenterScreen} options={{ title: '税务中心' }} />
          <Stack.Screen name="TaxDetail" component={TaxDetailScreen} options={{ title: '税务详情' }} />
          <Stack.Screen name="TaxConsultation" component={TaxConsultationScreen} options={{ title: 'AI 税务咨询' }} />
          <Stack.Screen name="DocumentList" component={DocumentListScreen} options={{ title: '证件管理' }} />
          <Stack.Screen name="DocumentDetail" component={DocumentDetailScreen} options={{ title: '证件详情' }} />
          <Stack.Screen name="AddDocument" component={AddDocumentScreen} options={{ title: '添加证件' }} />
          <Stack.Screen name="PolicyList" component={PolicyListScreen} options={{ title: '政策资讯' }} />
          <Stack.Screen name="PolicyDetail" component={PolicyDetailScreen} options={{ title: '政策详情' }} />
          <Stack.Screen name="Chat" component={ChatScreen} options={{ title: 'AI 助手' }} />
          <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: '我的' }} />
        </Stack.Navigator>
      </NavigationContainer>
      <StatusBar style="light" />
    </SafeAreaProvider>
  );
}
