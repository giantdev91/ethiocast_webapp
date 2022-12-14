import React, {useState, useEffect} from 'react';
import {createStackNavigator} from '@react-navigation/stack';

import {
    Signin,
    Forgot,
    Service,
    Disclaimer,
    Language,
    Empty,
    Check,
} from '../screens';

const Stack = createStackNavigator();

export const AuthStack = () => {
    return (
        <Stack.Navigator screenOptions={{headerShown: false}}>
            <Stack.Screen
                name="Language"
                component={Language}
                options={{cardStyle: {flex: 1}, title: 'WebTV'}}
            />
            <Stack.Screen
                name="Service"
                component={Service}
                options={{cardStyle: {flex: 1}, title: 'WebTV'}}
            />
            <Stack.Screen
                name="Signin"
                component={Signin}
                options={{cardStyle: {flex: 1}, title: 'WebTV'}}
            />
            <Stack.Screen
                name="Forgot"
                component={Forgot}
                options={{cardStyle: {flex: 1}, title: 'WebTV'}}
            />
            <Stack.Screen
                name="Disclaimer"
                component={Disclaimer}
                options={{cardStyle: {flex: 1}, title: 'WebTV'}}
            />
            <Stack.Screen
                name="Check"
                component={Check}
                options={{cardStyle: {flex: 1}, title: 'WebTV'}}
            />
            <Stack.Screen
                name="Empty"
                component={Empty}
                options={{cardStyle: {flex: 1}, title: 'WebTV'}}
            />
        </Stack.Navigator>
    );
};
