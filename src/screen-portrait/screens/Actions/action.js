import React, {Component} from 'react';
import {View, Platform} from 'react-native';

export default class ACTION extends Component {
    constructor(props) {
        super(props);
        const themeStyle = STYLE.getStyle();
        styles = {...themeStyle, ...baseStyle};
    }
    componentDidMount() {
        if (Platform.OS == 'android') {
            // if (GLOBAL.Connected_Internet == true) {
            this.getNotification();
            // }
        }
    }
    getNotification() {
        var path =
            GLOBAL.CDN_Prefix +
            '/' +
            GLOBAL.IMS +
            '/jsons/' +
            GLOBAL.CRM +
            '/push_actions.json';
        GLOBAL.show_log && console.log('get notification: ', path);
        DAL.getJson(path)
            .then(data => {
                GLOBAL.show_log && console.log('get notification result: ', data);
                if (data != undefined) {
                    if (data.length > 0) {
                        data.forEach(element => {
                            var version = element.version_number
                                .toString()
                                .replace('V', '')
                                .toString()
                                .replace('v', '')
                                .split('.');
                            var high = version[0];
                            var medium = version[1];
                            var low = version[2];

                            var version_ = GLOBAL.App_Version.toString()
                                .replace('V', '')
                                .toString()
                                .replace('v', '')
                                .split('.');
                            var high_ = version_[0];
                            var medium_ = version_[1];
                            var low_ = version_[2];

                            if (high >= high_) {
                                if (
                                    high + '' + medium >=
                                    high_ + '' + medium_
                                ) {
                                    if (
                                        high + '' + medium + '' + low >
                                        high_ + '' + medium_ + '' + low_
                                    ) {
                                        GLOBAL.OTA_Update = true;
                                        var test = GLOBAL.OTA_Updates.find(
                                            o => o.id == element.id,
                                        );
                                        if (test == undefined) {
                                            GLOBAL.OTA_Updates.push(element);
                                        }
                                    }
                                }
                            }
                        });
                    }
                }
            })
            .catch(error => {});
    }
    render() {
        return <View></View>;
    }
}
