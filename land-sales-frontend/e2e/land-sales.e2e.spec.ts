import process from 'node:process'
import { expect, test, type Page } from '@playwright/test'

const adminUsername = process.env.E2E_ADMIN_USERNAME ?? 'e2e-admin'
const adminPassword = process.env.E2E_ADMIN_PASSWORD ?? 'e2e-admin-password'

async function login(page: Page) {
  await page.goto('/login')
  await page.getByLabel('Usuario').fill(adminUsername)
  await page.getByLabel('Contraseña').fill(adminPassword)
  await page.getByRole('button', { name: 'Entrar' }).click()
  await expect(page).toHaveURL(/\/dashboard$/)
  await expect(page.getByText('Land Sales').first()).toBeVisible()
}

test.describe('Land Sales E2E', () => {
  test('authenticates, navigates to a protected route and logs out', async ({ page }) => {
    await login(page)

    await page.getByRole('link', { name: 'Reporte general' }).click()
    await expect(page).toHaveURL(/\/reportes$/)
    await expect(page.getByRole('heading', { name: 'Reporte general' })).toBeVisible()

    await page.getByText('Cerrar sesión').click()
    await expect(page).toHaveURL(/\/login$/)
    await expect(page.getByRole('button', { name: 'Entrar' })).toBeVisible()
  })

  test('creates a unique customer and finds it in the customer list', async ({ page }) => {
    const suffix = Date.now().toString()
    const customerName = `Cliente E2E ${suffix}`
    const phone = `55${suffix.slice(-8).padStart(8, '0')}`

    await login(page)
    await page.getByRole('link', { name: 'Clientes' }).click()
    await expect(page).toHaveURL(/\/clientes$/)
    await expect(page.getByRole('heading', { name: 'Clientes', exact: true })).toBeVisible()

    await page.getByRole('button', { name: 'Registrar cliente' }).click()
    await page.getByLabel('Nombre completo').fill(customerName)
    await page.getByLabel('Teléfono principal').fill(phone)
    await page.getByLabel('Domicilio completo').fill('Domicilio ficticio E2E')
    await page.getByRole('button', { name: 'Guardar cliente' }).click()

    await expect(page.getByText('Cliente guardado correctamente.')).toBeVisible()
    await page.getByPlaceholder('Buscar por nombre o teléfono').fill(customerName)
    await expect(page.getByText(customerName).first()).toBeVisible()
    await expect(page.getByText(phone).first()).toBeVisible()
  })
})
