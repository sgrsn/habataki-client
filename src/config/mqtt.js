export const MQTT_CONFIG = {
    broker: process.env.REACT_APP_MQTT_BROKER,
    port: parseInt(process.env.REACT_APP_MQTT_PORT || '1883'),
    username: process.env.REACT_APP_MQTT_USERNAME,
    password: process.env.REACT_APP_MQTT_PASSWORD,
    clientId: `${process.env.REACT_APP_MQTT_CLIENT_ID}${Math.random().toString(16).substring(2, 8)}`
};