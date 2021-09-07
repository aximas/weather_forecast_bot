const {Telegraf, Markup} = require('telegraf');
require('dotenv').config();
const text = require('./const');
const report = require('./report');
const axios = require('axios');

const bot = new Telegraf(process.env.BOT_TOKEN);
const weatherAPIToken = process.env.WEATHER_API_TOKEN;

bot.start((ctx) => {
    ctx.reply(`Hello ${ctx.message.from.first_name ? ctx.message.from.first_name : ctx.message.from.username}`);
    report.users.push(ctx.message.from.username);
    console.log(report.users);
});
bot.help((ctx) => ctx.reply(`${text.commads}`));

// kelvin to celsius function
const temperatureConverter = (temp) => {
    return (temp - 273.15).toFixed(1);
}

// weather command events
bot.command('weather', async (ctx) => {
    try {
        ctx.replyWithHTML('<b>Choose by</b>', Markup.inlineKeyboard(
            [
                [Markup.button.callback('City', 'btn_city'), Markup.button.callback('Geo', 'btn_geo')],
                // [Markup.button.callback('Zip', 'btn_zip')]
            ]
        ))
    } catch (e) {
        console.error(e);
    }
});

// input city event
bot.action('btn_city', async (ctx) => {
    try {
        await ctx.answerCbQuery();
        await ctx.reply('Input your city');

    } catch (e) {
        console.error(e);
    }
});

// input geo event
bot.action('btn_geo', async (ctx) => {
    try {
        await ctx.answerCbQuery();
        await ctx.reply('Please share with your location');

    } catch (e) {
        console.error(e);
    }
});

// input text as city
bot.on('text', async (ctx) => {
    const city = await ctx.message.text
    try {
        const weather = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${weatherAPIToken}`).then(response => response.data);
        await ctx.replyWithHTML(`Location: <b>${weather.name}</b> \n Temperature: <b>${temperatureConverter(weather.main.temp)}°C </b>`);
        console.log(weather.main.temp - 273.15);
    } catch (e) {
        ctx.reply(`Sorry ${city} is not found in database`);
        console.error(e.config.url, ctx.message.from.username);
    }
});

// share with location as geo
bot.on('location', async (ctx) => {
    const location = await ctx.message.location;
    console.log(location);
    try {
        const weather = await axios.get(`https://api.openweathermap.org/data/2.5/weather?lat=${location.latitude}&lon=${location.longitude}&appid=${weatherAPIToken}`).then(response => response.data);
        console.log(weather.name);
        console.log((weather.main.temp - 273.15).toFixed(1));
        ctx.replyWithHTML(`Location: <b>${weather.name}</b> \n Temperature: <b>${temperatureConverter(weather.main.temp)}°C </b>`);
    } catch (e) {
        ctx.reply('Sorry this location is not found');
        console.error(e.config.url, ctx.message.from.username);
    }
});

// bot.on('new_chat_members', (ctx) => console.log(ctx.message.new_chat_members))

bot.launch();
console.log('Bot launched');

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))