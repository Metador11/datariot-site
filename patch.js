const fs = require('fs');
const file = '/home/meta/Downloads/thinko (copy 1)/src/components/VideoFeed/CoubClassicItem.tsx';
let content = fs.readFileSync(file, 'utf8');

// replace margin-top of infoPanelWrapper
content = content.replace(
`    infoPanelWrapper: {
        width: CARD_WIDTH - 20, // Slightly narrower than video
        marginTop: -16, // Overlap video slightly
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,`,
`    infoPanelWrapper: {
        width: CARD_WIDTH, // Match video width exactly
        marginTop: 16, // Detached from video to avoid weird overlap outline
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.15,`
);

// update infoPanel border and radius
content = content.replace(
`    infoPanel: {
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 12,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },`,
`    infoPanel: {
        borderRadius: 24,
        paddingHorizontal: 16,
        paddingVertical: 14,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },`
);

// add linear gradient import
if (!content.includes("import { LinearGradient }")) {
    content = content.replace(
        `import { BlurView } from 'expo-blur';`,
        `import { BlurView } from 'expo-blur';\nimport { LinearGradient } from 'expo-linear-gradient';`
    );
}

// add linear gradient to infoPanel and update BlurView
content = content.replace(
`                <BlurView intensity={isDark ? 50 : 80} tint={isDark ? "dark" : "light"} style={styles.infoPanel}>
                    <View style={[styles.infoPanelContent, isExpanded && styles.infoPanelContentExpanded]}>`,
`                <View style={[styles.infoPanelShadow]}>
                <BlurView intensity={isDark ? 40 : 80} tint={isDark ? "dark" : "light"} style={styles.infoPanel}>
                    {isDark && (
                        <LinearGradient
                            colors={['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.02)']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 0.5, y: 1 }}
                            style={[StyleSheet.absoluteFillObject, { opacity: 0.6 }]}
                        />
                    )}
                    <View style={[styles.infoPanelContent, isExpanded && styles.infoPanelContentExpanded]}>`
);

content = content.replace(
`                    </View>
                </BlurView>`,
`                    </View>
                </BlurView>
                </View>`
);

content = content.replace(
`    infoPanelWrapper: {`,
`    infoPanelShadow: {
        borderRadius: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
        elevation: 8,
    },
    infoPanelWrapper: {`
);

// update floatingAuthorBadge backgrnd
content = content.replace(
`        backgroundColor: 'rgba(20,20,20,0.7)',`,
`        backgroundColor: 'rgba(0,0,0,0.5)',
        borderColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        overflow: 'hidden',`
);

content = content.replace(
`                <Pressable onPress={handleNavigateProfile} style={styles.floatingAuthorBadge}>
                    <Image source={{ uri: item.avatarUrl || 'https://i.pravatar.cc/100' }} style={styles.avatar} />
                    <Text style={styles.authorNameBadge}>{item.author}</Text>
                </Pressable>`,
`                <Pressable onPress={handleNavigateProfile} style={styles.floatingAuthorBadge}>
                    <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
                    <Image source={{ uri: item.avatarUrl || 'https://i.pravatar.cc/100' }} style={styles.avatar} />
                    <Text style={[styles.authorNameBadge, { textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 2 }]}>{item.author}</Text>
                </Pressable>`
);

// update video container border
content = content.replace(
`    videoContainer: {
        width: CARD_WIDTH,
        height: VIDEO_HEIGHT,
        backgroundColor: '#111',
        borderRadius: 24,
        overflow: 'hidden',
        position: 'relative',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.5,
        shadowRadius: 15,
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
        borderColor: 'rgba(255,255,255,0.08)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.4,
        shadowRadius: 20,
        elevation: 10,
    },`
);

fs.writeFileSync(file, content);
console.log('Done!');
