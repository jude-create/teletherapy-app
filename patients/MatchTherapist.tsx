import React, { useEffect, useMemo, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { AppNavigationProp } from '../types/navigation';
import {
  CalendarDaysIcon,
  CheckBadgeIcon,
  MagnifyingGlassIcon,
  StarIcon,
} from 'react-native-heroicons/solid';
import { Avatar, Button, Card, EmptyState, ErrorState, LoadingState, Screen } from '../components/ui';
import { getCurrentUser } from '../services/auth';
import { formatSlotLabel, getSlotsFromTherapist } from '../services/availability';
import { getPatientByUid } from '../services/patients';
import { findTherapistsByTherapyType } from '../services/therapists';
import { colors, spacing, typography } from '../theme';
import type { AvailabilitySlot } from '../types/models';

type PatientPreferences = {
  selectedOption?: string;
  therapistExperience?: string[];
  therapistPreferences?: string[];
};

type TherapistProfile = {
  id: string;
  uid?: string;
  name?: string;
  email?: string;
  license?: string;
  profileImage?: string;
  bio?: string;
  text?: string;
  yearsExperience?: string | number;
  therapyTypes?: string[];
  selectedOption?: string | string[];
  specialties?: string[];
  therapistExperiences?: string[];
  preferredPatientGroups?: string[];
  therapistProfile?: string[];
  selectedDays?: Record<string, boolean>;
  time?: string;
  availabilitySlots?: AvailabilitySlot[];
};

type MatchedTherapist = TherapistProfile & {
  matchScore: number;
  matchLabel: string;
  matchReasons: string[];
};

type ChipProps = {
  label: string;
};

type TherapistCardProps = {
  therapist: MatchedTherapist;
  onViewProfile: () => void;
  onBook: () => void;
};

type TherapistDetailModalProps = {
  therapist: MatchedTherapist | null;
  visible: boolean;
  onClose: () => void;
  onBook: () => void;
};

const toArray = (value?: string | string[] | null): string[] => {
  if (!value) return [];
  return Array.isArray(value) ? value.filter(Boolean) : [value].filter(Boolean);
};

const getAvailableDays = (selectedDays: Record<string, boolean> = {}) =>
  Object.entries(selectedDays)
    .filter(([, selected]) => selected)
    .map(([day]) => day);

const getOverlap = (first: string[] = [], second: string[] = []) => {
  const normalizedSecond = new Set(toArray(second).map((item) => item.toLowerCase()));
  return toArray(first).filter((item) => normalizedSecond.has(item.toLowerCase()));
};

const getMatchLabel = (score: number) => {
  if (score >= 80) return 'Best match';
  if (score >= 60) return 'Strong fit';
  if (score >= 40) return 'Good fit';
  return 'Possible fit';
};

const scoreTherapistMatch = (
  therapist: TherapistProfile,
  preferences: PatientPreferences
): MatchedTherapist => {
  const patientTherapyType = preferences?.selectedOption;
  const patientExperiences = toArray(preferences?.therapistExperience);
  const patientPreferences = toArray(preferences?.therapistPreferences);
  const therapistTypes = toArray(therapist.therapyTypes || therapist.selectedOption);
  const therapistExperiences = toArray(therapist.specialties || therapist.therapistExperiences);
  const therapistProfile = toArray(therapist.preferredPatientGroups || therapist.therapistProfile);
  const slots = getSlotsFromTherapist(therapist);
  const experienceMatches = getOverlap(patientExperiences, therapistExperiences);
  const preferenceMatches = getOverlap(patientPreferences, therapistProfile);
  let score = 0;
  const reasons = [];

  if (patientTherapyType && therapistTypes.includes(patientTherapyType)) {
    score += 30;
    reasons.push(patientTherapyType);
  }

  if (experienceMatches.length) {
    score += Math.min(32, experienceMatches.length * 8);
    reasons.push(...experienceMatches.slice(0, 2));
  }

  if (preferenceMatches.length) {
    score += Math.min(20, preferenceMatches.length * 10);
    reasons.push(...preferenceMatches.slice(0, 2));
  }

  if (slots.length) {
    score += 12;
    reasons.push('Available slots');
  }

  if (therapist.bio || therapist.text) {
    score += 6;
  }

  return {
    ...therapist,
    matchScore: Math.min(100, score),
    matchLabel: getMatchLabel(score),
    matchReasons: [...new Set(reasons)].slice(0, 4),
  };
};

const Chip = ({ label }: ChipProps) => (
  <View style={styles.chip}>
    <Text style={styles.chipText}>{label}</Text>
  </View>
);

const TherapistCard = ({ therapist, onViewProfile, onBook }: TherapistCardProps) => {
  const specialties = toArray(therapist.specialties || therapist.therapistExperiences).slice(0, 3);
  const therapyTypes = toArray(therapist.therapyTypes || therapist.selectedOption);
  const slots = getSlotsFromTherapist(therapist);

  return (
    <Card>
      <View style={styles.cardHeader}>
        <Avatar
          source={therapist.profileImage ? { uri: therapist.profileImage } : null}
          name={therapist.name || therapist.email || 'Therapist'}
          size={64}
          style={styles.avatar}
        />
        <View style={styles.cardIdentity}>
          <Text style={styles.therapistName}>{therapist.name || 'Therapist'}</Text>
          <Text style={styles.muted}>{therapyTypes.join(', ') || 'Therapy provider'}</Text>
          <Text style={styles.muted}>
            {therapist.yearsExperience ? `${therapist.yearsExperience} years experience` : 'Experience pending'}
          </Text>
          <View style={styles.badgeRow}>
            <View style={styles.badge}>
              <CheckBadgeIcon size={16} color={colors.success} />
              <Text style={styles.badgeText}>Verified</Text>
            </View>
            <View style={styles.badge}>
              <StarIcon size={16} color={colors.warning} />
              <Text style={styles.badgeText}>{therapist.matchLabel || 'Good fit'}</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.matchBox}>
        <Text style={styles.matchScore}>{therapist.matchScore || 0}% match</Text>
        <Text style={styles.matchReason}>
          {therapist.matchReasons?.length
            ? therapist.matchReasons.join(' • ')
            : 'Profile fits your selected care type.'}
        </Text>
      </View>

      <Text style={styles.bioText} numberOfLines={3}>
        {therapist.bio || therapist.text || 'Profile details will appear here once this therapist adds a bio.'}
      </Text>

      <View style={styles.chipList}>
        {specialties.length ? specialties.map((item) => <Chip key={item} label={item} />) : <Chip label="General therapy" />}
      </View>

      <View style={styles.availabilityRow}>
        <CalendarDaysIcon size={18} color={colors.primary} />
        <Text style={styles.availabilityText}>
          {slots.length
            ? `${slots.slice(0, 2).map(formatSlotLabel).join(', ')}${slots.length > 2 ? '...' : ''}`
            : 'Availability pending'}
        </Text>
      </View>

      <View style={styles.actions}>
        <Button title="View Profile" variant="outline" onPress={onViewProfile} style={styles.actionButton} />
        <Button title="Book" onPress={onBook} style={styles.actionButton} />
      </View>
    </Card>
  );
};

const TherapistDetailModal = ({ therapist, visible, onClose, onBook }: TherapistDetailModalProps) => {
  if (!therapist) return null;

  const therapyTypes = toArray(therapist.therapyTypes || therapist.selectedOption);
  const profileTags = toArray(therapist.preferredPatientGroups || therapist.therapistProfile);
  const specialties = toArray(therapist.specialties || therapist.therapistExperiences);
  const slots = getSlotsFromTherapist(therapist);

  return (
    <Modal transparent visible={visible} animationType="slide">
      <View style={styles.modalOverlay}>
        <Card style={styles.modalCard}>
          <View style={styles.cardHeader}>
            <Avatar
              source={therapist.profileImage ? { uri: therapist.profileImage } : null}
              name={therapist.name || therapist.email || 'Therapist'}
              size={64}
              style={styles.avatar}
            />
            <View style={styles.cardIdentity}>
              <Text style={styles.therapistName}>{therapist.name || 'Therapist'}</Text>
              <Text style={styles.muted}>{therapist.email}</Text>
              <Text style={styles.licenseText}>License: {therapist.license || 'Pending'}</Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.bioText}>{therapist.bio || therapist.text || 'No bio added yet.'}</Text>

          <Text style={styles.sectionTitle}>Specialties</Text>
          <Text style={styles.bioText}>
            {therapist.yearsExperience ? `${therapist.yearsExperience} years of experience` : 'Years of experience pending'}
          </Text>
          <View style={styles.chipList}>
            {(specialties.length ? specialties : ['General therapy']).map((item) => (
              <Chip key={item} label={item} />
            ))}
          </View>

          <Text style={styles.sectionTitle}>Profile</Text>
          <View style={styles.chipList}>
            {(profileTags.length ? profileTags : ['Profile pending']).map((item) => (
              <Chip key={item} label={item} />
            ))}
          </View>

          <Text style={styles.sectionTitle}>Availability</Text>
          <Text style={styles.bioText}>
            {slots.length ? slots.map(formatSlotLabel).join(', ') : 'Availability pending'}
          </Text>

          <Text style={styles.sectionTitle}>Therapy Type</Text>
          <View style={styles.chipList}>
            {(therapyTypes.length ? therapyTypes : ['Not specified']).map((item) => (
              <Chip key={item} label={item} />
            ))}
          </View>

          <View style={styles.modalActions}>
            <Button title="Close" variant="outline" onPress={onClose} style={styles.actionButton} />
            <Button title="Book Appointment" onPress={onBook} style={styles.actionButton} />
          </View>
        </Card>
      </View>
    </Modal>
  );
};

const MatchTherapist = () => {
  const navigation = useNavigation<AppNavigationProp>();
  const [patientPreferences, setPatientPreferences] = useState<PatientPreferences | null>(null);
  const [matchedTherapists, setMatchedTherapists] = useState<MatchedTherapist[]>([]);
  const [selectedTherapist, setSelectedTherapist] = useState<MatchedTherapist | null>(null);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const currentUser = getCurrentUser();
        if (!currentUser) {
          setErrorMessage('You need to be signed in to find therapists.');
          return;
        }

        const preferences = await getPatientByUid(currentUser.uid);
        if (!preferences) {
          setErrorMessage('Complete your questionnaire before matching with therapists.');
          return;
        }

        setPatientPreferences(preferences as PatientPreferences);

        const therapists = (await findTherapistsByTherapyType(preferences.selectedOption)) as TherapistProfile[];

        setMatchedTherapists(
          therapists
            .map((therapist) => scoreTherapistMatch(therapist, preferences as PatientPreferences))
            .sort((first, second) => second.matchScore - first.matchScore)
        );
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : 'Unable to match therapists.');
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, []);

  const filters = useMemo(() => {
    const preferred = toArray(patientPreferences?.therapistExperience).slice(0, 4);
    return ['All', ...preferred];
  }, [patientPreferences]);

  const filteredTherapists = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return matchedTherapists.filter((therapist) => {
      const searchable = [
        therapist.name,
        therapist.email,
        therapist.bio,
        therapist.text,
        ...toArray(therapist.selectedOption),
        ...toArray(therapist.therapistProfile),
        ...toArray(therapist.therapistExperiences),
        therapist.matchLabel,
        ...(therapist.matchReasons || []),
      ]
        .join(' ')
        .toLowerCase();

      const matchesSearch = !normalizedSearch || searchable.includes(normalizedSearch);
      const matchesFilter =
        activeFilter === 'All' || toArray(therapist.therapistExperiences).includes(activeFilter);

      return matchesSearch && matchesFilter;
    });
  }, [activeFilter, matchedTherapists, search]);

  const bookTherapist = (therapist: MatchedTherapist | null) => {
    if (!therapist) return;
    setSelectedTherapist(null);
    navigation.navigate('Book', {
      therapistId: therapist.id,
        therapist: {
        id: therapist.id,
        name: therapist.name || '',
        email: therapist.email || '',
        license: therapist.license || '',
        therapyTypes: toArray(therapist.therapyTypes || therapist.selectedOption),
        specialties: toArray(therapist.specialties || therapist.therapistExperiences),
        profileImage: therapist.profileImage || '',
        bio: therapist.bio || '',
        yearsExperience: therapist.yearsExperience || '',
        matchScore: therapist.matchScore || 0,
        matchLabel: therapist.matchLabel || '',
        availability: {
          days: getAvailableDays(therapist.selectedDays),
          time: therapist.time || '',
          slots: getSlotsFromTherapist(therapist),
        },
      },
    });
  };

  if (loading) {
    return (
      <Screen scroll={false}>
        <LoadingState message="Finding therapists..." />
      </Screen>
    );
  }

  return (
    <Screen>
      <Card style={styles.heroCard}>
        <Text style={styles.eyebrow}>Therapist marketplace</Text>
        <Text style={styles.heroTitle}>Find a therapist who fits your care goals</Text>
        <Text style={styles.heroText}>
          Search by specialty, review availability, and book directly from a therapist profile.
        </Text>
      </Card>

      {errorMessage ? <ErrorState title="Matching issue" message={errorMessage} /> : null}

      <Card>
        <View style={styles.searchBox}>
          <MagnifyingGlassIcon size={20} color={colors.textMuted} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search therapists or specialties"
            placeholderTextColor={colors.textSubtle}
            style={styles.searchInput}
          />
        </View>
        <View style={styles.filterRow}>
          {filters.map((filter) => (
            <Pressable
              key={filter}
              accessibilityRole="button"
              onPress={() => setActiveFilter(filter)}
              style={[styles.filterChip, activeFilter === filter && styles.filterChipActive]}
            >
              <Text style={[styles.filterText, activeFilter === filter && styles.filterTextActive]}>
                {filter}
              </Text>
            </Pressable>
          ))}
        </View>
      </Card>

      {filteredTherapists.length === 0 ? (
        <EmptyState
          title="No therapists found"
          message="Try clearing your search or updating your questionnaire preferences."
        />
      ) : (
        filteredTherapists.map((therapist) => (
          <TherapistCard
            key={therapist.id}
            therapist={therapist}
            onViewProfile={() => setSelectedTherapist(therapist)}
            onBook={() => bookTherapist(therapist)}
          />
        ))
      )}

      <TherapistDetailModal
        therapist={selectedTherapist}
        visible={Boolean(selectedTherapist)}
        onClose={() => setSelectedTherapist(null)}
        onBook={() => bookTherapist(selectedTherapist)}
      />
    </Screen>
  );
};

const styles = StyleSheet.create({
  heroCard: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  eyebrow: {
    ...typography.caption,
    color: colors.primarySoft,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  heroTitle: {
    ...typography.heading,
    color: colors.white,
  },
  heroText: {
    ...typography.body,
    color: colors.primarySoft,
  },
  searchBox: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surfaceMuted,
  },
  searchInput: {
    ...typography.body,
    flex: 1,
    paddingVertical: spacing.sm,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  filterChip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterText: {
    ...typography.small,
    fontWeight: '700',
  },
  filterTextActive: {
    color: colors.white,
  },
  cardHeader: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'center',
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 3,
    borderColor: colors.primarySoft,
  },
  cardIdentity: {
    flex: 1,
    gap: spacing.xs,
  },
  therapistName: {
    ...typography.subheading,
  },
  muted: {
    ...typography.small,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    borderRadius: 999,
    backgroundColor: colors.surfaceMuted,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  badgeText: {
    ...typography.caption,
    fontWeight: '700',
  },
  matchBox: {
    borderRadius: 8,
    backgroundColor: colors.successSoft,
    padding: spacing.md,
    gap: spacing.xs,
  },
  matchScore: {
    ...typography.subheading,
    color: colors.success,
  },
  matchReason: {
    ...typography.small,
    color: colors.text,
    fontWeight: '700',
  },
  bioText: {
    ...typography.body,
    color: colors.textMuted,
  },
  chipList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    borderRadius: 999,
    backgroundColor: colors.accentSoft,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  chipText: {
    ...typography.small,
    color: colors.primary,
    fontWeight: '700',
  },
  availabilityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  availabilityText: {
    ...typography.small,
    flex: 1,
    color: colors.text,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  actionButton: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  modalCard: {
    maxHeight: '92%',
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  licenseText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '800',
  },
  sectionTitle: {
    ...typography.subheading,
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
});

export default MatchTherapist;
