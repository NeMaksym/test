const PROD_BASE_URL = 'https://forkify-fvelk.ondigitalocean.app/api/v1'
const DEV_BASE_URL = 'http://localhost:8080/api/v1'
const BASE_URL =
    process.env.NODE_ENV === 'production' ? PROD_BASE_URL : DEV_BASE_URL
export const RECIPES_URL = `${BASE_URL}/recipes`

export const TIMEOUT_SEC = 10
export const RES_PER_PAGE = 10
export const KEY = '83badf7c-20a7-4f77-97a5-d38647c7e44b'
