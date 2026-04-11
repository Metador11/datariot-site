const fs = require('fs');
const file = '/home/meta/Downloads/thinko (copy 1)/src/components/VideoFeed/CoubClassicItem.tsx';
let content = fs.readFileSync(file, 'utf8');

// Also remove BlurView intensity overriding if it was darkened
content = content.replace(
`                <BlurView intensity={isDark ? 60 : 80} tint={isDark ? "dark" : "light"} style={styles.infoPanel}>`,
`                <BlurView intensity={isDark ? 50 : 80} tint={isDark ? "dark" : "light"} style={styles.infoPanel}>`
);

fs.writeFileSync(file, content);
console.log('Done!');
