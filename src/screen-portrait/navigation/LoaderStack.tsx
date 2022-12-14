import React, {useState, useEffect} from 'react';
import {createStackNavigator} from '@react-navigation/stack';

const Stack = createStackNavigator();

import {Check, Loader} from '../screens';

export const LoaderStack = () => {
    return (
        <Stack.Navigator screenOptions={{headerShown: false}}>
            <Stack.Screen
                name="Loader"
                component={Loader}
                options={{cardStyle: {flex: 1}, title: 'WebTV'}}
            />
            <Stack.Screen
                name="Check"
                component={Check}
                options={{cardStyle: {flex: 1}, title: 'WebTV'}}
            />
        </Stack.Navigator>
    );
};
