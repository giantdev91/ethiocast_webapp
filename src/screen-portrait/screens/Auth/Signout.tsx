import React, {ReactElement, useEffect, useState} from 'react';
import {View, ImageBackground, ActivityIndicator} from 'react-native';
// import GLOBALModule from '../../../datalayer/global';
var GLOBALModule = require('../../../datalayer/global');
var GLOBAL = GLOBALModule.default;
import {sendPageReport} from '../../../reporting/reporting';
import {CommonActions} from '@react-navigation/native';

export default ({navigation}): React.ReactElement => {
    const [reportStartTime, setReportStartTime] = useState(moment().unix());
    useEffect(() => {
        return () =>
            sendPageReport('Watchlist', reportStartTime, moment().unix());
    }, []);
    useEffect(() => {
        GLOBAL.Loaded = false;
        GLOBAL.Authenticated = false;
        GLOBAL.Profiled = false;
        DAL.getDevices(
            GLOBAL.IMS + '.' + GLOBAL.CRM,
            toAlphaNumeric(GLOBAL.UserID) + '.' + toAlphaNumeric(GLOBAL.Pass),
        )
            .then(devices => {
                if (devices.devices != undefined && devices.devices != '') {
                    var today = moment().utc().unix();
                    var devicesLeft = devices.devices.filter(
                        element => element.uuid != GLOBAL.Device_UniqueID,
                    );
                    var devicesNotToOld = devicesLeft.filter(
                        d => d.valid > today,
                    );
                    DAL.setDevices(
                        GLOBAL.IMS + '.' + GLOBAL.CRM,
                        toAlphaNumeric(GLOBAL.UserID) +
                            '.' +
                            toAlphaNumeric(GLOBAL.Pass),
                        devicesNotToOld,
                    )
                        .then(result => {
                            GLOBAL.Focus = 'Logout';
                            GLOBAL.AutoLogin = false;
                            if (
                                GLOBAL.UserID == 'lgapptest' ||
                                GLOBAL.UserID == 'tizenapptest'
                            ) {
                                GLOBAL.UserID = '';
                                GLOBAL.Pass = '';
                                GLOBAL.ServiceID = '';
                                UTILS.storeJson('UserID', '');
                                UTILS.storeJson('Pass', '');
                                UTILS.storeJson('ServiceID', '');
                            }
                            GLOBAL.App_Theme = 'Default';
                            UTILS.storeJson('AutoLogin', false);
                            if (GLOBAL.HasService == true) {
                                GLOBAL.Logo =
                                    GLOBAL.HTTPvsHTTPS +
                                    GLOBAL.Settings_Services_Login.contact.logo
                                        .toString()
                                        .replace('http://', '')
                                        .replace('https://', '')
                                        .replace('//', '');
                                GLOBAL.Background =
                                    GLOBAL.HTTPvsHTTPS +
                                    GLOBAL.Settings_Services_Login.contact.background
                                        .toString()
                                        .replace('http://', '')
                                        .replace('https://', '')
                                        .replace('//', '');
                                GLOBAL.Support =
                                    GLOBAL.Settings_Services_Login.contact.text;
                                openAuthPage();
                            } else {
                                GLOBAL.Logo =
                                    GLOBAL.HTTPvsHTTPS +
                                    GLOBAL.Settings_Services_Login.contact.logo
                                        .toString()
                                        .replace('http://', '')
                                        .replace('https://', '')
                                        .replace('//', '');
                                GLOBAL.Background =
                                    GLOBAL.HTTPvsHTTPS +
                                    GLOBAL.Settings_Services_Login.contact.background
                                        .toString()
                                        .replace('http://', '')
                                        .replace('https://', '')
                                        .replace('//', '');
                                GLOBAL.Support =
                                    GLOBAL.Settings_Services_Login.contact.text;
                                openAuthPage();
                            }
                        })
                        .catch(error => {
                            GLOBAL.Focus = 'Logout';
                            GLOBAL.AutoLogin = false;
                            if (GLOBAL.Device_Manufacturer == 'LG WebOS') {
                                GLOBAL.UserID = '';
                                GLOBAL.Pass = '';
                                GLOBAL.ServiceID = '';
                            }
                            GLOBAL.App_Theme = 'Default';
                            UTILS.storeJson('AutoLogin', false);
                            if (GLOBAL.HasService == true) {
                                GLOBAL.Logo =
                                    GLOBAL.HTTPvsHTTPS +
                                    GLOBAL.Settings_Services_Login.contact.logo
                                        .toString()
                                        .replace('http://', '')
                                        .replace('https://', '')
                                        .replace('//', '');
                                GLOBAL.Background =
                                    GLOBAL.HTTPvsHTTPS +
                                    GLOBAL.Settings_Services_Login.contact.background
                                        .toString()
                                        .replace('http://', '')
                                        .replace('https://', '')
                                        .replace('//', '');
                                GLOBAL.Support =
                                    GLOBAL.Settings_Services_Login.contact.text;
                                openAuthPage();
                            } else {
                                GLOBAL.Logo =
                                    GLOBAL.HTTPvsHTTPS +
                                    GLOBAL.Settings_Services_Login.contact.logo
                                        .toString()
                                        .replace('http://', '')
                                        .replace('https://', '')
                                        .replace('//', '');
                                GLOBAL.Background =
                                    GLOBAL.HTTPvsHTTPS +
                                    GLOBAL.Settings_Services_Login.contact.background
                                        .toString()
                                        .replace('http://', '')
                                        .replace('https://', '')
                                        .replace('//', '');
                                GLOBAL.Support =
                                    GLOBAL.Settings_Services_Login.contact.text;
                                openAuthPage();
                            }
                        });
                } else {
                    GLOBAL.Focus = 'Logout';
                    GLOBAL.AutoLogin = false;
                    if (GLOBAL.Device_Manufacturer == 'LG WebOS') {
                        GLOBAL.UserID = '';
                        GLOBAL.Pass = '';
                        GLOBAL.ServiceID = '';
                    }
                    GLOBAL.App_Theme = 'Default';
                    UTILS.storeJson('AutoLogin', false);
                    if (GLOBAL.HasService == true) {
                        GLOBAL.Logo =
                            GLOBAL.HTTPvsHTTPS +
                            GLOBAL.Settings_Services_Login.contact.logo
                                .toString()
                                .replace('http://', '')
                                .replace('https://', '')
                                .replace('//', '');
                        GLOBAL.Background =
                            GLOBAL.HTTPvsHTTPS +
                            GLOBAL.Settings_Services_Login.contact.background
                                .toString()
                                .replace('http://', '')
                                .replace('https://', '')
                                .replace('//', '');
                        GLOBAL.Support =
                            GLOBAL.Settings_Services_Login.contact.text;
                        openAuthPage();
                    } else {
                        GLOBAL.Logo =
                            GLOBAL.HTTPvsHTTPS +
                            GLOBAL.Settings_Services_Login.contact.logo
                                .toString()
                                .replace('http://', '')
                                .replace('https://', '')
                                .replace('//', '');
                        GLOBAL.Background =
                            GLOBAL.HTTPvsHTTPS +
                            GLOBAL.Settings_Services_Login.contact.background
                                .toString()
                                .replace('http://', '')
                                .replace('https://', '')
                                .replace('//', '');
                        GLOBAL.Support =
                            GLOBAL.Settings_Services_Login.contact.text;
                        openAuthPage();
                    }
                }
            })
            .catch(error => {
                GLOBAL.Focus = 'Logout';
                GLOBAL.AutoLogin = false;
                if (GLOBAL.Device_Manufacturer == 'LG WebOS') {
                    GLOBAL.UserID = '';
                    GLOBAL.Pass = '';
                    GLOBAL.ServiceID = '';
                }
                GLOBAL.App_Theme = 'Default';
                UTILS.storeJson('AutoLogin', false);
                if (GLOBAL.HasService == true) {
                    GLOBAL.Logo =
                        GLOBAL.HTTPvsHTTPS +
                        GLOBAL.Settings_Services_Login.contact.logo
                            .toString()
                            .replace('http://', '')
                            .replace('https://', '')
                            .replace('//', '');
                    GLOBAL.Background =
                        GLOBAL.HTTPvsHTTPS +
                        GLOBAL.Settings_Services_Login.contact.background
                            .toString()
                            .replace('http://', '')
                            .replace('https://', '')
                            .replace('//', '');
                    GLOBAL.Support =
                        GLOBAL.Settings_Services_Login.contact.text;
                    openAuthPage();
                } else {
                    GLOBAL.Logo =
                        GLOBAL.HTTPvsHTTPS +
                        GLOBAL.Settings_Services_Login.contact.logo
                            .toString()
                            .replace('http://', '')
                            .replace('https://', '')
                            .replace('//', '');
                    GLOBAL.Background =
                        GLOBAL.HTTPvsHTTPS +
                        GLOBAL.Settings_Services_Login.contact.background
                            .toString()
                            .replace('http://', '')
                            .replace('https://', '')
                            .replace('//', '');
                    GLOBAL.Support =
                        GLOBAL.Settings_Services_Login.contact.text;
                    openAuthPage();
                }
            });
    }, []);
    const openAuthPage = () => {
        if (GLOBAL.HasService == true) {
            navigation.dispatch(
                CommonActions.reset({
                    index: 1,
                    routes: [{name: 'Service'}],
                }),
            );
        } else {
            navigation.dispatch(
                CommonActions.reset({
                    index: 1,
                    routes: [{name: 'Signin'}],
                }),
            );
        }
    };
    const toAlphaNumeric = input => {
        if (input != null) {
            input = input.toString().replace(/\s/g, '');
            return input.toString().replace(/[^A-Za-z0-9]/g, '');
        } else {
            return '';
        }
    };
    return (
        <View
            style={{
                flex: 1,
                justifyContent: 'center',
                alignContent: 'center',
                alignItems: 'center',
                alignSelf: 'center',
            }}
        >
            <ActivityIndicator size={'large'} color={'white'} />
        </View>
    );
};
