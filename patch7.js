const fs = require('fs');
const file = '/home/meta/Downloads/thinko (copy 1)/src/components/VideoFeed/CoubClassicItem.tsx';
let content = fs.readFileSync(file, 'utf8');

// The VideoView from expo-video might be swallowing touches. Let's make sure pointerEvents
// is applied correctly or we wrap the pressable another way. 
// Also our overlay Gradient has no pointerEvents, which might also block touches
content = content.replace(
`                {/* Dark Gradient Overlay for better text visibility */}
                <View style={styles.overlayGradient} />`,
`                {/* Dark Gradient Overlay for better text visibility */}
                <View style={styles.overlayGradient} pointerEvents="none" />`
);

content = content.replace(
`                {/* Glowing Progress Bar integrated into bottom edge of video */}
                <View style={styles.progressBarContainer}>`,
`                {/* Glowing Progress Bar integrated into bottom edge of video */}
                <View style={styles.progressBarContainer} pointerEvents="none">`
);

fs.writeFileSync(file, content);
console.log('Done!');
