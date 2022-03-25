import { Browser, HTTPResponse, Page } from 'puppeteer';
import puppeteer from 'puppeteer-extra'
import stealthPlugin from 'puppeteer-extra-plugin-stealth'
import { parse, HTMLElement } from 'node-html-parser'
import fs from 'fs'

puppeteer.use(stealthPlugin())

const url:string = 'https://www.avito.ru/kazan/zemelnye_uchastki/prodam/izhs-ASgBAQICAUSWA9oQAUCmCBTmVQ?f=ASgBAQECAUSWA9oQAUCmCBTmVQFFxpoMFnsiZnJvbSI6MCwidG8iOjM1MDAwMH0'
const puppeteerPageLaunchOptions:object = {
    waitUntil: 'networkidle2'
}

// interface Card {
//     'title': string | null,
//     'distanceCityCenter': string | null,
//     'contactPerson': string | null,
//     'link': string | null,
//     'area': string | null,
//     'price': number | null,
//     'pricePerHundred': number | null,
//     'location': string | null,
//     'description': string | null,
//     'pubDate': string | null,
//     'user': string | null,
//     'viewers': number | null
// }

async function go(page:Page, url:string, options?:object):Promise<HTTPResponse> {
    try {
        return await page.goto(url)
    } catch (err) {
        throw err
    }
}

async function getHTML(page:Page):Promise<string> {
    try {
        return await page.content()
    } catch (err) {
        throw err
    }
}

async function autoScroll(page:Page) {
    try {
        return(
            page.evaluate(async() => {
                return (
                    new Promise<void>(resolve => {
                        let totalHeight = 0;
                        let distance = 450;
                        let timer = setInterval(() => {
                            let scrollHeight = document.body.scrollHeight;
                            window.scrollBy(0, distance);
                            totalHeight += distance;
        
                            if(totalHeight >= scrollHeight - window.innerHeight){
                                clearInterval(timer);
                                resolve();
                            }
                        }, 100);
                    }
                ))
            })
        )
    } catch (err) {
        throw err
    }
}

async function getLinks(html:string) {
    try {
        const root:HTMLElement = parse(html)
        let cards = Array.from(root.querySelectorAll('.iva-item-root-_lk9K '))
        let innerHtmlCards: string[] = [];
        cards.map((el) => innerHtmlCards.push(el.innerHTML)) 
        let links: string[] = []
        innerHtmlCards.forEach(innerHtml => {
            const root = parse(innerHtml)
            links.push(String(root.querySelector('div.iva-item-titleStep-pdebR > a')?.getAttribute('href')))
        });
        return links
    } catch (err) {
        throw err
    }
}

async function main(url:string, callback?: () => Promise<unknown>):Promise<void> {
    const browser:Browser = await puppeteer.launch({headless: true});
    const page:Page = await browser.newPage();
    try {
        await go(page, url, puppeteerPageLaunchOptions)
        await getLinks(await getHTML(page))
    } catch (err) {
        throw err
    } finally {
        await browser.close();
        if(callback) {
            callback()
        }
    }
}

main(url)