import { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Link, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import AppButton from '@/components/AppButton';
import Header from '@/components/Header';
import { COLORS, STATUS, TINTS } from '@/constants/colors';
import { RADIUS, SHADOWS, SHARED, SPACING, TEXT } from '@/constants/theme';
import { signIn } from '@/lib/auth';

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError(null);
    setLoading(true);

    try {
      const { data, error: authError } = await signIn(email.trim(), password);

      if (authError) {
        setError(authError.message);
      } else {
        router.replace('/');
      }
    } catch (err: any) {
      setError(err?.message || 'Unexpected error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.headerContainer}>
              <Header title="QR Attendance" />
            </View>

            <View style={styles.formCard}>
              <Text style={styles.title}>Welcome Back</Text>
              <Text style={styles.subtitle}>Sign in to record your attendance</Text>

              <View style={styles.form}>
                <Text style={styles.label}>Email</Text>
                <View style={styles.fieldWrap}>
                  <Ionicons
                    name="mail-outline"
                    size={20}
                    color={COLORS.primary}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    value={email}
                    onChangeText={setEmail}
                    placeholder="your.email@school.edu"
                    placeholderTextColor={COLORS.textSecondary}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    editable={!loading}
                  />
                </View>

                <Text style={styles.label}>Password</Text>
                <View style={styles.fieldWrap}>
                  <Ionicons
                    name="lock-closed-outline"
                    size={20}
                    color={COLORS.primary}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Enter your password"
                    placeholderTextColor={COLORS.textSecondary}
                    secureTextEntry
                    editable={!loading}
                  />
                </View>

                {error && <Text style={styles.error}>{error}</Text>}

                {loading ? (
                  <ActivityIndicator size="large" color={COLORS.primary} style={styles.loader} />
                ) : (
                  <View style={styles.primarySlot}>
                    <AppButton
                      theme="primary"
                      title="Sign In"
                      icon="log-in-outline"
                      onPress={handleLogin}
                    />
                  </View>
                )}
              </View>
            </View>

            <Link href="/register" style={styles.link}>
              Don't have an account? Sign Up
            </Link>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xxxl,
  },
  headerContainer: {
    alignItems: 'center',
    marginTop: SPACING.md,
    marginBottom: SPACING.lg,
  },
  formCard: {
    backgroundColor: TINTS.white,
    borderRadius: RADIUS.card,
    padding: SPACING.xl,
    marginBottom: SPACING.xl,
    ...SHADOWS.card,
  },
  title: {
    ...TEXT.display,
    marginBottom: SPACING.xxs,
  },
  subtitle: {
    ...TEXT.meta,
    marginBottom: SPACING.xl,
  },
  form: {
    marginBottom: SPACING.xs,
  },
  label: {
    ...TEXT.label,
    marginBottom: SPACING.xs,
    marginTop: SPACING.lg,
  },
  primarySlot: {
    marginTop: SPACING.xl,
  },
  fieldWrap: SHARED.fieldWrap,
  input: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.textPrimary,
    paddingVertical: 15,
  },
  inputIcon: {
    marginRight: SPACING.xs,
  },
  error: {
    ...TEXT.meta,
    color: COLORS.danger,
    fontWeight: '700',
    backgroundColor: STATUS.absent.bg,
    borderRadius: RADIUS.chip,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginTop: SPACING.md,
    overflow: 'hidden',
  },
  loader: {
    marginVertical: SPACING.lg,
  },
  link: {
    ...TEXT.chip,
    color: COLORS.primaryInk,
    textAlign: 'center',
  },
});
