import puppeteer from 'puppeteer-extra'
import stealthPlugin from 'puppeteer-extra-plugin-stealth'

puppeteer.use(stealthPlugin())

const url:string = 'https://www.avito.ru/kazan/zemelnye_uchastki/prodam/izhs-ASgBAQICAUSWA9oQAUCmCBTmVQ?f=ASgBAQECAUSWA9oQAUCmCBTmVQFFxpoMFnsiZnJvbSI6MCwidG8iOjM1MDAwMH0'

async function main() {
    console.log(url)
}

main()