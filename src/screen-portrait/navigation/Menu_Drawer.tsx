import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    Animated,
    Linking,
    StyleSheet,
    Image,
    ImageBackground,
    View,
    Platform,
} from 'react-native';
import LANG from '../../languages/languages';
// import FontAwesome5, {
//     SolidIcons,
//     RegularIcons,
//     BrandIcons,
// } from 'react-native-fontawesome';
import { FontAwesome5 } from '@expo/vector-icons';
import {
    useDrawerStatus,
    createDrawerNavigator,
    DrawerContentComponentProps,
    DrawerContentOptions,
    DrawerContentScrollView,
} from '@react-navigation/drawer';
import { Block, Text, Button } from '../components';
import { useData, useTheme } from '../hooks';
import { AppStack } from './AppStack';
import { CommonActions } from '@react-navigation/native';

const Drawer = createDrawerNavigator();

const ScreensStack = () => {
    const { colors, sizes_ } = useTheme();
    const isDrawerOpen = useDrawerStatus() === 'open';
    const animation = useRef(new Animated.Value(0)).current;
    const scale = animation.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 0.88],
    });
    const borderRadius = animation.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 16],
    });
    const animatedStyle = {
        borderRadius: borderRadius,
        transform: [{ scale: scale }],
    };
    useEffect(() => {
        Animated.timing(animation, {
            duration: 200,
            useNativeDriver: true,
            toValue: isDrawerOpen ? 1 : 0,
        }).start();
    }, [isDrawerOpen, animation]);

    return (
        <Animated.View
            style={StyleSheet.flatten([
                animatedStyle,
                {
                    flex: 1,
                    overflow: 'hidden',
                    borderColor: colors.card,
                    borderWidth: isDrawerOpen ? 1 : 0,
                },
            ])}>
            <ImageBackground
                source={{ uri: GLOBAL.Background }}
                style={{ flex: 1, width: null, height: null }}
                imageStyle={{ resizeMode: 'cover' }}>
                <AppStack />
            </ImageBackground>
        </Animated.View>
    );
};

/* custom drawer menu */
const DrawerContent = (
    props: DrawerContentComponentProps<DrawerContentOptions>,
) => {
    const { navigation } = props;
    const { isDark } = useData();
    const [active, setActive] = useState();
    const { colors, gradients, sizes_ } = useTheme();
    const labelColor = isDark ? colors.white : colors.text;
    const [baz, setBaz] = useState(false);
    const [screens, setScreens] = useState([]);
    const isDrawerOpen = useDrawerStatus() === 'open';
    const handleNavigation = useCallback(
        to => {
            if (GLOBAL.Device_IsWebTV == true) {
                // killVideoJSPlayer();
            }
            setActive(to);
            // navigation.navigate(to);
            //if (GLOBAL.Device_Manufacturer == 'Apple') {
            openNewScreen(to);
            //}
        },
        [navigation, setActive],
    );
    const openNewScreen = to => {
        navigation.dispatch(
            CommonActions.reset({
                index: 1,
                routes: [{ name: to }],
            }),
        );
    };
    // screen list for Drawer menu
    useEffect(() => {
        if (GLOBAL.Menu.length > 0 && screens.length == 0) {
            setBaz(true);
        }
    });
    useEffect(() => {
        //if (baz) {

        var menuArray = [];
        GLOBAL.Menu.forEach(element => {
            if (
                element.name != 'Casting' &&
                element.name != 'Hamburger' &&
                element.name != 'Logout' &&
                element.name != 'Youtube' &&
                element.name != 'Search' &&
                element.name != 'Television' &&
                element.name != 'Personal'
            ) {
                if (element.name == 'Apps' && Platform.OS == 'android') {
                    var icon = getIconDrawer(LANG.getTranslation(element.name));
                    var menu = {
                        name: LANG.getTranslation(element.name),
                        to: element.name,
                        icon: icon,
                    };
                    menuArray.push(menu);
                } else if (element.name != 'Apps') {
                    var icon = getIconDrawer(LANG.getTranslation(element.name));
                    var menu = {
                        name: LANG.getTranslation(element.name),
                        to: element.name,
                        icon: icon,
                    };
                    menuArray.push(menu);
                }
            }
        });
        setScreens(menuArray);
        //}
    }, [navigation, isDrawerOpen]);

    function getIconDrawer(menu) {
        switch (menu) {
            case LANG.getTranslation('Search'):
                return (
                    <FontAwesome5
                        style={{ fontSize: 18, color: '#fff' }}
                        // icon={SolidIcons.search}
                        name="search"
                    />
                );
                break;
            case LANG.getTranslation('Home'):
                return (
                    <FontAwesome5
                        style={{ fontSize: 18, color: '#fff' }}
                        // icon={SolidIcons.home}
                        name="home"
                    />
                );
                break;
            case LANG.getTranslation('Channels'):
                return (
                    <FontAwesome5
                        style={{ fontSize: 18, color: '#fff' }}
                        // icon={SolidIcons.th}
                        name="th"
                    />
                );
                break;
            case LANG.getTranslation('Television'):
                return (
                    <FontAwesome5
                        style={{ fontSize: 18, color: '#fff' }}
                        // icon={SolidIcons.tv}
                        name="tv"
                    />
                );
                break;
            case LANG.getTranslation('TV Guide'):
                return (
                    <FontAwesome5
                        style={{ fontSize: 18, color: '#fff' }}
                        // icon={SolidIcons.thList}
                        name="th-list"
                    />
                );
                break;
            case LANG.getTranslation('Recordings'):
                return (
                    <FontAwesome5
                        style={{ fontSize: 18, color: '#fff' }}
                        // icon={RegularIcons.dotCircle}
                        name="dot-circle"
                    />
                );
                break;
            case LANG.getTranslation('Movies'):
                return (
                    <FontAwesome5
                        style={{ fontSize: 18, color: '#fff' }}
                        // icon={SolidIcons.film}
                        name="film"
                    />
                );
                break;
            case LANG.getTranslation('Series'):
                return (
                    <FontAwesome5
                        style={{ fontSize: 18, color: '#fff' }}
                        // icon={SolidIcons.video}
                        name="video"
                    />
                );
                break;
            case LANG.getTranslation('Music'):
                return (
                    <FontAwesome5
                        style={{ fontSize: 18, color: '#fff' }}
                        // icon={SolidIcons.music}
                        name="music"
                    />
                );
                break;
            case LANG.getTranslation('Apps'):
                return (
                    <FontAwesome5
                        style={{ fontSize: 18, color: '#fff' }}
                        // icon={BrandIcons.android}
                        name="android"
                    />
                );
                break;
            case LANG.getTranslation('Setting'):
                return (
                    <FontAwesome5
                        style={{ fontSize: 18, color: '#fff' }}
                        // icon={SolidIcons.slidersHh}
                        name="sliders-h"
                    />
                );
                break;
            case LANG.getTranslation('Youtube'):
                return (
                    <FontAwesome5
                        style={{ fontSize: 18, color: '#fff' }}
                        // icon={BrandIcons.youtube}
                        name="youtube"
                    />
                );
                break;
            case LANG.getTranslation('Logout'):
                return (
                    <FontAwesome5
                        style={{ fontSize: 18, color: '#fff' }}
                        // icon={SolidIcons.lock}
                        name="lock"
                    />
                );
                break;
            case LANG.getTranslation('My List'):
                return (
                    <FontAwesome5
                        style={{ fontSize: 18, color: '#fff' }}
                        // icon={RegularIcons.playCircle}
                        name="play-circle"
                    />
                );
                break;
            case LANG.getTranslation('Downloads'):
                return (
                    <FontAwesome5
                        style={{ fontSize: 18, color: '#fff' }}
                        // icon={SolidIcons.download}
                        name="download"
                    />
                );
                break;
            case LANG.getTranslation('CatchupTV'):
                return (
                    <FontAwesome5
                        style={{ fontSize: 18, color: '#fff' }}
                        // icon={SolidIcons.history}
                        name="history"
                    />
                );
                break;
            case LANG.getTranslation('Education'):
                return (
                    <FontAwesome5
                        style={{ fontSize: 18, color: '#fff' }}
                        // icon={SolidIcons.school}
                        name="school"
                    />
                );
                break;
            default:
                //this is an app menu
                break;
        }
    }
    return (
        <DrawerContentScrollView
            {...props}
            scrollEnabled
            removeClippedSubviews
            renderToHardwareTextureAndroid
            contentContainerStyle={{ paddingBottom: sizes_.padding }}>
            <Block paddingHorizontal={sizes_.padding}>
                <View
                    style={{
                        paddingBottom: 20,
                        paddingTop: 20,
                        alignContent: 'center',
                        flexDirection: 'row',
                    }}>
                    <Image
                        //radius={0}
                        resizeMethod={'resize'}
                        resizeMode={'contain'}
                        style={{
                            width: !GLOBAL.Device_IsPortrait ? 200 : 100,
                            height: !GLOBAL.Device_IsPortrait ? 100 : 50,
                        }}
                        source={{ uri: GLOBAL.Logo }}
                    />
                </View>
                {GLOBAL.Selected_Profile != '' ? (
                    screens?.map((screen, index) => {
                        const isActive = active === screen.to;
                        return (
                            <Button
                                row
                                justify="flex-start"
                                marginBottom={sizes_.s}
                                key={`menu-screen-${screen.name}-${index}`}
                                onPress={() => handleNavigation(screen.to)}>
                                <View
                                    style={{
                                        alignContent: 'center',
                                        justifyContent: 'center',
                                        width: sizes_.md,
                                        height: sizes_.md,
                                        marginRight: sizes_.s,
                                    }}>
                                    {screen.icon}
                                </View>
                                <Text p semibold={isActive} color={labelColor}>
                                    {screen.name}
                                </Text>
                            </Button>
                        );
                    })
                ) : (
                    <View></View>
                )}
                {GLOBAL.Selected_Profile != '' ? (
                    <View>
                        <Block
                            flex={0}
                            height={1}
                            marginRight={sizes_.md}
                            marginVertical={sizes_.sm}
                            gradient={gradients.menu}
                        />

                        {GLOBAL.UserInterface.general.enable_watchlist_menu ==
                            true && (
                                <Button
                                    row
                                    justify="flex-start"
                                    onPress={() => handleNavigation('Watchlist')}>
                                    <View
                                        style={{
                                            alignContent: 'center',
                                            justifyContent: 'center',
                                            width: sizes_.md,
                                            height: sizes_.md,
                                            marginRight: sizes_.s,
                                        }}>
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
                                onPress={() => handleNavigation('Rentals')}>
                                <View
                                    style={{
                                        alignContent: 'center',
                                        justifyContent: 'center',
                                        width: sizes_.md,
                                        height: sizes_.md,
                                        marginRight: sizes_.s,
                                    }}>
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
                        {GLOBAL.SupportPages.length > 0 && (
                            <Button
                                row
                                justify="flex-start"
                                onPress={() => handleNavigation('Support')}>
                                <View
                                    style={{
                                        alignContent: 'center',
                                        justifyContent: 'center',
                                        width: sizes_.md,
                                        height: sizes_.md,
                                        marginRight: sizes_.s,
                                    }}>
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
                        <Button
                            row
                            justify="flex-start"
                            onPress={() => handleNavigation('Signout')}>
                            <View
                                style={{
                                    alignContent: 'center',
                                    justifyContent: 'center',
                                    width: sizes_.md,
                                    height: sizes_.md,
                                    marginRight: sizes_.s,
                                }}>
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

/* drawer menu navigation */
export default () => {
    const { gradients } = useTheme();
    return (
        <Block gradient={gradients['dark']}>
            <Drawer.Navigator
                screenOptions={{
                    headerShown: false,
                }}
                drawerType="slide"
                overlayColor="transparent"
                sceneContainerStyle={{ flex: 1, backgroundColor: 'transparent' }}
                drawerContent={props => <DrawerContent {...props} />}
                drawerStyle={{
                    flex: 1,
                    width: GLOBAL.Device_IsPortrait ? '60%' : '30%',
                    borderRightWidth: 0,
                    backgroundColor: 'transparent',
                }}>
                <Drawer.Screen name="Drawer" component={ScreensStack} />
            </Drawer.Navigator>
        </Block>
    );
};
