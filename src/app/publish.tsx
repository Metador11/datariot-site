import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, Image, KeyboardAvoidingView, Platform, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useAudioRecorder, useAudioPlayer, requestRecordingPermissionsAsync, RecordingPresets, useAudioPlayerStatus } from 'expo-audio';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '@lib/supabase/hooks/useAuth';
import { VIDEO_CATEGORIES, CATEGORY_DISPLAY_NAMES, VideoCategory } from '@lib/constants/categories';

export default function PublishScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const { videoUri, trimStart, trimEnd } = params;
    const { user } = useAuth();

    const [caption, setCaption] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<VideoCategory | null>(null);
    const [uploading, setUploading] = useState(false);

    // New Media State
    const [imageUri, setImageUri] = useState<string | null>(null);
    const [audioUri, setAudioUri] = useState<string | null>(null);

    const videoPlayer = useVideoPlayer(videoUri as string | null, player => {
        player.loop = false;
        player.muted = true;
    });

    const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
    const audioPlayer = useAudioPlayer(audioUri);
    const audioStatus = useAudioPlayerStatus(audioPlayer);
    const isPlaying = audioStatus.playing;
    const isRecording = recorder.isRecording;

    // --- Image Picker ---
    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission needed', 'Please allow access to your photos.');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
        });

        if (!result.canceled) {
            setImageUri(result.assets[0].uri);
            // Clear other media types if needed (e.g. valid only one attachment)
            setAudioUri(null);
        }
    };

    // --- Audio Recording ---
    async function startRecording() {
        try {
            const { granted } = await requestRecordingPermissionsAsync();
            if (granted) {
                await recorder.prepareToRecordAsync();
                recorder.record();
                // Clear other media
                setImageUri(null);
                setAudioUri(null);
            } else {
                Alert.alert('Permission needed', 'Microphone access is required.');
            }
        } catch (err) {
            console.error('Failed to start recording', err);
        }
    }

    async function stopRecording() {
        if (!recorder.isRecording) return;

        await recorder.stop();
        setAudioUri(recorder.uri);
    }

    function playSound() {
        if (!audioUri) return;

        if (audioPlayer.currentTime >= audioPlayer.duration && audioPlayer.duration > 0) {
            audioPlayer.seekTo(0);
        }
        audioPlayer.play();
    }

    function stopSound() {
        audioPlayer.pause();
    }

    // --- Posting ---
    const handlePost = async () => {
        const hasMedia = videoUri || imageUri || audioUri;
        if (!caption.trim() && !hasMedia) {
            Alert.alert('Empty Post', 'Please write something or attach media.');
            return;
        }

        if (!user) {
            Alert.alert('Error', 'You must be logged in.');
            return;
        }

        setUploading(true);

        try {
            const supabase = (await import('@lib/supabase/client')).supabase;

            if (videoUri) {
                // ... Video Logic (unchanged from original for now) ...
                const { error } = await supabase
                    .from('videos') // Assuming 'videos' table for full screen videos
                    .insert({
                        user_id: user.id,
                        title: caption.substring(0, 50) || 'New Short Video',
                        description: caption,
                        video_url: videoUri,
                        category: selectedCategory,
                        duration: Math.round((Number(trimEnd || 0) - Number(trimStart || 0)) / 1000) || 60,
                        is_published: true
                    });
                if (error) throw error;
            } else {
                // Generic Posts (Text, Image, Audio)
                const { error } = await supabase
                    .from('posts')
                    .insert({
                        user_id: user.id,
                        content: caption,
                        image_url: imageUri || null, // Mock upload
                        is_published: true,
                        // Add type field if schema supports it
                        // type: imageUri ? 'image' : audioUri ? 'audio' : 'text'
                    });

                if (error) {
                    console.error("Post insert error:", error);
                    throw error;
                }
            }

            // Wait a sec for propagation
            await new Promise(resolve => setTimeout(resolve, 500));

            Alert.alert('Success', 'Published!');
            router.replace('/(tabs)/profile'); // Or back to feed
        } catch (error: any) {
            console.error(error);
            Alert.alert('Error', 'Failed to publish: ' + (error.message || 'Unknown error'));
        } finally {
            setUploading(false);
        }
    };

    // Verification State
    const [isVerifying, setIsVerifying] = useState(false);
    const [verificationStatus, setVerificationStatus] = useState<'idle' | 'verified' | 'rejected'>('idle');

    useEffect(() => {
        if (videoUri) {
            verifyVideoContent();
        } else {
            setVerificationStatus('idle');
        }
    }, [videoUri]);

    const verifyVideoContent = async () => {
        setIsVerifying(true);
        setVerificationStatus('idle');

        // Mock verification delay
        setTimeout(() => {
            setIsVerifying(false);
            // innovative AI logic: always approve for now!
            const passed = true;
            if (passed) {
                setVerificationStatus('verified');
            } else {
                setVerificationStatus('rejected');
            }
        }, 2000);
    };

    const isVideoSelection = !!videoUri;

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <Stack.Screen options={{ headerShown: false }} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={handlePost}
                    disabled={uploading || isVerifying || (isVideoSelection && verificationStatus !== 'verified')}
                    style={[
                        styles.postButton,
                        (uploading || isVerifying || (isVideoSelection && verificationStatus !== 'verified')) && styles.disabledButton
                    ]}
                >
                    {uploading ? (
                        <ActivityIndicator color="#fff" size="small" />
                    ) : (
                        <Text style={styles.postButtonText}>Post</Text>
                    )}
                </TouchableOpacity>
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 100 }}>
                    {/* User Info (Optional) */}
                    <View style={styles.userInfo}>
                        <View style={styles.avatarPlaceholder}>
                            <Text style={styles.avatarText}>{user?.email?.charAt(0).toUpperCase() || 'U'}</Text>
                        </View>
                        <Text style={styles.username}>@{user?.email?.split('@')[0] || 'username'}</Text>
                    </View>

                    {/* Text Input */}
                    <TextInput
                        style={styles.textInput}
                        placeholder={isVideoSelection ? "Write a caption..." : "State your thesis..."}
                        placeholderTextColor="#666"
                        multiline
                        value={caption}
                        onChangeText={setCaption}
                        autoFocus={!isVideoSelection}
                    />

                    {/* PREVIEWS */}
                    {isVideoSelection && (
                        <View style={styles.mediaPreview}>
                            <VideoView
                                player={videoPlayer}
                                style={styles.video}
                                contentFit="cover"
                                nativeControls={false}
                            />

                            {/* Verification Overlay */}
                            {isVerifying && (
                                <View style={styles.verificationOverlay}>
                                    <ActivityIndicator size="large" color="#3385FF" />
                                    <Text style={styles.verificationText}>Verifying AI Content...</Text>
                                </View>
                            )}

                            {/* Verification Badges */}
                            {!isVerifying && verificationStatus === 'verified' && (
                                <View style={[styles.videoBadge, { backgroundColor: 'rgba(34, 197, 94, 0.9)' }]}>
                                    <Ionicons name="checkmark-circle" size={14} color="white" />
                                    <Text style={styles.videoBadgeText}>AI Verified</Text>
                                </View>
                            )}

                            {!isVerifying && verificationStatus === 'rejected' && (
                                <View style={styles.errorOverlay}>
                                    <Ionicons name="alert-circle" size={48} color="#ef4444" />
                                    <Text style={styles.errorTitle}>Verification Failed</Text>
                                    <Text style={styles.errorText}>
                                        This video does not appear to be AI-generated.
                                        Please upload AI-related content only.
                                    </Text>
                                </View>
                            )}
                        </View>
                    )}

                    {imageUri && (
                        <View style={styles.imagePreviewContainer}>
                            <Image source={{ uri: imageUri }} style={styles.imagePreview} />
                            <TouchableOpacity style={styles.removeMedia} onPress={() => setImageUri(null)}>
                                <Ionicons name="close" size={20} color="#FFF" />
                            </TouchableOpacity>
                        </View>
                    )}

                    {audioUri && (
                        <View style={styles.audioPreviewContainer}>
                            <TouchableOpacity onPress={isPlaying ? stopSound : playSound} style={styles.playButton}>
                                <Ionicons name={isPlaying ? "pause" : "play"} size={24} color="#000" />
                            </TouchableOpacity>
                            <View style={styles.audioWaveform}>
                                <View style={[styles.bar, { height: 12 }]} />
                                <View style={[styles.bar, { height: 20 }]} />
                                <View style={[styles.bar, { height: 16 }]} />
                                <View style={[styles.bar, { height: 24 }]} />
                                <View style={[styles.bar, { height: 10 }]} />
                            </View>
                            <TouchableOpacity style={styles.deleteAudio} onPress={() => {
                                setAudioUri(null);
                            }}>
                                <Ionicons name="trash-outline" size={20} color="#ef4444" />
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* Category Selection */}
                    {isVideoSelection && (
                        <View style={styles.categorySection}>
                            <Text style={styles.sectionTitle}>Select Category</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryList}>
                                {VIDEO_CATEGORIES.map((cat) => (
                                    <TouchableOpacity
                                        key={cat}
                                        onPress={() => setSelectedCategory(cat)}
                                        style={[
                                            styles.categoryChip,
                                            selectedCategory === cat && styles.categoryChipActive
                                        ]}
                                    >
                                        <Text style={[
                                            styles.categoryChipText,
                                            selectedCategory === cat && styles.categoryChipTextActive
                                        ]}>
                                            {CATEGORY_DISPLAY_NAMES[cat]}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                    )}

                </ScrollView>

                {/* TOOLBAR */}
                {!isVideoSelection && (
                    <View style={styles.toolbar}>
                        <TouchableOpacity style={styles.toolbarButton} onPress={pickImage}>
                            <Ionicons name="image-outline" size={24} color="#3385FF" />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.toolbarButton,
                                isRecording && styles.recordingButton
                            ]}
                            onPressIn={startRecording}
                            onPressOut={stopRecording}
                        >
                            <MaterialIcons
                                name="mic"
                                size={24}
                                color={isRecording ? "#FFF" : "#3385FF"}
                            />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.toolbarButton}>
                            <MaterialIcons name="poll" size={24} color="#3385FF" />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.toolbarButton}>
                            <Ionicons name="location-outline" size={24} color="#3385FF" />
                        </TouchableOpacity>

                        {isRecording && (
                            <Text style={styles.recordingText}>Recording...</Text>
                        )}
                    </View>
                )}
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.1)',
    },
    cancelText: {
        color: '#FFF',
        fontSize: 16,
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FFF',
    },
    backButton: {
        padding: 8,
    },
    postButton: {
        backgroundColor: '#3385FF',
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 20,
    },
    disabledButton: {
        opacity: 0.5,
    },
    postButtonText: {
        color: '#000',
        fontWeight: 'bold',
        fontSize: 14,
    },
    content: {
        flex: 1,
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    avatarPlaceholder: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#333',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    avatarText: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 16,
    },
    username: {
        color: '#FFF',
        fontWeight: '600',
        fontSize: 16,
    },
    textInput: {
        fontSize: 18,
        color: '#FFF',
        minHeight: 100,
        textAlignVertical: 'top',
        paddingHorizontal: 20,
        paddingTop: 16,
    },

    // Media Previews
    mediaPreview: {
        marginHorizontal: 20,
        height: 250,
        borderRadius: 16,
        overflow: 'hidden',
        backgroundColor: '#111',
        position: 'relative',
        marginTop: 10,
    },
    categorySection: {
        marginTop: 24,
        paddingHorizontal: 20,
    },
    sectionTitle: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 12,
        opacity: 0.8,
    },
    categoryList: {
        gap: 8,
        paddingRight: 20,
    },
    categoryChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    categoryChipActive: {
        backgroundColor: '#3385FF',
        borderColor: '#3385FF',
    },
    categoryChipText: {
        color: '#AAA',
        fontSize: 14,
        fontWeight: '500',
    },
    categoryChipTextActive: {
        color: '#000',
        fontWeight: 'bold',
    },
    video: {
        width: '100%',
        height: '100%',
    },
    videoBadge: {
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: 'rgba(0,0,0,0.6)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    videoBadgeText: {
        color: 'white',
        fontSize: 10,
        fontWeight: 'bold',
    },

    imagePreviewContainer: {
        marginHorizontal: 20,
        marginTop: 10,
        borderRadius: 16,
        overflow: 'hidden',
    },
    imagePreview: {
        width: '100%',
        height: 300,
        resizeMode: 'cover',
        borderRadius: 16,
    },
    removeMedia: {
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: 'rgba(0,0,0,0.6)',
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },

    audioPreviewContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1e293b',
        marginHorizontal: 20,
        marginTop: 20,
        padding: 12,
        borderRadius: 16,
    },
    playButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#3385FF',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    audioWaveform: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        height: 40,
        gap: 4,
    },
    bar: {
        width: 4,
        backgroundColor: '#3385FF',
        borderRadius: 2,
    },
    deleteAudio: {
        padding: 8,
    },

    // Toolbar
    toolbar: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.1)',
        backgroundColor: '#000',
    },
    toolbarButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 8,
        backgroundColor: 'rgba(51, 133, 255, 0.1)',
    },
    recordingButton: {
        backgroundColor: '#ef4444',
        transform: [{ scale: 1.1 }],
    },
    recordingText: {
        color: '#ef4444',
        marginLeft: 'auto',
        fontWeight: 'bold',
    },
    verificationOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
    verificationText: {
        color: '#FFF',
        marginTop: 10,
        fontSize: 14,
        fontWeight: '600',
    },
    errorOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.85)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
        padding: 20,
    },
    errorTitle: {
        color: '#ef4444',
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 10,
        marginBottom: 5,
    },
    errorText: {
        color: '#ccc',
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 20,
    },
});
