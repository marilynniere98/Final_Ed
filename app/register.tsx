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
  Pressable,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Link, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import AppButton from '@/components/AppButton';
import Header from '@/components/Header';
import { COLORS, STATUS, TINTS } from '@/constants/colors';
import {
  PRESSED,
  RADIUS,
  SHADOWS,
  SHARED,
  SPACING,
  TEXT,
} from '@/constants/theme';
import { signUp } from '@/lib/auth';

export default function RegisterScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<'student' | 'teacher'>('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    setError(null);

    if (!fullName.trim() || !email.trim() || !password || !confirmPassword) {
      setError('All fields are required.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);

    try {
      const { data, error: authError } = await signUp(email.trim(), password, {
        full_name: fullName.trim(),
        role,
      });

      if (authError) {
        setError(authError.message);
      } else if (data.session) {
        router.replace('/(tabs)');
      } else {
        setSuccess(true);
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
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

            {success ? (
              <View style={styles.successContainer}>
                <View style={styles.successIcon}>
                  <Ionicons name="mail-open-outline" size={40} color={COLORS.primary} />
                </View>
                <Text style={styles.successTitle}>Check your email!</Text>
                <Text style={styles.successText}>
                  We sent a confirmation link to {email}. Click the link to verify your
                  account, then come back and sign in.
                </Text>
                <Link href="/login" style={styles.link}>
                  Back to Sign In
                </Link>
              </View>
            ) : (
              <View style={styles.formCard}>
                <Text style={styles.title}>Create Account</Text>
                <Text style={styles.subtitle}>Register to start recording attendance</Text>
                <View style={styles.form}>
                <Text style={styles.label}>Full Name</Text>
                <View style={styles.fieldWrap}>
                  <Ionicons
                    name="person-outline"
                    size={20}
                    color={COLORS.primary}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    value={fullName}
                    onChangeText={setFullName}
                    placeholder="e.g. Juan Dela Cruz"
                    placeholderTextColor={COLORS.textSecondary}
                    editable={!loading}
                  />
                </View>

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
                    placeholder="At least 6 characters"
                    placeholderTextColor={COLORS.textSecondary}
                    secureTextEntry
                    editable={!loading}
                  />
                </View>

                <Text style={styles.label}>Confirm Password</Text>
                <View style={styles.fieldWrap}>
                  <Ionicons
                    name="shield-checkmark-outline"
                    size={20}
                    color={COLORS.primary}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    placeholder="Re-enter your password"
                    placeholderTextColor={COLORS.textSecondary}
                    secureTextEntry
                    editable={!loading}
                  />
                </View>

                <Text style={styles.label}>I am a...</Text>
                <View style={styles.roleRow}>
                  <Pressable
                    style={({ pressed }) => [
                      styles.roleChip,
                      role === 'student' && styles.roleChipActive,
                      pressed && PRESSED,
                    ]}
                    onPress={() => setRole('student')}
                    disabled={loading}
                  >
                    <Text
                      style={[
                        styles.roleChipText,
                        role === 'student' && styles.roleChipTextActive,
                      ]}
                    >
                      Student
                    </Text>
                  </Pressable>
                  <Pressable
                    style={({ pressed }) => [
                      styles.roleChip,
                      role === 'teacher' && styles.roleChipActive,
                      pressed && PRESSED,
                    ]}
                    onPress={() => setRole('teacher')}
                    disabled={loading}
                  >
                    <Text
                      style={[
                        styles.roleChipText,
                        role === 'teacher' && styles.roleChipTextActive,
                      ]}
                    >
                      Teacher
                    </Text>
                  </Pressable>
                </View>

                {error && <Text style={styles.error}>{error}</Text>}

                {loading ? (
                  <ActivityIndicator size="large" color={COLORS.primary} style={styles.loader} />
                ) : (
                  <View style={styles.primarySlot}>
                    <AppButton
                      theme="primary"
                      title="Sign Up"
                      icon="person-add-outline"
                      onPress={handleRegister}
                    />
                  </View>
                )}
              </View>
            </View>
            )}

            {!success && (
              <Link href="/login" style={styles.link}>
                Already have an account? Sign In
              </Link>
            )}
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
    marginBottom: SPACING.lg,
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
  roleRow: {
    flexDirection: 'row',
    marginTop: SPACING.xs,
  },
  roleChip: {
    ...SHARED.chip,
    flex: 1,
    marginRight: SPACING.xs,
  },
  roleChipActive: {
    backgroundColor: COLORS.textPrimary,
    borderColor: COLORS.textPrimary,
  },
  roleChipText: {
    ...TEXT.chip,
    color: COLORS.textPrimary,
  },
  roleChipTextActive: {
    color: TINTS.white,
  },
  loader: {
    marginVertical: SPACING.lg,
  },
  link: {
    ...TEXT.chip,
    color: COLORS.primaryInk,
    textAlign: 'center',
  },
  successContainer: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
    padding: SPACING.xl,
    backgroundColor: TINTS.white,
    borderRadius: RADIUS.card,
    ...SHADOWS.card,
  },
  successIcon: {
    width: 84,
    height: 84,
    borderRadius: RADIUS.pill,
    backgroundColor: TINTS.wash,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  successTitle: {
    ...TEXT.section,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  successText: {
    ...TEXT.meta,
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: SPACING.lg,
  },
});
