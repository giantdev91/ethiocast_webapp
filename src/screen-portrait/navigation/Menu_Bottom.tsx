import React, { useState } from 'react';
import { View, TouchableOpacity, Platform, ScrollView } from 'react-native';
import LANG from '../../languages/languages';
// import FontAwesome5, {
//     SolidIcons,
//     RegularIcons,
//     BrandIcons,
// } from 'react-native-fontawesome';
import { FontAwesome, FontAwesome5 } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from '../components';
import { CommonActions } from '@react-navigation/native';
import { AppStack } from './AppStack';
//import { SIZES } from '../constants/dark';
import SIZES from '../constants/sizes';
const Tab = createBottomTabNavigator();

function MyTabBar({ state, descriptors, navigation }) {
    var sizes = SIZES.getSizing();

    if (GLOBAL.App_Theme == 'Akua') {
        var menu = '';
        const { index, routes } = navigation.dangerouslyGetState();
        if (routes[index].state != undefined) {
            const currentRoute = routes[index].state.routes;
            if (currentRoute.length > 0) {
                const currentName = currentRoute[currentRoute.length - 1].name;
                menu = currentName;
            }
        }
        var menuArray = [
            { name: LANG.getTranslation('Personal'), menu: 'Personal' },
        ];
        GLOBAL.Menu.forEach(element => {
            if (
                element.name != 'Casting' &&
                element.name != 'Hamburger' &&
                element.name != 'Logout' &&
                element.name != 'Youtube' &&
                element.name != 'Television'
            ) {
                if (element.name == 'Apps' && Platform.OS == 'android') {
                    var menu = {
                        name: LANG.getTranslation(element.name),
                        menu: LANG.getTranslation(element.name),
                    };
                    menuArray.push(menu);
                } else if (element.name != 'Apps') {
                    var menu = {
                        name: LANG.getTranslation(element.name),
                        menu: element.name,
                    };
                    menuArray.push(menu);
                }
            }
        });
        if (menuArray.length > 1 && menu == '') {
            menu = menuArray[1].name;
        }
        const [active, setActive] = useState(menu);
        const [reportStartTime, setReportStartTime] = useState(moment().unix());
        if (
            GLOBAL.Profiled == true &&
            menu != 'Player_Channels' &&
            menu != 'Player_CatchupTV' &&
            menu != 'Player_Movies' &&
            menu != 'Player_Series' &&
            menu != 'Player_Recordings' &&
            menu != 'Player_Education'
        ) {
            return (
                <View
                    style={{
                        flexDirection: 'row',
                        backgroundColor: '#000',
                        justifyContent: 'center',
                        alignItems: 'center',
                        paddingTop: 10,
                        maxHeight:
                            GLOBAL.Device_IsPhone &&
                                GLOBAL.Device_Manufacturer != 'Apple'
                                ? 70
                                : GLOBAL.Device_IsPhone &&
                                    GLOBAL.Device_Manufacturer == 'Apple'
                                    ? 120
                                    : sizes.height * 0.13,
                    }}>
                    <ScrollView
                        contentContainerStyle={{
                            flexDirection: 'row',
                            alignItems: 'center',
                        }}
                        horizontal>
                        {menuArray.map((route, index) => {
                            const onPress = () => {
                                setActive(route.menu);
                                navigation.dispatch(
                                    CommonActions.reset({
                                        index: 1,
                                        routes: [{ name: route.menu }],
                                    }),
                                );
                            };
                            const onLongPress = () => {
                                setActive(route.name);
                                //navigation.navigate(route.name);
                                navigation.dispatch(
                                    CommonActions.reset({
                                        index: 1,
                                        routes: [{ name: route.menu }],
                                    }),
                                );
                            };
                            return (
                                <FocusButton
                                    key={index}
                                    accessibilityRole="button"
                                    accessibilityStates={
                                        menu == route.name ? ['selected'] : []
                                    }
                                    onPress={onPress}
                                    onLongPress={onLongPress}
                                    style={{ flex: 1, alignItems: 'center' }}>
                                    <View
                                        style={{
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                        }}>
                                        {GLOBAL.OTA_Update &&
                                            Platform.OS == 'android' &&
                                            route.name ==
                                            LANG.getTranslation(
                                                'personal',
                                            ) && (
                                                <View
                                                    style={{
                                                        position: 'absolute',
                                                        top: 0,
                                                        right: 0,
                                                        left: 20,
                                                        zIndex: 99999,
                                                    }}>
                                                    <View
                                                        style={{
                                                            flexDirection:
                                                                'row',
                                                            backgroundColor:
                                                                'red',
                                                            borderRadius: 100,
                                                            height: 20,
                                                            width: 20,
                                                            alignSelf: 'center',
                                                            justifyContent:
                                                                'center',
                                                            alignContent:
                                                                'center',
                                                            alignItems:
                                                                'center',
                                                        }}>
                                                        <Text bold>!</Text>
                                                    </View>
                                                </View>
                                            )}
                                        <FontAwesome5
                                            style={{
                                                fontSize: 18,
                                                color:
                                                    menu == route.name
                                                        ? '#fff'
                                                        : '#999',
                                            }}
                                            // icon={getIconTabs(route.name)}
                                            name={getIconTabs(route.name)}
                                        />
                                        <Text
                                            numberOfLines={1}
                                            color={
                                                menu == route.name
                                                    ? '#fff'
                                                    : '#999'
                                            }
                                            style={{
                                                flex: 1,
                                                marginHorizontal:
                                                    GLOBAL.Device_IsPortrait
                                                        ? 15
                                                        : 25,
                                                marginVertical: 10,
                                            }}>
                                            {route.name}
                                        </Text>
                                    </View>
                                </FocusButton>
                            );
                        })}
                    </ScrollView>
                </View>
            );
        } else {
            return null;
        }
    } else {
        return null;
    }
}

function getIconTabs(menu) {
    switch (menu) {
        case LANG.getTranslation('Personal'):
            return "user-alt";
            break;
        case LANG.getTranslation('Search'):
            return "search";
            break;
        case LANG.getTranslation('Home'):
            return "home";
            break;
        case LANG.getTranslation('Channels'):
            return "th";
            break;
        case LANG.getTranslation('Television'):
            return "tv";
            break;
        case LANG.getTranslation('TV Guide'):
            return "th-list";
            break;
        case LANG.getTranslation('Recordings'):
            return "dot-circle";
            break;
        case LANG.getTranslation('Movies'):
            return "film";
            break;
        case LANG.getTranslation('Series'):
            return "video";
            break;
        case LANG.getTranslation('Music'):
            return "music";
            break;
        case LANG.getTranslation('Apps'):
            return "android";
            break;
        case LANG.getTranslation('Setting'):
            return "sliders-h"
            break;
        case LANG.getTranslation('Youtube'):
            return "youtube";
            break;
        case LANG.getTranslation('Logout'):
            return "lock";
            break;
        case LANG.getTranslation('My List'):
            return "play-circle";
            break;
        case LANG.getTranslation('Downloads'):
            return "download";
            break;
        case LANG.getTranslation('CatchupTV'):
            return "history";
            break;
        case LANG.getTranslation('Education'):
            return "school";
            break;
        default:
            //this is an app menu
            break;
    }
}

export default () => {
    return (
        <Tab.Navigator
            sceneContainerStyle={{ backgroundColor: 'transparent' }}
            tabBar={props => <MyTabBar {...props} />}>
            <Tab.Screen name="Bottom" component={AppStack} />
        </Tab.Navigator>
    );
};
