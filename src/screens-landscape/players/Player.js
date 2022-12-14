import React, {PureComponent} from 'react';
import Channel_Player_V1 from '../components/Players/Player_Channels_V1';

export default class Player extends PureComponent {
    constructor(props) {
        super(props);
    }
    getPlayer(player) {
        switch (player) {
            case 'Channel_Player_V1':
                return (
                    <Channel_Player_V1
                        max_retry={this.props.max_retry}
                        page={this.props.page}
                        action={this.props.action}
                        fromPage={this.props.fromPage}
                    ></Channel_Player_V1>
                );
                break;
        }
    }
    render() {
        return this.getPlayer('Channel_Player_V1');
    }
}
