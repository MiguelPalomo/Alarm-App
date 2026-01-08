const { withAndroidManifest } = require('@expo/config-plugins');

/**
 * Expo config plugin to modify AndroidManifest.xml for alarm functionality
 * Adds necessary permissions and activity flags for lock screen alarms
 */
module.exports = function withAndroidAlarmManifest(config) {
  return withAndroidManifest(config, async (config) => {
    const androidManifest = config.modResults;
    const { manifest } = androidManifest;

    // Ensure uses-permission array exists
    if (!manifest['uses-permission']) {
      manifest['uses-permission'] = [];
    }

    // Add required permissions if not already present
    const permissions = [
      'android.permission.USE_FULL_SCREEN_INTENT',
      'android.permission.WAKE_LOCK',
      'android.permission.SCHEDULE_EXACT_ALARM',
      'android.permission.POST_NOTIFICATIONS',
      'android.permission.VIBRATE',
      'android.permission.RECEIVE_BOOT_COMPLETED'
    ];

    permissions.forEach(permission => {
      const exists = manifest['uses-permission'].some(
        p => p.$['android:name'] === permission
      );
      if (!exists) {
        manifest['uses-permission'].push({
          $: { 'android:name': permission }
        });
      }
    });

    // Configure main activity to show when locked
    if (manifest.application && manifest.application[0].activity) {
      const mainActivity = manifest.application[0].activity.find(
        activity => activity.$['android:name'] === '.MainActivity'
      );

      if (mainActivity) {
        // Add flags to show activity on lock screen
        mainActivity.$['android:showWhenLocked'] = 'true';
        mainActivity.$['android:turnScreenOn'] = 'true';
        
        // Keep these existing flags
        if (!mainActivity.$['android:launchMode']) {
          mainActivity.$['android:launchMode'] = 'singleTask';
        }
      }
    }

    return config;
  });
};
