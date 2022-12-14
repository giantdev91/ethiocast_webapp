import React, {Component} from 'react';
import {View} from 'react-native';

export default class MESSAGE extends Component {
    constructor(props) {
        super(props);
        const themeStyle = STYLE.getStyle();
        styles = {...themeStyle, ...baseStyle};
    }
    componentDidMount() {
        if (GLOBAL.Connected_Internet == true) {
            this.getNotification();
        }
    }

    getNotification() {
        const date = moment().format('DD_MM_YYYY');
        var path =
            GLOBAL.CDN_Prefix +
            '/' +
            GLOBAL.IMS +
            '/jsons/' +
            GLOBAL.CRM +
            '/' +
            date +
            '_push.json';
        DAL.getJson(path)
            .then(data => {
                if (data != undefined) {
                    data.forEach(element => {
                        var messagesNew = GLOBAL.Messages.find(
                            m => m.id == element.content_id,
                        );
                        if (messagesNew == undefined) {
                            var new_message = {
                                id: element.content_id,
                                tz: Number(element.time),
                                read: false,
                                deleted: false,
                                message: element.big_text,
                                title: element.title,
                                image: element.image,
                            };
                            GLOBAL.Messages.splice(0, 0, new_message);
                        }
                    });
                    var qty = GLOBAL.Messages.filter(m => m.read == false);
                    GLOBAL.Messages_QTY = qty.length;
                    UTILS.storeJson('Messages', GLOBAL.Messages);
                }
            })
            .catch(error => {});
    }
    render() {
        return <View></View>;
    }
}
