import 'react-native-gesture-handler';
import StackNavigator from './StackNavigator';
import { configureGoogleSignIn } from './config/googleAuth';
import { configurePushNotificationHandler } from './services/pushNotifications';
import { ThemeProvider } from './theme';

configureGoogleSignIn();
configurePushNotificationHandler();

export default function App() {
  return (
    <ThemeProvider>
      <StackNavigator />
    </ThemeProvider>
  );
}
