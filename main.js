const {app, BrowserWindow, ipcMain} = require("electron");
const log = require("electron-log/main");
const path = require("node:path");
const puppeteer = require("puppeteer-core");
const {executablePath} = require("puppeteer");
const createWindow = () => {
    const win = new BrowserWindow({
        width: 2000,
        height: 2000,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: true,
            preload: path.join(__dirname, "preload.js"),
        },
    });
    win.loadFile("index.html");
};

app.whenReady().then(() => {
    ipcMain.handle("grab", async (event, props) => {
        await newGrabBrowser(JSON.parse(props));
    });
    ipcMain.handle("getNameGroupFB", async (event, props) => {
        return await getName(JSON.parse(props));
    });
    createWindow();

    app.on("activate", () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function getName({url}) {
    const browser = await puppeteer.launch({
        headless: true,
        args: ["--no-sandbox,--disable-notifications"],
        executablePath: executablePath()
    });
    const page = await browser.newPage();
    await page.setViewport({
        width: 1920,
        height: 1080,
        deviceScaleFactor: 1,
    });
    await page.goto(url);
    await page.waitForXPath(
        "/html/body/div[1]/div/div[1]/div/div[5]/div/div/div[1]/div/div[2]/div/div/div/div[1]/div"
    );
    const elements = await page.$x('/html/body/div[1]/div/div[1]/div/div[5]/div/div/div[1]/div/div[2]/div/div/div/div[1]/div')
    await elements[0].click();
    const [getXpath] = await page.$x('/html/body/div[1]/div/div[1]/div/div[3]/div/div/div[1]/div[1]/div[1]/div[2]/div/div/div/div/div[1]/div/div/div/div/div/div[1]/h1/span/a')
    const getMsg = await page.evaluate(name => name.innerText, getXpath);
    await browser.close();
    return getMsg
}

async function newGrabBrowser({urls, username, password, comment}) {
    const browser = await puppeteer.launch({
        headless: false,
        args: ["--disable-notifications"],
        executablePath:
            "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    });
    const page = await browser.newPage();
    await page.setViewport({
        width: 1920,
        height: 1080,
        deviceScaleFactor: 1,
    });
    await page.goto("https://www.facebook.com");
    setTimeout(() => {
    }, 1000);
    await page.type("#email", username);
    setTimeout(() => {
    }, 1000);
    await page.type("#pass", password);
    const elements = await page.$x(
        "/html/body/div[1]/div[1]/div[1]/div/div/div/div[2]/div/div[1]/form/div[2]/button"
    );
    await elements[0].click();
    await page.waitForNavigation();
    for (let url of urls) {
        const pageGroup = await browser.newPage();
        await pageGroup.setViewport({
            width: 1920,
            height: 1080,
            deviceScaleFactor: 1,
        });
        await pageGroup.goto(url);
        const urlProfiles = new Set();

        await pageGroup.evaluate(() => {
            window.scrollBy(0, 50000);
        });
        await pageGroup.waitForTimeout(8000);
        await pageGroup.evaluate(() => {
            window.scrollBy(0, 50000);
        });
        try {
            const xpathPost = await pageGroup.$x(
                '//*[@class="xt0psk2"]/a'
            );
            const xpath = '//*[@class="xt0psk2"]/a';

            const hrefs = await pageGroup.evaluate((xpath) => {
                const elements = document.evaluate(xpath, document, null, XPathResult.ANY_TYPE, null);
                const result = [];
                let node = elements.iterateNext();
                while (node) {
                    result.push(node.href);
                    node = elements.iterateNext();
                }
                return result;
            }, xpath);
            try
            {
                for (let href of hrefs) {
                    const regex = /\/user\/(\d+)\//;
                    const match = href.match(regex);
                    if(match !== null){
                        console.log('match', typeof match, match);
                        urlProfiles.add('https://www.facebook.com/'+match[1]);
                    }

                }
            } catch (e) {
                console.log(e);
            }
        } catch (e) {
            console.log(e);
        }
        for (let urlProfile of urlProfiles) {
            await pageGroup.goto(urlProfile);
            await pageGroup.waitForTimeout(8000);
            await pageGroup.evaluate(() => {
                window.scrollBy(0, 50000);
            });
            const paragraphElement = await pageGroup.$$('div[aria-label="Viết bình luận..."]');
            console.log(paragraphElement);

            if (paragraphElement) {
                for (let i = 0; i < 5; i++) {
                    try {
                        await paragraphElement[i].type(comment);
                        await pageGroup.keyboard.press('Enter');
                        await pageGroup.waitForTimeout(8000);
                    } catch (e) {
                        console.log(e);
                    }

                }
                console.log('Đã nhập văn bản vào phần tử <div>');
            } else {
                console.log("Không tìm thấy phần tử <p>");
            }
        }
    }
}

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});
