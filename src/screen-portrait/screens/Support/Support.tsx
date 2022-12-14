import React, {ReactElement, useState, useEffect} from 'react';
import {BackHandler, TVMenuControl, ScrollView, Dimensions} from 'react-native';
import {NavigationContainer, DefaultTheme} from '@react-navigation/native';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import {TabBar, Tab} from '@ui-kitten/components';
import {View, ImageBackground} from 'react-native';
import {Block, Text} from '../../components';
import SIZES from '../../constants/sizes';
import Decode from 'unescape';
import HTML from 'react-native-render-html';
import {CommonActions} from '@react-navigation/native';
import {sendPageReport} from '../../../reporting/reporting';

export default ({navigation, route}): React.ReactElement => {
    const [reportStartTime, setReportStartTime] = useState(moment().unix());
    const {Navigator, Screen} = createMaterialTopTabNavigator();
    var sizes = SIZES.getSizing();
    const [page, setPage] = useState([]);
    const [pageIndex, setPageIndex] = useState(0);
    useEffect(() => {
        return () =>
            sendPageReport('Watchlist', reportStartTime, moment().unix());
    }, []);
    useEffect(() => {
        var pages = GLOBAL.SupportPages[pageIndex];
        setPage(pages.description);
    }, []);
    useEffect(() => {
        const backAction = () => {
            navigation.dispatch(
                CommonActions.reset({
                    index: 1,
                    routes: [{name: 'Home'}],
                }),
            );
            return true;
        };
        const backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            backAction,
        );
        return () => backHandler.remove();
    }, []);
    const TabNavigator = () => (
        <Navigator
            tabBarOptions={{
                scrollEnabled: true,
                tabStyle: {
                    width: 'auto',
                },
            }}
            initialLayout={{width: Dimensions.get('window').width}}
            style={{backgroundColor: 'transparent'}}
            tabBar={props => <TopTabBar {...props} />}
        >
            {GLOBAL.SupportPages.map(renderScreenName)}
        </Navigator>
    );
    const renderScreenName = (item, index) => (
        <Screen name={item.name} component={ScreenFirst} />
    );
    const renderSupportPage = item => (
        <Tab style={{width: 'auto'}} title={item.name} />
    );
    const selectTab = (index, state) => {
        setPageIndex(index);
        var pages = GLOBAL.SupportPages[index];
        setPage(pages.description);
        navigation.navigate(state.routeNames[index]);
    };
    const TopTabBar = ({navigation, state}) => (
        <TabBar
            style={{
                backgroundColor: '#111',
                height: sizes.height * 0.1,
                margin: 0,
                padding: 0,
            }}
            selectedIndex={state.index}
            indicatorStyle={{backgroundColor: 'transparent', height: 2}}
            onSelect={index => selectTab(index, state)}
        >
            {GLOBAL.SupportPages.map(renderSupportPage)}
        </TabBar>
    );

    const ScreenFirst = () => (
        <Block width={sizes.width} align="center" color={'transparent'}>
            <ScrollView style={{flex: 1, padding: 20}}>
                <HTML
                    source={{html: Decode(page)}}
                    baseFontStyle={{color: '#fff', fontSize: 16}}
                />
            </ScrollView>
        </Block>
    );
    const MyTheme = {
        ...DefaultTheme,
        colors: {
            ...DefaultTheme.colors,
            background: 'transparent',
        },
        dark: true,
    };
    return (
        <View style={{backgroundColor: '#111', flex: 1}}>
            <ImageBackground
                source={{uri: GLOBAL.Background}}
                style={{flex: 1, width: null, height: null}}
                imageStyle={{resizeMode: 'cover'}}
            >
                <NavigationContainer theme={MyTheme} independent={true}>
                    <TabNavigator />
                </NavigationContainer>
            </ImageBackground>
        </View>
    );
};
