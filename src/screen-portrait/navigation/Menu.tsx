import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import Screens from './Screens';
import {useTheme} from '../hooks';

const Tab = createBottomTabNavigator();

function MyTabBar({state, descriptors, navigation}) {
    return null;
}
export default () => {
    const {gradients} = useTheme();
    return (
        <Tab.Navigator
            sceneContainerStyle={{backgroundColor: 'transparent'}}
            screenOptions={{
                headerShown: false
            }}
            tabBar={props => <MyTabBar {...props} />}
        >
            <Tab.Screen name="Bottom" component={Screens} />
        </Tab.Navigator>
    );
};
