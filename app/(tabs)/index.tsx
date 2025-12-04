import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Box } from '@/components/ui/box';
import {
  Card,
  CardBody,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { HStack } from '@/components/ui/hstack';
import { Input, InputField } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { supabase } from '@/lib/supabase';

type Tailor = {
  id: string;
  name: string;
  description: string | null;
  phone: string | null;
  email: string | null;
  address_line_1: string | null;
  address_line_2: string | null;
  city: string | null;
  postcode: string | null;
  country: string | null;
  has_location: boolean;
  latitude: number | null;
  longitude: number | null;
};

const FILTERS = [
  {
    id: 'near-me',
    label: 'Near me',
    radiusKm: 2,
  },
  {
    id: 'within-5km',
    label: 'Within 5km',
    radiusKm: 5,
  },
  {
    id: 'within-10km',
    label: 'Within 10km',
    radiusKm: 10,
  },
] as const;

type FilterId = (typeof FILTERS)[number]['id'];

const EARTH_RADIUS_KM = 6371;
const deg2rad = (deg: number) => (deg * Math.PI) / 180;
const getDistanceKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_KM * c;
};

export default function SearchScreen() {
  const [query, setQuery] = useState("");
  const [selectedFilters, setSelectedFilters] = useState<FilterId[]>([]);
  const [tailors, setTailors] = useState<Tailor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [locating, setLocating] = useState(true);
  const [locationError, setLocationError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTailors = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('tailors')
        .select(
          'id,name,description,phone,email,address_line_1,address_line_2,city,postcode,country,has_location,latitude,longitude'
        )
        .order('name');

      if (error) {
        setError(error.message);
        setTailors([]);
      } else {
        setError(null);
        setTailors(data ?? []);
      }

      setLoading(false);
    };

    fetchTailors();
  }, []);

  useEffect(() => {
    const requestLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setLocationError('Enable location services to filter nearby tailors.');
          setUserLocation(null);
          return;
        }

        const coords = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        setUserLocation({
          latitude: coords.coords.latitude,
          longitude: coords.coords.longitude,
        });
        setLocationError(null);
      } catch (locErr) {
        console.warn('Location error', locErr);
        setLocationError('Unable to fetch your location right now.');
        setUserLocation(null);
      } finally {
        setLocating(false);
      }
    };

    requestLocation();
  }, []);

  const filteredTailors = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    const textFiltered = normalized
      ? tailors.filter((tailor) =>
          tailor.name.toLowerCase().includes(normalized)
        )
      : tailors;

    if (!selectedFilters.length) {
      return textFiltered;
    }

    const activeFilterId = selectedFilters[0];
    if (!activeFilterId) {
      return textFiltered;
    }

    const activeFilter = FILTERS.find((filter) => filter.id === activeFilterId);
    if (!activeFilter) {
      return textFiltered;
    }

    if (!userLocation) {
      return [];
    }

    return textFiltered.filter((tailor) => {
      if (tailor.latitude == null || tailor.longitude == null) {
        return false;
      }

      const distanceKm = getDistanceKm(
        userLocation.latitude,
        userLocation.longitude,
        tailor.latitude,
        tailor.longitude
      );

      return distanceKm <= activeFilter.radiusKm;
    });
  }, [query, selectedFilters, tailors, userLocation]);

  const toggleFilter = (filterId: FilterId) => {
    setSelectedFilters((prev) =>
      prev[0] === filterId ? [] : [filterId]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-[#f5f5f5]">
      <Box className="flex-1 px-5 py-6">
        <Box className="mb-6">
          <Text className="text-sm uppercase tracking-[0.15em] text-gray-500">
            Find a tailor
          </Text>
          <Text className="mt-2 text-3xl font-semibold text-gray-900">
            Search by name
          </Text>
        </Box>

        <HStack className="items-center gap-3 rounded-3xl border border-black/10 bg-white px-5 py-4 shadow-sm">
          <Ionicons name="search" size={20} color="#6b7280" />

          <Input className="flex-1 border-0 bg-transparent px-0">
            <InputField
              value={query}
              onChangeText={setQuery}
              placeholder="Type a tailor name..."
              placeholderTextColor="#9ca3af"
              className="text-base text-gray-900"
              returnKeyType="search"
              autoCapitalize="words"
              autoCorrect={false}
            />
          </Input>
        </HStack>

        <HStack className="mb-2 mt-4 flex-wrap" space="md">
          {FILTERS.map((filter) => {
            const isSelected = selectedFilters.includes(filter.id);

            return (
              <Pressable
                key={filter.id}
                onPress={() => toggleFilter(filter.id)}
                className={`items-center justify-center rounded-full border px-5 py-2.5 ${
                  isSelected
                    ? "border-gray-900 bg-gray-900"
                    : "border-gray-300 bg-white"
                }`}
                style={{ minWidth: 96 }}
              >
                <Text
                  className={`text-sm font-medium ${
                    isSelected ? "text-white" : "text-gray-800"
                  }`}
                >
                  {filter.label}
                </Text>
              </Pressable>
            );
          })}
        </HStack>
        {selectedFilters.length ? (
          <Text className="mb-2 text-xs text-gray-500">
            {locating
              ? 'Detecting your location...'
              : userLocation
              ? `Showing tailors ${FILTERS.find((f) => f.id === selectedFilters[0])?.label.toLowerCase()}.`
              : 'Turn on location services to apply this filter.'}
          </Text>
        ) : null}
        {locationError && !locating ? (
          <Text className="mb-2 text-xs font-semibold text-red-500">
            {locationError}
          </Text>
        ) : null}

        <Text className="mt-4 mb-4 text-lg font-semibold text-gray-900">
          Tailors ({loading ? '...' : filteredTailors.length})
        </Text>

        {error ? (
          <Box className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3">
            <Text className="text-sm font-semibold text-red-700">
              Unable to load tailors
            </Text>
            <Text className="mt-1 text-sm text-red-600">{error}</Text>
          </Box>
        ) : null}

        {loading ? (
          <Box className="mt-10 items-center">
            <ActivityIndicator color="#111827" />
            <Text className="mt-3 text-base text-gray-500">
              Fetching tailors...
            </Text>
          </Box>
        ) : (
          <FlatList
            data={filteredTailors}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingBottom: 32 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => {
              const highlights = [
                item.has_location && 'Verified location',
                item.phone && 'Phone listed',
                item.email && 'Email listed',
              ].filter(Boolean) as string[];

              const cityCountry = [item.city, item.country]
                .filter(Boolean)
                .join(', ');
              const contactLabel =
                item.phone ?? item.email ?? 'No contact info yet';
              const distanceKm =
                userLocation &&
                item.latitude != null &&
                item.longitude != null
                  ? getDistanceKm(
                      userLocation.latitude,
                      userLocation.longitude,
                      item.latitude,
                      item.longitude
                    )
                  : null;
              const address = [
                item.address_line_1,
                item.address_line_2,
                item.postcode,
              ]
                .filter(Boolean)
                .join(', ');

              return (
                <Card
                  size="lg"
                  variant="elevated"
                  className="mb-4 rounded-3xl border border-black/5 bg-white/95 shadow-lg"
                >
                  <CardHeader className="flex-row items-start justify-between p-0">
                    <Box className="flex-1 pr-3">
                      <CardTitle className="text-2xl text-gray-900">
                        {item.name}
                      </CardTitle>
                      <CardDescription className="text-base text-gray-600">
                        {item.description?.trim() || 'No description yet'}
                      </CardDescription>
                    </Box>

                    <Box className="items-end">
                      <Text className="text-sm font-semibold uppercase tracking-wide text-gray-500">
                        {cityCountry || 'City unknown'}
                      </Text>
                      {item.has_location ? (
                        <HStack
                          className="mt-2 items-center rounded-full bg-green-50 px-3 py-1"
                          space="xs"
                        >
                          <Ionicons
                            name="location-outline"
                            size={14}
                            color="#16a34a"
                          />
                          <Text className="text-xs font-semibold text-green-700">
                            GPS ready
                          </Text>
                        </HStack>
                      ) : null}
                    </Box>
                  </CardHeader>

                  {distanceKm !== null ? (
                    <CardBody className="flex-row flex-wrap gap-2 p-0">
                      <Box className="rounded-full bg-blue-50 px-3 py-1">
                        <Text className="text-xs font-medium text-blue-700">
                          {distanceKm.toFixed(1)} km away
                        </Text>
                      </Box>
                    </CardBody>
                  ) : null}

                  {highlights.length ? (
                    <CardBody className="flex-row flex-wrap gap-2 p-0">
                      {highlights.map((label) => (
                        <Box
                          key={`${item.id}-${label}`}
                          className="rounded-full bg-gray-100 px-3 py-1"
                        >
                          <Text className="text-xs font-medium text-gray-700">
                            {label}
                          </Text>
                        </Box>
                      ))}
                    </CardBody>
                  ) : null}

                  <CardFooter className="flex-row items-center justify-between">
                    <HStack className="items-center" space="xs">
                      <Ionicons
                        name="call-outline"
                        size={16}
                        color="#6b7280"
                      />
                      <Text className="text-sm text-gray-600">
                        {contactLabel}
                      </Text>
                    </HStack>
                  </CardFooter>

                  {address ? (
                    <CardBody className="pt-0">
                      <HStack className="items-start" space="xs">
                        <Ionicons
                          name="navigate"
                          size={16}
                          color="#6b7280"
                        />
                        <Text className="flex-1 text-sm text-gray-600">
                          {address}
                        </Text>
                      </HStack>
                    </CardBody>
                  ) : null}
                </Card>
              );
            }}
            ListEmptyComponent={
              query.trim() ? (
                <Box className="mt-10 items-center">
                  <Text className="text-base text-gray-500">
                    No tailor matches “{query.trim()}”.
                  </Text>
                </Box>
              ) : (
                <Box className="mt-10 items-center">
                  <Text className="text-base text-gray-500">
                    No tailors have been added yet.
                  </Text>
                </Box>
              )
            }
          />
        )}
      </Box>
    </SafeAreaView>
  );
}
