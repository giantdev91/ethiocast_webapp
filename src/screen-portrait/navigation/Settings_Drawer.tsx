import React, { useState } from 'react';
import { Image, View, Platform } from 'react-native';
import LANG from '../../languages/languages';
// import FontAwesome5, {SolidIcons} from 'react-native-fontawesome';
import { FontAwesome, FontAwesome5 } from '@expo/vector-icons';
import { Block, Text, Button } from '../components';
import { PersonalStack } from './PersonalStack';
import {
    createDrawerNavigator,
    DrawerContentComponentProps,
    DrawerContentOptions,
    DrawerContentScrollView,
} from '@react-navigation/drawer';
import { CommonActions } from '@react-navigation/native';
import UserAvatar from 'react-native-user-avatar';
import useTheme from '../hooks/useTheme';
import SIZES from '../constants/sizes';

const Drawer = createDrawerNavigator();
var sizes = SIZES.getSizing();

const DrawerContent = (
    props: DrawerContentComponentProps<DrawerContentOptions>,
) => {
    const { navigation } = props;
    const { colors, gradients, sizes_ } = useTheme();
    const labelColor = colors.white;
    const [active, setActive] = useState('');

    const onOpenProfiles = navigation => {
        setActive('Profiles');
        GLOBAL.Profiled = false;
        navigation.navigate('Profiles ');
    };
    const openSettingsMenu = (navigation, to) => {
        setActive(to);
        navigation.dispatch(
            CommonActions.reset({
                index: 1,
                routes: [{ name: to }],
            }),
        );
    };
    return (
        <DrawerContentScrollView
            {...props}
            scrollEnabled
            //removeClippedSubviews
            renderToHardwareTextureAndroid
            contentContainerStyle={{ paddingBottom: sizes_.padding }}
        >
            <Block paddingHorizontal={sizes_.padding}>
                {GLOBAL.Selected_Profile != '' ? (
                    <View>
                        <View
                            style={{
                                flexDirection: 'row',
                                paddingBottom: 20,
                                paddingTop: 0,
                            }}
                        >
                            <Image
                                //radius={0}
                                resizeMethod={'resize'}
                                resizeMode={'contain'}
                                style={{
                                    width: !GLOBAL.Device_IsPortrait
                                        ? 200
                                        : 100,
                                    height: !GLOBAL.Device_IsPortrait
                                        ? 100
                                        : 50,
                                }}
                                source={{ uri: GLOBAL.Logo }}
                            />
                        </View>
                        {GLOBAL.UserInterface.general.enable_profiles ==
                            true && (
                                <Button
                                    row
                                    justify="flex-start"
                                    onPress={() => onOpenProfiles(navigation)}
                                >
                                    <View
                                        style={{
                                            alignContent: 'center',
                                            alignItems: 'center',
                                            width: sizes_.md,
                                            marginRight: sizes_.s,
                                        }}
                                    >
                                        <UserAvatar
                                            size={30}
                                            name={GLOBAL.Selected_Profile.name
                                                .split(' ')
                                                .slice(0, 2)
                                                .join('+')}
                                        />
                                    </View>
                                    <Text
                                        numberOfLines={1}
                                        marginRight={40}
                                        color={labelColor}
                                    >
                                        {GLOBAL.Selected_Profile.name}
                                    </Text>
                                </Button>
                            )}
                        {GLOBAL.UserInterface.general.enable_settings_menu ==
                            true && (
                                <Button
                                    row
                                    justify="flex-start"
                                    onPress={() =>
                                        openSettingsMenu(navigation, 'Settings ')
                                    }
                                >
                                    <View
                                        style={{
                                            alignContent: 'center',
                                            alignItems: 'center',
                                            width: sizes_.md,
                                            marginRight: sizes_.s,
                                        }}
                                    >
                                        {GLOBAL.OTA_Update &&
                                            Platform.OS == 'android' && (
                                                <View
                                                    style={{
                                                        position: 'absolute',
                                                        top: -10,
                                                        left: 15,
                                                        zIndex: 99999,
                                                    }}
                                                >
                                                    <View
                                                        style={{
                                                            flexDirection: 'row',
                                                            backgroundColor: 'red',
                                                            borderRadius: 100,
                                                            height: 20,
                                                            width: 20,
                                                            alignSelf: 'center',
                                                            justifyContent:
                                                                'center',
                                                            alignContent: 'center',
                                                            alignItems: 'center',
                                                        }}
                                                    >
                                                        <Text bold>!</Text>
                                                    </View>
                                                </View>
                                            )}
                                        <FontAwesome5
                                            style={{ fontSize: 18, color: '#fff' }}
                                            // icon={SolidIcons.cog}
                                            name="cog"
                                        />
                                    </View>
                                    <Text color={labelColor}>
                                        {LANG.getTranslation('settings')}
                                    </Text>
                                </Button>
                            )}
                        {GLOBAL.UserInterface.general.enable_messages_menu ==
                            true && (
                                <Button
                                    row
                                    justify="flex-start"
                                    onPress={() =>
                                        openSettingsMenu(navigation, 'Messages ')
                                    }
                                >
                                    <View
                                        style={{
                                            alignContent: 'center',
                                            alignItems: 'center',
                                            width: sizes_.md,
                                            marginRight: sizes_.s,
                                        }}
                                    >
                                        <FontAwesome5
                                            style={{ fontSize: 18, color: '#fff' }}
                                            // icon={SolidIcons.envelope}
                                            name="envelope"
                                        />
                                    </View>
                                    <Text color={labelColor}>
                                        {LANG.getTranslation('messages')}
                                    </Text>
                                </Button>
                            )}
                        {GLOBAL.SupportPages.length > 0 && (
                            <Button
                                row
                                justify="flex-start"
                                onPress={() =>
                                    openSettingsMenu(navigation, 'Support ')
                                }
                            >
                                <View
                                    style={{
                                        alignContent: 'center',
                                        alignItems: 'center',
                                        width: sizes_.md,
                                        marginRight: sizes_.s,
                                    }}
                                >
                                    <FontAwesome5
                                        style={{ fontSize: 18, color: '#fff' }}
                                        // icon={SolidIcons.headset}
                                        name="headset"
                                    />
                                </View>
                                <Text color={labelColor}>
                                    {LANG.getTranslation('support')}
                                </Text>
                            </Button>
                        )}
                        {GLOBAL.UserInterface.general.enable_watchlist_menu ==
                            true && (
                                <Button
                                    row
                                    justify="flex-start"
                                    onPress={() =>
                                        openSettingsMenu(navigation, 'Watchlist ')
                                    }
                                >
                                    <View
                                        style={{
                                            alignContent: 'center',
                                            alignItems: 'center',
                                            width: sizes_.md,
                                            marginRight: sizes_.s,
                                        }}
                                    >
                                        <FontAwesome5
                                            style={{ fontSize: 18, color: '#fff' }}
                                            // icon={SolidIcons.caretSquareRight}
                                            name="caret-square-right"
                                        />
                                    </View>
                                    <Text color={labelColor}>
                                        {LANG.getTranslation('watchlist')}
                                    </Text>
                                </Button>
                            )}
                        {GLOBAL.Payment_Method != 'subscription' && (
                            <Button
                                row
                                justify="flex-start"
                                onPress={() =>
                                    openSettingsMenu(navigation, 'Rentals ')
                                }
                            >
                                <View
                                    style={{
                                        alignContent: 'center',
                                        alignItems: 'center',
                                        width: sizes_.md,
                                        marginRight: sizes_.s,
                                    }}
                                >
                                    <FontAwesome5
                                        style={{ fontSize: 18, color: '#fff' }}
                                        // icon={SolidIcons.moneyBill}
                                        name="money-bill"
                                    />
                                </View>
                                <Text color={labelColor}>
                                    {LANG.getTranslation('rentals')}
                                </Text>
                            </Button>
                        )}
                        {GLOBAL.UserInterface.general.enable_favourites_menu ==
                            true && (
                                <Button
                                    row
                                    justify="flex-start"
                                    onPress={() =>
                                        openSettingsMenu(navigation, 'Favorites ')
                                    }
                                >
                                    <View
                                        style={{
                                            alignContent: 'center',
                                            alignItems: 'center',
                                            width: sizes_.md,
                                            marginRight: sizes_.s,
                                        }}
                                    >
                                        <FontAwesome
                                            style={{ fontSize: 18, color: '#fff' }}
                                            // icon={SolidIcons.heart}
                                            name="heart"
                                        />
                                    </View>
                                    <Text color={labelColor}>
                                        {LANG.getTranslation('favorites')}
                                    </Text>
                                </Button>
                            )}
                        <Button
                            row
                            justify="flex-start"
                            onPress={() =>
                                openSettingsMenu(navigation, 'Signout ')
                            }
                        >
                            <View
                                style={{
                                    alignContent: 'center',
                                    alignItems: 'center',
                                    width: sizes_.md,
                                    marginRight: sizes_.s,
                                }}
                            >
                                <FontAwesome5
                                    style={{ fontSize: 18, color: '#fff' }}
                                    // icon={SolidIcons.lock}
                                    name="lock"
                                />
                            </View>
                            <Text color={labelColor}>
                                {LANG.getTranslation('logout')}
                            </Text>
                        </Button>
                    </View>
                ) : (
                    <View></View>
                )}
            </Block>
        </DrawerContentScrollView>
    );
};

export default () => {
    const { sizes_, gradients } = useTheme();
    return (
        <Block flex={1} gradient={gradients['dark']}>
            <Drawer.Navigator
                openByDefault
                initialRouteName="Settings"
                drawerStyle={{
                    backgroundColor: 'transparent',
                    width: GLOBAL.Device_IsPortrait
                        ? sizes.width * 0.6
                        : sizes.width * 0.3,
                }}
                drawerType={'slide'}
                drawerContent={props => <DrawerContent {...props} />}
            >
                <Drawer.Screen name="Personal" component={PersonalStack} />
            </Drawer.Navigator>
        </Block>
    );
};
