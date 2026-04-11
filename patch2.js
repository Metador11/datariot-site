const fs = require('fs');
const file = '/home/meta/Downloads/thinko (copy 1)/src/components/VideoFeed/CoubClassicItem.tsx';
let content = fs.readFileSync(file, 'utf8');

// remove infoPanelShadow style
content = content.replace(
`    infoPanelShadow: {
        borderRadius: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
        elevation: 8,
    },`,
``
);

// update infoPanelWrapper to overlap slightly again but fix borders
content = content.replace(
`    infoPanelWrapper: {
        width: CARD_WIDTH, // Match video width exactly
        marginTop: 16, // Detached from video to avoid weird overlap outline
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 8,
        zIndex: 10,
    },`,
`    infoPanelWrapper: {
        width: CARD_WIDTH - 24, // Slightly narrower than video for a premium overlapping look
        marginTop: -20, // Overlap video intentionally
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
        zIndex: 10,
    },`
);

// update infoPanel border and radius
content = content.replace(
`    infoPanel: {
        borderRadius: 24,
        paddingHorizontal: 16,
        paddingVertical: 14,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },`,
`    infoPanel: {
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 12,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
        backgroundColor: 'rgba(0,0,0,0.3)', // Ensure base level of darkness
    },`
);

// update jsx structure to remove infoPanelShadow wrapper
content = content.replace(
`                <View style={[styles.infoPanelShadow]}>
                <BlurView intensity={isDark ? 40 : 80} tint={isDark ? "dark" : "light"} style={styles.infoPanel}>`,
`                <BlurView intensity={isDark ? 60 : 80} tint={isDark ? "dark" : "light"} style={styles.infoPanel}>`
);

content = content.replace(
`                </BlurView>
                </View>`,
`                </BlurView>`
);


// update video container border to remove it or soften it
content = content.replace(
`    videoContainer: {
        width: CARD_WIDTH,
        height: VIDEO_HEIGHT,
        backgroundColor: '#111',
        borderRadius: 24,
        overflow: 'hidden',
        position: 'relative',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.4,
        shadowRadius: 20,
        elevation: 10,
    },`,
`    videoContainer: {
        width: CARD_WIDTH,
        height: VIDEO_HEIGHT,
        backgroundColor: '#111',
        borderRadius: 24,
        overflow: 'hidden',
        position: 'relative',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)', // Very subtle inner/outer border
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.5,
        shadowRadius: 15,
        elevation: 10,
    },`
);

fs.writeFileSync(file, content);
console.log('Done!');
