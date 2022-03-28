import { Browser, HTTPResponse, Page } from 'puppeteer';
import puppeteer from 'puppeteer-extra'
import stealthPlugin from 'puppeteer-extra-plugin-stealth'
import { parse, HTMLElement } from 'node-html-parser'
import async from 'async'
import fs from 'fs'

puppeteer.use(stealthPlugin())

const url:string = 'https://www.avito.ru/kazan/zemelnye_uchastki/prodam/izhs-ASgBAQICAUSWA9oQAUCmCBTmVQ?f=ASgBAQECAUSWA9oQAUCmCBTmVQFFxpoMFnsiZnJvbSI6MCwidG8iOjM1MDAwMH0'
const siteUrl = 'https://www.avito.ru'
const puppeteerPageLaunchOptions:object = {
    networkIdle2Timeout: 60000,
    waitUntil: 'domcontentloaded',
    timeout: 99999999
}
const p = 4

async function go(page:Page, url:string, options?:object):Promise<HTTPResponse> {
    try {
        return await page.goto(url, options)
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

async function getPageLinks(html:string):Promise<string[]> {
    try {
        const root:HTMLElement = parse(html)
        let cards = Array.from(root.querySelectorAll('.iva-item-root-_lk9K '))
        let innerHtmlCards: string[] = [];
        cards.map((el) => innerHtmlCards.push(el.innerHTML)) 
        let links: string[] = []
        innerHtmlCards.forEach(innerHtml => {
            const root = parse(innerHtml)
            links.push(siteUrl + String(root.querySelector('div.iva-item-titleStep-pdebR > a')?.getAttribute('href')))
        });
        return links
    } catch (err) {
        throw err
    }
}

function Product(html:string) {
    const root = parse(html)
    function getValue(selector: string) {
        return root.querySelector(selector)?.innerText.replace(/&nbsp;/ig, '',).replace('\n', '').replace(/\s+/g,' ' ).trim()
    }
    return {
        'title': getValue('body > div.item-view-page-layout.item-view-page-layout_content.item-view-page-layout_responsive > div.l-content.clearfix > div.item-view.js-item-view.item-view__new-style > div.item-view-content > div.item-view-content-left > div.item-view-title-info.js-item-view-title-info > div > div.title-info-main > h1 > span'),
        'distanceCityCenter': getValue('body > div.item-view-page-layout.item-view-page-layout_content.item-view-page-layout_responsive > div.l-content.clearfix > div.item-view.js-item-view.item-view__new-style > div.item-view-content > div.item-view-content-left > div.item-view-main.js-item-view-main > div:nth-child(1) > div > ul > li:nth-child(2)'),
        'area': getValue('body > div.item-view-page-layout.item-view-page-layout_content.item-view-page-layout_responsive > div.l-content.clearfix > div.item-view.js-item-view.item-view__new-style > div.item-view-content > div.item-view-content-left > div.item-view-main.js-item-view-main > div:nth-child(1) > div > ul > li:nth-child(1)'),
        'price': getValue('#price-value > span > span > span.js-item-price'),
        'pricePerHundred': getValue('body > div.item-view-page-layout.item-view-page-layout_content.item-view-page-layout_responsive > div.l-content.clearfix > div.item-view.js-item-view.item-view__new-style > div.item-view-content > div.item-view-content-right > div.item-view-info.js-item-view-info.js-sticky-fallback > div > div.item-view-price.js-item-view-price > div > div.item-price > div.item-price-sub-price'),
        'location': getValue('body > div.item-view-page-layout.item-view-page-layout_content.item-view-page-layout_responsive > div.l-content.clearfix > div.item-view.js-item-view.item-view__new-style > div.item-view-content > div.item-view-content-left > div.item-view-main.js-item-view-main > div.item-view-block.item-view-map.js-item-view-map.item-view-map_open > div > div.item-map-location > div.item-address > div > span'),
        'description': getValue('body > div.item-view-page-layout.item-view-page-layout_content.item-view-page-layout_responsive > div.l-content.clearfix > div.item-view.js-item-view.item-view__new-style > div.item-view-content > div.item-view-content-left > div.item-view-main.js-item-view-main > div:nth-child(3) > div > div.item-description-text > p'),
        'pubDate': getValue('body > div.item-view-page-layout.item-view-page-layout_content.item-view-page-layout_responsive > div.l-content.clearfix > div.item-view.js-item-view.item-view__new-style > div.item-view-content > div.item-view-content-left > div.item-view-title-info.js-item-view-title-info > div > div.title-info-actions > div > div.title-info-metadata-item-redesign'),
        'user': getValue('body > div.item-view-page-layout.item-view-page-layout_content.item-view-page-layout_responsive > div.l-content.clearfix > div.item-view.js-item-view.item-view__new-style > div.item-view-content > div.item-view-content-right > div.item-view-info.js-item-view-info.js-sticky-fallback > div > div.item-view-seller-info.js-item-view-seller-info > div > div.seller-info-prop.js-seller-info-prop_seller-name.seller-info-prop_layout-two-col > div.seller-info-col > div:nth-child(1) > div > a'),
        'viewers': getValue('body > div.item-view-page-layout.item-view-page-layout_content.item-view-page-layout_responsive > div.l-content.clearfix > div.item-view.js-item-view.item-view__new-style > div.item-view-content > div.item-view-content-right > div.item-view-info.js-item-view-info.js-sticky-fallback > div > div.item-view-search-info-redesign > div')
    }
}

async function generationTasks(browser: Browser, queue: async.QueueObject<string>) {
    try {
        for(let i = 0; i <= p; i++) {
            const page:Page = await browser.newPage()
            await go(page, `${url}&p=${i}`, puppeteerPageLaunchOptions)
            queue.push(await getPageLinks(await getHTML(page)))
            page.close()
        }
    } catch (err) {
        throw err
    }
}

async function parser(browser: Browser) {
    return new Promise(async (resolve) => {
        const q = async.queue(async (task: string) => {
            console.log(`task ${task} started`)
            const page:Page = await browser.newPage()
            await go(page, task, puppeteerPageLaunchOptions)
            fs.appendFileSync('./data/data.json', JSON.stringify(Product(await getHTML(page))))
            console.log(`task ${task} finished`)
            await page.close()
        }, 3)
        await generationTasks(browser, q)
    })
}

async function main(url:string, callback?: () => Promise<unknown>):Promise<void> {
    const browser:Browser = await puppeteer.launch({headless: false});
    try {
        await parser(browser)
    } catch(err) {
        throw err
    } finally {
        console.log('broswser closing...')
        await browser.close();
        if(callback) {
            callback()
        }
    }
}

main(url)