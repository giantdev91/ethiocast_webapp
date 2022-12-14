import React, {ReactElement, useState} from 'react';
import {View} from 'react-native';
import {sendPageReport} from '../../../reporting/reporting';

export default ({navigation}): React.ReactElement => {
    const [reportStartTime, setReportStartTime] = useState(moment().unix());
    useEffect(() => {
        return () =>
            sendPageReport('Downloads', reportStartTime, moment().unix());
    }, []);
    return <View></View>;
};
