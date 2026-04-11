const fs = require('fs');
const file = '/home/meta/Downloads/thinko (copy 1)/src/components/VideoFeed/CoubClassicItem.tsx';
let content = fs.readFileSync(file, 'utf8');

// The best way to hide "black bars" for "contain" videos without cropping
// the main video itself is to render a second VideoView behind it with "cover"
// and a heavy blur over it. That way the blurry background fills the space
// perfectly matching the video colours.
content = content.replace(
    `                <VideoView
                    player={player}
                    style={StyleSheet.absoluteFillObject}
                    contentFit="contain"
                    nativeControls={false}
                    pointerEvents="none" 
                />`,
    `                {/* Background blurred video to fill black bars */}
                <VideoView
                    player={player}
                    style={StyleSheet.absoluteFillObject}
                    contentFit="cover"
                    nativeControls={false}
                    pointerEvents="none"
                />
                <BlurView 
                    intensity={60} 
                    tint="dark" 
                    style={StyleSheet.absoluteFillObject}
                    pointerEvents="none"
                />
                
                {/* Foreground uncropped video */}
                <VideoView
                    player={player}
                    style={StyleSheet.absoluteFillObject}
                    contentFit="contain"
                    nativeControls={false}
                    pointerEvents="none" 
                />`
);

fs.writeFileSync(file, content);
console.log('Added blurred background player!');
