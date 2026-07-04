import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { CheckCircleIcon } from 'react-native-heroicons/solid';
import { Button, Card, ErrorState, Header, Input, Screen } from '../components/ui';
import { getCurrentUser } from '../services/auth';
import { createSlotId, formatSlotLabel, normalizeTime } from '../services/availability';
import { saveTherapistQuestionnaire } from '../services/therapists';
import { colors, spacing, typography } from '../theme';

const steps = [
  {
    key: 'therapyTypes',
    title: 'Therapy types',
    helper: 'Select each format you provide.',
    options: ['Individual', 'Couples', 'Teen', 'Family'],
  },
  {
    key: 'specialties',
    title: 'Specialties',
    helper: 'Choose the conditions and goals you support.',
    options: ['Anxiety', 'Depression', 'Trauma', 'Addiction', 'Stress', 'Relationship issues'],
  },
  {
    key: 'preferredPatientGroups',
    title: 'Preferred patient groups',
    helper: 'Optional, but helpful for matching.',
    optional: true,
    options: ['Adults', 'Teens', 'Couples', 'Families', 'Faith-based care', 'LGBTQ+ affirming'],
  },
  {
    key: 'availability',
    title: 'First availability slot',
    helper: 'Add one bookable window now. You can edit availability later.',
  },
];

const OptionCard = ({ label, selected, onPress }) => (
  <Pressable
    accessibilityRole="button"
    onPress={onPress}
    style={[styles.optionCard, selected && styles.optionCardSelected]}
  >
    <Text style={[styles.optionText, selected && styles.optionTextSelected]}>{label}</Text>
    {selected ? <CheckCircleIcon size={22} color={colors.primary} /> : null}
  </Pressable>
);

const Questions = () => {
  const navigation = useNavigation();
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState({
    therapyTypes: [],
    specialties: [],
    preferredPatientGroups: [],
    availabilityDay: 'Monday',
    startTime: '09:00',
    endTime: '10:00',
  });
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const currentStep = steps[stepIndex];
  const progress = useMemo(() => ((stepIndex + 1) / steps.length) * 100, [stepIndex]);
  const isLastStep = stepIndex === steps.length - 1;

  const toggleOption = (option) => {
    setErrorMessage('');
    setAnswers((previous) => {
      const current = previous[currentStep.key] || [];
      return {
        ...previous,
        [currentStep.key]: current.includes(option)
          ? current.filter((item) => item !== option)
          : [...current, option],
      };
    });
  };

  const validateStep = (step = currentStep) => {
    if (step.optional) return '';
    if (step.key !== 'availability' && !answers[step.key]?.length) {
      return 'Please select at least one option before continuing.';
    }
    if (step.key === 'availability') {
      const start = normalizeTime(answers.startTime);
      const end = normalizeTime(answers.endTime);
      if (!start || !end || end <= start) {
        return 'Add one valid availability window, like 09:00 to 10:00.';
      }
    }
    return '';
  };

  const goBack = () => {
    setErrorMessage('');
    if (stepIndex === 0) {
      navigation.navigate('TherapistDrawer');
      return;
    }
    setStepIndex((index) => index - 1);
  };

  const goNext = () => {
    const issue = validateStep();
    if (issue) {
      setErrorMessage(issue);
      return;
    }
    setErrorMessage('');
    setStepIndex((index) => index + 1);
  };

  const submit = async () => {
    const missingStep = steps.find((step) => validateStep(step));
    if (missingStep) {
      setStepIndex(steps.indexOf(missingStep));
      setErrorMessage(validateStep(missingStep));
      return;
    }

    try {
      setSaving(true);
      setErrorMessage('');
      const currentUser = getCurrentUser();
      if (!currentUser) {
        setErrorMessage('You need to be signed in to save onboarding.');
        return;
      }

      const slot = {
        id: createSlotId(),
        day: answers.availabilityDay,
        startTime: normalizeTime(answers.startTime),
        endTime: normalizeTime(answers.endTime),
      };
      const selectedDays = { [slot.day]: true };

      await saveTherapistQuestionnaire(currentUser.uid, {
        therapyTypes: answers.therapyTypes,
        specialties: answers.specialties,
        preferredPatientGroups: answers.preferredPatientGroups,
        availabilitySlots: [slot],
        selectedDays,
        time: formatSlotLabel(slot),
      });
      navigation.navigate('TherapistDrawer');
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen contentContainerStyle={styles.content}>
      <Header title="VirtualMindSpace" subtitle="Therapist onboarding" />

      <Card>
        <View style={styles.progressHeader}>
          <Text style={styles.progressLabel}>Step {stepIndex + 1} of {steps.length}</Text>
          <Text style={styles.progressPercent}>{Math.round(progress)}%</Text>
        </View>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
      </Card>

      <Card>
        <Text style={styles.title}>{currentStep.title}</Text>
        <Text style={styles.helper}>{currentStep.helper}</Text>
        {errorMessage ? <ErrorState title="Onboarding issue" message={errorMessage} /> : null}

        {currentStep.key === 'availability' ? (
          <View style={styles.form}>
            <Input
              label="First availability day"
              value={answers.availabilityDay}
              onChangeText={(value) => setAnswers((current) => ({ ...current, availabilityDay: value }))}
              placeholder="Monday"
            />
            <View style={styles.timeRow}>
              <Input
                label="Start"
                value={answers.startTime}
                onChangeText={(value) => setAnswers((current) => ({ ...current, startTime: value }))}
                placeholder="09:00"
                style={styles.timeInput}
              />
              <Input
                label="End"
                value={answers.endTime}
                onChangeText={(value) => setAnswers((current) => ({ ...current, endTime: value }))}
                placeholder="10:00"
                style={styles.timeInput}
              />
            </View>
          </View>
        ) : (
          <View style={styles.options}>
            {currentStep.options.map((option) => (
              <OptionCard
                key={option}
                label={option}
                selected={(answers[currentStep.key] || []).includes(option)}
                onPress={() => toggleOption(option)}
              />
            ))}
          </View>
        )}
      </Card>

      <View style={styles.actions}>
        <Button title="Back" variant="outline" onPress={goBack} style={styles.actionButton} />
        <Button
          title={isLastStep ? 'Finish' : 'Next'}
          onPress={isLastStep ? submit : goNext}
          loading={saving}
          style={styles.actionButton}
        />
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 0,
    paddingTop: 0,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.md,
  },
  progressLabel: {
    ...typography.small,
    fontWeight: '800',
  },
  progressPercent: {
    ...typography.small,
    color: colors.primary,
    fontWeight: '800',
  },
  progressTrack: {
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.surfaceMuted,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 5,
    backgroundColor: colors.success,
  },
  title: {
    ...typography.heading,
    color: colors.primary,
  },
  helper: {
    ...typography.body,
    color: colors.textMuted,
  },
  form: {
    gap: spacing.md,
  },
  textArea: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
  timeRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  timeInput: {
    flex: 1,
  },
  options: {
    gap: spacing.sm,
  },
  optionCard: {
    minHeight: 56,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  optionCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  optionText: {
    ...typography.body,
    flex: 1,
  },
  optionTextSelected: {
    color: colors.primary,
    fontWeight: '800',
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  actionButton: {
    flex: 1,
  },
});

export default Questions;
