import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { AppNavigationProp } from '../types/navigation';
import { CheckCircleIcon } from 'react-native-heroicons/solid';
import { Button, Card, ErrorState, Header, Screen } from '../components/ui';
import { getCurrentUser } from '../services/auth';
import { savePatientQuestionnaire } from '../services/patients';
import { colors, spacing, typography } from '../theme';

type PatientQuestionnaireKey =
  | 'selectedOption'
  | 'gender'
  | 'relationshipStatus'
  | 'therapistPreferences'
  | 'therapistExperience';

type PatientQuestionnaireAnswers = {
  selectedOption: string;
  gender: string;
  relationshipStatus: string;
  therapistPreferences: string[];
  therapistExperience: string[];
};

type PatientQuestionnaireStep = {
  key: PatientQuestionnaireKey;
  title: string;
  helper: string;
  type: 'single' | 'multi';
  required: boolean;
  options: string[];
};

type OptionCardProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
};

const experienceOptions = [
  'Depression',
  'Stress and Anxiety',
  'Coping with addictions',
  'Relationship issues',
  'Family conflicts',
  'Trauma and abuse',
  'Coping with grief and loss',
  'Anger management',
  'Bipolar disorder',
  'Concentration, memory and focus',
];

const steps: PatientQuestionnaireStep[] = [
  {
    key: 'selectedOption',
    title: 'What type of therapy are you looking for?',
    helper: 'Choose the care format that feels closest to what you need right now.',
    type: 'single',
    required: true,
    options: ['Individual', 'Couples', 'Teen'],
  },
  {
    key: 'gender',
    title: 'What is your gender identity?',
    helper: 'This helps your therapist understand how to address your profile.',
    type: 'single',
    required: true,
    options: ['Female', 'Male', 'Prefer not to say'],
  },
  {
    key: 'relationshipStatus',
    title: 'What is your relationship status?',
    helper: 'Select the option that best describes your current situation.',
    type: 'single',
    required: true,
    options: ['Single', 'In a relationship', 'Married', 'Divorced', 'Widowed'],
  },
  {
    key: 'therapistPreferences',
    title: 'Therapist preferences',
    helper: 'Choose any preferences that would help you feel comfortable.',
    type: 'multi',
    required: false,
    options: [
      'Male therapist',
      'Female therapist',
      'Christian-based therapist',
      'Non-religious therapist',
      'Older therapist (45+)',
    ],
  },
  {
    key: 'therapistExperience',
    title: 'I prefer a therapist with experience in...',
    helper: 'Select all areas that apply. You can update these later.',
    type: 'multi',
    required: true,
    options: experienceOptions,
  },
];

const OptionCard = ({ label, selected, onPress }: OptionCardProps) => (
  <Pressable
    accessibilityRole="button"
    onPress={onPress}
    style={[styles.optionCard, selected && styles.optionCardSelected]}
  >
    <Text style={[styles.optionText, selected && styles.optionTextSelected]}>{label}</Text>
    {selected ? <CheckCircleIcon size={22} color={colors.primary} /> : null}
  </Pressable>
);

const Questionnaire = () => {
  const navigation = useNavigation<AppNavigationProp>();
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<PatientQuestionnaireAnswers>({
    selectedOption: '',
    gender: '',
    relationshipStatus: '',
    therapistPreferences: [],
    therapistExperience: [],
  });
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const currentStep = steps[stepIndex];
  const progress = useMemo(() => ((stepIndex + 1) / steps.length) * 100, [stepIndex]);
  const currentValue = answers[currentStep.key];

  const hasAnswer = (step = currentStep) => {
    const value = answers[step.key];
    return Array.isArray(value) ? value.length > 0 : Boolean(value);
  };

  const selectOption = (option: string) => {
    setErrorMessage('');
    setAnswers((previous) => {
      if (currentStep.type === 'multi') {
        const current = previous[currentStep.key] as string[];
        const next = current.includes(option)
          ? current.filter((item) => item !== option)
          : [...current, option];
        return { ...previous, [currentStep.key]: next };
      }

      return { ...previous, [currentStep.key]: option };
    });
  };

  const goBack = () => {
    setErrorMessage('');
    if (stepIndex === 0) {
      navigation.navigate('PatientDrawer');
      return;
    }
    setStepIndex((index) => index - 1);
  };

  const goNext = () => {
    if (currentStep.required && !hasAnswer()) {
      setErrorMessage('Please choose an option before continuing.');
      return;
    }

    setErrorMessage('');
    setStepIndex((index) => index + 1);
  };

  const submit = async () => {
    const missingStep = steps.find((step) => step.required && !hasAnswer(step));
    if (missingStep) {
      setStepIndex(steps.indexOf(missingStep));
      setErrorMessage('Please complete this step before submitting.');
      return;
    }

    try {
      setSaving(true);
      setErrorMessage('');
      const currentUser = getCurrentUser();
      if (!currentUser) {
        setErrorMessage('You need to be signed in to save your questionnaire.');
        return;
      }

      await savePatientQuestionnaire(currentUser.uid, answers);
      navigation.navigate('PatientDrawer');
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setSaving(false);
    }
  };

  const isLastStep = stepIndex === steps.length - 1;

  return (
    <Screen contentContainerStyle={styles.content}>
      <Header title="VirtualMindSpace" subtitle="Patient questionnaire" />

      <Card>
        <View style={styles.progressHeader}>
          <Text style={styles.progressLabel}>
            Step {stepIndex + 1} of {steps.length}
          </Text>
          <Text style={styles.progressPercent}>{Math.round(progress)}%</Text>
        </View>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
      </Card>

      <Card>
        <Text style={styles.title}>{currentStep.title}</Text>
        <Text style={styles.helper}>{currentStep.helper}</Text>

        {errorMessage ? <ErrorState title="Questionnaire issue" message={errorMessage} /> : null}

        <View style={styles.options}>
          {currentStep.options.map((option) => {
            const selected = Array.isArray(currentValue)
              ? currentValue.includes(option)
              : currentValue === option;
            return (
              <OptionCard
                key={option}
                label={option}
                selected={selected}
                onPress={() => selectOption(option)}
              />
            );
          })}
        </View>
      </Card>

      <View style={styles.actions}>
        <Button title="Back" variant="outline" onPress={goBack} style={styles.actionButton} />
        <Button
          title={isLastStep ? 'Submit' : 'Next'}
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

export default Questionnaire;
