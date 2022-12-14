import React, {Component, useEffect} from 'react';
import {View} from 'react-native';
import SIZES from '../../constants/sizes';
import {useNavigation} from '@react-navigation/core';

export default (): React.ReactElement => {
    var sizes = SIZES.getSizing();
    const navigation = useNavigation();
    useEffect(() => {
        refreshUserData();
    }, []);
    const toAlphaNumeric = input => {
        if (input == '' || input == undefined || input == null) {
            return '';
        }
        input = input.toString().replace(/\s/g, '');
        return input.toString().replace(/[^A-Za-z0-9]/g, '');
    };
    const refreshUserData = () => {
        if (GLOBAL.UserID == '') {
            return;
        }
        var path =
            GLOBAL.CDN_Prefix +
            '/' +
            GLOBAL.IMS +
            '/customers/' +
            toAlphaNumeric(GLOBAL.UserID).split('').join('/') +
            '/' +
            toAlphaNumeric(GLOBAL.Pass) +
            '.json';
        DAL.getJson(path).then(data => {
            if (data != undefined) {
                var user = JSON.parse(data);
                var expiring = moment(
                    new Date(user.account.datetime_expired),
                ).format('X');
                var current = moment().format('X');
                var expireTime = expiring - current;
                GLOBAL.User = user;
                GLOBAL.User_Currency = user.customer.currency;
                if (user.account.account_status == 'Disabled') {
                    navigation.navigate('Signout');
                } else if (
                    user.account.account_status == 'Expired' ||
                    expireTime < 3600
                ) {
                    navigation.navigate('Signout');
                } else {
                    const date = moment().format('DD_MM_YYYY');
                    GLOBAL.Login_Check_Date = date;
                    GLOBAL.Staging = user.account.staging;
                    GLOBAL.ProductID = user.products.productid;
                    GLOBAL.ResellerID = user.account.resellerid;
                    GLOBAL.Recordings = user.recordings;
                    GLOBAL.Storage_Total = user.storage.total;
                    GLOBAL.Storage_Used = user.storage.used;
                    GLOBAL.Storage_Hours = user.storage.total_hours;
                    GLOBAL.PPV = user.payperview;
                    GLOBAL.Wallet_Credits = user.customer.walletbalance;
                    GLOBAL.Rented_Movies = user.payperview.movies;
                    var messages = user.messages;
                    if (messages != undefined) {
                        messages.forEach(message_ => {
                            var messagesNew = GLOBAL.Messages.find(
                                m =>
                                    m.id == message_.id &&
                                    m.tz == message_.time,
                            );
                            if (messagesNew == undefined) {
                                var new_message = {
                                    id: message_.id,
                                    tz: Number(message_.time),
                                    read: false,
                                    deleted: false,
                                    message: message_.message,
                                    title: message_.message,
                                    image: '',
                                };
                                GLOBAL.Messages.splice(0, 0, new_message);
                            }
                        });
                    }
                    var qty = GLOBAL.Messages.filter(m => m.read == false);
                    GLOBAL.Messages_QTY = qty.length;
                    UTILS.storeJson('Messages', GLOBAL.Messages);
                }
            }
        });
    };
    return <View></View>;
};
