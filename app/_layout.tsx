import type { Session } from '@supabase/supabase-js';
import { Stack, usePathname, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';

import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';
import { supabase } from '@/lib/supabase';

import '@/global.css';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const [session, setSession] = useState<Session | null>(null);
  const [initializing, setInitializing] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setInitializing(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (initializing) return;

    const isOnLogin = pathname?.startsWith('/login');
    if (!session && !isOnLogin) {
      router.replace('/login');
    } else if (session && isOnLogin) {
      router.replace('/(tabs)');
    }
  }, [initializing, pathname, router, session]);

  // TODO: Add a loading screen
  // if (initializing) {
  //   return (
  //     <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
  //       <ActivityIndicator />
  //     </View>
  //   );
  // }

  return (
    <GluestackUIProvider mode="light">
      <Stack>
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
      </Stack>
      <StatusBar style="auto" />
    </GluestackUIProvider>
  );
}
