import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import {useScreenOptions} from '../hooks';
import {
    Home,
    Albums,
    Ads,
    Apps,
    CatchupTV,
    Channels,
    Player_Channels,
    Downloads,
    Courses,
    Years,
    Player_Education,
    Favorites,
    Stores,
    Movie,
    Categories,
    Player_Movies,
    Songs,
    Recordings,
    Player_Recordings,
    Rentals,
    Search,
    Series,
    Seasons,
    Player_Series,
    Settings,
    Support,
    Home_Akua_Landscape,
    Home_Akua_Portrait,
    Home_Honua_Landscape,
    Home_Honua_Portrait,
    Home_Iridium_Landscape,
    Home_Iridium_Portrait,
    Watchlist,
    TVGuide,
    Search_TVGuide,
    Profiles,
    Series_Sub,
    Years_Sub,
    Signout,
    Stores_Sub,
    Messages,
    Player_CatchupTV,
} from '../screens';
import Settings_Drawer from './Settings_Drawer';

const Stack = createStackNavigator();

export const AppStack = () => {
    const screenOptions = useScreenOptions();
    return (
        <Stack.Navigator
            screenOptions={
                GLOBAL.App_Theme == 'Akua'
                    ? {headerShown: false}
                    : screenOptions.stack
            }>
            <Stack.Screen
                name="Home"
                component={Home}
                options={{
                    cardStyle: {flex: 1},
                    title: GLOBAL.Settings_Gui.brandname,
                }}
            />
            <Stack.Screen
                name="Ads"
                component={Ads}
                options={{
                    cardStyle: {flex: 1},
                    title: GLOBAL.Settings_Gui.brandname,
                }}
            />
            <Stack.Screen
                name="Apps"
                component={Apps}
                options={{
                    cardStyle: {flex: 1},
                    title: GLOBAL.Settings_Gui.brandname,
                }}
            />
            <Stack.Screen
                name="CatchupTV"
                component={CatchupTV}
                options={{
                    cardStyle: {flex: 1},
                    title: GLOBAL.Settings_Gui.brandname,
                }}
            />
            <Stack.Screen
                name="Player_CatchupTV"
                options={{
                    headerShown: false,
                    title: 'Player: ' + GLOBAL.Settings_Gui.brandname,
                }}
                component={Player_CatchupTV}
            />
            <Stack.Screen
                name="Channels"
                component={Channels}
                options={{
                    cardStyle: {flex: 1},
                    title: GLOBAL.Settings_Gui.brandname,
                }}
            />
            <Stack.Screen
                name="Player_Channels"
                options={{
                    headerShown: false,
                    title: 'Player: ' + GLOBAL.Settings_Gui.brandname,
                }}
                component={Player_Channels}
            />
            <Stack.Screen
                name="Downloads"
                component={Downloads}
                options={{
                    cardStyle: {flex: 1},
                    title: GLOBAL.Settings_Gui.brandname,
                }}
            />
            <Stack.Screen
                name="Courses"
                component={Courses}
                options={{
                    cardStyle: {flex: 1},
                    title: GLOBAL.Settings_Gui.brandname,
                }}
            />
            <Stack.Screen
                name="Education"
                component={Years}
                options={{
                    cardStyle: {flex: 1},
                    title: GLOBAL.Settings_Gui.brandname,
                }}
            />
            <Stack.Screen
                name="Education "
                component={Years_Sub}
                options={{
                    cardStyle: {flex: 1},
                    title: GLOBAL.Settings_Gui.brandname,
                }}
            />
            <Stack.Screen
                name="Player_Education"
                options={{
                    headerShown: false,
                    title: 'Player: ' + GLOBAL.Settings_Gui.brandname,
                }}
                component={Player_Education}
            />
            <Stack.Screen
                name="Favorites"
                component={Favorites}
                options={{
                    cardStyle: {flex: 1},
                    title: GLOBAL.Settings_Gui.brandname,
                }}
            />
            <Stack.Screen
                name="Movies"
                component={Stores}
                options={{
                    cardStyle: {flex: 1},
                    title: GLOBAL.Settings_Gui.brandname,
                }}
            />
            <Stack.Screen
                name="Movies "
                component={Stores_Sub}
                options={{
                    cardStyle: {flex: 1},
                    title: GLOBAL.Settings_Gui.brandname,
                }}
            />
            <Stack.Screen
                name="Movie"
                component={Movie}
                options={{
                    cardStyle: {flex: 1},
                    title: GLOBAL.Settings_Gui.brandname,
                }}
            />
            <Stack.Screen
                name="Categories"
                component={Categories}
                options={{
                    cardStyle: {flex: 1},
                    title: GLOBAL.Settings_Gui.brandname,
                }}
            />
            <Stack.Screen
                name="Player_Movies"
                options={{
                    headerShown: false,
                    title: 'Player: ' + GLOBAL.Settings_Gui.brandname,
                }}
                component={Player_Movies}
            />
            <Stack.Screen
                name="Music"
                component={Albums}
                options={{
                    cardStyle: {flex: 1},
                    title: GLOBAL.Settings_Gui.brandname,
                }}
            />
            <Stack.Screen
                name="Songs"
                component={Songs}
                options={{
                    cardStyle: {flex: 1},
                    title: GLOBAL.Settings_Gui.brandname,
                }}
            />
            <Stack.Screen
                name="Recordings"
                component={Recordings}
                options={{
                    cardStyle: {flex: 1},
                    title: GLOBAL.Settings_Gui.brandname,
                }}
            />
            <Stack.Screen
                name="Player_Recordings"
                options={{
                    headerShown: false,
                    title: 'Player: ' + GLOBAL.Settings_Gui.brandname,
                }}
                component={Player_Recordings}
            />
            <Stack.Screen
                name="Rentals"
                component={Rentals}
                options={{
                    cardStyle: {flex: 1},
                    title: GLOBAL.Settings_Gui.brandname,
                }}
            />
            <Stack.Screen
                name="Search"
                component={Search}
                options={{
                    cardStyle: {flex: 1},
                    title: GLOBAL.Settings_Gui.brandname,
                }}
            />
            <Stack.Screen
                name="Series"
                component={Series}
                options={{
                    cardStyle: {flex: 1},
                    title: GLOBAL.Settings_Gui.brandname,
                }}
            />
            <Stack.Screen
                name="Series "
                component={Series_Sub}
                options={{
                    cardStyle: {flex: 1},
                    title: GLOBAL.Settings_Gui.brandname,
                }}
            />
            <Stack.Screen
                name="Seasons"
                component={Seasons}
                options={{
                    cardStyle: {flex: 1},
                    title: GLOBAL.Settings_Gui.brandname,
                }}
            />
            <Stack.Screen
                name="Player_Series"
                options={{
                    headerShown: false,
                    title: 'Player: ' + GLOBAL.Settings_Gui.brandname,
                }}
                component={Player_Series}
            />
            <Stack.Screen
                name="Settings"
                component={Settings}
                options={{
                    cardStyle: {flex: 1},
                    title: GLOBAL.Settings_Gui.brandname,
                }}
            />
            <Stack.Screen
                name="Support"
                component={Support}
                options={{
                    cardStyle: {flex: 1},
                    title: GLOBAL.Settings_Gui.brandname,
                }}
            />
            <Stack.Screen
                name="Home_Akua_Landscape"
                component={Home_Akua_Landscape}
                options={{
                    cardStyle: {flex: 1},
                    title: GLOBAL.Settings_Gui.brandname,
                }}
            />
            <Stack.Screen
                name="Home_Honua_Landscape"
                component={Home_Honua_Landscape}
                options={{
                    cardStyle: {flex: 1},
                    title: GLOBAL.Settings_Gui.brandname,
                }}
            />
            <Stack.Screen
                name="Home_Iridium_Landscape"
                component={Home_Iridium_Landscape}
                options={{
                    cardStyle: {flex: 1},
                    title: GLOBAL.Settings_Gui.brandname,
                }}
            />
            <Stack.Screen
                name="Home_Akua_Portrait"
                component={Home_Akua_Portrait}
                options={{
                    cardStyle: {flex: 1},
                    title: GLOBAL.Settings_Gui.brandname,
                }}
            />
            <Stack.Screen
                name="Home_Honua_Portrait"
                component={Home_Honua_Portrait}
                options={{
                    cardStyle: {flex: 1},
                    title: GLOBAL.Settings_Gui.brandname,
                }}
            />
            <Stack.Screen
                name="Home_Iridium_Portrait"
                component={Home_Iridium_Portrait}
                options={{
                    cardStyle: {flex: 1},
                    title: GLOBAL.Settings_Gui.brandname,
                }}
            />
            <Stack.Screen
                name="TV Guide"
                component={TVGuide}
                options={{
                    cardStyle: {flex: 1},
                    title: GLOBAL.Settings_Gui.brandname,
                }}
            />
            <Stack.Screen
                name="Search_TVGuide"
                component={Search_TVGuide}
                options={{
                    cardStyle: {flex: 1},
                    title: GLOBAL.Settings_Gui.brandname,
                }}
            />
            <Stack.Screen
                name="Watchlist"
                component={Watchlist}
                options={{
                    cardStyle: {flex: 1},
                    title: GLOBAL.Settings_Gui.brandname,
                }}
            />
            <Stack.Screen
                name="Profiles "
                component={Profiles}
                options={{
                    cardStyle: {flex: 1},
                    title: GLOBAL.Settings_Gui.brandname,
                }}
            />
            <Stack.Screen
                name="Messages"
                component={Messages}
                options={{
                    cardStyle: {flex: 1},
                    title: GLOBAL.Settings_Gui.brandname,
                }}
            />
            <Stack.Screen
                name="Signout"
                component={Signout}
                options={{
                    cardStyle: {flex: 1},
                    title: GLOBAL.Settings_Gui.brandname,
                }}
            />
            {GLOBAL.App_Theme == 'Akua' && (
                <Stack.Screen
                    name="Personal"
                    component={Settings_Drawer}
                    options={{
                        cardStyle: {flex: 1},
                        title: GLOBAL.Settings_Gui.brandname,
                    }}
                />
            )}
        </Stack.Navigator>
    );
};
