import React, {useState, useEffect} from 'react';
import {createStackNavigator} from '@react-navigation/stack';

import {Empty, Profiles, Edit, Add, Signout} from '../screens';

const Stack = createStackNavigator();

export const ProfileStack = () => {
    return (
        <Stack.Navigator screenOptions={{headerShown: false}}>
            <Stack.Screen
                name="Profiles"
                component={Profiles}
                options={{
                    cardStyle: {flex: 1},
                    title: GLOBAL.Settings_Gui.brandname,
                }}
            />
            <Stack.Screen
                name="Edit"
                component={Edit}
                options={{
                    cardStyle: {flex: 1},
                    title: GLOBAL.Settings_Gui.brandname,
                }}
            />
            <Stack.Screen
                name="Add"
                component={Add}
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
            <Stack.Screen
                name="Empty"
                component={Empty}
                options={{
                    cardStyle: {flex: 1},
                    title: GLOBAL.Settings_Gui.brandname,
                }}
            />
        </Stack.Navigator>
    );
};
