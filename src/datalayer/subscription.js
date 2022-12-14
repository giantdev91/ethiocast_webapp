import React, {Component} from 'react';
import {View, Text, Image, Linking} from 'react-native';

import TimerMixin from 'react-timer-mixin';
import UTILS from './utils';
// var GLOBAL = require('./global');
var GLOBALModule = require('./global');
var GLOBAL = GLOBALModule.default;
//var PUSH = require('./push');
import STYLE from '../styling/style';

export default class SUBSCRIPTION extends Component {
    constructor(props) {
        super(props);
        const themeStyle = STYLE.getStyle();
        styles = {...themeStyle, ...baseStyle};

        this.state = {
            title: '',
            bigtext: '',
            smalltext: '',
            image: '',
            url: '',
            positive: 'Open',
            negative: 'Cancel',
            autoHide: true,
            index: 0,
            show_modal: false,
            type: '',
            id: 0,
            extra_style: {},
            showmessage: false,
            message: '',
        };
    }
    componentDidMount() {
        if (GLOBAL.Device_IsWebTV) {
            startMouseEvents();
        }
        if (GLOBAL.Connected_Internet == true) {
            this.getNotification();
        }
    }
    componentWillUnmount() {
        this.setState({
            showmessage: false,
        });
        TimerMixin.clearTimeout(this.subTimer);
    }
    getNotification() {
        var path = '';
        if (GLOBAL.ResellerID == 0) {
            path =
                GLOBAL.CDN_Prefix +
                '/' +
                GLOBAL.IMS +
                '/jsons/' +
                GLOBAL.CRM +
                '/subscription_push.json';
        } else {
            path =
                GLOBAL.CDN_Prefix +
                '/' +
                GLOBAL.IMS +
                '/jsons/' +
                GLOBAL.CRM +
                '/subscription_push_' +
                GLOBAL.ResellerID +
                '.json';
        }
        DAL.getJson(path)
            .then(data => {
                if (data != undefined) {
                    GLOBAL.Message_Center_Shown = true;
                    GLOBAL.Subscription_Push = data;
                    //this.showNotifications();
                    if (GLOBAL.Subscription_Push.length > 0) {
                        this.showMessageNotifications();
                    }
                }
            })
            .catch(error => {});
    }
    showNotifications() {
        if (GLOBAL.Device_IsPhone == true || GLOBAL.Device_IsTablet) {
            if (GLOBAL.Subscription_Push == undefined) {
                return;
            }
            if (
                GLOBAL.User == undefined ||
                GLOBAL.User == null ||
                GLOBAL.User.length == 0
            ) {
                return;
            }
            var current = moment().format('X');

            GLOBAL.Subscription_Push.forEach(function (element) {
                var expiringStart = moment(
                    new Date(GLOBAL.User.account.date_expired),
                )
                    .add(element.days, 'days')
                    .startOf('day')
                    .format('X');
                var expiringEnd = moment(
                    new Date(GLOBAL.User.account.date_expired),
                )
                    .add(element.days, 'days')
                    .endOf('day')
                    .format('X');

                if (expiringStart < current && expiringEnd > current) {
                    var id = moment().format('DD_MM_YYYY') + '_' + element.days;
                    var check = GLOBAL.Shown_Notifications.find(
                        m => m.id == id,
                    );
                    if (check == null) {
                        var storePush = {id: id};
                        GLOBAL.Shown_Notifications.push(storePush);
                        UTILS.storeJson(
                            'Shown_Notifications',
                            GLOBAL.Shown_Notifications,
                        );

                        action = '["Renew", "Cancel"]';
                        autoHide = false;

                        // PUSH.default.localPushSubscription(autoHide, "External", 123, element.big_text, element.title, action, element.image, element.url);
                    }
                }
            });
        }
    }
    showMessageNotifications() {
        if (GLOBAL.Subscription_Push == undefined) {
            return;
        }
        if (
            GLOBAL.User == undefined ||
            GLOBAL.User == null ||
            GLOBAL.User.length == 0
        ) {
            return;
        }

        GLOBAL.Subscription_Push.forEach(element => {
            if (element != undefined) {
                var current = moment().format('X');
                var expiringStart = moment(
                    new Date(GLOBAL.User.account.date_expired),
                )
                    .add(element.days, 'days')
                    .startOf('day')
                    .format('X');
                var expiringEnd = moment(
                    new Date(GLOBAL.User.account.date_expired),
                )
                    .add(element.days, 'days')
                    .endOf('day')
                    .format('X');

                if (expiringStart < current && expiringEnd > current) {
                    this.setState({
                        showmessage: true,
                        message: element.big_text,
                    });
                    TimerMixin.clearTimeout(this.subTimer);
                    this.subTimer = TimerMixin.setTimeout(() => {
                        this.setState({
                            showmessage: false,
                        });
                    }, 10000);
                    // var id = moment().format('DD_MM_YYYY') + "_" + element.days;
                    // var check = GLOBAL.Shown_Notifications.find(m => m.id == id);
                    // if(check == null){
                    //     var storePush = {id : id}

                    //     GLOBAL.Shown_Notifications.push(storePush);
                    //     UTILS.storeJson('Shown_Notifications',GLOBAL.Shown_Notifications)

                    //     var new_message = {
                    //         id: id,
                    //         tz: Number(current),
                    //         read: false,
                    //         deleted: false,
                    //         message: element.big_text,
                    //         title: element.title,
                    //         image: element.image,
                    //     }
                    //     GLOBAL.Messages.splice(0,0,new_message);
                    // }
                }
            }
            var qty = GLOBAL.Messages.filter(m => m.read == false);
            GLOBAL.Messages_QTY = qty.length;
            UTILS.storeJson('Messages', GLOBAL.Messages);
        });
    }

    render() {
        return (
            <View>
                {RenderIf(
                    this.state.showmessage == true && GLOBAL.Focus == 'Home',
                )(
                    <View
                        style={{
                            width: '100%',
                            height: 50,
                            justifyContent: 'center',
                            alignContent: 'center',
                            alignItems: 'center',
                        }}
                    >
                        <View
                            style={{
                                width: '50%',
                                height: 50,
                                top: 5,
                                backgroundColor: 'orange',
                                justifyContent: 'center',
                                alignContent: 'center',
                                alignItems: 'center',
                            }}
                        >
                            <Text style={{color: '#ffffff'}}>
                                {this.state.message}
                            </Text>
                        </View>
                    </View>,
                )}
            </View>
        );
    }
}
