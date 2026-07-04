import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Button, Card, ErrorState, Input, LoadingState, Screen } from '../components/ui';
import { getCurrentUser } from '../services/auth';
import { createSlotId, formatSlotLabel, normalizeTime, weekDays } from '../services/availability';
import { getTherapistByUid, updateTherapistAvailability } from '../services/therapists';
import { colors, spacing, typography } from '../theme';

const Availability = () => {
  const [selectedDay, setSelectedDay] = useState('Monday');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [availabilitySlots, setAvailabilitySlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const loadAvailability = async () => {
      try {
        const currentUser = getCurrentUser();
        if (!currentUser) {
          setErrorMessage('You need to be signed in to edit availability.');
          return;
        }

        const therapist = await getTherapistByUid(currentUser.uid);
        if (Array.isArray(therapist?.availabilitySlots)) {
          setAvailabilitySlots(therapist.availabilitySlots);
        }
      } catch (error) {
        setErrorMessage(error.message);
      } finally {
        setLoading(false);
      }
    };

    loadAvailability();
  }, []);

  const addSlot = () => {
    const normalizedStart = normalizeTime(startTime);
    const normalizedEnd = normalizeTime(endTime);

    if (!normalizedStart || !normalizedEnd) {
      setErrorMessage('Use 24-hour time for each slot, like 09:00 and 10:00.');
      return;
    }

    if (normalizedEnd <= normalizedStart) {
      setErrorMessage('The end time needs to be later than the start time.');
      return;
    }

    setErrorMessage('');
    setSuccessMessage('');
    setAvailabilitySlots((current) => [
      ...current,
      { id: createSlotId(), day: selectedDay, startTime: normalizedStart, endTime: normalizedEnd },
    ]);
    setStartTime('');
    setEndTime('');
  };

  const removeSlot = (slotId) => {
    setSuccessMessage('');
    setAvailabilitySlots((current) => current.filter((slot) => slot.id !== slotId));
  };

  const saveAvailability = async () => {
    try {
      if (!availabilitySlots.length) {
        setErrorMessage('Add at least one bookable slot before saving.');
        return;
      }

      setSaving(true);
      setErrorMessage('');
      const currentUser = getCurrentUser();
      if (!currentUser) {
        setErrorMessage('You need to be signed in to save availability.');
        return;
      }

      const selectedDays = weekDays.reduce((result, day) => {
        result[day] = availabilitySlots.some((slot) => slot.day === day);
        return result;
      }, {});

      await updateTherapistAvailability(currentUser.uid, {
        selectedDays,
        time: availabilitySlots.map(formatSlotLabel).join(', '),
        availabilitySlots,
      });
      setSuccessMessage('Availability saved successfully.');
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Screen scroll={false}>
        <LoadingState message="Loading availability..." />
      </Screen>
    );
  }

  return (
    <Screen contentContainerStyle={styles.content}>
      <Card>
        <Text style={styles.title}>Update Availability</Text>
        <Text style={styles.body}>Add the weekly session slots patients can choose from when booking.</Text>

        {errorMessage ? <ErrorState title="Availability issue" message={errorMessage} /> : null}
        {successMessage ? <Text style={styles.successText}>{successMessage}</Text> : null}

        <View style={styles.section}>
          <Text style={styles.label}>Day</Text>
          <View style={styles.dayGrid}>
            {weekDays.map((day) => {
              const selected = selectedDay === day;
              return (
                <Pressable
                  key={day}
                  accessibilityRole="button"
                  onPress={() => setSelectedDay(day)}
                  style={[styles.dayButton, selected && styles.dayButtonSelected]}
                >
                  <Text style={[styles.dayText, selected && styles.dayTextSelected]}>{day}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.timeRow}>
          <Input label="Start" placeholder="09:00" value={startTime} onChangeText={setStartTime} style={styles.timeField} />
          <Input label="End" placeholder="10:00" value={endTime} onChangeText={setEndTime} style={styles.timeField} />
        </View>

        <Button title="Add Slot" variant="secondary" onPress={addSlot} />

        <View style={styles.slotList}>
          {availabilitySlots.length ? (
            availabilitySlots.map((slot) => (
              <View key={slot.id} style={styles.slotRow}>
                <Text style={styles.slotText}>{formatSlotLabel(slot)}</Text>
                <Button
                  title="Remove"
                  variant="ghost"
                  onPress={() => removeSlot(slot.id)}
                  style={styles.removeButton}
                  textStyle={styles.removeButtonText}
                />
              </View>
            ))
          ) : (
            <Text style={styles.body}>No bookable slots added yet.</Text>
          )}
        </View>

        <Button title="Save Availability" onPress={saveAvailability} loading={saving} />
      </Card>
    </Screen>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingTop: spacing.xl,
  },
  title: {
    ...typography.heading,
    color: colors.primary,
    textAlign: 'center',
  },
  body: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
  },
  section: {
    gap: spacing.sm,
  },
  label: {
    ...typography.small,
    fontWeight: '700',
    color: colors.text,
  },
  dayGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  dayButton: {
    flexGrow: 1,
    flexBasis: '45%',
    minHeight: 44,
    minWidth: 132,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    backgroundColor: colors.surfaceMuted,
    paddingHorizontal: spacing.md,
  },
  dayButtonSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  dayText: {
    ...typography.small,
    fontWeight: '700',
    color: colors.text,
  },
  dayTextSelected: {
    color: colors.white,
  },
  timeRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  timeField: {
    flex: 1,
  },
  slotList: {
    gap: spacing.sm,
  },
  slotRow: {
    minHeight: 52,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceMuted,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  slotText: {
    ...typography.body,
    flex: 1,
    fontWeight: '700',
  },
  removeButton: {
    width: 'auto',
    minHeight: 38,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  removeButtonText: {
    ...typography.small,
    color: colors.danger,
    fontWeight: '800',
  },
  successText: {
    ...typography.body,
    color: colors.success,
    fontWeight: '800',
    textAlign: 'center',
  },
});

export default Availability;
