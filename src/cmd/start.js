import { chromium } from "playwright-chromium"
import dotenv from 'dotenv'

dotenv.config()

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const main = async () => {
  const browser = await chromium.launch({
    headless: false,
    args: ["--start-maximized"],
  })
  const context = await browser.newContext({ viewport: null });
  const page = await context.newPage()

  await page.goto('https://www.facebook.com')
  await page.getByTestId('royal-email').click()
  await page.getByTestId('royal-email').fill(process.env.EMAIL)
  await page.getByTestId('royal-email').press('Tab')
  await page.getByTestId('royal-pass').fill(process.env.PASSWORD)
  await page.getByTestId('royal-login-button').click()

  // you have to resolve captcha, 2fa manually if any
  await delay(10 * 1000)

  // sometimes facebook will ask for 2nd login
  await page.getByTestId('royal-email').click()
  await page.getByTestId('royal-email').fill(process.env.EMAIL)
  await page.getByTestId('royal-email').press('Tab')
  await page.getByTestId('royal-pass').fill(process.env.PASSWORD)
  await page.getByTestId('royal-login-button').click()
  await delay(3 * 1000)

  const groupIds = process.env.GROUP_IDS.split(",")

  for (const groupId of groupIds) {
    await page.goto(`https://www.facebook.com/groups/${groupId}/user/${process.env.USER_ID}`)
    while (true) {
      const button = await page.getByRole('button', { name: 'Actions for this post' }).first()
      if (await button.count() === 0) {
        break
      }
      await button.click()
      await page.getByRole('menuitem', { name: 'Delete post' }).locator('div').nth(1).click()
      await page.getByRole('button', { name: 'Delete' }).click()
      await delay(3 * 1000)
    }

    await page.goto(`https://www.facebook.com/groups/${groupId}/my_pending_content`)
    while (true) {
      const button = await page.getByRole('button', { name: 'Delete' }).first()
      if (await button.count() === 0) {
        break
      }
      await button.click()
      await page.getByRole('button', { name: 'Delete' }).click()
      await delay(3 * 1000)
    }
  }

  await browser.close()
}

main()
