const TOKEN_KEY = 'land_sales_access_token'
const TOKEN_TYPE_KEY = 'land_sales_token_type'

export const tokenStorage = {
  getToken() {
    return window.localStorage.getItem(TOKEN_KEY)
  },
  getTokenType() {
    return window.localStorage.getItem(TOKEN_TYPE_KEY) ?? 'Bearer'
  },
  setToken(tokenType: string, accessToken: string) {
    window.localStorage.setItem(TOKEN_TYPE_KEY, tokenType)
    window.localStorage.setItem(TOKEN_KEY, accessToken)
  },
  clear() {
    window.localStorage.removeItem(TOKEN_KEY)
    window.localStorage.removeItem(TOKEN_TYPE_KEY)
  },
}
