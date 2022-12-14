import React, {Component} from 'react';
import StandardModal from './StandardModal';
import ParentalModal from './ParentalModal';
import MessageModal from './MessageModal';
import MessageModalHome from './MessageModalHome';
import LoaderModal from './LoaderModal';

class Modal extends Component {
    constructor(props) {
        super(props);
    }
    render() {
        if (this.props.Type == 'Parental') {
            return (
                <ParentalModal
                    Title={this.props.Title}
                    TextButton1={this.props.TextButton1}
                    TextButton2={this.props.TextButton2}
                    OnPressButton1={this.props.OnPressButton1}
                    OnPressButton2={this.props.OnPressButton2}
                    {...this.props}
                ></ParentalModal>
            );
        } else if (this.props.Type == 'Message') {
            return (
                <MessageModal
                    TextContent={this.props.TextMain}
                    TextSubject={this.props.TextHeader}
                    OnPressClose={this.props.OnPressClose}
                    QRCode={this.props.QRCode}
                    Status={this.props.Status}
                    {...this.props}
                ></MessageModal>
            );
        } else if (this.props.Type == 'MessageHome') {
            return <MessageModalHome {...this.props}></MessageModalHome>;
        } else if (this.props.Type == 'Loader') {
            return (
                <LoaderModal
                    Title={this.props.Title}
                    Centered={this.props.Centered}
                    Progress={this.props.Progress}
                    ShowLoader={this.props.ShowLoader}
                ></LoaderModal>
            );
        } else {
            return (
                <StandardModal
                    Title={this.props.Title}
                    Centered={this.props.Centered}
                    TextButton1={this.props.TextButton1}
                    TextButton2={this.props.TextButton2}
                    TextButton3={this.props.TextButton3}
                    TextMain={this.props.TextMain}
                    TextHeader={this.props.TextHeader}
                    TextTagline={this.props.TextTagline}
                    OnPressButton1={this.props.OnPressButton1}
                    OnPressButton2={this.props.OnPressButton2}
                    OnPressButton3={this.props.OnPressButton3}
                    ShowLoader={this.props.ShowLoader}
                ></StandardModal>
            );
        }
    }
}
export default Modal;
