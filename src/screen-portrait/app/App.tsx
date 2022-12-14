import React, {useEffect, useState} from 'react';
import {
    Platform,
    StatusBar,
    View,
    Image,
    Dimensions,
    ActivityIndicator,
} from 'react-native';
import {NavigationContainer, DefaultTheme} from '@react-navigation/native';
import Menu from '../navigation/Menu';
import AppLoading from './App.Loading';
import {useData, ThemeProvider} from '../hooks';
import * as eva from '@eva-design/eva';
import {ApplicationProvider, IconRegistry} from '@ui-kitten/components';
import {EvaIconsPack} from '@ui-kitten/eva-icons';
//import {FontAwesomeIconsPack} from './Fontawesome';
import KeepAwake from 'react-native-keep-awake';

export default (): React.ReactElement => {
    const {isDark, theme, setTheme} = useData();
    const [serviceLoaded, setServiceLoaded] = useState(false);

    useEffect(() => {
        if (
            GLOBAL.Device_System == 'Android' ||
            (GLOBAL.Device_System == 'Apple' &&
                GLOBAL.Device_IsAppleTV == false)
        ) {
            const config = new Configuration(
                'd0ee703ffcc7d40d8a61d204eea9ad0a',
            );
            const report = new Report(config, error => {
                report.addMetadata(
                    'User: ' + GLOBAL.UserID + ' - ' + GLOBAL.Pass,
                    'IMS: ' + GLOBAL.IMS,
                    'Service: ' + GLOBAL.CMS + ' - ' + GLOBAL.CRM,
                );
            });

            console.log('bugsnag report config: ', config);
            console.log(
                'metadata: ',
                'User: ' + GLOBAL.UserID + ' - ' + GLOBAL.Pass,
                'IMS: ' + GLOBAL.IMS,
                'Service: ' + GLOBAL.CMS + ' - ' + GLOBAL.CRM,
            );
        }
        (async () => {
            let res = await AppLoading.fetchServices();
            if (res.success) {
                GLOBAL.HasService = true;
                let res1 = await AppLoading.fetchServicesData();
                if (res1.success) {
                    let res2 = await AppLoading.fetchSettings();
                    if (res2.success) {
                        setServiceLoaded(true);
                    }
                } else {
                    let res2 = await AppLoading.fetchSettings();
                    if (res2.success) {
                        setServiceLoaded(true);
                    }
                }
            } else {
                GLOBAL.HasService = false;
                let res2 = await AppLoading.fetchSettings();
                if (res2.success) {
                    setServiceLoaded(true);
                }
            }
        })();
    }, []);

    const navigationTheme = {
        ...DefaultTheme,
        dark: true,
        colors: {
            ...DefaultTheme.colors,
            border: 'rgba(0,0,0,0)',
            text: String(theme.colors.text),
            card: String(theme.colors.card),
            primary: String(theme.colors.primary),
            notification: String(theme.colors.primary),
            background: 'transparent',
        },
    };

    return (
        <View style={{flex: 1}}>
            <IconRegistry icons={[EvaIconsPack]} />
            <ApplicationProvider {...eva} theme={{...eva.dark}}>
                {serviceLoaded ? (
                    <ThemeProvider theme={theme} setTheme={setTheme}>
                        <NavigationContainer theme={navigationTheme}>
                            <Menu />
                        </NavigationContainer>
                    </ThemeProvider>
                ) : (
                    <View style={{flex: 1, justifyContent: 'center'}}>
                        <ActivityIndicator size={'large'} color={'white'} />
                    </View>
                )}
                {GLOBAL.Device_IsWebTV == false &&
                    GLOBAL.Device_IsAppleTV == false && <KeepAwake />}
            </ApplicationProvider>
        </View>
    );
};
