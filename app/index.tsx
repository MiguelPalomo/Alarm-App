import { AppRegistry } from 'react-native';
import App from '../App';
import notifee, { EventType } from '@notifee/react-native';

// Register background handler globally
notifee.onBackgroundEvent(async ({ type, detail }) => {
    console.log('Background Event:', type);
});

export default App;
