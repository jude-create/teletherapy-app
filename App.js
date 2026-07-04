import 'react-native-gesture-handler';
import StackNavigator from './StackNavigator';
import { configureGoogleSignIn } from './config/googleAuth';
import { configurePushNotificationHandler } from './services/pushNotifications';

configureGoogleSignIn();
configurePushNotificationHandler();

export default function App() {
  return <StackNavigator />;
}
