import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import AppButton from '@/components/AppButton';
import Header from '@/components/Header';
import { COLORS, TINTS } from '@/constants/colors';
import { RADIUS, SHADOWS, SPACING, TEXT } from '@/constants/theme';
import { getAvailableEvents, type CloudEvent } from '@/lib/events';
import { useRole } from '@/lib/useRole';

export default function Index() {
  const { role } = useRole();
  const [events, setEvents] = useState<CloudEvent[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      if (role !== 'student') {
        setEvents([]);
        setEventsLoading(false);
        return () => {
          active = false;
        };
      }

      setEventsLoading(true);
      getAvailableEvents().then((list) => {
        if (!active) return;
        setEvents(list);
        setEventsLoading(false);
      });

      return () => {
        active = false;
      };
    }, [role])
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerContainer}>
          <Header title="QR Attendance" />
        </View>

        <View style={styles.heroCard}>
          <View style={styles.heroIcon}>
            <Ionicons name="qr-code" size={28} color={COLORS.primary} />
          </View>
          <Text style={styles.mainTitle}>School Event Attendance</Text>
          <Text style={styles.subtitle}>
            Stay updated with school events and attendance.
          </Text>
        </View>

        {role === 'student' && (
          <View style={styles.eventsSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Available Events</Text>
              {!eventsLoading && (
                <View style={styles.sectionCount}>
                  <Text style={styles.sectionCountText}>{events.length}</Text>
                </View>
              )}
            </View>

            {eventsLoading ? (
              <ActivityIndicator color={COLORS.primary} style={styles.loader} />
            ) : events.length === 0 ? (
              <View style={styles.emptyCard}>
                <Ionicons
                  name="calendar-outline"
                  size={28}
                  color={COLORS.primary}
                />
                <Text style={styles.emptyText}>
                  No available events right now. Check back later.
                </Text>
              </View>
            ) : (
              events.map((event) => (
                <View key={event.id} style={styles.eventCard}>
                  <View style={styles.eventIcon}>
                    <Ionicons
                      name="calendar"
                      size={20}
                      color={COLORS.primary}
                    />
                  </View>
                  <View style={styles.eventBody}>
                    <Text style={styles.eventTitle}>{event.title}</Text>
                    <Text style={styles.eventMeta}>{event.event_code}</Text>
                    <Text style={styles.eventMeta}>
                      {formatEventRange(event.start_time, event.end_time)}
                    </Text>
                    {event.venue ? (
                      <Text style={styles.eventMeta}>{event.venue}</Text>
                    ) : null}
                    {event.description ? (
                      <Text style={styles.eventMeta} numberOfLines={2}>
                        {event.description}
                      </Text>
                    ) : null}
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        <View style={styles.footerContainer}>
          <AppButton
            theme="primary"
            title="Scan QR Code"
            icon="qr-code-outline"
            onPress={() => router.push('/scan')}
          />
          <AppButton
            title="Attendance History"
            icon="time-outline"
            onPress={() => router.push('/history')}
          />
          <AppButton
            title="Profile"
            icon="person-outline"
            onPress={() => router.push('/profile')}
          />
        </View>

        
      </ScrollView>
    </SafeAreaView>
  );
}

function formatEventRange(start: string | null, end: string | null) {
  if (!start && !end) return 'Schedule to be announced';

  const formatter = (value: string) =>
    new Date(value).toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });

  if (start && end) return `${formatter(start)} - ${formatter(end)}`;
  return formatter((start ?? end) as string);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.xl,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  heroCard: {
    backgroundColor: TINTS.white,
    borderRadius: RADIUS.card,
    padding: SPACING.xl,
    marginBottom: SPACING.lg,
    ...SHADOWS.card,
  },
  heroIcon: {
    width: 60,
    height: 60,
    borderRadius: RADIUS.pill,
    backgroundColor: TINTS.wash,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  mainTitle: {
    ...TEXT.title,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    ...TEXT.meta,
    lineHeight: 21,
  },
  eventsSection: {
    marginBottom: SPACING.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  sectionTitle: {
    ...TEXT.section,
    flex: 1,
  },
  sectionCount: {
    minWidth: 28,
    paddingHorizontal: SPACING.xs,
    paddingVertical: 4,
    borderRadius: RADIUS.badge,
    backgroundColor: COLORS.primaryInk,
    alignItems: 'center',
  },
  sectionCountText: {
    ...TEXT.badge,
    color: TINTS.white,
  },
  loader: {
    marginVertical: SPACING.lg,
  },
  emptyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: TINTS.white,
    borderRadius: RADIUS.card,
    padding: SPACING.lg,
    ...SHADOWS.card,
  },
  emptyText: {
    ...TEXT.meta,
    flex: 1,
    marginLeft: SPACING.sm,
    lineHeight: 20,
  },
  eventCard: {
    flexDirection: 'row',
    backgroundColor: TINTS.white,
    borderRadius: RADIUS.card,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    ...SHADOWS.card,
  },
  eventIcon: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.pill,
    backgroundColor: TINTS.wash,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  eventBody: {
    flex: 1,
  },
  eventTitle: {
    ...TEXT.cardTitle,
    marginBottom: 2,
  },
  eventMeta: {
    ...TEXT.meta,
  },
  footerContainer: {
    width: '100%',
  },
  credit: {
    ...TEXT.hint,
    textAlign: 'center',
    marginTop: SPACING.lg,
  },
});