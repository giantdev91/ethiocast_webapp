import React, {useState, useEffect} from 'react';
import {createStackNavigator} from '@react-navigation/stack';

const Stack = createStackNavigator();

import Menu_Drawer from './Menu_Drawer';
import Menu_Bottom from './Menu_Bottom';

export const MenuStack = () => {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
                cardStyle: {backgroundColor: 'transparent'},
            }}
        >
            {GLOBAL.App_Theme == 'Iridium' && (
                <Stack.Screen
                    options={{
                        headerShown: false,
                        cardStyle: {backgroundColor: 'transparent'},
                    }}
                    name="Iridium"
                    component={Menu_Drawer}
                />
            )}
            {GLOBAL.App_Theme == 'Honua' && (
                <Stack.Screen
                    options={{
                        headerShown: false,
                        cardStyle: {backgroundColor: 'transparent'},
                    }}
                    name="Honua"
                    component={Menu_Drawer}
                />
            )}
            {GLOBAL.App_Theme == 'Akua' && (
                <Stack.Screen
                    options={{
                        headerShown: false,
                        cardStyle: {backgroundColor: 'transparent'},
                    }}
                    name="Akua"
                    component={Menu_Bottom}
                />
            )}
        </Stack.Navigator>
    );
};
