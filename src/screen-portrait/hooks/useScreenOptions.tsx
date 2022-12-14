import React from 'react';
import { View, TouchableOpacity, Platform } from 'react-native';
import {
    StackHeaderTitleProps,
    CardStyleInterpolators,
} from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/core';
import { DrawerActions } from '@react-navigation/native';
import { StackHeaderOptions } from '@react-navigation/stack/lib/typescript/src/types';
import { CommonActions } from '@react-navigation/native';

import UserAvatar from 'react-native-user-avatar';
import Image from '../components/Image';
import Text from '../components/Text';
import useTheme from '../hooks/useTheme';
import Button from '../components/Button';
// import {SolidIcons} from 'react-native-fontawesome';
import { FontAwesome, FontAwesome5 } from '@expo/vector-icons';

export default () => {
    const navigation = useNavigation();
    const { colors, sizes_ } = useTheme();
    const onOpenProfiles = () => {
        GLOBAL.Profiled = false;
        GLOBAL.ViaHome = true;
        //navigation.navigate('Profiles ');
        navigation.dispatch(
            CommonActions.reset({
                index: 1,
                routes: [{ name: 'Profiles ' }],
            }),
        );
    };
    const onOpenSearch = () => {
        navigation.dispatch(
            CommonActions.reset({
                index: 1,
                routes: [{ name: 'Search' }],
            }),
        );
        //navigation.navigate('Search');
    };
    const onOpenFavorites = () => {
        navigation.dispatch(
            CommonActions.reset({
                index: 1,
                routes: [{ name: 'Favorites' }],
            }),
        );
        // navigation.navigate('Support');
    };
    const onOpenSettings = () => {
        navigation.dispatch(
            CommonActions.reset({
                index: 1,
                routes: [{ name: 'Settings' }],
            }),
        );
        // navigation.navigate('Settings');
    };
    const onOpenMessages = () => {
        navigation.dispatch(
            CommonActions.reset({
                index: 1,
                routes: [{ name: 'Messages' }],
            }),
        );
        ///navigation.navigate('Messages');
    };
    const checkSearchMenu = () => {
        var test = GLOBAL.Menu.find(m => m.name == 'Search');
        if (test != undefined) {
            return true;
        } else {
            return false;
        }
    };
    const menu = {
        headerStyle: {
            elevation: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.80)',
        },
        headerStatusBarHeight: 0,
        headerTitleAlign: 'left',
        headerTitleContainerStyle: { marginLeft: -sizes_.sm },
        headerLeftContainerStyle: { paddingLeft: sizes_.s },
        headerRightContainerStyle: { paddingRight: sizes_.s },
        cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
        headerTitle: ({ children }: StackHeaderTitleProps) => (
            <Text p>{LANG.getTranslation(children)}</Text>
        ),
        headerLeft: () => (
            <Button
                onPress={() =>
                    navigation.dispatch(DrawerActions.toggleDrawer())
                }
            >
                <Image
                    source={require('../assets/icons/menu.png')}
                    radius={0}
                    color={colors.icon}
                />
            </Button>
        ),
        headerRight: () => (
            <View
                style={{
                    flex: 1,
                    flexDirection: 'row',
                    justifyContent: 'center',
                }}
            >
                {GLOBAL.UserInterface.general.enable_messages_menu == true && (
                    <View
                        style={{
                            alignSelf: 'center',
                            marginLeft: 2,
                            marginRight: 2,
                        }}
                    >
                        <FocusButton
                            style={{
                                margin: 5,
                                borderRadius: 100,
                                flex: 1,
                                flexDirection: 'column',
                                justifyContent: 'center',
                                alignContent: 'center',
                                alignItems: 'center',
                            }}
                            onPress={() => onOpenMessages()}
                        >
                            <FontAwesome5
                                style={{ fontSize: 14, color: '#fff' }}
                                // icon={SolidIcons.envelope}
                                name="envelope"
                            />
                        </FocusButton>
                    </View>
                )}
                {GLOBAL.UserInterface.general.enable_favourites_menu ==
                    true && (
                        <View
                            style={{
                                alignSelf: 'center',
                                marginLeft: 2,
                                marginRight: 2,
                            }}
                        >
                            <FocusButton
                                style={{
                                    margin: 5,
                                    borderRadius: 100,
                                    flex: 1,
                                    flexDirection: 'column',
                                    justifyContent: 'center',
                                    alignContent: 'center',
                                    alignItems: 'center',
                                }}
                                onPress={() => onOpenFavorites()}
                            >
                                <FontAwesome
                                    style={{ fontSize: 14, color: '#fff' }}
                                    // icon={SolidIcons.heart}
                                    name="heart"
                                />
                            </FocusButton>
                        </View>
                    )}
                {GLOBAL.UserInterface.general.enable_settings_menu == true && (
                    <View
                        style={{
                            alignSelf: 'center',
                            marginLeft: 2,
                            marginRight: 2,
                        }}
                    >
                        <FocusButton
                            style={{
                                margin: 5,
                                borderRadius: 100,
                                flex: 1,
                                flexDirection: 'column',
                                justifyContent: 'center',
                                alignContent: 'center',
                                alignItems: 'center',
                            }}
                            onPress={() => onOpenSettings()}
                        >
                            {GLOBAL.OTA_Update && Platform.OS == 'android' && (
                                <View
                                    style={{
                                        position: 'absolute',
                                        top: 2,
                                        left: 8,
                                        zIndex: 99999,
                                    }}
                                >
                                    <View
                                        style={{
                                            flexDirection: 'row',
                                            backgroundColor: 'red',
                                            borderRadius: 100,
                                            height: 15,
                                            width: 15,
                                            alignSelf: 'center',
                                            justifyContent: 'center',
                                            alignContent: 'center',
                                            alignItems: 'center',
                                        }}
                                    >
                                        <Text>!</Text>
                                    </View>
                                </View>
                            )}
                            <FontAwesome5
                                style={{ fontSize: 14, color: '#fff' }}
                                // icon={SolidIcons.cog}
                                name="cog"
                            />
                        </FocusButton>
                    </View>
                )}
                {GLOBAL.UserInterface.general.enable_search_menu == true &&
                    checkSearchMenu && (
                        <View
                            style={{
                                alignSelf: 'center',
                                marginLeft: 2,
                                marginRight: 2,
                            }}
                        >
                            <FocusButton
                                style={{
                                    margin: 5,
                                    borderRadius: 100,
                                    flex: 1,
                                    flexDirection: 'column',
                                    justifyContent: 'center',
                                    alignContent: 'center',
                                    alignItems: 'center',
                                }}
                                onPress={() => onOpenSearch()}
                            >
                                <FontAwesome5
                                    style={{ fontSize: 14, color: '#fff' }}
                                    // icon={SolidIcons.search}
                                    name="search"
                                />
                            </FocusButton>
                        </View>
                    )}
                <View
                    style={{
                        alignSelf: 'center',
                        marginLeft: 2,
                        marginRight: 10,
                    }}
                >
                    <FocusButton
                        style={{
                            borderRadius: 100,
                            flex: 1,
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignContent: 'center',
                            alignItems: 'center',
                        }}
                        onPress={() => onOpenProfiles()}
                    >
                        <UserAvatar
                            size={30}
                            name={GLOBAL.Selected_Profile.name
                                .split(' ')
                                .slice(0, 2)
                                .join('+')}
                        />
                    </FocusButton>
                </View>
            </View>
        ),
    } as StackHeaderOptions;

    const options = {
        stack: menu,
        components: {
            ...menu,
            // headerTitle: () => (
            //   <Text p white>
            //     {t('navigation.components')}
            //   </Text>
            // ),
            // headerRight: () => null,
            // headerLeft: () => (

            //     <Button
            //       onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}>
            //       <FontAwesome5 style={{ fontSize: 14, color: '#fff', }} icon={SolidIcons.hamburger} />
            //     </Button>

            // ),
        },
    };
    return options;
};
