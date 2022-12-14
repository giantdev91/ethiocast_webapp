import React, {Component} from 'react';
import {View} from 'react-native';
import TimerMixin from 'react-timer-mixin';
import STYLE from '../../../styling/style';

export default class UPDATE extends Component {
    constructor(props) {
        super(props);
    }
    componentDidMount() {
        if (GLOBAL.Focus == 'Outside') {
            return;
        } else {
            const date = moment().subtract(0, 'days').format('DD_MM_YYYY');
            if (GLOBAL.EPG_DATE_LOADED != date) {
                (async () => {
                    this.getEpgData(0);
                })();
            }
        }
    }
    componentWillUnmount() {
        GLOBAL.Message_Center_Shown = false;
        TimerMixin.clearTimeout(this.timer1);
    }
    getEpgData = async days => {
        const date = moment().subtract(days, 'days').format('DD_MM_YYYY');
        const test = moment().subtract(days, 'days').format('YYYY');
        if (test < 2020) {
            return {
                success: false,
                error: LANG.getTranslation('no_access_date_time'),
            };
        } else {
            GLOBAL.EPG = [];
            GLOBAL.EPG_TODAY = [];
            var path =
                GLOBAL.CDN_Prefix +
                '/' +
                GLOBAL.IMS +
                '/jsons/' +
                GLOBAL.CRM +
                '/' +
                date +
                '_' +
                GLOBAL.ProductID +
                '_product_epg_v4.json?t=' +
                new Date().getTime();
            try {
                console.log('get epg data: ', path);
                let response = await fetch(path);
                let data = await response.json();
                console.log('get epg data response: ', data);
                GLOBAL.EPG = data.channels;
                GLOBAL.EPG_TODAY = GLOBAL.EPG;
                GLOBAL.EPG_DATE_LOADED = date;
                if (GLOBAL.User.products.ChannelPackages.length > 0) {
                    return this.getExtraEpg(0, 0);
                }
            } catch (error) {}
        }
    };
    getExtraEpg = async (days, id) => {
        if (id < GLOBAL.User.products.ChannelPackages.length) {
            const date = moment().subtract(days, 'days').format('DD_MM_YYYY');
            const test = moment().subtract(days, 'days').format('YYYY');
            if (test < 2019) {
                return {
                    success: false,
                    error: LANG.getTranslation('no_access_date_time'),
                };
            } else {
                var path =
                    GLOBAL.CDN_Prefix +
                    '/' +
                    GLOBAL.IMS +
                    '/jsons/' +
                    GLOBAL.CMS +
                    '/' +
                    date +
                    '_' +
                    GLOBAL.User.products.ChannelPackages[id].PackageID +
                    '_package_epg_v4.json?t=' +
                    new Date().getTime();
                try {
                    console.log('get extra epg: ', path);
                    let response = await fetch(path);
                    let data = await response.json();
                    console.log('get extra epg response: ', data);
                    data.channels.forEach(function (element) {
                        GLOBAL.EPG = GLOBAL.EPG.concat(element);
                        GLOBAL.EPG_TODAY = GLOBAL.EPG_TODAY.concat(element);
                    });
                    GLOBAL.EPG_DATE_LOADED = date;
                    if (GLOBAL.User.products.ChannelPackages.length > 0) {
                        return this.getExtraEpg(0, id + 1);
                    }
                } catch (error) {}
            }
        }
    };
    render() {
        return <View></View>;
    }
}
