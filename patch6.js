const fs = require('fs');
const file = '/home/meta/Downloads/thinko (copy 1)/src/components/VideoFeed/CoubClassicItem.tsx';
let content = fs.readFileSync(file, 'utf8');

// Ensure nativeControls is false since we are managing press
content = content.replace(
`                <VideoView
                    player={player}
                    style={StyleSheet.absoluteFillObject}
                    contentFit="cover"
                    nativeControls={false}
                />`,
`                <VideoView
                    player={player}
                    style={StyleSheet.absoluteFillObject}
                    contentFit="cover"
                    nativeControls={false}
                    pointerEvents="none" 
                />`
);

fs.writeFileSync(file, content);
console.log('Done!');
