import TimerMixin from 'react-timer-mixin';

// var GLOBAL = require('./global');
var GLOBALModule = require('./global');
var GLOBAL = GLOBALModule.default;

/*
 * Gather user actions, create a report and send to a server
 * @returns {MWareAnalytics}
 */
class REPORT {
    debug = false;
    timer = null;
    timeout = 5 * 60000;
    temp = [];
    report = [];
    isPlayerPage = false;

    /*
     * Clear last report
     * @returns {void}
     */
    clear = function () {
        if (this.report.length) this.report.pop();
    };

    /*
     * Start timer to clear last action if user is inactive
     * @returns {void}
     */
    reset = function () {
        //if (isPlayerPage) return false;
        TimerMixin.clearTimeout(this.timer);
        this.time = TimerMixin.setTimeout(() => {
            this.clear.bind(this);
        }, this.timeout);
    };

    /*
     * Sets an end timestamp to a user action
     * @param {string} [optional] key
     * @returns {void}
     */
    endAction = function (key) {
        if (key) {
            if (this.temp[key]) {
                this.temp[key].to = moment().unix();
                this.report.push(this.temp[key]);
                delete this.temp[key];
                this.send();
                return false;
            }
            return false;
        }

        if (!this.report.length) return false;
        var index = this.report.length - 1;
        if (!this.report[index].to) {
            this.report[index].to = moment().unix();
            this.send();
        }
    };

    /*
     * Set start timestamp for user action
     * @param {object} options
     * @returns {void}
     */
    startAction = function (options) {
        options.from = moment().unix();

        if (options.key) {
            // if key is defined store action separately because it will be ended manually and pushed to this.report
            this.temp[options.key] = options;
        } else {
            this.report.push(options);
        }
        //this.reset();
    };

    /*
     * Create a new user action, initialize with start timestamp and end previous action
     * @param {object} action options
     * @returns {void}
     */
    set = function (options) {
        // end previous action
        this.endAction();
        // start a new action
        this.startAction(options);
    };

    /*
     * Send action to API
     * @returns {void}
     */
    send = async () => {
        var report = this.report.slice();
        this.report.length = 0;
        //https://mwarebigquerytest.appspot.com/
        try {
            if (GLOBAL.Connected_Internet == true) {
                const response = await fetch(
                    GLOBAL.ANALYTICS_REPORT_URL,
                    {
                        method: 'POST',
                        cors: 'no-cors',
                        headers: {
                            Accept: 'application/json',
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            date: moment().format('YYYY-MM-DD'),
                            user: {
                                uuid: GLOBAL.Device_UniqueID,
                                id: GLOBAL.UserID,
                                password: GLOBAL.Pass,
                            },
                            ui: {
                                name: GLOBAL.App_Theme,
                                version: GLOBAL.App_Version,
                            },
                            client: {
                                name: GLOBAL.Settings_Gui.client,
                                cms: GLOBAL.CMS,
                                crm: GLOBAL.CRM,
                                product: GLOBAL.User.products.productname,
                            },
                            location: {
                                city: GLOBAL.City,
                                state: GLOBAL.State,
                                country: GLOBAL.Country,
                                latitude: GLOBAL.Latitude,
                                longitude: GLOBAL.Longitude,
                            },
                            device: {
                                category: GLOBAL.Device_Category,
                                type: GLOBAL.Device_Type,
                                model: GLOBAL.Device_Model,
                            },
                            network: {speed: '0.0', latency: 0.0},
                            actions: report,
                        }),
                    },
                ).catch(error => {});
                const json = await response;
            }
        } catch (e) {}
    };
}
const report = new REPORT();
export default report;
