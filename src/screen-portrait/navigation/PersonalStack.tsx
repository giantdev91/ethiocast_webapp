import React, {useState, useEffect} from 'react';
import {createStackNavigator} from '@react-navigation/stack';

const Stack = createStackNavigator();

import {
    Favorites,
    Messages,
    Profiles,
    Rentals,
    Settings,
    Signout,
    Watchlist,
    Support,
} from '../screens';

export const PersonalStack = () => {
    return (
        <Stack.Navigator screenOptions={{headerShown: false}}>
            <Stack.Screen
                name="Settings "
                component={Settings}
                options={{
                    cardStyle: {flex: 1},
                    title: GLOBAL.Settings_Gui.brandname,
                }}
            />
            <Stack.Screen
                name="Support "
                component={Support}
                options={{
                    cardStyle: {flex: 1},
                    title: GLOBAL.Settings_Gui.brandname,
                }}
            />
            <Stack.Screen
                name="Rentals "
                component={Rentals}
                options={{
                    cardStyle: {flex: 1},
                    title: GLOBAL.Settings_Gui.brandname,
                }}
            />
            <Stack.Screen
                name="Watchlist "
                component={Watchlist}
                options={{
                    cardStyle: {flex: 1},
                    title: GLOBAL.Settings_Gui.brandname,
                }}
            />
            <Stack.Screen
                name="Favorites "
                component={Favorites}
                options={{
                    cardStyle: {flex: 1},
                    title: GLOBAL.Settings_Gui.brandname,
                }}
            />
            <Stack.Screen
                name="Messages "
                component={Messages}
                options={{
                    cardStyle: {flex: 1},
                    title: GLOBAL.Settings_Gui.brandname,
                }}
            />
            <Stack.Screen
                name="Signout "
                component={Signout}
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
        </Stack.Navigator>
    );
};
