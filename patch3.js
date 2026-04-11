const fs = require('fs');
const file = '/home/meta/Downloads/thinko (copy 1)/src/components/VideoFeed/CoubClassicItem.tsx';
let content = fs.readFileSync(file, 'utf8');


// Make the infoPanelWrapper narrower so the border is completely within the video border
// and move it up more so it's clearly an overlay inside the video, not a weird adjoining box
content = content.replace(
`    infoPanelWrapper: {
        width: CARD_WIDTH - 24, // Slightly narrower than video for a premium overlapping look
        marginTop: -20, // Overlap video intentionally
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
        zIndex: 10,
    },`,
`    infoPanelWrapper: {
        width: CARD_WIDTH - 32, // Narrow enough to clearly sit inside the video width
        marginTop: -32, // Overlap higher up into the video space
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 8,
        elevation: 8,
        zIndex: 10,
    },`
);

// Simplify the infoPanel borders and colors
content = content.replace(
`    infoPanel: {
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 12,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
        backgroundColor: 'rgba(0,0,0,0.3)', // Ensure base level of darkness
    },`,
`    infoPanel: {
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 12,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        backgroundColor: 'rgba(20,20,20,0.4)',
    },`
);


// remove the inner border from the video container which creates the 'two outlines' issue
content = content.replace(
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
    },`,
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
    },`
);

// return the badge to the cleaner setup without borders since that also might be one of the borders they hate
content = content.replace(
`    floatingAuthorBadge: {
        position: 'absolute',
        top: 12, // Floating slightly inside the top-left of the video
        left: 12,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        overflow: 'hidden',
        paddingRight: 10,
        paddingLeft: 4,
        paddingVertical: 4,
        borderRadius: 20,
        zIndex: 20, // Ensure it sits above the video
    },`,
`    floatingAuthorBadge: {
        position: 'absolute',
        top: 12, // Floating slightly inside the top-left of the video
        left: 12,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(20,20,20,0.6)',
        overflow: 'hidden',
        paddingRight: 10,
        paddingLeft: 4,
        paddingVertical: 4,
        borderRadius: 20,
        zIndex: 20, // Ensure it sits above the video
    },`
);

fs.writeFileSync(file, content);
console.log('Done!');
