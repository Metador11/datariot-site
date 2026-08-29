import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    Pressable,
    Image,
    Alert,
    ActivityIndicator,
    ScrollView,
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from '@components/UI/SafeAreaView';
import { theme } from '@design-system/theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../components/Theme/ThemeProvider';
import { useAuth } from '@lib/supabase/hooks/useAuth';
import { supabase } from '@lib/supabase/client';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { decode } from 'base64-arraybuffer';

const BIO_MAX = 160;

export default function Page() {
    const router = useRouter();
    const { user } = useAuth();
    const { theme: t, mode } = useTheme();
    const isDark = mode === 'dark';
    const [focusedField, setFocusedField] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const [uploadingHeader, setUploadingHeader] = useState(false);

    // Log states for debugging
    console.log('EditProfile states:', { loading, uploadingAvatar, uploadingHeader });

    const [username, setUsername] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [bio, setBio] = useState('');

    // Preview states (can be local URIs or remote URLs)
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [headerPreview, setHeaderPreview] = useState<string | null>(null);

    // Final URLs (must be remote URLs for saving to DB)
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [headerUrl, setHeaderUrl] = useState<string | null>(null);

    const getProfile = useCallback(async () => {
        try {
            setLoading(true);
            if (!user) throw new Error('No user on the session!');

            const { data, error, status } = await supabase
                .from('profiles')
                .select('username, display_name, avatar_url, bio, banner_url')
                .eq('id', user.id)
                .single();

            if (error && status !== 406) {
                throw error;
            }

            if (data) {
                setUsername(data.username || '');
                setDisplayName(data.display_name || '');
                setAvatarUrl(data.avatar_url);
                setAvatarPreview(data.avatar_url);
                setBio(data.bio || '');
                setHeaderUrl(data.banner_url);
                setHeaderPreview(data.banner_url);
            }
        } catch (error) {
            if (error instanceof Error) {
                Alert.alert('Error', error.message);
            }
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        if (user) {
            getProfile();
        }
    }, [user, getProfile]);

    const updateProfile = async () => {
        console.log('Update profile triggered');
        if (uploadingAvatar || uploadingHeader) {
            Alert.alert('Please wait', 'Images are still uploading...');
            return;
        }

        try {
            setLoading(true);
            if (!user) throw new Error('No user found');

            // Ensure we are using the remote URL if available, otherwise fallback to existing
            // If headerUrl is null, it might mean no change or upload finished but state lagged? 
            // Actually, uploadImage sets headerUrl directly.
            // But if user didn't change it, headerUrl starts as null unless we initialized it.
            // Wait, we initialize headerUrl in getProfile.

            // Logic:
            // 1. If we have a new remote URL from upload (headerUrl), use it.
            // 2. If we haven't uploaded a new one, we should use the one from getProfile.
            // Problem: In getProfile we set headerUrl to data.banner_url.
            // So headerUrl should hold the current remote URL.
            // Unless... uploadImage failed?

            // Let's use a robust selection:
            const finalAvatarUrl = avatarUrl && avatarUrl.startsWith('http') ? avatarUrl : (avatarPreview && avatarPreview.startsWith('http') ? avatarPreview : null);
            const finalHeaderUrl = headerUrl && headerUrl.startsWith('http') ? headerUrl : (headerPreview && headerPreview.startsWith('http') ? headerPreview : null);

            console.log('Final URLs for save:', { finalAvatarUrl, finalHeaderUrl });

            const updates = {
                id: user.id,
                username: username.trim(),
                display_name: displayName.trim(),
                bio: bio.trim(),
                avatar_url: finalAvatarUrl,
                banner_url: finalHeaderUrl,
                updated_at: new Date().toISOString(),
            };

            console.log('Upserting profile with:', updates);

            const { error } = await supabase
                .from('profiles')
                .upsert(updates);

            if (error) {
                // Check for missing column error (PostgREST code PGRST204 is common for schema cache issues, 
                // but sometimes it's 42703 'undefined_column' in the message details)
                if (error.code === 'PGRST204' || error.message.includes('Could not find the') || error.message.includes('column')) {
                    console.warn('Schema mismatch detected. Attempting partial save...');

                    // Fallback: Save only standard columns
                    const standardUpdates = {
                        id: user.id,
                        username: username.trim(),
                        display_name: displayName.trim(),
                        avatar_url: finalAvatarUrl,
                        updated_at: new Date().toISOString(),
                    };

                    const { error: fallbackError } = await supabase
                        .from('profiles')
                        .upsert(standardUpdates);

                    if (fallbackError) throw fallbackError;

                    Alert.alert(
                        'Saved (Partial)',
                        'Profile name and avatar saved. Bio and Header could not be saved because the database schema is missing those columns. Please run the SQL script to fix this.'
                    );
                    router.back();
                    return;
                }

                console.error('Supabase error:', error);
                throw error;
            }

            console.log('Profile updated successfully');
            Alert.alert('Success', 'Profile updated!', [
                { text: 'OK', onPress: () => router.back() }
            ]);
        } catch {
            Alert.alert('Error', 'Failed to update profile');
        } finally {
            setLoading(false);
            console.log('Update profile attempt finished');
        }
    };

    const pickImage = async (type: 'avatar' | 'header') => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: type === 'avatar' ? [1, 1] : [16, 9],
                quality: 0.8,
            });

            if (!result.canceled && result.assets[0].uri) {
                const localUri = result.assets[0].uri;

                // Set preview immediately
                if (type === 'avatar') {
                    setAvatarPreview(localUri);
                } else {
                    setHeaderPreview(localUri);
                }

                uploadImage(localUri, type);
            }
        } catch {
            Alert.alert('Error', 'Error picking image');
        }
    };



    const uploadImage = async (uri: string, type: 'avatar' | 'header') => {
        const setUploading = type === 'avatar' ? setUploadingAvatar : setUploadingHeader;
        try {
            setUploading(true);
            if (!user) return;

            const ext = uri.split('.').pop() || 'png';
            const fileName = `${user.id}/${type}_${Date.now()}.${ext}`;
            const filePath = fileName;

            const bucketName = 'avatars';

            console.log('Reading file (base64):', uri);
            const base64 = await FileSystem.readAsStringAsync(uri, {
                encoding: 'base64',
            });
            const arrayBuffer = decode(base64);
            console.log('File size (bytes):', arrayBuffer.byteLength);

            const { error: uploadError } = await supabase.storage
                .from(bucketName)
                .upload(filePath, arrayBuffer, {
                    contentType: `image/${ext === 'jpeg' ? 'jpeg' : ext}`,
                    upsert: true
                });

            if (uploadError) {
                if ('message' in uploadError && uploadError.message.includes('Bucket not found')) {
                    throw new Error(`Storage bucket '${bucketName}' not found. Please create it and set to public.`);
                }
                throw uploadError;
            }

            const { data } = supabase.storage.from(bucketName).getPublicUrl(filePath);

            if (data?.publicUrl) {
                if (type === 'avatar') {
                    console.log('Setting avatar URL:', data.publicUrl);
                    setAvatarUrl(data.publicUrl);
                } else {
                    console.log('Setting header URL:', data.publicUrl);
                    setHeaderUrl(data.publicUrl);
                }
            } else {
                console.warn('GetPublicUrl returned no data');
            }
        } catch (error) {
            console.error('Upload error:', error);
            if (error instanceof Error) {
                Alert.alert('Upload Error', error.message);
            }
        } finally {
            setUploading(false);
        }
    };

    const monoFont = { fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' };

    // Theme-aware tokens
    const bg = t.colors.background.primary;
    const surface = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.025)';
    const border = isDark ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.08)';
    const primary = t.colors.primary.DEFAULT;
    const onPrimary = (t.colors.primary as any).onPrimary || '#FFFFFF';
    const initial = displayName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U';

    const inputStyle = (field: string): any[] => ([
        styles.input,
        monoFont,
        {
            backgroundColor: surface,
            color: t.colors.text.primary,
            borderColor: focusedField === field ? primary : border,
        },
        focusedField === field && isWebEP
            ? ({ boxShadow: isDark ? `0 0 0 3px ${hexA(primary, 0.18)}` : `0 0 0 3px ${hexA(primary, 0.14)}` } as any)
            : null,
    ]);

    const renderField = (
        field: string,
        label: string,
        value: string,
        onChange: (s: string) => void,
        opts: { placeholder: string; multiline?: boolean; autoCapitalize?: 'none' | 'sentences'; counter?: boolean } = { placeholder: '' }
    ) => (
        <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
                <Text style={[styles.label, monoFont, { color: t.colors.text.secondary }]}>&gt; {label}</Text>
                {opts.counter && (
                    <Text style={[styles.counter, monoFont, { color: value.length > BIO_MAX ? t.colors.error : t.colors.text.muted }]}>
                        {value.length}/{BIO_MAX}
                    </Text>
                )}
            </View>
            <TextInput
                style={[inputStyle(field), opts.multiline && styles.textArea]}
                value={value}
                onChangeText={onChange}
                placeholder={opts.placeholder}
                placeholderTextColor={t.colors.text.muted}
                onFocus={() => setFocusedField(field)}
                onBlur={() => setFocusedField(null)}
                autoCapitalize={opts.autoCapitalize}
                multiline={opts.multiline}
                textAlignVertical={opts.multiline ? 'top' : 'center'}
            />
        </View>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: bg }]}>
            <View style={[styles.header, { borderBottomColor: border }]}>
                <Pressable onPress={() => router.back()} style={styles.cancelButton}>
                    <Text style={[styles.cancelText, monoFont, { color: t.colors.text.secondary }]}>[ CANCEL ]</Text>
                </Pressable>
                <Text style={[styles.headerTitle, monoFont, { color: t.colors.text.primary }]}>[ EDIT PROFILE ]</Text>
                <Pressable
                    onPress={updateProfile}
                    style={[styles.saveButton, { backgroundColor: primary }, loading && styles.disabledButton]}
                    disabled={loading}
                >
                    {(loading || uploadingAvatar || uploadingHeader) ? (
                        <ActivityIndicator color={onPrimary} size="small" />
                    ) : (
                        <Text style={[styles.saveText, monoFont, { color: onPrimary }]}>[ SAVE ]</Text>
                    )}
                </Pressable>
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    <View style={styles.column}>
                        {/* Banner + overlapping avatar */}
                        <View style={styles.bannerWrap}>
                            <Pressable onPress={() => pickImage('header')} style={[styles.banner, { borderColor: border, backgroundColor: surface }]} disabled={uploadingHeader}>
                                {headerPreview ? (
                                    <Image source={{ uri: headerPreview }} style={styles.bannerImg} />
                                ) : (
                                    <View style={[StyleSheet.absoluteFill, styles.center]}>
                                        <Ionicons name="image-outline" size={34} color={t.colors.text.muted} />
                                    </View>
                                )}
                                <LinearGradient colors={['transparent', 'rgba(0,0,0,0.35)']} style={StyleSheet.absoluteFill} pointerEvents="none" />
                                {uploadingHeader && (
                                    <View style={[StyleSheet.absoluteFill, styles.center, { backgroundColor: 'rgba(0,0,0,0.4)' }]}>
                                        <ActivityIndicator color="#fff" />
                                    </View>
                                )}
                                <View style={[styles.bannerCamBtn, { backgroundColor: 'rgba(0,0,0,0.55)', borderColor: 'rgba(255,255,255,0.15)' }]}>
                                    <Ionicons name="camera" size={15} color="#fff" />
                                    <Text style={[styles.bannerCamText, monoFont]}>COVER</Text>
                                </View>
                            </Pressable>

                            <Pressable onPress={() => pickImage('avatar')} style={styles.avatarWrap} disabled={uploadingAvatar}>
                                <View style={[styles.avatarRing, { borderColor: bg, backgroundColor: surface }]}>
                                    {avatarPreview ? (
                                        <Image source={{ uri: avatarPreview }} style={styles.avatarImg} />
                                    ) : (
                                        <View style={[styles.avatarImg, styles.center, { backgroundColor: primary }]}>
                                            <Text style={[styles.avatarTxt, monoFont, { color: onPrimary }]}>{initial}</Text>
                                        </View>
                                    )}
                                    {uploadingAvatar && (
                                        <View style={[StyleSheet.absoluteFill, styles.center, { backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: 999 }]}>
                                            <ActivityIndicator color="#fff" />
                                        </View>
                                    )}
                                </View>
                                <View style={[styles.avatarCamBtn, { backgroundColor: primary, borderColor: bg }]}>
                                    <Ionicons name="camera" size={13} color={onPrimary} />
                                </View>
                            </Pressable>
                        </View>

                        {/* Form */}
                        <View style={styles.form}>
                            {renderField('display', 'DISPLAY NAME', displayName, setDisplayName, { placeholder: 'Enter display name' })}
                            {renderField('username', 'USERNAME', username, setUsername, { placeholder: 'Enter username', autoCapitalize: 'none' })}
                            {renderField('bio', 'BIO', bio, setBio, { placeholder: 'Write something about yourself...', multiline: true, counter: true })}
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const isWebEP = Platform.OS === 'web';

// Small helper: convert a hex/rgb color to rgba with given alpha (best effort)
function hexA(color: string, alpha: number): string {
    if (color.startsWith('#')) {
        let h = color.slice(1);
        if (h.length === 3) h = h.split('').map((c) => c + c).join('');
        const r = parseInt(h.slice(0, 2), 16);
        const g = parseInt(h.slice(2, 4), 16);
        const b = parseInt(h.slice(4, 6), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
    return color;
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background.primary,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: theme.spacing.lg,
        paddingVertical: 12,
        borderBottomWidth: 1,
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: '800',
        letterSpacing: 1,
    },
    cancelButton: {
        padding: 8,
    },
    cancelText: {
        fontSize: 13,
        letterSpacing: 0.5,
    },
    saveButton: {
        paddingVertical: 9,
        borderRadius: 999,
        paddingHorizontal: 18,
        minWidth: 84,
        alignItems: 'center',
        justifyContent: 'center',
    },
    saveText: {
        fontWeight: '800',
        fontSize: 13,
        letterSpacing: 0.5,
    },
    scrollContent: {
        paddingBottom: 60,
    },
    column: {
        width: '100%',
        maxWidth: 660,
        alignSelf: 'center',
        paddingHorizontal: 20,
    },
    center: {
        justifyContent: 'center',
        alignItems: 'center',
    },

    // Banner + avatar
    bannerWrap: {
        marginTop: 24,
        marginBottom: 60,
        position: 'relative',
    },
    banner: {
        width: '100%',
        height: 180,
        borderRadius: 22,
        overflow: 'hidden',
        borderWidth: 1,
        position: 'relative',
    },
    bannerImg: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    bannerCamBtn: {
        position: 'absolute',
        bottom: 12,
        right: 12,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 11,
        paddingVertical: 7,
        borderRadius: 999,
        borderWidth: 1,
    },
    bannerCamText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: '800',
        letterSpacing: 1.2,
    },
    avatarWrap: {
        position: 'absolute',
        bottom: -44,
        left: 18,
    },
    avatarRing: {
        width: 98,
        height: 98,
        borderRadius: 49,
        borderWidth: 4,
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarImg: {
        width: '100%',
        height: '100%',
        borderRadius: 49,
    },
    avatarTxt: {
        fontSize: 36,
        fontWeight: '800',
    },
    avatarCamBtn: {
        position: 'absolute',
        bottom: -2,
        right: -2,
        width: 30,
        height: 30,
        borderRadius: 15,
        borderWidth: 3,
        justifyContent: 'center',
        alignItems: 'center',
    },

    // Form
    form: {
        marginTop: 6,
    },
    inputGroup: {
        marginBottom: 18,
    },
    labelRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    label: {
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 1,
    },
    counter: {
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    input: {
        borderRadius: 14,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 15,
        borderWidth: 1,
        // @ts-ignore — web smooth focus transition
        ...(Platform.OS === 'web' ? { transition: 'box-shadow 0.15s ease, border-color 0.15s ease', outlineStyle: 'none' } : {}),
    },
    textArea: {
        minHeight: 120,
        paddingTop: 14,
    },
    disabledButton: {
        opacity: 0.5,
    },
});
