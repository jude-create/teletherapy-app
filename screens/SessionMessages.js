import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button, Card, EmptyState, ErrorState, Input, LoadingState, Screen } from '../components/ui';
import { getCurrentUser } from '../services/auth';
import { formatAppointmentDate } from '../services/appointments';
import { sendAppointmentMessage, subscribeToMessagesForAppointment } from '../services/messages';
import { colors, spacing, typography } from '../theme';

const SessionMessages = ({ route }) => {
  const appointment = route?.params?.appointment;
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    setLoading(true);
    setErrorMessage('');
    const unsubscribe = subscribeToMessagesForAppointment(
      appointment?.id,
      (nextMessages) => {
        setMessages(nextMessages);
        setLoading(false);
      },
      (error) => {
        setErrorMessage(error.message);
        setLoading(false);
      }
    );
    return unsubscribe;
  }, [appointment?.id]);

  const sendMessage = async () => {
    try {
      setSending(true);
      setErrorMessage('');
      const currentUser = getCurrentUser();
      const senderRole = currentUser?.uid === appointment?.therapistId ? 'therapist' : 'patient';

      await sendAppointmentMessage({
        appointment,
        sender: {
          uid: currentUser?.uid,
          email: currentUser?.email,
          displayName: currentUser?.displayName,
          role: senderRole,
        },
        text: draft,
      });
      setDraft('');
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setSending(false);
    }
  };

  if (!appointment) {
    return (
      <Screen scroll={false}>
        <EmptyState title="No appointment selected" message="Open messages from an approved visit." />
      </Screen>
    );
  }

  return (
    <Screen contentContainerStyle={styles.content}>
      <Card>
        <Text style={styles.title}>Session Messages</Text>
        <Text style={styles.body}>
          {appointment.therapistName || appointment.therapist?.name || 'Therapist'} •{' '}
          {formatAppointmentDate(appointment.appointmentDateTime)}
        </Text>
      </Card>

      {errorMessage ? <ErrorState title="Message issue" message={errorMessage} /> : null}
      {loading ? <LoadingState message="Loading messages..." /> : null}

      {!loading && messages.length === 0 ? (
        <EmptyState
          title="No messages yet"
          message="Use this space for appointment questions, prep notes, or follow-up details."
        />
      ) : null}

      {!loading &&
        messages.map((message) => {
          const mine = message.senderId === getCurrentUser()?.uid;
          return (
            <View
              key={message.id}
              style={[styles.messageBubble, mine ? styles.messageMine : styles.messageTheirs]}
            >
              <Text style={styles.messageSender}>{mine ? 'You' : message.senderName}</Text>
              <Text style={styles.messageText}>{message.text}</Text>
            </View>
          );
        })}

      <Card>
        <Input
          label="Message"
          multiline
          value={draft}
          onChangeText={setDraft}
          placeholder="Write a short session message"
          inputStyle={styles.messageInput}
        />
        <Button title="Send Message" onPress={sendMessage} loading={sending} />
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
  },
  body: {
    ...typography.body,
    color: colors.textMuted,
  },
  messageBubble: {
    maxWidth: '88%',
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.xs,
  },
  messageMine: {
    alignSelf: 'flex-end',
    backgroundColor: colors.primarySoft,
  },
  messageTheirs: {
    alignSelf: 'flex-start',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  messageSender: {
    ...typography.caption,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  messageText: {
    ...typography.body,
  },
  messageInput: {
    minHeight: 92,
    textAlignVertical: 'top',
  },
});

export default SessionMessages;
