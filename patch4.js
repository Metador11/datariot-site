const fs = require('fs');
const file = '/home/meta/Downloads/thinko (copy 1)/src/components/VideoFeed/CoubClassicItem.tsx';
let content = fs.readFileSync(file, 'utf8');

// Undo the darkening and adjust the vertical position (marginTop)
content = content.replace(
`    infoPanelWrapper: {
        width: CARD_WIDTH - 32, // Narrow enough to clearly sit inside the video width
        marginTop: -32, // Overlap higher up into the video space
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 8,
        elevation: 8,
        zIndex: 10,
    },`,
`    infoPanelWrapper: {
        width: CARD_WIDTH - 32, // Narrow enough to clearly sit inside the video width
        marginTop: -24, // Overlap slightly lower
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 8,
        elevation: 8,
        zIndex: 10,
    },`
);

content = content.replace(
`    infoPanel: {
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 12,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        backgroundColor: 'rgba(20,20,20,0.4)',
    },`,
`    infoPanel: {
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 12,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        // backgroundColor removed to rely on BlurView purely
    },`
);

fs.writeFileSync(file, content);
console.log('Done!');
