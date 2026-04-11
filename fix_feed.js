const fs = require('fs');

const feedFile = '/home/meta/Downloads/thinko (copy 1)/src/components/VideoFeed/CoubClassicFeed.tsx';
let feedContent = fs.readFileSync(feedFile, 'utf8');

if (!feedContent.includes('const [containerHeight, setContainerHeight] = useState')) {
    feedContent = feedContent.replace(
        `const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);`,
        `const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);\n    const [containerHeight, setContainerHeight] = useState(0);`
    );

    feedContent = feedContent.replace(
        `<View style={[styles.container, { backgroundColor: theme.colors.background.primary }]}>`,
        `<View 
            style={[styles.container, { backgroundColor: theme.colors.background.primary }]}
            onLayout={(e) => setContainerHeight(e.nativeEvent.layout.height)}
        >`
    );

    feedContent = feedContent.replace(
        `                contentContainerStyle={{
                    paddingTop: paddingTop + 20, // Extra padding top for floating cards
                    paddingBottom: paddingBottom + 40,
                }}`,
        `                contentContainerStyle={{}}
                pagingEnabled
                decelerationRate="fast"
                snapToAlignment="start"`
    );

    feedContent = feedContent.replace(
        `        return (
            <CoubClassicItem`,
        `        return (
            <View style={{ height: containerHeight || 800, justifyContent: 'center' }}>
                <CoubClassicItem`
    );

    feedContent = feedContent.replace(
        `                onSelect={() => setSelectedVideoId(item.id)}
            />
        );`,
        `                onSelect={() => setSelectedVideoId(item.id)}
            />
            </View>
        );`
    );

    fs.writeFileSync(feedFile, feedContent);
}

const itemFile = '/home/meta/Downloads/thinko (copy 1)/src/components/VideoFeed/CoubClassicItem.tsx';
let itemContent = fs.readFileSync(itemFile, 'utf8');

if (itemContent.includes('marginBottom: 32')) {
    itemContent = itemContent.replace(
        `    card: {
        width: SCREEN_WIDTH,
        paddingHorizontal: CARD_MARGIN,
        marginBottom: 32, // Large gap between cards
        alignItems: 'center',
    },`,
        `    card: {
        width: SCREEN_WIDTH,
        paddingHorizontal: CARD_MARGIN,
        alignItems: 'center',
    },`
    );

    fs.writeFileSync(itemFile, itemContent);
}

console.log('Fixed feed scroll layout!');
