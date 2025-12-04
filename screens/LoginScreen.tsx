import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Box } from '@/components/ui/box';
import { Heading } from '@/components/ui/heading';
import { Input, InputField } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { supabase } from '@/lib/supabase';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isDisabled = submitting || !email.trim() || password.length < 6;

  const handleLogin = async () => {
    if (isDisabled) return;
    setSubmitting(true);
    setError(null);

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (signInError) {
        throw signInError;
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Unable to sign in. Try again.';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Box className="flex-1 px-6 py-10">
          <VStack className="flex-1" space="lg">
            <VStack space="sm">
              <Heading size="3xl" className="text-gray-900">
                Welcome back
              </Heading>
              <Text className="text-base text-gray-500">
                Sign in to keep working with your tailors.
              </Text>
            </VStack>

            <VStack className="mt-6" space="lg">
              <VStack space="xs">
                <Text className="text-sm font-medium uppercase tracking-wide text-gray-600">
                  Email
                </Text>
                <Input
                  size="lg"
                  variant="outline"
                  className="rounded-2xl border-gray-200 bg-gray-50"
                >
                  <InputField
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    placeholder="Enter your email"
                    placeholderTextColor="#9ca3af"
                    className="text-base text-gray-900"
                  />
                </Input>
              </VStack>

              <VStack space="xs">
                <Text className="text-sm font-medium uppercase tracking-wide text-gray-600">
                  Password
                </Text>
                <Input
                  size="lg"
                  variant="outline"
                  className="rounded-2xl border-gray-200 bg-gray-50"
                >
                  <InputField
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    placeholder="Enter your password"
                    placeholderTextColor="#9ca3af"
                    className="text-base text-gray-900"
                  />
                </Input>
              </VStack>

              {error ? (
                <Text className="text-sm font-semibold text-red-600">
                  {error}
                </Text>
              ) : null}

              <Pressable
                onPress={handleLogin}
                disabled={isDisabled}
                className={`mt-2 items-center rounded-2xl py-4 ${
                  isDisabled ? 'bg-gray-300' : 'bg-gray-900'
                }`}
              >
                {submitting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text
                    className={`text-base font-semibold ${
                      isDisabled ? 'text-gray-500' : 'text-white'
                    }`}
                  >
                    Continue
                  </Text>
                )}
              </Pressable>
            </VStack>
          </VStack>

          <Text className="mt-8 text-center text-sm text-gray-500">
            Need an account? Contact support to get onboarded.
          </Text>
        </Box>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
